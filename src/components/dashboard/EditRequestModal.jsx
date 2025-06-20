// File: src/components/dashboard/EditRequestModal.jsx
import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext' // ✅ ADD this import
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'

const EditRequestModal = ({ request, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth() // ✅ ADD this line to get user
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    originCoordinates: null,
    destinationCoordinates: null,
    departure_date: '',
    departure_time: '',
    max_price: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  // Populate form when request changes
  useEffect(() => {
    if (request) {
      console.log('🔧 Editing request:', request)
      
      const departureTime = request.preferred_departure_time 
        ? new Date(request.preferred_departure_time) 
        : null

      setFormData({
        origin: request.origin || '',
        destination: request.destination || '',
        originCoordinates: null,
        destinationCoordinates: null,
        departure_date: departureTime ? departureTime.toISOString().split('T')[0] : '',
        departure_time: departureTime ? departureTime.toTimeString().slice(0, 5) : '',
        max_price: request.max_price || '',
        notes: request.notes || ''
      })
    }
  }, [request])

  const handleOriginSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      origin: location ? location.name : '',
      originCoordinates: location ? location.coordinates : null
    }))
  }

  const handleDestinationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      destination: location ? location.name : '',
      destinationCoordinates: location ? location.coordinates : null
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.origin || !formData.destination) {
      toast.error('Please fill in origin and destination')
      return
    }

    try {
      setLoading(true)

      const updateData = {
        origin: formData.origin,
        destination: formData.destination,
        notes: formData.notes || '',
        updated_at: new Date().toISOString()
      }

      // Add departure time if both date and time are provided
      if (formData.departure_date && formData.departure_time) {
        updateData.preferred_departure_time = `${formData.departure_date}T${formData.departure_time}:00+00`
      }

      // Add coordinates if available
      if (formData.originCoordinates) {
        updateData.origin_coordinates = `(${formData.originCoordinates[0]},${formData.originCoordinates[1]})`
      }
      if (formData.destinationCoordinates) {
        updateData.destination_coordinates = `(${formData.destinationCoordinates[0]},${formData.destinationCoordinates[1]})`
      }

      console.log('🔧 Updating request ID:', request.id)
      console.log('🔧 Update data:', updateData)

      const { data, error } = await supabase
        .from('passenger_ride_requests')
        .update(updateData)
        .eq('id', request.id)
        .eq('passenger_id', user.id) // ✅ Use passenger_id since that's what your table uses
        .select()

      // If that fails, try with requester_id:
      // .eq('requester_id', user.id)

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Update successful:', data)

      toast.success('Request updated successfully!')
      
      if (onSuccess) {
        await onSuccess()
      }
      
      onClose()

    } catch (error) {
      console.error('❌ Error updating request:', error)
      toast.error(`Failed to update request: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Ride Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Origin and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From *
              </label>
              <LocationInput
                placeholder="Where do you want to be picked up?"
                onLocationSelect={handleOriginSelect}
                initialValue={formData.origin}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To *
              </label>
              <LocationInput
                placeholder="Where do you want to go?"
                onLocationSelect={handleDestinationSelect}
                initialValue={formData.destination}
                className="w-full"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData(prev => ({ ...prev, departure_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <input
                type="time"
                value={formData.departure_time}
                onChange={(e) => setFormData(prev => ({ ...prev, departure_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Price (Optional)
            </label>
            <input
              type="number"
              value={formData.max_price}
              onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
              placeholder="Leave empty for negotiable"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional information or preferences..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRequestModal