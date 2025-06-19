import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext' // ← FIXED: Go up 2 levels
import { 
  UserCircleIcon, 
  CameraIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    university: profile?.university || '',
    bio: profile?.bio || '',
    student_id: profile?.student_id || '',
    graduation_year: profile?.graduation_year || new Date().getFullYear()
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await updateProfile(formData)
      if (error) {
        toast.error('Failed to update profile')
      } else {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (error) {
      toast.error('An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      university: profile?.university || '',
      bio: profile?.bio || '',
      student_id: profile?.student_id || '',
      graduation_year: profile?.graduation_year || new Date().getFullYear()
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 text-white hover:bg-blue-600">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">
                    {profile?.full_name || 'Your Profile'}
                  </h1>
                  <p className="text-blue-100">{user?.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 flex items-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <UserCircleIcon className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell others about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Academic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                    University
                  </label>
                  {isEditing ? (
                    <select
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select University</option>
                      <option value="University of North Texas">University of North Texas</option>
                      <option value="Harvard University">Harvard University</option>
                      <option value="Stanford University">Stanford University</option>
                      <option value="MIT">MIT</option>
                      <option value="University of California, Berkeley">UC Berkeley</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile?.university || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.student_id || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Graduation Year
                  </label>
                  {isEditing ? (
                    <select
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile?.graduation_year || 'Not provided'}</p>
                  )}
                </div>

                {/* Account Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Member Since</p>
                      <p className="font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Profile Completed</p>
                      <p className="font-medium text-green-600">
                        {profile?.profile_completed ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage