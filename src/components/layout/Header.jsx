import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  HomeIcon,
  MapIcon,
  PlusIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationDropdown from './NotificationDropdown'

const Header = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  
  // Separate refs for each dropdown
  const profileMenuRef = useRef(null)
  const notificationRef = useRef(null)

  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification 
  } = useNotifications()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Find Rides', href: '/rides', icon: MapIcon },
    { name: 'Create Ride', href: '/rides/create', icon: PlusIcon },
  ]

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Notification toggle
  const handleNotificationToggle = () => {
    setShowNotifications(!showNotifications)
    if (showUserMenu) setShowUserMenu(false)
  }

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu)
    if (showNotifications) setShowNotifications(false)
  }

  // Notification handlers
  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId)
    toast.success('Notification marked as read')
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    toast.success('All notifications marked as read')
  }

  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId)
    toast.success('Notification deleted')
  }

  const handleCloseNotifications = () => {
    setShowNotifications(false)
  }

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20 
          ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-white/60 backdrop-blur-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300 relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <svg className="absolute inset-0 w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <g opacity="0.8">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" opacity="0.6"/>
                      <circle cx="12" cy="12" r="8.5" strokeWidth="1" opacity="0.4"/>
                      <circle cx="12" cy="12" r="7" strokeWidth="0.8" opacity="0.3"/>
                      <circle cx="12" cy="12" r="9.2" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 4"/>
                    </g>
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-full shadow-inner">
                      <div className="w-4 h-4 bg-gray-200 rounded-full m-0.5"></div>
                    </div>
                  </div>
                </motion.div>
                
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-white text-lg drop-shadow-lg" role="img" aria-label="degree">
                    🎓
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DegreeWheels
              </span>
              <div className="flex space-x-1 hidden sm:flex">
                {['M', 'M', 'S', 'S'].map((letter, i) => (
                  <span 
                    key={i}
      className={`w-4 h-4 bg-gradient-to-r ${
        i === 0 ? 'from-blue-500 to-blue-600' :
        i === 1 ? 'from-green-500 to-green-600' : 
        i === 2 ? 'from-purple-500 to-purple-600' :
        'from-orange-500 to-orange-600'
      } text-white text-xs font-bold rounded-full flex items-center justify-center`}
      title={
        i === 0 ? 'Meet' :
        i === 1 ? 'Move' :
        i === 2 ? 'Share' :
        'Save' 
      }
    >
                    {letter}
                  </span>
                ))}
              </div>
              
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNotificationToggle}
                className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 top-full mt-2 z-[9999]"
                  style={{
                    position: 'fixed',
                    top: '4rem',
                    right: '1rem',
                    zIndex: 99999
                  }}
                >
                  <NotificationDropdown 
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onClose={handleCloseNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onDelete={handleDeleteNotification}
                  />
                </div>
              )}
            </div>

            {/* Contact Us Icon/Button */}
            <Link
              to="/contact"
              className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full transition-colors"
              title="Contact Us"
            >
              <EnvelopeIcon className="w-6 h-6" />
            </Link>

            {user ? (
              <>
                {/* User Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                        {profile?.full_name || user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {profile?.university || 'Student'}
                      </div>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {profile?.full_name || user.email}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        
                        <hr className="my-2" />
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            handleSignOut()
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/50"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {user && (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Header