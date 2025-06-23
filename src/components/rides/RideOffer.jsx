import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'
import { formatDateInBrowserTz, formatTimeInBrowserTz } from '../../utils/timezone'

const RideOffer = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  
  console.log('🚀 RideOffer - Starting render process')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    origin: '',
    originCoordinates: null,
    destination: '',
    destinationCoordinates: null,
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '',
    availableSeats: 1,
    notes: ''
  })

  // 🔧 FIX: Use useCallback to prevent infinite re-renders
  const handleOriginSelect = useCallback((location) => {
    console.log('🔧 RideOffer - Origin selected:', location)
    setFormData(prev => ({
      ...prev,
      origin: location ? location.name : '',
      originCoordinates: location ? location.coordinates : null
    }))
    
    if (location && errors.origin) {
      setErrors(prev => ({ ...prev, origin: null }))
    }
  }, [errors.origin])

  const handleDestinationSelect = useCallback((location) => {
    console.log('🔧 RideOffer - Destination selected:', location)
    setFormData(prev => ({
      ...prev,
      destination: location ? location.name : '',
      destinationCoordinates: location ? location.coordinates : null
    }))
    
    if (location && errors.destination) {
      setErrors(prev => ({ ...prev, destination: null }))
    }
  }, [errors.destination])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const validateForm = useCallback(() => {
    const newErrors = {}
    
    if (!formData.origin) {
      newErrors.origin = 'Pickup location is required'
    }
    if (!formData.destination) {
      newErrors.destination = 'Destination is required'
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required'
    }
    if (!formData.departureTime) {
      newErrors.departureTime = 'Departure time is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const rideData = {
        driver_id: user.id,
        origin: formData.origin,
        destination: formData.destination,
        origin_coordinates: formData.originCoordinates 
          ? `(${formData.originCoordinates[0]},${formData.originCoordinates[1]})`
          : null,
        destination_coordinates: formData.destinationCoordinates 
          ? `(${formData.destinationCoordinates[0]},${formData.destinationCoordinates[1]})`
          : null,
        departure_time: `${formData.departureDate}T${formData.departureTime}:00`,
        available_seats: parseInt(formData.availableSeats),
        total_seats: parseInt(formData.availableSeats),
        notes: formData.notes,
        status: 'active',
        created_at: new Date().toISOString()
      }

      console.log('🚀 Creating ride:', rideData)

      const { data: createdRide, error } = await supabase
        .from('rides')
        .insert([rideData])
        .select()
        .single()

      if (error) throw error
      
      toast.success('🚗 Ride offer created successfully!')
      navigate('/dashboard')

    } catch (error) {
      console.error('❌ Error creating ride:', error)
      toast.error('Failed to create ride offer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [user?.id, formData, validateForm, navigate])

  // 🔧 FIX: Memoize form fields to prevent re-renders
  const originLocationKey = `origin-${formData.origin}`
  const destinationLocationKey = `destination-${formData.destination}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer a Ride</h1>
            <p className="text-gray-600">Share your journey with fellow students</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From *
                </label>
                <LocationInput
                  key={originLocationKey}
                  placeholder="Enter pickup location"
                  onLocationSelect={handleOriginSelect}
                  initialValue={formData.origin}
                  className="w-full"
                  required
                />
                {errors.origin && (
                  <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To *
                </label>
                <LocationInput
                  key={destinationLocationKey}
                  placeholder="Enter destination"
                  onLocationSelect={handleDestinationSelect}
                  initialValue={formData.destination}
                  className="w-full"
                  required
                />
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {errors.departureDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Time *
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {errors.departureTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.departureTime}</p>
                )}
              </div>
            </div>

            {/* Available Seats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Seats *
                </label>
                <select
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <option key={num} value={num}>{num} seat{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div></div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information for passengers..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Ride Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RideOffer