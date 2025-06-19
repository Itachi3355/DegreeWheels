import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { XMarkIcon, MapPinIcon, CalendarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const RideForm = ({ onClose, onSuccess, initialData = {} }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Location state to handle coordinates
  const [locationState, setLocationState] = useState({
    origin: initialData.origin || '',
    destination: initialData.destination || '',
    originCoordinates: null,
    destinationCoordinates: null
  })
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      origin: initialData.origin || '',
      destination: initialData.destination || '',
      departure_date: initialData.departureDate || new Date().toISOString().split('T')[0],
      departure_time: initialData.departureTime || '',
      available_seats: initialData.availableSeats || 1,
      notes: ''
    }
  })

  // Location handlers
  const handleOriginSelect = (location) => {
    if (location) {
      setLocationState(prev => ({
        ...prev,
        origin: location.name,
        originCoordinates: location.coordinates
      }))
      setValue('origin', location.name)
    } else {
      setLocationState(prev => ({
        ...prev,
        origin: '',
        originCoordinates: null
      }))
      setValue('origin', '')
    }
  }

  const handleDestinationSelect = (location) => {
    if (location) {
      setLocationState(prev => ({
        ...prev,
        destination: location.name,
        destinationCoordinates: location.coordinates
      }))
      setValue('destination', location.name)
    } else {
      setLocationState(prev => ({
        ...prev,
        destination: '',
        destinationCoordinates: null
      }))
      setValue('destination', '')
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      console.log('🚀 Creating ride with data:', data)

      const rideData = {
        driver_id: user.id,
        origin: locationState.origin,
        destination: locationState.destination,
        origin_coordinates: locationState.originCoordinates 
          ? `(${locationState.originCoordinates[0]},${locationState.originCoordinates[1]})`
          : null,
        destination_coordinates: locationState.destinationCoordinates 
          ? `(${locationState.destinationCoordinates[0]},${locationState.destinationCoordinates[1]})`
          : null,
        departure_time: `${data.departure_date}T${data.departure_time}:00`,
        available_seats: parseInt(data.available_seats),
        total_seats: parseInt(data.available_seats),
        notes: data.notes || '',
        status: 'active',
        created_at: new Date().toISOString()
      }

      console.log('Final ride data:', rideData)

      const { data: createdRide, error } = await supabase
        .from('rides')
        .insert([rideData])
        .select()
        .single()

      if (error) throw error
      
      toast.success('🚗 Ride offer created successfully!')
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/dashboard')
      }

    } catch (error) {
      console.error('❌ Error creating ride:', error)
      toast.error('Failed to create ride offer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Post a New Ride</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              From (Pickup Location) *
            </label>
            <LocationInput
              placeholder="Where will you start your trip?"
              onLocationSelect={handleOriginSelect}
              initialValue={locationState.origin}
              className="w-full"
            />
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...register('origin', { required: 'Pickup location is required' })}
              value={locationState.origin}
            />
            {errors.origin && (
              <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>
            )}
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              To (Destination) *
            </label>
            <LocationInput
              placeholder="Where are you going?"
              onLocationSelect={handleDestinationSelect}
              initialValue={locationState.destination}
              className="w-full"
            />
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...register('destination', { required: 'Destination is required' })}
              value={locationState.destination}
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                {...register('departure_date', { required: 'Date is required' })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.departure_date && (
                <p className="mt-1 text-sm text-red-600">{errors.departure_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Time *
              </label>
              <input
                type="time"
                {...register('departure_time', { required: 'Time is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.departure_time && (
                <p className="mt-1 text-sm text-red-600">{errors.departure_time.message}</p>
              )}
            </div>
          </div>

          {/* Available Seats - Now takes full width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserGroupIcon className="w-4 h-4 inline mr-1" />
              Available Seats *
            </label>
            <select
              {...register('available_seats', { required: 'Available seats is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>
                  {num} seat{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
            {errors.available_seats && (
              <p className="mt-1 text-sm text-red-600">{errors.available_seats.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Any additional info (pickup details, car info, preferences, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Include helpful details like car make/model, pickup instructions, or passenger preferences
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Posting...' : 'Post Ride'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default RideForm