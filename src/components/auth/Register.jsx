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
      toast.success('Account created successfully! Welcome to DegreeWheels!')
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

  const nextStep = () => setCurrentStep(2)
  const prevStep = () => setCurrentStep(1)

  // Demo credentials for quick testing
  const fillDemo = () => {
    // Only fill on step 2
    if (currentStep === 2) {
      // Use a plausible demo email and password
      document.querySelector('input[name="email"]').value = 'demo@myunt.edu'
      document.querySelector('input[name="password"]').value = 'Demo123456'
      document.querySelector('input[name="confirmPassword"]').value = 'Demo123456'
    }
  }

  // DegreeWheels color palette
  const DEGREEWHEELS_COLORS = {
    primary: 'bg-blue-700',
    primaryHover: 'bg-blue-800',
    accent: 'bg-indigo-500',
    accentHover: 'bg-indigo-600',
    text: 'text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
    gradient: 'from-blue-50 to-indigo-100',
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${DEGREEWHEELS_COLORS.gradient} flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      {/* Illustration Banner removed as requested */}
      <div className="w-full flex justify-center pt-8 pb-4">
        {/* Illustration removed */}
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo removed as requested */}
        <Link to="/" className="flex justify-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-700 font-sans">DegreeWheels</h2>
        </Link>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Create your campus ride account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-semibold text-blue-700 hover:text-indigo-600 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-blue-100"
        >
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= 1 ? 'bg-blue-700 border-blue-700 text-white' : 'border-gray-300 text-gray-300'}`}>1</div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-700' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= 2 ? 'bg-blue-700 border-blue-700 text-white' : 'border-gray-300 text-gray-300'}`}>2</div>
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
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-blue-700">Full Name</label>
                  <div className="mt-1 relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      {...register('fullName', {
                        required: 'Full name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                      })}
                      type="text"
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.fullName ? 'border-red-300' : 'border-blue-200'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                {/* University */}
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-blue-700">University</label>
                  <div className="mt-1 relative">
                    <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <select
                      {...register('university', { required: 'University is required' })}
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.university ? 'border-red-300' : 'border-blue-200'}`}
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
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-blue-700">Phone Number</label>
                  <div className="mt-1 relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
                      })}
                      type="tel"
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.phone ? 'border-red-300' : 'border-blue-200'}`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                {/* Student ID & Graduation Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-blue-700">Student ID</label>
                    <input
                      {...register('studentId', { required: 'Student ID is required' })}
                      type="text"
                      className={`appearance-none block w-full px-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.studentId ? 'border-red-300' : 'border-blue-200'}`}
                      placeholder="Student ID"
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-blue-700">Graduation Year</label>
                    <select
                      {...register('graduationYear', { required: 'Graduation year is required' })}
                      className={`appearance-none block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.graduationYear ? 'border-red-300' : 'border-blue-200'}`}
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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-700">College Email Address</label>
                  <div className="mt-1 relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' }
                      })}
                      type="email"
                      autoComplete="email"
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.email ? 'border-red-300' : 'border-blue-200'}`}
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
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-700">Password</label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                        pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-red-300' : 'border-blue-200'}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
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
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-700">Confirm Password</label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`appearance-none block w-full pl-10 pr-12 py-3 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.confirmPassword ? 'border-red-300' : 'border-blue-200'}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
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
                {/* Terms */}
                <div className="flex items-center">
                  <input
                    {...register('agreeToTerms', { required: 'You must agree to the terms and conditions' })}
                    id="agree-to-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-700 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-to-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-700 hover:text-indigo-600">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-700 hover:text-indigo-600">Privacy Policy</Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}
                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 border border-blue-200 rounded-lg shadow-sm bg-white text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {/* Demo/Test Account Button */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Demo Account (for testing)</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2)
                        // Fill demo data for quick test
                        const demo = {
                          fullName: 'Demo User',
                          university: 'University of North Texas',
                          phone: '+1234567890',
                          studentId: '123456',
                          graduationYear: new Date().getFullYear() + 2,
                          email: 'demo@myunt.edu',
                          password: 'Demo123456',
                          confirmPassword: 'Demo123456',
                          agreeToTerms: true
                        }
                        Object.keys(demo).forEach(key => {
                          if (typeof watch(key) !== 'undefined') {
                            // Only set if field exists
                            document.querySelector(`[name="${key}"]`)?.value !== undefined && (document.querySelector(`[name="${key}"]`).value = demo[key])
                          }
                        })
                      }}
                      className="text-xs text-blue-700 hover:text-indigo-600 underline"
                    >
                      Fill demo credentials
                    </button>
                  </div>
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