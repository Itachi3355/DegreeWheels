import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  TrophyIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboard } from '../../hooks/useDashboard'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import MyRides from './MyRides'
import MyRequests from './MyRequests'
import MyBookings from './MyBookings'
import IncomingRequests from './IncomingRequests'
import DashboardStats from './DashboardStats'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showWelcome, setShowWelcome] = useState(true)
  
  const {
    loading,
    myRides,
    myRequests,
    myBookings,
    incomingRequests,
    stats,
    fetchDashboardData,
    deleteRide  // ✅ ADD this if it exists in useDashboard
  } = useDashboard()

  // ✅ CREATE the missing functions directly
  const cancelRideRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('passenger_ride_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('passenger_id', user.id) // ✅ Use correct column

      if (error) throw error
      
      await fetchDashboardData()
      toast.success('Request cancelled successfully')
      return { success: true }
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error('Failed to cancel request')
      return { success: false, error }
    }
  }

  const markRequestAsFound = async (requestId) => {
    try {
      const { error } = await supabase
        .from('passenger_ride_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('passenger_id', user.id) // ✅ Use correct column

      if (error) throw error
      
      await fetchDashboardData()
      toast.success('Request marked as completed')
      return { success: true }
    } catch (error) {
      console.error('Error marking request as found:', error)
      toast.error('Failed to update request')
      return { success: false, error }
    }
  }

  // ✅ MOVE renderTabContent INSIDE the component so it can access the functions
  const renderTabContent = (activeTab, data) => {
    const { myRides, myRequests, myBookings, incomingRequests } = data

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardStats 
              myRides={myRides}
              myRequests={myRequests}
              incomingRequests={incomingRequests}
            />
            {/* Recent Activity Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Rides</h3>
                {myRides?.slice(0, 3).map((ride) => (
                  <div key={ride.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ride.origin} → {ride.destination}</p>
                      <p className="text-sm text-gray-600">{new Date(ride.departure_time).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {myRides?.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No rides yet</p>
                )}
              </div>
              
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
                {myRequests?.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{request.origin} → {request.destination}</p>
                      <p className="text-sm text-gray-600">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {myRequests?.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No requests yet</p>
                )}
              </div>
            </div>
          </div>
        )
      case 'rides':
        return (
          <MyRides 
            rides={myRides} 
            onDeleteRide={deleteRide}
            onRefetch={fetchDashboardData}
          />
        )
      case 'requests':
        return (
          <MyRequests 
            requests={myRequests} 
            onCancelRequest={cancelRideRequest}
            onMarkAsFound={markRequestAsFound}
            onRefetch={fetchDashboardData}
          />
        )
      case 'bookings':
        // 🔧 FIX: Don't pass bookings as prop AND don't trigger multiple fetches
        return (
          <MyBookings 
            key={`bookings-${activeTab}`}  // Stable key based on tab, not time
            onBookingUpdate={fetchDashboardData}
          />
        )
      default:
        return null
    }
  }

  // Quick actions
  const quickActions = [
    {
      title: 'Offer a Ride',
      subtitle: 'Share your journey with fellow students',
      icon: PlusIcon,
      gradient: 'from-blue-500 to-cyan-500',
      action: () => navigate('/offer-ride')
    },
    {
      title: 'Find a Ride',
      subtitle: 'Browse available rides near you',
      icon: MagnifyingGlassIcon,
      gradient: 'from-green-500 to-emerald-500',
      action: () => navigate('/search')
    },
    {
      title: 'Request a Ride',
      subtitle: 'Post your ride request',
      icon: SparklesIcon,
      gradient: 'from-purple-500 to-pink-500',
      action: () => navigate('/request-ride')
    }
  ]

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrophyIcon, count: 0 },
    { id: 'rides', label: 'My Rides', icon: UserGroupIcon, count: myRides?.length },
    { id: 'requests', label: 'Requests', icon: MapPinIcon, count: myRequests?.length },
    { id: 'bookings', label: 'Bookings', icon: CalendarIcon, count: myBookings?.length }
  ]

  const handleTabClick = (e, tab) => {
    e.preventDefault()
    setActiveTab(tab)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-20">
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
          />
          <span className="ml-4 text-lg text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section with Modern Glass Card */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative mb-8 overflow-hidden"
            >
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-gray-900"
                      >
                        Welcome back, {user?.profile?.full_name || user?.email?.split('@')[0]}! 🚗
                      </motion.h1>
                      <p className="text-gray-600 text-lg">Ready for your next adventure?</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions with Hover Effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="group bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`inline-flex p-3 bg-gradient-to-r ${action.gradient} rounded-xl text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600">{action.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats Cards with Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard
            label="Total Rides"
            value={myRides?.length || 0}
            icon={UserGroupIcon}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            label="Requests"
            value={myRequests?.length || 0}
            icon={MapPinIcon}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            label="Bookings"
            value={myBookings?.length || 0}
            icon={CalendarIcon}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            label="Karma Points"
            value={user?.profile?.karma_points || 0}
            icon={TrophyIcon}
            color="from-yellow-500 to-orange-500"
          />
        </motion.div>

        {/* Modern Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl p-2 border border-white/50 shadow-lg mb-8"
        >
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => handleTabClick(e, tab.id)}
                className={`relative flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-lg -z-10"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content with Animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent(activeTab, { myRides, myRequests, myBookings, incomingRequests })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Modern Stats Card Component
const StatsCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 bg-gradient-to-r ${color} rounded-xl shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
)

export default Dashboard