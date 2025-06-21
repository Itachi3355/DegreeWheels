import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  StarIcon,
  ShieldCheckIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { useBookings } from '../../hooks/useBookings'

const BookingModal = ({ ride, isOpen, onClose, onConfirm }) => {
  const { bookRide } = useBookings()
  const [formData, setFormData] = useState({
    seats: 1,
    pickupNotes: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await bookRide(
        ride.id,
        ride.driver_id,
        formData.seats,
        formData.pickupNotes,
        formData.phone
      )

      onClose()
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !ride) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/50"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-t-3xl"></div>
            <div className="relative flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Book Your Ride</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Ride Summary */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {ride.driver?.full_name?.charAt(0) || 'D'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {ride.driver?.full_name || 'Driver'}
                </h3>
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">
                    {ride.driver?.rating || '4.8'} • {ride.driver?.total_rides || 25} rides
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-green-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-semibold text-gray-900">{ride.origin}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-semibold text-gray-900">{ride.destination}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-indigo-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Departure</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(ride.departure_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Seats
              </label>
              <select
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm"
                required
              >
                {[...Array(Math.min(ride.available_seats, 4))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} seat{i !== 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Your phone number"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Notes (Optional)
              </label>
              <textarea
                value={formData.pickupNotes}
                onChange={(e) => setFormData({ ...formData, pickupNotes: e.target.value })}
                placeholder="Any specific pickup instructions..."
                rows="3"
                className="w-full p-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm resize-none"
              />
            </div>

            {/* Safety Notice */}
            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Safety First</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share your trip details with a friend</li>
                    <li>• Meet in a public, well-lit location</li>
                    <li>• Verify the driver's identity before getting in</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BookingModal