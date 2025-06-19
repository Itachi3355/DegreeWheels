import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const ProfileSetup = () => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfileImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let avatarUrl = null

      if (profileImage) {
        avatarUrl = await uploadProfileImage(profileImage)
      }

      const profileData = {
        bio: data.bio,
        preferences: {
          music: data.musicPreference,
          conversation: data.conversationLevel,
          smoking: data.smokingPreference,
          pets: data.petPreference
        },
        car_info: data.hasCar ? {
          make: data.carMake,
          model: data.carModel,
          year: data.carYear,
          color: data.carColor,
          license_plate: data.licensePlate
        } : null,
        emergency_contact: {
          name: data.emergencyName,
          phone: data.emergencyPhone,
          relationship: data.emergencyRelationship
        },
        avatar_url: avatarUrl,
        profile_completed: true
      }

      await updateProfile(profileData)
      toast.success('Profile setup complete! Welcome to RideShare!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Profile setup error:', error)
      toast.error('Error setting up profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us personalize your ride-sharing experience
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-primary-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Profile Picture & Bio */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Tell us about yourself</h2>
                  <p className="text-gray-600">Add a photo and bio to help others get to know you</p>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CameraIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors">
                      <CameraIcon className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload a clear photo of yourself
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio', {
                      required: 'Bio is required',
                      maxLength: {
                        value: 300,
                        message: 'Bio must be less than 300 characters'
                      }
                    })}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
                      errors.bio ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tell others about yourself, your interests, and what makes you a great ride companion..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {watch('bio')?.length || 0}/300 characters
                  </p>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Ride Preferences</h2>
                  <p className="text-gray-600">Help us match you with compatible ride partners</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Music Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MusicalNoteIcon className="w-4 h-4 inline mr-1" />
                      Music Preference
                    </label>
                    <select
                      {...register('musicPreference')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="any">Any music is fine</option>
                      <option value="no-music">Prefer quiet rides</option>
                      <option value="pop">Pop music</option>
                      <option value="rock">Rock music</option>
                      <option value="hip-hop">Hip-hop</option>
                      <option value="classical">Classical</option>
                      <option value="country">Country</option>
                    </select>
                  </div>

                  {/* Conversation Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1" />
                      Conversation Level
                    </label>
                    <select
                      {...register('conversationLevel')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="chatty">Love to chat</option>
                      <option value="moderate">Some conversation</option>
                      <option value="quiet">Prefer quiet rides</option>
                    </select>
                  </div>

                  {/* Smoking Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Smoking Preference
                    </label>
                    <select
                      {...register('smokingPreference')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="no-smoking">No smoking</option>
                      <option value="smoking-ok">Smoking OK</option>
                    </select>
                  </div>

                  {/* Pet Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Preference
                    </label>
                    <select
                      {...register('petPreference')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="no-pets">No pets</option>
                      <option value="pets-ok">Pets welcome</option>
                      <option value="love-pets">Love pets!</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Car Info & Emergency Contact */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Final Details</h2>
                  <p className="text-gray-600">Car information and emergency contact</p>
                </div>

                {/* Do you have a car? */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you have a car and plan to offer rides?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        {...register('hasCar')}
                        type="radio"
                        value="true"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes, I have a car</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        {...register('hasCar')}
                        type="radio"
                        value="false"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">No, I'm looking for rides</span>
                    </label>
                  </div>
                </div>

                {/* Car Information (conditional) */}
                {watch('hasCar') === 'true' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Car Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Make
                        </label>
                        <input
                          {...register('carMake', {
                            required: watch('hasCar') === 'true' ? 'Car make is required' : false
                          })}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Toyota"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model
                        </label>
                        <input
                          {...register('carModel', {
                            required: watch('hasCar') === 'true' ? 'Car model is required' : false
                          })}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Camry"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          {...register('carYear')}
                          type="number"
                          min="1990"
                          max="2024"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          {...register('carColor')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Blue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    <span className="text-red-500 mr-2">🚨</span>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        {...register('emergencyName', {
                          required: 'Emergency contact name is required'
                        })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        {...register('emergencyPhone', {
                          required: 'Emergency contact phone is required'
                        })}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <select
                        {...register('emergencyRelationship', {
                          required: 'Please select relationship'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select relationship</option>
                        <option value="parent">Parent</option>
                        <option value="guardian">Guardian</option>
                        <option value="sibling">Sibling</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Complete Profile'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip for now, I'll complete this later
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfileSetup