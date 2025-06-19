import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  StarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

const RideCard = memo(({ ride, onBook }) => {
  const navigate = useNavigate()
  
  console.log('RideCard rendered for ride:', ride.id)

  if (!ride) {
    return null
  }

  const handleViewDetails = () => {
    navigate(`/ride/${ride.id}`) // This will match the /ride/:rideId route
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid time'
    }
  }

  const getTrustScore = (driver) => {
    let score = 0
    if (driver.university) score += 25
    if (driver.phone) score += 15  
    if (driver.emergency_contact) score += 20
    if (driver.car_make && driver.car_model) score += 20
    if (driver.created_at && new Date() - new Date(driver.created_at) > 30 * 24 * 60 * 60 * 1000) score += 20 // 30+ days old
    return score
  }
  
  const trustScore = getTrustScore(ride.driver)
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Driver Info */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
          {ride.driver?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {ride.driver?.full_name || 'Unknown Driver'}
          </p>
          <p className="text-sm text-gray-500">
            {ride.driver?.university || 'University Student'}
          </p>
        </div>
        <div className="flex items-center text-yellow-400">
          <StarIcon className="w-4 h-4 mr-1" />
          <span className="text-sm text-gray-600">4.8</span>
        </div>
      </div>

      {/* Route Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">From</p>
            <p className="text-sm text-gray-600">{ride.origin || 'Origin not specified'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">To</p>
            <p className="text-sm text-gray-600">{ride.destination || 'Destination not specified'}</p>
          </div>
        </div>
      </div>

      {/* Time and Date */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>{formatDate(ride.departure_time)}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{formatTime(ride.departure_time)}</span>
        </div>
        <div className="flex items-center">
          <UserIcon className="w-4 h-4 mr-1" />
          <span>{ride.available_seats || 0} seats</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-4">
        <button 
          onClick={handleViewDetails}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>

      {/* Additional Info */}
      {ride.description && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 line-clamp-2">
            {ride.description}
          </p>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="flex items-center space-x-2 mb-2">
        {trustScore >= 80 && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            ✓ Verified Driver
          </span>
        )}
        {ride.driver.university && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {ride.driver.university}
          </span>
        )}
        {ride.driver.car_make && (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {ride.driver.car_make} {ride.driver.car_model}
          </span>
        )}
      </div>

      {/* Seats Info - Updated */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <UserGroupIcon className="h-4 w-4" />
        <span>{ride.available_seats} seats available</span>
      </div>
    </div>
  )
})

RideCard.propTypes = {
  ride: PropTypes.object.isRequired,
  onBook: PropTypes.func
}

export default RideCard