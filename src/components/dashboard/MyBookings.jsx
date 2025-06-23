import React, { useState, useEffect, useRef } from 'react'
import {
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import ChatModal from '../rides/ChatModal'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../../hooks/useDashboard'
import { calculateMapDistance } from '../common/Map'
import { formatDateInBrowserTz, formatTimeInBrowserTz } from '../../utils/timezone'

const MyBookings = React.memo(({ onBookingUpdate }) => {
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatRideId, setChatRideId] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // 🔧 FIX: Get bookings from useDashboard instead of fetching separately
  const { myBookings: bookings, loading } = useDashboard()
  
  const [searchFilters, setSearchFilters] = useState({
    origin: '',
    destination: '',
    status: 'all'
  })

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('ride_bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success(`Booking ${newStatus}!`)
      
      if (onBookingUpdate) {
        onBookingUpdate()
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
    }
  }

  const copyContact = async (contact) => {
    try {
      await navigator.clipboard.writeText(contact)
      toast.success(`Contact copied: ${contact}`)
    } catch (error) {
      toast.error('Failed to copy contact')
    }
  }

  const filteredBookings = bookings?.filter(booking => {
    if (searchFilters.status !== 'all' && booking.status !== searchFilters.status) {
      return false
    }
    if (searchFilters.origin && !booking.ride?.origin?.toLowerCase().includes(searchFilters.origin.toLowerCase())) {
      return false
    }
    if (searchFilters.destination && !booking.ride?.destination?.toLowerCase().includes(searchFilters.destination.toLowerCase())) {
      return false
    }
    return true
  }) || []

  const handleAcceptBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, 'accepted')
  }

  const handleRejectBooking = async (bookingId) => {
    await updateBookingStatus(bookingId, 'rejected')
  }

  const handleOpenChat = (rideId) => {
    setChatRideId(rideId)
    setShowChatModal(true)
  }

  const handleViewRideDetails = (booking) => {
    if (booking.ride?.id) {
      navigate(`/ride/${booking.ride.id}`)
    }
  }

  const getActionButtons = (booking) => {
    const buttons = []
    
    if (booking.status === 'pending' && booking.driver_id === user.id) {
      buttons.push(
        <button
          key="accept"
          onClick={() => handleAcceptBooking(booking.id)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <CheckIcon className="w-4 h-4 mr-1" />
          Accept Ride
        </button>,
        <button
          key="reject"
          onClick={() => handleRejectBooking(booking.id)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          <XMarkIcon className="w-4 h-4 mr-1" />
          Cancel Booking
        </button>
      )
    }
    if (booking.status === 'pending' && booking.passenger_id === user.id) {
    buttons.push(
      <button
        key="approve"
        onClick={() => handleAcceptBooking(booking.id)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
      >
        <CheckIcon className="w-4 h-4 mr-1" />
        Approve Offer
      </button>,
      <button
        key="reject"
        onClick={() => handleRejectBooking(booking.id)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
      >
        <XMarkIcon className="w-4 h-4 mr-1" />
        Reject Offer
      </button>
    )
  }
    
    if (booking.status === 'accepted') {
      buttons.push(
        <button
          key="chat"
          onClick={() => handleOpenChat(booking.ride_id)}
          className="relative inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
          Chat
          {booking.unreadMessages > 0 && (
            <span
              className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"
              title={`${booking.unreadMessages} unread messages`}
            ></span>
          )}
        </button>
      )
    }
    
    buttons.push(
      <button
        key="details"
        onClick={() => {
          setSelectedBooking(booking)
          setShowDetailsModal(true)
        }}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100"
      >
        View Details
      </button>
    )
    
    return buttons
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading bookings...</span>
      </div>
    )
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-600 mb-6">Book a ride to see it here</p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              if (onBookingUpdate) onBookingUpdate()
            }}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh Bookings
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Find Rides
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        My Bookings ({filteredBookings.length})
      </h2>
      
      {filteredBookings.map((booking, index) => (
        <div key={`${booking.id}-${index}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <MapPinIcon className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-medium text-gray-900">
                  {booking.ride?.origin} → {booking.ride?.destination}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status === 'pending' && booking.passenger_id === user.id ? 'Ride Offer Received' :
                   booking.status === 'pending' && booking.driver_id === user.id ? 'Awaiting Passenger Response' :
                   booking.status === 'accepted' ? 'Confirmed' :
                   booking.status === 'cancelled' ? 'Cancelled' :
                   booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              

{booking.status === 'accepted' && booking.driver_id === user.id && booking.passenger && (
  // Passenger Details
  <div className="bg-green-50 rounded-lg p-4 mb-4">
    <h4 className="font-semibold text-green-900 mb-2">Passenger Details</h4>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <span className="text-lg font-medium text-green-800">
          {booking.passenger.full_name?.charAt(0) || 'P'}
        </span>
      </div>
      <div>
        <p className="font-medium text-gray-900">{booking.passenger.full_name || 'Passenger'}</p>
        <p className="text-sm text-gray-500">{booking.passenger.email}</p>
        {booking.passenger.phone && (
          <p className="text-sm text-gray-500">{booking.passenger.phone}</p>
        )}
      </div>
    </div>
  </div>
)}

{booking.status === 'accepted' && booking.passenger_id === user.id && booking.ride?.driver && (
  // Driver Details
  <div className="bg-blue-50 rounded-lg p-4 mb-4">
    <h4 className="font-semibold text-blue-900 mb-2">Driver Details</h4>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-lg font-medium text-blue-600">
          {booking.ride.driver.full_name?.charAt(0) || 'D'}
        </span>
      </div>
      <div>
        <p className="font-medium text-gray-900">{booking.ride.driver.full_name || 'Driver'}</p>
        <p className="text-sm text-gray-500">{booking.ride.driver.email}</p>
        {booking.ride.driver.phone && (
          <p className="text-sm text-gray-500">{booking.ride.driver.phone}</p>
        )}
      </div>
    </div>
  </div>
)}

{booking.ride?.origin_coordinates && booking.ride?.destination_coordinates && (
  <div className="flex items-center text-sm text-gray-600 mb-2">
    <span className="font-medium text-indigo-600">
      Distance: ~{calculateMapDistance(booking.ride.origin_coordinates, booking.ride.destination_coordinates)} miles
    </span>
  </div>
)}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    {booking.ride?.departure_time && !isNaN(Date.parse(booking.ride.departure_time))
                      ? `${formatDateInBrowserTz(booking.ride.departure_time)} at ${formatTimeInBrowserTz(booking.ride.departure_time)}`
                      : 'Date/Time not available'}
                  </span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>
                    {booking.ride?.departure_time && !isNaN(Date.parse(booking.ride.departure_time))
                      ? new Date(booking.ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '--:--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {getActionButtons(booking)}
            </div>
          </div>
        </div>
      ))}

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        rideId={chatRideId}
      />

{showDetailsModal && selectedBooking && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="w-8 h-8 text-white" />
          <h3 className="text-2xl font-bold text-white">Booking Details</h3>
        </div>
        <button
          onClick={() => setShowDetailsModal(false)}
          className="text-white hover:bg-white/20 rounded-full p-2 transition"
          aria-label="Close"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
      </div>
      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-700">From:</span>
            <span className="text-gray-900">{selectedBooking.ride?.origin}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-gray-700">To:</span>
            <span className="text-gray-900">{selectedBooking.ride?.destination}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Date:</span>
            <span className="text-gray-900">
              {formatDateInBrowserTz(selectedBooking.ride?.departure_time)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-700">Time:</span>
            <span className="text-gray-900">
              {formatTimeInBrowserTz(selectedBooking.ride?.departure_time)}
            </span>
          </div>
          {selectedBooking.ride?.origin_coordinates && selectedBooking.ride?.destination_coordinates && (
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-700">Distance:</span>
              <span className="text-indigo-700 font-semibold">
                ~{calculateMapDistance(selectedBooking.ride.origin_coordinates, selectedBooking.ride.destination_coordinates)} miles
              </span>
            </div>
          )}
        </div>
        <hr className="my-2" />
        {/* Passenger or Driver Details */}
        {selectedBooking.status === 'accepted' && selectedBooking.driver_id === user.id && selectedBooking.passenger && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Passenger Details</h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-green-800">
                  {selectedBooking.passenger.full_name?.charAt(0) || 'P'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedBooking.passenger.full_name || 'Passenger'}</p>
                <p className="text-sm text-gray-500">{selectedBooking.passenger.email}</p>
                {selectedBooking.passenger.phone && (
                  <p className="text-sm text-gray-500">{selectedBooking.passenger.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {selectedBooking.status === 'accepted' && selectedBooking.passenger_id === user.id && selectedBooking.ride?.driver && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Driver Details</h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-blue-600">
                  {selectedBooking.ride.driver.full_name?.charAt(0) || 'D'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedBooking.ride.driver.full_name || 'Driver'}</p>
                <p className="text-sm text-gray-500">{selectedBooking.ride.driver.email}</p>
                {selectedBooking.ride.driver.phone && (
                  <p className="text-sm text-gray-500">{selectedBooking.ride.driver.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-end">
        <button
          onClick={() => setShowDetailsModal(false)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
})

export default MyBookings
