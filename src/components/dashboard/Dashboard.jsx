import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useDashboard } from '../../hooks/useDashboard'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import DashboardStats from './DashboardStats'
import MyRides from './MyRides'
import MyRequests from './MyRequests'
import IncomingRequests from './IncomingRequests'
import MyBookings from './MyBookings'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    loading,
    error,
    myRides = [],
    myRequests = [],
    myBookings = [],
    incomingRequests = [],
    approveRequest,
    rejectRequest,
    cancelRequest,
    deleteRide,
    cancelRideRequest,
    markRequestAsFound,
    refetch
  } = useDashboard()

  const [requests, setRequests] = useState([])

  // Fetch user's ride requests
  const fetchRequests = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          requester:profiles!ride_requests_requester_id_fkey(*)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching requests:', error)
        return
      }

      console.log('✅ Fetched ride requests:', data)
      setRequests(data || [])
    } catch (err) {
      console.error('Error:', err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user?.id])

  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', count: null },
    { id: 'my-rides', name: 'My Rides', count: myRides.length },
    { id: 'my-requests', name: 'My Requests', count: myRequests.length },
    { id: 'my-bookings', name: 'My Bookings', count: myBookings.length },
    { id: 'incoming', name: 'Incoming Requests', count: incomingRequests.length }
  ]

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['overview', 'rides', 'requests', 'bookings'].includes(tab)) {
      setActiveTab(tab)
      console.log('🎯 Dashboard tab set from URL:', tab)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.profile?.full_name || user?.email}!
            </h1>
            <p className="text-gray-600 mt-1">Manage your rides and requests</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Find Rides
            </button>
            <button
              onClick={() => navigate('/offer-ride')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Offer Ride
            </button>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats 
          myRides={myRides}
          myRequests={myRequests}
          myBookings={myBookings}
          incomingRequests={incomingRequests}
        />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  {tab.name}
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    } rounded-full px-2 py-1 text-xs font-medium`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('/search')}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">Find a Ride</h3>
                      <p className="text-gray-600 text-sm">Search for available rides that match your route</p>
                    </button>
                    <button
                      onClick={() => navigate('/offer-ride')}
                      className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">Offer a Ride</h3>
                      <p className="text-gray-600 text-sm">Share your trip and help other students</p>
                    </button>
                  </div>
                </div>

                {/* Recent Activity - UPDATE THIS */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {/* My Recent Rides */}
                    {Array.isArray(myRides) && myRides.slice(0, 2).map((ride) => (
                      <div key={ride.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {ride.origin} → {ride.destination}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(ride.departure_time).toLocaleDateString()} • {ride.available_seats} seats
                          </p>
                        </div>
                        <span className="text-sm text-blue-600">Your ride</span>
                      </div>
                    ))}
                    
                    {/* My Recent Requests */}
                    {Array.isArray(myRequests) && myRequests.slice(0, 2).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.origin} → {request.destination}
                          </p>
                          <p className="text-sm text-gray-600">
                            Looking for ride • Max price: ${request.max_price || 'Any'}
                          </p>
                        </div>
                        <span className="text-sm text-yellow-600">Your request</span>
                      </div>
                    ))}

                    {/* My Recent Bookings */}
                    {Array.isArray(myBookings) && myBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.ride?.origin} → {booking.ride?.destination}
                          </p>
                          <p className="text-sm text-gray-600">
                            Driver: {booking.ride?.driver?.full_name} • Status: {booking.status}
                          </p>
                        </div>
                        <span className="text-sm text-green-600">Your booking</span>
                      </div>
                    ))}

                    {/* No Activity Message */}
                    {(!Array.isArray(myRides) || myRides.length === 0) && 
                     (!Array.isArray(myRequests) || myRequests.length === 0) && 
                     (!Array.isArray(myBookings) || myBookings.length === 0) && (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No recent activity. Start by offering a ride or finding one!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* My Rides Tab */}
            {activeTab === 'my-rides' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">My Rides</h2>
                  <button
                    onClick={() => navigate('/offer-ride')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Offer New Ride
                  </button>
                </div>
                <MyRides rides={myRides} onDeleteRide={deleteRide} />
              </div>
            )}

            {/* My Requests Tab */}
            {activeTab === 'my-requests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">My Requests</h2>
                  <button
                    onClick={() => navigate('/search')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Post New Request
                  </button>
                </div>
                <MyRequests 
                  requests={myRequests} 
                  onCancelRequest={cancelRideRequest}
                  onMarkAsFound={markRequestAsFound}
                  onRefetch={refetch}
                />
              </div>
            )}

            {/* My Bookings Tab - ADD THIS */}
            {activeTab === 'my-bookings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">My Bookings</h2>
                  <button
                    onClick={() => navigate('/search')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Find More Rides
                  </button>
                </div>
                <MyBookings bookings={myBookings} onCancelBooking={cancelRequest} />
              </div>
            )}

            {/* Incoming Requests Tab */}
            {activeTab === 'incoming' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Incoming Requests</h2>
                <IncomingRequests 
                  requests={incomingRequests}
                  onApprove={approveRequest}
                  onReject={rejectRequest}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard