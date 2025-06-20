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

const MyBookings = React.memo(({ onBookingUpdate }) => {
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatRideId, setChatRideId] = useState(null)
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
    
    if (booking.status === 'accepted') {
      buttons.push(
        <button
          key="chat"
          onClick={() => handleOpenChat(booking.ride_id)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
          Chat
        </button>
      )
    }
    
    buttons.push(
      <button
        key="details"
        onClick={() => handleViewRideDetails(booking)}
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

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{new Date(booking.ride?.departure_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>{new Date(booking.ride?.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
    </div>
  )
})

export default MyBookings
