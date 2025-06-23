import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  StarIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { formatDateInBrowserTz, formatTimeInBrowserTz } from '../../utils/timezone'

const RideCard = ({ ride, onBook, onViewDetails }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header with Driver Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {ride.driver?.full_name?.charAt(0) || 'D'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {ride.driver?.full_name || 'Driver'}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {ride.driver?.rating || '4.8'}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {ride.driver?.rides_completed || 12} rides
                </span>
              </div>
            </div>
          </div>
          
          {/* Price Badge */}
          <div className="text-right">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">
              {ride.price_per_seat ? `$${ride.price_per_seat}` : 'FREE'}
            </div>
            <p className="text-xs text-gray-500 mt-1">per seat</p>
          </div>
        </div>

        {/* Route Information */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-4 shadow-sm"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">From</p>
              <p className="font-semibold text-gray-900 truncate">{ride.origin}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-4 shadow-sm"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">To</p>
              <p className="font-semibold text-gray-900 truncate">{ride.destination}</p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <ClockIcon className="w-5 h-5 text-indigo-500 mr-2" />
              <span className="text-sm text-gray-600">Departure</span>
            </div>
            <p className="font-bold text-gray-900">
              <span>
                {formatDateInBrowserTz(ride.departure_time)} at {formatTimeInBrowserTz(ride.departure_time)}
              </span>
            </p>
          </div>
          
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <UserGroupIcon className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <p className="font-bold text-gray-900">{ride.available_seats}</p>
            <p className="text-sm text-gray-700">seats left</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewDetails(ride)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-2xl transition-colors duration-200 flex items-center justify-center"
          >
            View Details
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(ride)}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center group"
          >
            Book Ride
            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            ride.status === 'active' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {ride.status || 'Active'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default RideCard