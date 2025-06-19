import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const RideDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState(null)

  console.log('RideDetails loaded for ride ID:', id)

  useEffect(() => {
    if (!id || id === 'undefined') {
      console.error('Invalid ride ID:', id)
      setError('Invalid ride ID')
      setLoading(false)
      return
    }

    fetchRideDetails()
  }, [id])

  const fetchRideDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching ride details for ID:', id)

      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(*),
          ride_bookings(
            *,
            passenger:profiles!ride_bookings_passenger_id_fkey(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching ride detail:', error)
        throw error
      }

      if (!data) {
        setError('Ride not found')
        return
      }

      setRide(data)
      console.log('Ride details fetched:', data)

    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'Failed to load ride details')
      
      // If it's a UUID error, likely the ride doesn't exist
      if (error.code === '22P02') {
        setError('Ride not found')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRequestRide = async () => {
    if (!user) {
      toast.error('Please login to request a ride')
      navigate('/login')
      return
    }

    if (ride.driver_id === user.id) {
      toast.error('You cannot request your own ride')
      return
    }

    // Check if user already has a booking for this ride
    const existingBooking = ride.ride_bookings?.find(
      booking => booking.passenger_id === user.id
    )

    if (existingBooking) {
      toast.error('You have already booked this ride')
      return
    }

    try {
      setRequesting(true)

      const { error } = await supabase
        .from('ride_requests')
        .insert([
          {
            ride_id: ride.id,
            passenger_id: user.id,
            status: 'pending'
          }
        ])

      if (error) throw error

      toast.success('Ride request sent successfully!')
      
      // Refresh ride details to show the new request
      await fetchRideDetails()

    } catch (error) {
      console.error('Error requesting ride:', error)
      toast.error('Failed to send ride request')
    } finally {
      setRequesting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ride details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ride Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/search')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Available Rides
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No ride found
  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ride Not Found</h2>
          <p className="text-gray-600 mb-6">The ride you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Available Rides
          </button>
        </div>
      </div>
    )
  }

  const isDriver = ride.driver_id === user?.id
  const hasRequested = ride.ride_requests?.some(request => request.passenger_id === user?.id)
  const confirmedBookings = ride.ride_bookings?.filter(booking => booking.status === 'accepted').length || 0
  const availableSeats = ride.available_seats - confirmedBookings

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Ride Details</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">{ride.origin} → {ride.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {new Date(ride.departure_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${ride.price_per_seat}</div>
                <div className="text-sm text-blue-100">per seat</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trip Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPinIcon className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">From</p>
                        <p className="text-gray-900">{ride.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPinIcon className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">To</p>
                        <p className="text-gray-900">{ride.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Departure</p>
                        <p className="text-gray-900">
                          {new Date(ride.departure_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <UserIcon className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Available Seats</p>
                        <p className="text-gray-900">{availableSeats} of {ride.available_seats}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {ride.description && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{ride.description}</p>
                  </div>
                )}

                {/* Ride Requests */}
                {ride.ride_requests && ride.ride_requests.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Ride Requests ({ride.ride_requests.length})
                    </h2>
                    <div className="space-y-3">
                      {ride.ride_requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {request.passenger?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {request.passenger?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Requested on {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ride Bookings */}
                {ride.ride_bookings && ride.ride_bookings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Bookings ({ride.ride_bookings.length})
                    </h2>
                    <div className="space-y-3">
                      {ride.ride_bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {booking.passenger?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.passenger?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Booked on {new Date(booking.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Driver Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver</h2>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-blue-600">
                        {ride.driver?.full_name?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {ride.driver?.full_name || 'Driver'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ride.driver?.university || 'University Student'}
                      </p>
                    </div>
                  </div>
                  
                  {!isDriver && (
                    <div className="space-y-2">
                      {ride.driver?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          <span>{ride.driver.phone}</span>
                        </div>
                      )}
                      {ride.driver?.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          <span>{ride.driver.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div>
                  {isDriver ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <p className="text-blue-800 font-medium">This is your ride</p>
                      <p className="text-sm text-blue-600">Manage requests from your dashboard</p>
                    </div>
                  ) : hasRequested ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-yellow-800 font-medium">Request Sent</p>
                      <p className="text-sm text-yellow-600">Waiting for driver approval</p>
                    </div>
                  ) : availableSeats > 0 ? (
                    <button
                      onClick={handleRequestRide}
                      disabled={requesting}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {requesting ? 'Sending Request...' : 'Request Ride'}
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-800 font-medium">No Seats Available</p>
                      <p className="text-sm text-red-600">This ride is fully booked</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RideDetails