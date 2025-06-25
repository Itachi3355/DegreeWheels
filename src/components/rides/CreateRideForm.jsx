import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useCreateRide } from '../../hooks/useCreateRide'
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'

const CreateRideForm = ({ onSuccess }) => {
  const navigate = useNavigate()
  const { loading, createRide } = useCreateRide()
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    originCoordinates: null,
    destinationCoordinates: null,
    departure_date: new Date().toISOString().split('T')[0],
    departure_time: '',
    available_seats: 1,
    description: ''
  })

  const [errors, setErrors] = useState({})

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0]
  
  // Get current time
  const now = new Date()
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0')

  // Location selection handlers
  const handleOriginSelect = useCallback((location) => {
    setFormData(prev => ({
      ...prev,
      origin: location ? location.name : '',
      originCoordinates: location ? location.coordinates : null
    }))
    if (errors.origin) {
      setErrors(prev => ({ ...prev, origin: '' }))
    }
  }, [errors.origin])

  const handleDestinationSelect = useCallback((location) => {
    setFormData(prev => ({
      ...prev,
      destination: location ? location.name : '',
      destinationCoordinates: location ? location.coordinates : null
    }))
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: '' }))
    }
  }, [errors.destination])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.origin.trim()) {
      newErrors.origin = 'Pickup location is required'
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }
    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required'
    }
    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required'
    }
    
    // Validate future date/time
    if (formData.departure_date && formData.departure_time) {
      const selectedDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`)
      const now = new Date()
      
      if (selectedDateTime <= now) {
        newErrors.departure_time = 'Departure time must be in the future'
      }
    }

    if (!formData.available_seats || formData.available_seats < 1) {
      newErrors.available_seats = 'At least 1 seat is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const rideData = {
        origin: formData.origin,
        destination: formData.destination,
        origin_coordinates: formData.originCoordinates, // <-- add this
        destination_coordinates: formData.destinationCoordinates, // <-- add this
        departure_time: `${formData.departure_date}T${formData.departure_time}:00`,
        available_seats: parseInt(formData.available_seats),
        description: formData.description
      }

      const result = await createRide(rideData)
      
      if (result.success) {
        toast.success('Ride created successfully!')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error creating ride:', error)
      toast.error('Failed to create ride. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Compact Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create Your Ride</h1>
                <p className="text-lg opacity-90 mt-1">Share your journey with fellow students</p>
              </div>
            </div>
          </div>

          {/* Single Page Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Route Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Origin */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-green-600 mr-2" />
                    Pickup Location *
                  </div>
                </label>
                <LocationInput
                  placeholder="Enter pickup location..."
                  onLocationSelect={handleOriginSelect}
                  initialValue={formData.origin}
                  className={`${errors.origin ? 'border-red-300' : 'border-gray-300'} rounded-lg`}
                />
                {errors.origin && (
                  <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-red-600 mr-2" />
                    Destination *
                  </div>
                </label>
                <LocationInput
                  placeholder="Enter destination..."
                  onLocationSelect={handleDestinationSelect}
                  initialValue={formData.destination}
                  className={`${errors.destination ? 'border-red-300' : 'border-gray-300'} rounded-lg`}
                />
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                )}
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
                    Departure Date *
                  </div>
                </label>
                <input
                  type="date"
                  name="departure_date"
                  value={formData.departure_date}
                  onChange={handleInputChange}
                  min={today}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.departure_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.departure_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.departure_date}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-purple-600 mr-2" />
                    Departure Time *
                  </div>
                </label>
                <input
                  type="time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  min={formData.departure_date === today ? currentTime : undefined}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.departure_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.departure_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.departure_time}</p>
                )}
              </div>

              {/* Available Seats */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-orange-600 mr-2" />
                    Available Seats *
                  </div>
                </label>
                <select
                  name="available_seats"
                  value={formData.available_seats}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.available_seats ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} seat{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
                {errors.available_seats && (
                  <p className="mt-1 text-sm text-red-600">{errors.available_seats}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-5 h-5 text-indigo-600 mr-2" />
                  Additional Information (Optional)
                </div>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Meeting point details, car info, special requirements..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Quick Preview */}
            {(formData.origin || formData.destination) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
              >
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <SparklesIcon className="w-5 h-5 text-blue-600 mr-2" />
                  Ride Preview
                </h3>
                <div className="text-sm space-y-2">
                  {formData.origin && formData.destination && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600">Route:</span>
                      <span className="ml-2 text-gray-900">{formData.origin} → {formData.destination}</span>
                    </div>
                  )}
                  {formData.departure_date && formData.departure_time && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600">When:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(formData.departure_date).toLocaleDateString()} at {formData.departure_time}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600">Seats:</span>
                    <span className="ml-2 text-gray-900">{formData.available_seats} available</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600">Type:</span>
                    <span className="ml-2 text-green-600 font-semibold">Free Ride</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <motion.button
                type="button"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Create Ride
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateRideForm