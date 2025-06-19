import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  UserIcon,
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  AcademicCapIcon,
  PhoneIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'

const Register = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  // List of common universities (you can expand this)
  const universities = [
    'Harvard University',
    'Stanford University',
    'MIT',
    'University of California, Berkeley',
    'University of California, Los Angeles',
    'Columbia University',
    'University of Chicago',
    'Yale University',
    'Princeton University',
    'University of Pennsylvania',
    'University of North Texas',
    'Texas A&M University',
    'University of Texas at Austin',
    'University of Texas at Dallas',
    'Texas Tech University',
    'University of Houston',
    'Rice University',
    'Baylor University',
    'Texas Christian University',
    'Southern Methodist University',
    'University of Texas at Arlington',
    'Texas State University',
    'Sam Houston State University',
    'Stephen F. Austin State University',
    'University of Texas at San Antonio',
    'University of Texas at El Paso',
    'University of Texas Rio Grande Valley',
    'University of Texas at Tyler',
    'University of Texas Permian Basin',
    'University of Texas at Brownsville',
    'University of Texas at Pan American',
    'University of Texas at San Marcos',
    'University of Texas at Austin - McCombs School of Business',
    'University of Texas at Austin - Cockrell School of Engineering',
    'University of Texas at Austin - College of Natural Sciences',
    'Other'
  ]

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const userData = {
        full_name: data.fullName,
        university: data.university,
        phone: data.phone,
        student_id: data.studentId,
        graduation_year: parseInt(data.graduationYear),
      }

      const { error } = await signUp(data.email, data.password, userData)
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.')
        } else if (error.message.includes('Password should be at least 6 characters')) {
          toast.error('Password must be at least 6 characters long')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Account created successfully! Welcome to RideShare!')
      
      // Small delay to ensure auth state is updated, then redirect
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
      
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setCurrentStep(2)
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h2 className="text-3xl font-bold text-primary-600">RideShare</h2>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Join RideShare Campus
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10"
        >
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 text-gray-300'
              }`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 text-gray-300'
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Personal Info</span>
              <span className="text-xs text-gray-500">Account Setup</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('fullName', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                      type="text"
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                    University
                  </label>
                  <div className="mt-1 relative">
                    <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      {...register('university', {
                        required: 'University is required'
                      })}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.university ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your university</option>
                      {universities.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>
                  {errors.university && (
                    <p className="mt-1 text-sm text-red-600">{errors.university.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      type="tel"
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <input
                      {...register('studentId', {
                        required: 'Student ID is required'
                      })}
                      type="text"
                      className={`appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.studentId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Student ID"
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
                      Graduation Year
                    </label>
                    <select
                      {...register('graduationYear', {
                        required: 'Graduation year is required'
                      })}
                      className={`appearance-none block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.graduationYear ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {errors.graduationYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.graduationYear.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continue
                  <ArrowRightIcon className="ml-2 w-4 h-4" />
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    College Email Address
                  </label>
                  <div className="mt-1 relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      type="email"
                      autoComplete="email"
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your.name@university.edu"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Use your official college email address for verification
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions'
                    })}
                    id="agree-to-terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-to-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Register