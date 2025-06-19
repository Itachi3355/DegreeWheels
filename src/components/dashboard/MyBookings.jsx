import React, { useState, useEffect } from 'react'
import { ClockIcon, MapPinIcon, CurrencyDollarIcon, UserIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LocationInput from '../common/LocationInput' // ✅ Add this import
import toast from 'react-hot-toast'
import ChatModal from '../rides/ChatModal'
import { useNavigate } from 'react-router-dom'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chatRideId, setChatRideId] = useState(null)
  const [renderKey, setRenderKey] = useState(0)
  const [showChatModal, setShowChatModal] = useState(false) // ✅ Add separate show state
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // ✅ Add search filters
  const [searchFilters, setSearchFilters] = useState({
    origin: '',
    destination: '',
    status: 'all'
  })

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      
      
      
      const { data, error } = await supabase
        .from('ride_bookings')
        .select(`
          *,
          ride:rides(
            *,
            driver:profiles!rides_driver_id_fkey(*)
          ),
          passenger:profiles!ride_bookings_passenger_id_fkey(*)
        `)
        .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      // The following block was invalid and removed as it did nothing and caused a syntax error
      // If you want to process or map bookings, do it here.

      if (error) {
        console.error('Error fetching bookings:', error)
        throw error
      }

      // ✅ Force re-render by updating both state and key
      setBookings(data || [])
      setRenderKey(prev => prev + 1)
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
      await fetchBookings()
      
      // ✅ Notify parent to refresh counts
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

  // ✅ Add filter function
  const filteredBookings = bookings.filter(booking => {
    const matchesOrigin = !searchFilters.origin || 
      booking.ride?.origin?.toLowerCase().includes(searchFilters.origin.toLowerCase())
    
    const matchesDestination = !searchFilters.destination || 
      booking.ride?.destination?.toLowerCase().includes(searchFilters.destination.toLowerCase())
    
    const matchesStatus = searchFilters.status === 'all' || 
      booking.status === searchFilters.status
    
    return matchesOrigin && matchesDestination && matchesStatus
  })

  const clearFilters = () => {
    setSearchFilters({ origin: '', destination: '', status: 'all' })
  }

  const handleViewRideDetails = (booking) => {
    
    if (booking.ride_id) {
      // Navigate to ride details page
      navigate(`/ride/${booking.ride_id}`)
    } else {
      toast.error('Ride details not available')
    }
  }

  const handleOpenChat = (rideId) => {
    
    setChatRideId(rideId)
    setShowChatModal(true) // ✅ Set show state
  }

  const handleCloseChat = () => {
    
    setShowChatModal(false)
    // Delay clearing the rideId to allow modal to close gracefully
    setTimeout(() => {
      setChatRideId(null)
    }, 300)
  }

  
  
  
  

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error loading bookings: {error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  // ✅ Add explicit length check and force re-render
  const hasBookings = Array.isArray(bookings) && bookings.length > 0

  if (!hasBookings) {
    return (
      <div key={renderKey} className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
        <p className="text-gray-500">Book a ride to see it here</p>
        <button 
          onClick={() => {
            
            fetchBookings()
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Bookings
        </button>
      </div>
    )
  }

  return (
    <div key={renderKey} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        My Bookings ({bookings.length}) - Key: {renderKey}
      </h2>
      
      {bookings.map((booking, index) => (
        <div key={`${booking.id}-${renderKey}`} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900">
                  {booking.ride?.origin} → {booking.ride?.destination}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  booking.status === 'accepted' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Role:</strong> {booking.driver_id === user.id ? 'Driver' : 'Passenger'}</p>
                <p><strong>Seats:</strong> {booking.seats_requested}</p>
                <p><strong>Departure:</strong> {new Date(booking.ride?.departure_time).toLocaleString()}</p>
                <p><strong>Debug:</strong> Booking #{index + 1}, ID: {booking.id}</p>
                {booking.pickup_notes && (
                  <p><strong>Notes:</strong> {booking.pickup_notes}</p>
                )}
              </div>
            </div>
          </div>

          {booking.status === 'accepted' && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleOpenChat(booking.ride_id)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-4.818 1.282a1 1 0 01-1.272-1.272l1.282-4.818A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Chat
              </button>
              
              <button
                onClick={() => handleViewRideDetails(booking)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Chat Modal */}
      {showChatModal && chatRideId && (
        <ChatModal
          rideId={chatRideId}
          isOpen={showChatModal}
          onClose={handleCloseChat}
        />
      )}
    </div>
  )
}

export default MyBookings
