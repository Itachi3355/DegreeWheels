import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'

const RideRequestForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    seats: 1,
    maxPrice: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleLocationSelect = (field, location) => {
    setFormData(prev => ({
      ...prev,
      [field]: location.place_name || location.text || location.name || ''
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const geocodeLocation = async (address) => {
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=YOUR_MAPBOX_ACCESS_TOKEN`)
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const { geometry } = data.features[0]
        return {
          lat: geometry.coordinates[1],
          lng: geometry.coordinates[0]
        }
      }
      
      return null
    } catch (error) {
      console.error('Error geocoding location:', error)
      return null
    }
  }

  const createRideRequest = async (requestData) => {
    try {
      // Geocode origin and destination
      const originCoords = await geocodeLocation(requestData.origin)
      const destCoords = await geocodeLocation(requestData.destination)

      const requestWithCoords = {
        ...requestData,
        origin_coordinates: originCoords ? [originCoords.lng, originCoords.lat] : null,
        destination_coordinates: destCoords ? [destCoords.lng, destCoords.lat] : null
      }

      const { data, error } = await supabase
        .from('ride_requests')
        .insert([requestWithCoords])
        .select()

      return { data, error }
    } catch (error) {
      console.error('Error creating ride request:', error)
      throw error
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🚀 Form submitted with data:', formData)
    console.log('🚀 User:', user)
    
    if (!user) {
      setError('You must be logged in to request a ride')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.origin || !formData.destination || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields')
      }

      // Create datetime string
      const departureDateTime = new Date(`${formData.date}T${formData.time}`)
      console.log('🚀 Departure time:', departureDateTime)
      
      if (departureDateTime <= new Date()) {
        throw new Error('Departure time must be in the future')
      }

      // Prepare data for insertion
      const insertData = {
        requester_id: user.id,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: departureDateTime.toISOString(),
        seats_needed: parseInt(formData.seats),
        max_price: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        notes: formData.notes || null,
        status: 'active'
      }
      
      console.log('🚀 Inserting data:', insertData)

      // Create ride request in database
      const { data: requestData, error: insertError } = await createRideRequest(insertData)

      if (insertError) {
        console.error('❌ Insert error:', insertError)
        throw new Error(insertError.message)
      }

      console.log('✅ Ride request created successfully:', requestData)

      // Show success message
      toast.success('Ride request posted successfully!')

      // Call success callback
      if (onSuccess) {
        onSuccess(requestData)
      }

    } catch (err) {
      console.error('❌ Error creating ride request:', err)
      setError(err.message || 'Failed to create ride request')
      toast.error('Failed to create ride request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-4">
        <p className="text-gray-600">
          Tell us where you want to go and we'll help you find a ride
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              From *
            </label>
            <LocationInput
              placeholder="Enter pickup location"
              onLocationSelect={(location) => handleLocationSelect('origin', location)}
              initialValue={formData.origin}
              className="w-full"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              To *
            </label>
            <LocationInput
              placeholder="Enter destination"
              onLocationSelect={(location) => handleLocationSelect('destination', location)}
              initialValue={formData.destination}
              className="w-full"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Time *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Seats and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserGroupIcon className="w-4 h-4 inline mr-1" />
              Seats Needed *
            </label>
            <select
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 seat</option>
              <option value={2}>2 seats</option>
              <option value={3}>3 seats</option>
              <option value={4}>4 seats</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
              Max Price (optional)
            </label>
            <input
              type="number"
              name="maxPrice"
              value={formData.maxPrice}
              onChange={handleInputChange}
              placeholder="$0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
            Additional Notes (optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="Any specific requirements or notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Request...
              </span>
            ) : (
              'Request Ride'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default RideRequestForm