import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPinIcon, 
  ClockIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LocationInput from '../common/LocationInput'

const RideOffer = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state - ONLY LocationInput, no duplicate inputs
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    originCoordinates: null,
    destinationCoordinates: null,
    departure_date: new Date().toISOString().split('T')[0],
    departure_time: '',
    available_seats: 1,
    price: 0,
    description: ''
  })

  const [errors, setErrors] = useState({})

  // Location handlers - these will be the ONLY inputs for locations
  const handleOriginSelect = (location) => {
    console.log('🎯 Origin selected:', location)
    setFormData(prev => ({
      ...prev,
      origin: location ? location.name : '',
      originCoordinates: location ? location.coordinates : null
    }))
    
    if (location && errors.origin) {
      setErrors(prev => ({ ...prev, origin: null }))
    }
  }

  const handleDestinationSelect = (location) => {
    console.log('🎯 Destination selected:', location)
    setFormData(prev => ({
      ...prev,
      destination: location ? location.name : '',
      destinationCoordinates: location ? location.coordinates : null
    }))
    
    if (location && errors.destination) {
      setErrors(prev => ({ ...prev, destination: null }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.origin) {
      newErrors.origin = 'Pickup location is required'
    }
    if (!formData.destination) {
      newErrors.destination = 'Destination is required'
    }
    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required'
    }
    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required'
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

    setIsSubmitting(true)
    try {
      const rideData = {
        driver_id: user.id,
        origin: formData.origin,
        destination: formData.destination,
        origin_coordinates: formData.originCoordinates,
        destination_coordinates: formData.destinationCoordinates,
        departure_time: `${formData.departure_date}T${formData.departure_time}:00`,
        available_seats: parseInt(formData.available_seats),
        total_seats: parseInt(formData.available_seats),
        price_per_seat: parseFloat(formData.price) || 0,
        notes: formData.description,
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
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer a Ride</h1>
          <p className="text-lg text-gray-600">
            Share your journey and help fellow students get around campus
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ride Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ✅ ONLY LocationInput for Origin - NO duplicate input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Pickup Location *
                </label>
                <LocationInput
                  placeholder="Where will you start your trip?"
                  onLocationSelect={handleOriginSelect}
                  initialValue={formData.origin}
                  className="w-full"
                />
                {errors.origin && (
                  <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
                )}
                <p className="mt-1 text-xs text-blue-600">
                  Selected: {formData.origin || 'None'}
                </p>
              </div>

              {/* ✅ ONLY LocationInput for Destination - NO duplicate input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Destination *
                </label>
                <LocationInput
                  placeholder="Where are you going?"
                  onLocationSelect={handleDestinationSelect}
                  initialValue={formData.destination}
                  className="w-full"
                />
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                )}
                <p className="mt-1 text-xs text-blue-600">
                  Selected: {formData.destination || 'None'}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Departure Date *
                </label>
                <input
                  type="date"
                  name="departure_date"
                  value={formData.departure_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.departure_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.departure_date}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Departure Time *
                </label>
                <input
                  type="time"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.departure_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.departure_time}</p>
                )}
              </div>

              {/* Available Seats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserGroupIcon className="w-4 h-4 inline mr-1" />
                  Available Seats *
                </label>
                <select
                  name="available_seats"
                  value={formData.available_seats}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Price per Person
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00 (Free)"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank or 0 for free rides</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information about your ride..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Ride Offer
                    <CheckCircleIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  )
}

export default RideOffer