import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LocationInput from '../common/LocationInput'
import toast from 'react-hot-toast'
import { formatDateInBrowserTz, formatTimeInBrowserTz } from '../../utils/timezone'

const RideRequestForm = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    originCoordinates: null,
    destinationCoordinates: null,
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: '',
    notes: ''
  })

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
      toast.error('Please fill in both origin and destination')
      return
    }

    try {
      setLoading(true)

      // ✅ FIX: Use exact column names from your table
      const requestData = {
        passenger_id: user.id, // ✅ Correct column name
        origin: formData.origin,
        destination: formData.destination,
        preferred_departure_time: formData.preferred_date && formData.preferred_time 
          ? `${formData.preferred_date}T${formData.preferred_time}:00+00` // ✅ Add timezone
          : null,
        max_price: null, // ✅ Include this column (set to null)
        notes: formData.notes || '',
        status: 'open'
        // ✅ created_at and updated_at should be auto-generated
      }

      // Add coordinates if available
      if (formData.originCoordinates) {
        requestData.origin_coordinates = `(${formData.originCoordinates[0]},${formData.originCoordinates[1]})`
      }
      if (formData.destinationCoordinates) {
        requestData.destination_coordinates = `(${formData.destinationCoordinates[0]},${formData.destinationCoordinates[1]})`
      }

      console.log('🔧 Creating request with data:', requestData)

      const { data, error } = await supabase
        .from('passenger_ride_requests')
        .insert([requestData])
        .select() // ✅ Return the created record

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      console.log('✅ Request created successfully:', data)
      toast.success('Ride request posted successfully!')
      navigate('/dashboard')

    } catch (error) {
      console.error('Error creating ride request:', error)
      toast.error(`Failed to post ride request: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Request a Ride</h1>
            <p className="text-indigo-100">Find fellow students going your way</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  From *
                </label>
                <LocationInput
                  placeholder="Where do you want to be picked up?"
                  onLocationSelect={handleOriginSelect}
                  className="w-full"
                  value={formData.origin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  To *
                </label>
                <LocationInput
                  placeholder="Where do you want to go?"
                  onLocationSelect={handleDestinationSelect}
                  className="w-full"
                  value={formData.destination}
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Pickup Time
                </label>
                <input
                  type="time"
                  value={formData.preferred_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                placeholder="Any additional information or preferences..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Posting Request...
                  </div>
                ) : (
                  'Post Ride Request'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default RideRequestForm