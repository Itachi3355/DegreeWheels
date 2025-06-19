import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useCreateRide } from '../../hooks/useCreateRide'

const CreateRideForm = ({ onSuccess }) => {
  const navigate = useNavigate()
  const { loading, createRide } = useCreateRide()
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    departure_time: '',
    available_seats: 1,
    description: ''
  })

  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]
  
  // Get current time in HH:MM format
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = (currentStep) => {
    const newErrors = {}

    if (currentStep === 1) {
      if (!formData.origin.trim()) {
        newErrors.origin = 'Pickup location is required'
      }
      if (!formData.destination.trim()) {
        newErrors.destination = 'Destination is required'
      }
      if (formData.origin.trim() && formData.destination.trim() && 
          formData.origin.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
        newErrors.destination = 'Destination must be different from pickup location'
      }
    }

    if (currentStep === 2) {
      if (!formData.departure_date) {
        newErrors.departure_date = 'Departure date is required'
      }
      if (!formData.departure_time) {
        newErrors.departure_time = 'Departure time is required'
      }
      
      // Validate date/time is in the future
      if (formData.departure_date && formData.departure_time) {
        const departureDateTime = new Date(`${formData.departure_date}T${formData.departure_time}`)
        const now = new Date()
        
        if (departureDateTime <= now) {
          newErrors.departure_time = 'Departure time must be in the future'
        }
      }
      
      if (!formData.available_seats || formData.available_seats < 1 || formData.available_seats > 8) {
        newErrors.available_seats = 'Available seats must be between 1 and 8'
      }
    }

    // Step 3 validation (optional description, no validation needed)
    // No validation needed for step 3 since description is optional

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Only submit when explicitly called (not from validation)
    console.log('Form submitted explicitly')
    
    // Combine date and time
    const departure_time = `${formData.departure_date}T${formData.departure_time}`
    
    const rideData = {
      ...formData,
      departure_time,
      available_seats: parseInt(formData.available_seats)
    }

    const result = await createRide(rideData)
    
    if (result.success) {
      if (onSuccess) {
        onSuccess(result.data)
      } else {
        navigate('/dashboard')
      }
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Where are you going?</h2>
        <p className="text-gray-600">Tell us your pickup location and destination</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-2" />
            Pickup Location
          </label>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleInputChange}
            placeholder="e.g., UNT Campus, Denton"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.origin ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.origin && (
            <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-2" />
            Destination
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
            placeholder="e.g., Dallas Airport, Dallas"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.destination ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">When are you leaving?</h2>
        <p className="text-gray-600">Set your departure date, time, and available seats</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Departure Date
          </label>
          <input
            type="date"
            name="departure_date"
            value={formData.departure_date}
            onChange={handleInputChange}
            min={today}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.departure_date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.departure_date && (
            <p className="mt-1 text-sm text-red-600">{errors.departure_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="w-4 h-4 inline mr-2" />
            Departure Time
          </label>
          <input
            type="time"
            name="departure_time"
            value={formData.departure_time}
            onChange={handleInputChange}
            min={formData.departure_date === today ? currentTime : undefined}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.departure_time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.departure_time && (
            <p className="mt-1 text-sm text-red-600">{errors.departure_time}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserIcon className="w-4 h-4 inline mr-2" />
          Available Seats
        </label>
        <select
          name="available_seats"
          value={formData.available_seats}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.available_seats ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <option key={num} value={num}>
              {num} seat{num > 1 ? 's' : ''}
            </option>
          ))}
        </select>
        {errors.available_seats && (
          <p className="mt-1 text-sm text-red-600">{errors.available_seats}</p>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Details</h2>
        <p className="text-gray-600">Add any additional information about your ride</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DocumentTextIcon className="w-4 h-4 inline mr-2" />
          Additional Information (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Any additional details about your ride (pickup instructions, car description, preferences, etc.)"
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="mt-1 text-sm text-gray-500 text-right">
          {formData.description.length}/500
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">Ride Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Route:</span>
            <span className="font-medium">{formData.origin} → {formData.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-medium">
              {formData.departure_date && new Date(formData.departure_date).toLocaleDateString()} 
              {formData.departure_time && ` at ${formData.departure_time}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Available Seats:</span>
            <span className="font-medium">{formData.available_seats}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">Free Ride</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > num ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  num
                )}
              </div>
              {num < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content - Remove onSubmit from form tag */}
      <div className="px-8 pb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={step === 1 ? () => navigate('/dashboard') : handleBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Ride...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Create Ride
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateRideForm