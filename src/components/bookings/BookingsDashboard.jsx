import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useBookings } from '../../hooks/useBookings'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  UserIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

const BookingsDashboard = () => {
  const { bookings, loading, updateBookingStatus } = useBookings()
  const [activeTab, setActiveTab] = useState('incoming') // incoming, outgoing

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const handleAcceptBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'accepted')
  }

  const handleDeclineBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'declined')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
        <p className="text-lg text-gray-600">Manage your ride bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'incoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Incoming Requests ({bookings.asDriver?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'outgoing'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Bookings ({bookings.asPassenger?.length || 0})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'incoming' ? (
        // Incoming booking requests (as driver)
        <div className="space-y-4">
          {bookings.asDriver?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No booking requests yet</p>
              <p>Passengers will send booking requests for your rides</p>
            </div>
          ) : (
            bookings.asDriver.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <UserIcon className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">
                        Booking Request from {booking.passenger?.full_name}
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        booking.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <span>{booking.ride?.origin} → {booking.ride?.destination}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-purple-600 mr-2" />
                        <span>
                          {new Date(booking.ride?.departure_time).toLocaleDateString()} at{' '}
                          {new Date(booking.ride?.departure_time).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-orange-600 mr-2" />
                        <span>{booking.seats_requested} seat{booking.seats_requested !== 1 ? 's' : ''} requested</span>
                      </div>

                      {booking.pickup_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Pickup notes:</span> {booking.pickup_notes}
                          </p>
                        </div>
                      )}

                      {booking.status === 'accepted' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800 font-medium mb-1">Contact Details:</p>
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm">{booking.passenger?.phone || 'Phone not provided'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handleAcceptBooking(booking.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineBooking(booking.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 mt-4">
                  <p className="text-xs text-gray-500">
                    Requested {new Date(booking.created_at).toLocaleDateString()} at{' '}
                    {new Date(booking.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        // Outgoing bookings (as passenger)
        <div className="space-y-4">
          {bookings.asPassenger?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No bookings yet</p>
              <p>Book a ride to see your booking requests here</p>
            </div>
          ) : (
            bookings.asPassenger.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="font-semibold text-gray-900">
                        Your Booking Request
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        booking.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <span>{booking.ride?.origin} → {booking.ride?.destination}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-purple-600 mr-2" />
                        <span>
                          {new Date(booking.ride?.departure_time).toLocaleDateString()} at{' '}
                          {new Date(booking.ride?.departure_time).toLocaleTimeString([], {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-orange-600 mr-2" />
                        <span>Driver: {booking.ride?.driver?.full_name}</span>
                      </div>

                      {booking.status === 'accepted' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800 font-medium mb-1">Booking Confirmed! 🎉</p>
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm">Driver: {booking.ride?.driver?.phone || 'Phone not provided'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="ml-6">
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default BookingsDashboard