import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, MapPinIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import { useBookings } from '../../hooks/useBookings'

const BookingModal = ({ ride, isOpen, onClose }) => {
  const { bookRide } = useBookings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    seats: 1,
    pickupNotes: ''
  })

  if (!isOpen || !ride) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await bookRide(
      ride.id,
      ride.driver_id,
      parseInt(formData.seats),
      formData.pickupNotes
    )

    setIsSubmitting(false)

    if (result.success) {
      onClose()
      setFormData({ seats: 1, pickupNotes: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book This Ride</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Ride Details */}
        <div className="p-6 border-b bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <span className="text-sm text-gray-600">From:</span>
                <p className="font-medium">{ride.origin}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <span className="text-sm text-gray-600">To:</span>
                <p className="font-medium">{ride.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <span className="text-sm text-gray-600">Departure:</span>
                <p className="font-medium">
                  {new Date(ride.departure_time).toLocaleDateString()} at{' '}
                  {new Date(ride.departure_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <span className="text-sm text-gray-600">Available seats:</span>
                <p className="font-medium">{ride.available_seats} seats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many seats do you need? *
            </label>
            <select
              value={formData.seats}
              onChange={(e) => setFormData(prev => ({ ...prev, seats: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} seat{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup notes (optional)
            </label>
            <textarea
              value={formData.pickupNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, pickupNotes: e.target.value }))}
              rows="3"
              placeholder="Any specific pickup location details, landmarks, or instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Help the driver find you easily by providing specific details
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your booking request will be sent to the driver</li>
              <li>• You'll be notified when they respond</li>
              <li>• If accepted, you'll get their contact details</li>
              <li>• Meet at the pickup location on time</li>
            </ul>
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
              disabled={isSubmitting || ride.available_seats === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Booking...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default BookingModal