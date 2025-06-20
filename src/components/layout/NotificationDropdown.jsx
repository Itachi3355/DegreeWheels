// File: src/components/layout/NotificationDropdown.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckIcon, 
  XMarkIcon, 
  BellIcon,
  BellSlashIcon,
  ClockIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserPlusIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

const NotificationDropdown = ({ notifications = [], unreadCount = 0, onClose, onMarkAsRead, onMarkAllAsRead, onDelete }) => {
  const [localNotifications, setLocalNotifications] = useState(notifications)

  // Mock notifications if none provided
  const mockNotifications = [
    {
      id: 1,
      type: 'ride_request',
      title: 'New ride request',
      message: 'John Doe wants to join your ride to Dallas',
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
      read: false,
      icon: UserPlusIcon,
      color: 'blue'
    },
    {
      id: 2,
      type: 'ride_confirmed',
      title: 'Ride confirmed',
      message: 'Your ride to Austin has been confirmed',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      read: true,
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      id: 3,
      type: 'ride_cancelled',
      title: 'Ride cancelled',
      message: 'Your ride to Houston has been cancelled',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false,
      icon: ExclamationTriangleIcon,
      color: 'red'
    },
    {
      id: 4,
      type: 'ride_reminder',
      title: 'Ride reminder',
      message: 'Your ride to San Antonio starts in 30 minutes',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      read: false,
      icon: ClockIcon,
      color: 'orange'
    },
    {
      id: 5,
      type: 'ride_completed',
      title: 'Ride completed',
      message: 'Thank you for using DegreeWheels!',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      read: true,
      icon: CheckCircleIcon,
      color: 'green'
    }
  ]

  const displayNotifications = localNotifications.length > 0 ? localNotifications : mockNotifications
  const displayUnreadCount = unreadCount > 0 ? unreadCount : displayNotifications.filter(n => !n.read).length

  const getNotificationIcon = (notification) => {
    const IconComponent = notification.icon || InformationCircleIcon
    const colorMap = {
      blue: 'text-blue-500 bg-blue-50',
      green: 'text-green-500 bg-green-50',
      red: 'text-red-500 bg-red-50',
      orange: 'text-orange-500 bg-orange-50',
      purple: 'text-purple-500 bg-purple-50'
    }
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[notification.color] || colorMap.blue}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    )
  }

  const handleMarkAsRead = (notificationId) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    if (onMarkAsRead) {
      onMarkAsRead(notificationId)
    }
  }

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    if (onMarkAllAsRead) {
      onMarkAllAsRead()
    }
  }

  const handleDelete = (notificationId) => {
    setLocalNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
    if (onDelete) {
      onDelete(notificationId)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
      style={{ width: '380px', maxWidth: '90vw' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <BellIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {displayUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {displayUnreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {displayUnreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <BellSlashIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm">We'll notify you when something happens</p>
          </div>
        ) : (
          displayNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group ${
                !notification.read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium text-gray-900 truncate ${
                        !notification.read ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-100"
                          title="Mark as read"
                        >
                          <CheckIcon className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        className="p-1 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100"
                        title="Delete"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {displayNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {displayNotifications.length} notification{displayNotifications.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default NotificationDropdown