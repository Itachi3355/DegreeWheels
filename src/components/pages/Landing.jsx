import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon, 
  MapIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  AcademicCapIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GlobeAltIcon,
  MapPinIcon,
  ShareIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../common/Logo'
import DegreeWheelsLogo from '../common/DegreeWheelsLogo'

const Landing = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: UserGroupIcon,
      title: 'MEET Students',
      description: 'Connect with verified university peers and build lasting friendships',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: MapPinIcon, 
      title: 'MOVE Efficiently',
      description: 'Smart routing and ride matching for seamless campus transportation',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: ShareIcon,
      title: 'SHARE Experiences', 
      description: 'Split costs, share stories, and build your campus community',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: BookOpenIcon,
      title: 'SAVE Together',
      description: 'Share rides to save money and reduce your travel costs',
      color: 'from-amber-500 to-orange-500',
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Active Students', icon: UserGroupIcon },
    { number: '50,000+', label: 'Rides Completed', icon: MapIcon },
    { number: '95%', label: 'Safety Rating', icon: ShieldCheckIcon },
    { number: '$2.5M+', label: 'Money Saved', icon: CurrencyDollarIcon }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      avatar: '👩‍💻',
      university: 'MIT',
      quote: 'Amazing app! Found reliable rides to campus every day. The community is so trustworthy.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Business Student', 
      avatar: '👨‍💼',
      university: 'Stanford',
      quote: 'Super convenient and safe. I use it every day to get to campus and internship.',
      rating: 5
    },
    {
      name: 'Emma Wilson',
      role: 'Engineering Student',
      avatar: '👩‍🔬',
      university: 'UC Berkeley',
      quote: 'The best way to network with other students while saving money on transportation.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section with Glassmorphism */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-emerald-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
            className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-violet-400/20 to-pink-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg mb-8"
          >
            <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />
            <span className="text-indigo-600 font-semibold">#1 Student Rideshare Platform</span>
          </motion.div>

          {/* Main Heading */}
          <div className="text-center mb-8">
            <DegreeWheelsLogo size="xl" animate={true} />
            <h1 className="text-6xl font-bold text-gray-900 mb-6 hero-title">
              Meet • Move • Share • Save
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The future of university transportation is here. Connect with verified students, 
              share rides safely, and build lasting friendships on your campus.
            </p>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Connect with fellow students, save money, and build lasting friendships through our intelligent rideshare platform designed exclusively for university communities.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <AcademicCapIcon className="w-6 h-6 mr-3" />
                    Start Your Journey
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-5 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-indigo-300 hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              University Verified
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5 text-blue-500 mr-2" />
              100% Safe
            </div>
            <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
              4.9/5 Rating
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Modern Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Glassmorphism Cards */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why Choose 
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> RideShare?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for students, by students. Experience the future of campus transportation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`${feature.gradient} backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full`}>
                  {/* Floating Icon */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 mx-auto flex items-center justify-center bg-gradient-to-r ${feature.color} rounded-2xl text-white shadow-xl transform group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Modern Card Design */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Students Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy students who've transformed their commute
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  {/* Quote */}
                  <div className="mb-6">
                    <div className="text-6xl text-indigo-200 mb-4">"</div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {testimonial.quote}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex text-yellow-400 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                      <div className="text-xs text-indigo-600 font-medium">{testimonial.university}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient Background */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Start Sharing?
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of students already saving money and making connections through our platform
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center px-10 py-5 text-lg font-bold text-indigo-600 bg-white rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-2xl"
                >
                  <AcademicCapIcon className="w-6 h-6 mr-3" />
                  Sign Up with University Email
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-10 py-5 text-lg font-bold text-white border-2 border-white/50 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
                >
                  Already have an account?
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Centered Logo with Custom Sizing - MINIMALIST TIRE */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              {/* Logo Icon - MINIMALIST NO-SPOKES TIRE */}
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg border-4 border-gray-300 relative">
                
                {/* MINIMALIST ROTATING TIRE */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 10, // Normal speed for footer
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* NO SPOKES - Clean rim design */}
                  <svg className="absolute inset-0 w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <g opacity="0.8">
                      {/* Outer rim circles */}
                      <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.6"/>
                      <circle cx="12" cy="12" r="8.5" strokeWidth="1.5" opacity="0.4"/>
                      <circle cx="12" cy="12" r="7" strokeWidth="1" opacity="0.3"/>
                      
                      {/* Tire tread marks */}
                      <circle cx="12" cy="12" r="9.2" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 6"/>
                    </g>
                  </svg>
                  
                  {/* Center hub - larger for footer */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 bg-white rounded-full shadow-inner">
                      <div className="w-6 h-6 bg-gray-200 rounded-full m-0.5"></div>
                    </div>
                  </div>
                </motion.div>
                
                {/* FIXED DEGREE SYMBOL */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="text-white text-2xl drop-shadow-lg" role="img" aria-label="degree">
                    🎓
                  </span>
                </div>
              </div>

              {/* Text Logo - DegreeWheels (big) + MMSS (small) */}
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  DegreeWheels
                </span>
                
                <div className="flex space-x-1">
                  {[
                    { letter: 'M', color: 'from-blue-500 to-blue-600' },
                    { letter: 'M', color: 'from-green-500 to-green-600' },
                    { letter: 'S', color: 'from-purple-500 to-purple-600' },
                    { letter: 'S', color: 'from-orange-500 to-orange-600' }
                  ].map((item, i) => (
                    <span 
                      key={i}
                      className={`w-4 h-4 bg-gradient-to-r ${item.color} text-white text-xs font-bold rounded-full flex items-center justify-center`}
                    >
                      {item.letter}
                    </span>
                  ))}     
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
              The #1 university rideshare platform. Built by students, for students. 
              Safe, reliable, and community-focused transportation solutions.
            </p>

            {/* MMSS Philosophy - Optional */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { letter: 'M', word: 'MEET', color: 'text-blue-400' },
                { letter: 'M', word: 'MOVE', color: 'text-green-400' },
                { letter: 'S', word: 'SHARE', color: 'text-purple-400' },
                { letter: 'S', word: 'SAVE', color: 'text-orange-400' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <span className={`${item.color} font-bold text-sm`}>{item.word}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 mt-12 pt-8">
              <p className="text-gray-500 text-sm">
                © 2024 DegreeWheels. All rights reserved. | 
                <span className="text-gray-400 ml-1">Developed by MMSS</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing