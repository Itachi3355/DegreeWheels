// File: src/components/rides/MyRides.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  TruckIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'

const MyRides = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('driving')
  const [myRides, setMyRides] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyRides()
    }
  }, [user])

  const fetchMyRides = async () => {
    try {
      setLoading(true)

      // Fetch rides I'm driving - NO price_per_seat
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          ride_bookings(
            id,
            passenger_id,
            status,
            created_at
          )
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })

      if (ridesError) {
        console.error('Error fetching rides:', ridesError)
        throw ridesError
      }

      // Fetch ride requests I made
      const { data: requestsData, error: requestsError } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (requestsError) {
        console.error('Error fetching requests:', requestsError)
        throw requestsError
      }

      // Fetch rides I've booked - NO price_per_seat
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('ride_bookings')
        .select(`
          *,
          ride:rides(
            id,
            origin,
            destination,
            departure_time,
            available_seats,
            status
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        throw bookingsError
      }

      setMyRides(ridesData || [])
      setMyRequests(requestsData || [])
      setMyBookings(bookingsData || [])

    } catch (error) {
      console.error('Error fetching my rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'driving', label: 'Driving', count: myRides.length, icon: TruckIcon },
    { id: 'requests', label: 'My Requests', count: myRequests.length, icon: UserGroupIcon },
    { id: 'bookings', label: 'My Bookings', count: myBookings.length, icon: CalendarIcon }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rides</h1>
          <p className="text-gray-600">Manage your rides, requests, and bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {tabs.map(({ id, label, count, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeTab === id ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'driving' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Rides I'm Driving</h2>
              {myRides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TruckIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>You haven't posted any rides yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRides.map(ride => (
                    <RideCard key={ride.id} ride={ride} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Ride Requests</h2>
              {myRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserGroupIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>You haven't made any ride requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map(request => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>You haven't booked any rides yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple card components
const RideCard = ({ ride }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-green-600" />
          <span className="font-medium">{ride.origin}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-red-600" />
          <span className="font-medium">{ride.destination}</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        ride.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {ride.status}
      </span>
    </div>
    
    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <CalendarIcon className="h-4 w-4" />
        <span>{new Date(ride.departure_time).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center space-x-1">
        <ClockIcon className="h-4 w-4" />
        <span>{new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="flex items-center space-x-1">
        <UserGroupIcon className="h-4 w-4" />
        <span>{ride.available_seats} seats</span>
      </div>
    </div>

    {ride.ride_bookings && ride.ride_bookings.length > 0 && (
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600 mb-2">Passengers ({ride.ride_bookings.length}):</p>
        <div className="space-y-1">
          {ride.ride_bookings.map(booking => (
            <div key={booking.id} className="text-sm">
              <span className="font-medium">{booking.passenger?.full_name || 'Anonymous'}</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
)

const RequestCard = ({ request }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-green-600" />
          <span className="font-medium">{request.origin}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-red-600" />
          <span className="font-medium">{request.destination}</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        request.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {request.status}
      </span>
    </div>

    {request.ride_offers && request.ride_offers.length > 0 && (
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600 mb-2">Offers ({request.ride_offers.length}):</p>
        <div className="space-y-2">
          {request.ride_offers.map(offer => (
            <div key={offer.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{offer.driver?.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-600">{offer.message}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {offer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
)

const BookingCard = ({ booking }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-green-600" />
          <span className="font-medium">{booking.ride?.origin}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <MapPinIcon className="h-4 w-4 text-red-600" />
          <span className="font-medium">{booking.ride?.destination}</span>
        </div>
        <p className="text-sm text-gray-600">
          Driver: {booking.ride?.driver?.full_name || 'Anonymous'}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {booking.status}
      </span>
    </div>
  </motion.div>
)

export default MyRides