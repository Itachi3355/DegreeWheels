import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, PlusIcon, ClockIcon, MapPinIcon, CurrencyDollarIcon, UserIcon, MapIcon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useRides } from '../../hooks/useRides'
import { supabase } from '../../lib/supabase'
import RideRequestForm from './RideRequestForm'
import RideForm from './RideForm'
import LocationInput from '../common/LocationInput'
import Map from '../common/Map'
import toast from 'react-hot-toast'
import BookingModal from './BookingModal'
// ❌ REMOVE: import { findCompatibleRides } from '../../utils/matchingAlgorithm'
//

const RideSearch = () => {
  const { user, profile } = useAuth()
  const { 
    rides, 
    requests, 
    loading, 
    error, 
    requestsError, 
    searchRides, 
    refetch 
  } = useRides()
  
  // State variables
  const [activeTab, setActiveTab] = useState('requests') // 'rides' or 'requests'
   // 'active' for rides, 'requests' for passenger requests
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showRideForm, setShowRideForm] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    maxPrice: '',
    status: 'all' // Default to active rides
  })

  // Booking modal state
  const [selectedRide, setSelectedRide] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showOfferedRequests, setShowOfferedRequests] = useState(false)

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Status filter options
  const statusOptions = [
    { value: 'available', label: 'Available Requests' },
    { value: 'matched', label: 'Matched Requests' },
    { value: 'all', label: 'All Requests' },
  { value: 'active', label: 'Active Rides' },
  { value: 'inactive', label: 'Inactive Rides' },
  { value: 'all', label: 'All Rides' }
]
  // Offer ride function
  const handleOfferRide = async (request) => {
    console.log('🚗 Creating ride offer for request:', request.id)
    console.log('DEBUG filteredRides:', filteredRides)
    try {
      // ✅ ADD: Check for existing duplicate rides
      const { data: existingRides, error: checkError } = await supabase
        .from('rides')
        .select('id')
        .eq('driver_id', user.id)
        .eq('origin', request.origin)
        .eq('destination', request.destination)
        .eq('departure_time', request.preferred_departure_time || new Date().toISOString())
        .eq('status', 'active')

      if (checkError) throw checkError

      if (existingRides && existingRides.length > 0) {
        toast.error('You already have an active ride for this route and time!')
        return
      }

      // ✅ FIX: Use the request's preferred_departure_time or set a default
      const departureTime = request.preferred_departure_time || new Date().toISOString()
      
      const rideData = {
        driver_id: user.id,
        origin: request.origin,
        destination: request.destination,
        departure_time: departureTime, // ✅ FIX: Ensure this is never undefined
        available_seats: 4, // Default value, can be made configurable
        total_seats: 4,
        notes: `Ride offered in response to passenger request`,
        status: 'active',
        created_at: new Date().toISOString(),
        // Add coordinates if available
        ...(request.origin_coordinates && { origin_coordinates: request.origin_coordinates }),
        ...(request.destination_coordinates && { destination_coordinates: request.destination_coordinates })
      }

      console.log('🔧 Creating ride with data:', rideData)

      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .insert([rideData])
        .select()
        .single()

      if (rideError) {
        console.error('❌ Error creating ride:', rideError)
        throw rideError
      }

      console.log('✅ Ride created:', ride)

      // ✅ FIX: Create booking using correct table and fields
      const bookingData = {
        ride_id: ride.id,
        passenger_id: request.passenger_id,
        driver_id: user.id,
        seats_requested: 1,
        pickup_notes: `Auto-booking for ride offer response`,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      const { data: booking, error: bookingError } = await supabase
        .from('ride_bookings')  // ✅ CORRECT TABLE NAME
        .insert([bookingData])
        .select()
        .single()

      if (bookingError) {
        console.error('❌ Error creating booking:', bookingError)
        throw bookingError
      }

      console.log('✅ Booking created:', booking)

      // Update request status to 'matched'
      const { error: updateError } = await supabase
        .from('passenger_ride_requests')
        .update({ 
          status: 'matched', // ✅ This hides it from the list
          matched_ride_id: ride.id, // ✅ Track which ride matched
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (updateError) {
        console.error('❌ Error updating request:', updateError)
        throw updateError
      }

      toast.success('Ride offer sent successfully!')
      
      // Refresh data
      if (refetch) {  // ✅ Use refetch instead of refreshData
        await refetch()
      }

    } catch (error) {
      console.error('❌ Error offering ride:', error)
      toast.error(`Failed to offer ride: ${error.message}`)
    }
  }

  // Handler functions
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilterDate('')
    setSearchFilters({
      origin: '',
      destination: '',
      date: '',
      maxPrice: '',
      status: activeTab === 'rides' ? 'active' : 'all'
    })
  }, [activeTab])

  const handleBookRide = useCallback((ride) => {
    setSelectedRide(ride)
    setShowBookingModal(true)
  }, [])

  const handleViewDetails = (request) => {
    console.log('View details:', request)
    
    // ✅ FIX: Create a proper details modal or navigation
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  // Distance calculation function
  const calculateDistance = useMemo(() => {
    return (originCoords, destCoords) => {
      if (!originCoords || !destCoords) return null
    
      try {
        // ✅ STANDARDIZE: Parse coordinates consistently
        let originLatLng, destLatLng
        
        if (typeof originCoords === 'string') {
          // Handle string format: "(-96.944127,32.82938)"
          const cleanOrigin = originCoords.replace(/[()]/g, '').split(',').map(Number)
          originLatLng = [cleanOrigin[1], cleanOrigin[0]] // [lat, lng]
        } else if (Array.isArray(originCoords)) {
          // Handle array format: [-96.944127, 32.82938]
          originLatLng = [originCoords[1], originCoords[0]] // [lat, lng]
        } else {
          return null
        }
        
        if (typeof destCoords === 'string') {
          // Handle string format: "(-96.944127,32.82938)"
          const cleanDest = destCoords.replace(/[()]/g, '').split(',').map(Number)
          destLatLng = [cleanDest[1], cleanDest[0]] // [lat, lng]
        } else if (Array.isArray(destCoords)) {
          // Handle array format: [-96.944127, 32.82938]
          destLatLng = [destCoords[1], destCoords[0]] // [lat, lng]
        } else {
          return null
        }
        
        console.log('🔧 Distance calculation:', {
          origin: originLatLng,
          dest: destLatLng,
          originString: originCoords,
          destString: destCoords
        })
        
        const [lat1, lon1] = originLatLng
        const [lat2, lon2] = destLatLng
        
        const R = 3959 // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c
        
        const result = Math.round(distance * 10) / 10 // Round to 1 decimal place
        console.log('🔧 Calculated distance:', result, 'miles')
        return result
        
      } catch (error) {
        console.error('Error calculating distance:', error)
        return null
      }
    }
  }, []) // ✅ Empty dependency array - function doesn't change

  // Filtered data
  const filteredRides = useMemo(() => {
    if (!rides) return []
    
    return rides.filter(ride => {
      const matchesSearch = !searchQuery || 
        ride.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.destination?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDate = !filterDate || 
        ride.departure_time?.startsWith(filterDate)
      
      const matchesOrigin = !searchFilters.origin ||
        ride.origin?.toLowerCase().includes(searchFilters.origin.toLowerCase())
        
      const matchesDestination = !searchFilters.destination ||
        ride.destination?.toLowerCase().includes(searchFilters.destination.toLowerCase())
        
      const matchesStatus = searchFilters.status === 'all' || 
        ride.status === searchFilters.status
    
      return matchesSearch && matchesDate && matchesOrigin && matchesDestination && matchesStatus
    })
  }, [rides, searchQuery, filterDate, searchFilters])

  // Filter requests based on activeTab and status
  const filteredRequests = useMemo(() => {
    if (!requests || requests.length === 0) return []
    
    return requests.filter(request => {
      // ✅ HIDE matched/completed requests from the list
      if (request.status === 'matched' || request.status === 'completed') {
        return false
      }
      
      // Apply search filters
      const matchesOrigin = !searchFilters.origin || 
        request.origin?.toLowerCase().includes(searchFilters.origin.toLowerCase())
    
      const matchesDestination = !searchFilters.destination || 
        request.destination?.toLowerCase().includes(searchFilters.destination.toLowerCase())
    
      const matchesStatus = searchFilters.status === 'all' || 
        request.status === searchFilters.status
    
      return matchesOrigin && matchesDestination && matchesStatus
    })
  }, [requests, searchFilters])

  // Count variables
  const ridesCount = filteredRides?.length || 0
  const requestsCount = filteredRequests?.length || 0

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('RideSearch rendered - Main Component Only', {
        activeTab,
        ridesCount,
        requestsCount
      })
    }
  }, [activeTab, ridesCount, requestsCount])

  console.log('RideSearch render:', { activeTab, ridesCount: rides?.length, requestsCount: requests?.length })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading rides...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Rides</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Define tabs
  const tabs = [
    { id: 'rides', name: 'Available Rides', description: 'Browse rides offered by drivers' },
    { id: 'requests', name: 'Passenger Requests', description: 'Browse ride requests from passengers' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error handling */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Rides</h1>
          <p className="text-gray-600">Browse passenger requests first, then check available rides</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.name} ({tab.id === 'requests' ? requestsCount : ridesCount})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <LocationInput
                placeholder="Origin city"
                value={searchFilters.origin}
                onLocationSelect={(location) => {
                  setSearchFilters(prev => ({
                    ...prev,
                    origin: location.display_name || location.name || ''
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <LocationInput
                placeholder="Destination city"
                value={searchFilters.destination}
                onLocationSelect={(location) => {
                  setSearchFilters(prev => ({
                    ...prev,
                    destination: location.display_name || location.name || ''
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={searchFilters.date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'requests' ? (
          // Passenger Requests Tab
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Passenger Requests</h2>
                <p className="text-sm text-gray-600 mt-1">
                  These are requests from passengers looking for rides. Click "Offer Ride" to send your details to them.
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4 mr-2" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map View
                </button>
              </div>
              
              <p className="text-sm text-gray-600">
                {requestsCount} request{requestsCount !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Map Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Passenger Requests Map</h3>
                    <div className="text-sm text-gray-600">
                      Showing {filteredRequests.length} requests
                    </div>
                  </div>
                </div>
                
                {/* Map Container - Fixed Height */}
                <div className="h-[500px] w-full">
                  {filteredRequests.length > 0 ? (
                    <Map 
                      rides={filteredRequests}
                      height="100%"
                      showRoute={true}
                      mapId="passenger-requests-map"
                      onRideSelect={(request) => {
                        console.log('Selected passenger request:', request)
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Passenger Requests</h3>
                        <p className="text-sm text-gray-600">No students are currently looking for rides</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // List View for Requests
              <>
                {filteredRequests.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No passenger requests</h3>
                    <p className="text-gray-600 mb-4">
                      Passenger requests will appear here when they need rides
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('rides')}
                        className="text-blue-600 hover:text-blue-700 font-medium block"
                      >
                        Check Available Rides Instead
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Or Try Map View
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <MapPinIcon className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-medium text-gray-900">{request.origin}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <MapPinIcon className="w-5 h-5 text-red-600 mr-2" />
                              <span className="font-medium text-gray-900">{request.destination}</span>
                            </div>
                            
                            {/* ✅ FIX: Properly format date and add distance */}
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {request.preferred_departure_time ? (
                                <span>
                                  {new Date(request.preferred_departure_time).toLocaleDateString()} at{' '}
                                  {new Date(request.preferred_departure_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              ) : (
                                <span>Flexible timing</span>
                              )}
                            </div>

                            {/* ✅ ADD: Distance calculation */}
                            {request.origin_coordinates && request.destination_coordinates && (
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <span className="text-indigo-600 font-medium">
                                  ~{calculateDistance(
                                    request.origin_coordinates,    // Pass as string
                                    request.destination_coordinates // Pass as string
                                  )} miles
                                </span>
                              </div>
                            )}

                            {/* ✅ REMOVE: Budget line since you want it removed */}
                            
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <UserIcon className="w-4 h-4 mr-1" />
                              <span>{request.passenger_count || 1} passenger(s)</span>
                            </div>
                            
                            {request.notes && (
                              <p className="text-sm text-gray-600 italic mt-2">{request.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOfferRide(request)}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Offer Ride
                          </button>
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Available Rides Tab
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4 mr-2" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map View
                </button>
              </div>
              
              <p className="text-sm text-gray-600">
                {ridesCount} ride{ridesCount !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Map or List View */}
            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Map Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Available Rides Map</h3>
                    <div className="text-sm text-gray-600">
                      Showing {filteredRides.length} rides
                    </div>
                  </div>
                </div>
                
                {/* Map Container - Fixed Height */}
                <div className="h-[500px] w-full">
                  {filteredRides.length > 0 ? (
                    <Map 
                      rides={filteredRides}
                      height="100%"
                      showRoute={true}
                      mapId="available-rides-map"
                      onRideSelect={(ride) => {
                        console.log('Selected ride:', ride)
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Rides</h3>
                        <p className="text-sm text-gray-600 mb-4">No rides match your current filters</p>
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRides.length > 0 ? (
                  filteredRides.map((ride) => (
                    <div key={ride.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <MapPinIcon className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium text-gray-900">
                              {ride.origin} → {ride.destination}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              <span>
                                {new Date(ride.departure_time).toLocaleDateString()} at{' '}
                                {new Date(ride.departure_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            {/* ✅ FIX: Show ride status clearly */}
                            <div className="flex items-center">
                              <span className={`h-2.5 w-2.5 rounded-full mr-2 ${ride.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span className="text-sm font-medium text-gray-900">
                                {ride.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          {/* ✅ ADD: Driver details section */}
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-sm text-gray-500 mb-2">Driver Details</p>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <img 
                                  src={profile?.avatar_url || '/default-avatar.png'} 
                                  alt="Driver Avatar" 
                                  className="h-10 w-10 rounded-full"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">
                                  {profile?.vehicle_type ? `${profile.vehicle_type} - ${profile.license_plate}` : 'Vehicle details not provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBookRide(ride)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => console.log('View details:', ride)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M3 21L21 3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No available rides</h3>
                    <p className="text-gray-600 mb-4">
                      Rides will appear here when they are available
                    </p>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Check Passenger Requests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal 
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          ride={selectedRide}
          user={user}
        />

        {/* Details Modal - For passenger requests */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                
                {/* Request info */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">From:</span>
                    <p className="text-gray-900">{selectedRequest.origin}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">To:</span>
                    <p className="text-gray-900">{selectedRequest.destination}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                    <p className="text-gray-900">
                      {new Date(selectedRequest.preferred_departure_time).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Passengers:</span>
                    <p className="text-gray-900">{selectedRequest.passenger_count}</p>
                  </div>
                  {selectedRequest.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-900">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleOfferRide(selectedRequest)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Offer Ride
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(RideSearch)
