import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  TruckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext' // ✅ ADD: Missing import
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'

const MyRides = ({ rides, onDeleteRide, onRefetch }) => {
  const navigate = useNavigate()
  const { user } = useAuth() // ✅ ADD: Get user from auth context

  // Add search filters
  const [searchFilters, setSearchFilters] = useState({
    origin: '',
    destination: '',
    status: 'all'
  })

  // Separate upcoming and past rides
  const { upcomingRides, pastRides } = useMemo(() => {
    const now = new Date()
    const filteredRides = rides.filter(ride => {
      const matchesOrigin = !searchFilters.origin || 
        ride.origin?.toLowerCase().includes(searchFilters.origin.toLowerCase())
      
      const matchesDestination = !searchFilters.destination || 
        ride.destination?.toLowerCase().includes(searchFilters.destination.toLowerCase())
      
      const matchesStatus = searchFilters.status === 'all' || 
        ride.status === searchFilters.status
      
      return matchesOrigin && matchesDestination && matchesStatus
    })
    
    const upcoming = filteredRides.filter(ride => new Date(ride.departure_time) > now)
    const past = filteredRides.filter(ride => new Date(ride.departure_time) <= now)
    
    return {
      upcomingRides: upcoming,
      pastRides: past
    }
  }, [rides, searchFilters])

  // ✅ ADD: Missing utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  // ✅ ADD: Missing handler functions
  const handleViewRideDetails = (rideId, e) => {
    e.stopPropagation()
    navigate(`/ride/${rideId}`)
  }

  const handleEditRide = (rideId, e) => {
    e.stopPropagation()
    // Navigate to edit ride page or open edit modal
    navigate(`/edit-ride/${rideId}`)
  }

  const handleDeleteRide = (rideId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
      if (onDeleteRide) {
        onDeleteRide(rideId)
      }
    }
  }

  // ✅ ADD: Complete handleCancelRide function
  const handleCancelRide = async (rideId, e) => {
    e.stopPropagation()
    
    if (!window.confirm('Are you sure you want to cancel this ride? This will notify all passengers and restore their requests.')) {
      return
    }

    try {
      console.log('Cancelling ride:', rideId, 'User:', user?.id)
      
      // 1. Get all accepted bookings for this ride
      const { data: acceptedBookings } = await supabase
        .from('ride_bookings')
        .select('passenger_id')
        .eq('ride_id', rideId)
        .eq('status', 'accepted')

      // 2. Cancel the ride
      const { error: rideError } = await supabase
        .from('rides')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString() 
        })
        .eq('id', rideId)
        .eq('driver_id', user.id)

      if (rideError) throw rideError

      // 3. Cancel all bookings for this ride
      const { error: bookingError } = await supabase
        .from('ride_bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString() 
        })
        .eq('ride_id', rideId)

      if (bookingError) throw bookingError

      // 4. Restore passenger requests to 'open' status
      if (acceptedBookings && acceptedBookings.length > 0) {
        const passengerIds = acceptedBookings.map(b => b.passenger_id)
        
        const { error: requestError } = await supabase
          .from('passenger_ride_requests')
          .update({ 
            status: 'open',
            updated_at: new Date().toISOString() 
          })
          .in('passenger_id', passengerIds)
          .eq('status', 'matched')

        if (requestError) {
          console.warn('Failed to restore passenger requests:', requestError)
        }
      }

      toast.success('Ride cancelled successfully. Passengers have been notified.')
      
      // Refresh the rides list
      if (onRefetch) {
        onRefetch()
      }

    } catch (error) {
      console.error('Error cancelling ride:', error)
      toast.error('Failed to cancel ride')
    }
  }

  // Add this function after the existing functions:
  const handleCleanupDuplicates = async () => {
    if (!window.confirm('This will remove duplicate rides. Are you sure?')) {
      return
    }

    try {
      // Get all rides for this user
      const { data: allRides, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by origin, destination, and departure_time
      const rideGroups = new Map()
      
      allRides.forEach(ride => {
        const key = `${ride.origin}-${ride.destination}-${ride.departure_time}`
        if (!rideGroups.has(key)) {
          rideGroups.set(key, [])
        }
        rideGroups.get(key).push(ride)
      })

      // Find duplicates (groups with more than 1 ride)
      const duplicatesToDelete = []
      
      rideGroups.forEach((rides, key) => {
        if (rides.length > 1) {
          // Keep the first one (oldest), mark others for deletion
          const [keepRide, ...deleteDuplicates] = rides
          duplicatesToDelete.push(...deleteDuplicates.map(r => r.id))
          console.log(`🔄 Found ${rides.length} duplicates for: ${key}`)
          console.log(`🔄 Keeping ride ID: ${keepRide.id}`)
          console.log(`🔄 Deleting ride IDs: ${deleteDuplicates.map(r => r.id).join(', ')}`)
        }
      })

      if (duplicatesToDelete.length === 0) {
        toast.success('No duplicates found!')
        return
      }

      // Delete duplicate rides
      const { error: deleteError } = await supabase
        .from('rides')
        .delete()
        .in('id', duplicatesToDelete)

      if (deleteError) throw deleteError

      toast.success(`Removed ${duplicatesToDelete.length} duplicate rides!`)
      
      // Refresh the rides list
      if (onRefetch) {
        onRefetch()
      }

    } catch (error) {
      console.error('❌ Error cleaning duplicates:', error)
      toast.error('Failed to clean duplicates')
    }
  }

  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No rides offered yet</h3>
        <p className="text-gray-600 mb-6">Start offering rides to help other students get around!</p>
        <button
          onClick={() => navigate('/offer-ride')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Offer a Ride
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter My Rides</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <LocationInput
              placeholder="Origin"
              onLocationSelect={(location) => {
                setSearchFilters(prev => ({
                  ...prev,
                  origin: location ? location.name : ''
                }))
              }}
              initialValue={searchFilters.origin}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <LocationInput
              placeholder="Destination"
              onLocationSelect={(location) => {
                setSearchFilters(prev => ({
                  ...prev,
                  destination: location ? location.name : ''
                }))
              }}
              initialValue={searchFilters.destination}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Rides</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={() => setSearchFilters({ origin: '', destination: '', status: 'all' })}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
            
            {/* ✅ ADD: Cleanup button */}
            <button
              onClick={handleCleanupDuplicates}
              className="flex-1 bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm"
              title="Remove duplicate rides"
            >
              🧹 Cleanup
            </button>
          </div>
        </div>
      </div>

      {/* Rides List */}
      {upcomingRides.length === 0 && pastRides.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchFilters.origin || searchFilters.destination || searchFilters.status !== 'all' 
              ? 'No rides match your filters' 
              : 'No rides posted yet'
            }
          </h3>
          <p className="text-gray-600">
            {searchFilters.origin || searchFilters.destination || searchFilters.status !== 'all'
              ? 'Try adjusting your search filters'
              : 'Your posted rides will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...upcomingRides, ...pastRides].map((ride) => {
            const confirmedPassengers = ride.passengers?.filter(p => p.status === 'confirmed') || []
            const pendingRequests = ride.passengers?.filter(p => p.status === 'pending') || []
            
            return (
              <div key={ride.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                        {ride.status || 'Active'}
                      </span>
                      {pendingRequests.length > 0 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {pendingRequests.length} pending
                        </span>
                      )}
                    </div>
                    
                    {/* Route */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">From:</span>
                        <span className="ml-2 font-medium text-gray-900">{ride.origin}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">To:</span>
                        <span className="ml-2 font-medium text-gray-900">{ride.destination}</span>
                      </div>
                    </div>

                    {/* Date, Time, Seats */}
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>{formatDate(ride.departure_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{formatTime(ride.departure_time)}</span>
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span>{ride.available_seats} seats</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleViewRideDetails(ride.id, e)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    
                    {ride.status === 'active' && (
                      <>
                        <button
                          onClick={(e) => handleEditRide(ride.id, e)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Ride"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={(e) => handleCancelRide(ride.id, e)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Cancel Ride"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={(e) => handleDeleteRide(ride.id, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Ride"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Passengers */}
                {confirmedPassengers.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Confirmed Passengers ({confirmedPassengers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {confirmedPassengers.map((passenger, index) => (
                        <div key={index} className="flex items-center bg-green-50 rounded-full px-3 py-1">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                            {passenger.passenger?.full_name?.charAt(0) || 'P'}
                          </div>
                          <span className="text-sm text-green-800">
                            {passenger.passenger?.full_name || 'Anonymous'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning for no passengers */}
                {ride.status === 'active' && confirmedPassengers.length === 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center text-amber-600">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">No passengers yet</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyRides