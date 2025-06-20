// Create: src/components/pages/TermsPage.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DegreeWheels
              </span>
              <div className="flex space-x-1 ml-2">
                {['M', 'M', 'S', 'S'].map((letter, i) => (
                  <span 
                    key={i}
                    className={`w-6 h-6 bg-gradient-to-r ${
                      i === 0 ? 'from-blue-500 to-blue-600' :
                      i === 1 ? 'from-green-500 to-green-600' : 
                      i === 2 ? 'from-purple-500 to-purple-600' :
                      'from-orange-500 to-orange-600'
                    } text-white text-xs font-bold rounded-full flex items-center justify-center`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Meet • Move • Share • Study</p>
            <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Welcome to DegreeWheels, the university rideshare platform that helps students <strong>Meet, Move, Share, and Study</strong> together. 
                By using our service, you agree to these Terms of Service ("Terms"). Please read them carefully.
              </p>
            </section>

            {/* MMSS Philosophy */}
            <section className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. The MMSS Philosophy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">M</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">MEET</h3>
                    <p className="text-sm text-gray-600">Connect with verified university students and build lasting friendships through shared rides.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">M</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">MOVE</h3>
                    <p className="text-sm text-gray-600">Get around campus and beyond efficiently and affordably with fellow students.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">S</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">SHARE</h3>
                    <p className="text-sm text-gray-600">Share rides, costs, and experiences with your peers while reducing environmental impact.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">S</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">STUDY</h3>
                    <p className="text-sm text-gray-600">Turn travel time into productive study sessions with like-minded classmates.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Eligibility */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">3. Eligibility</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>You must be a currently enrolled university student</li>
                <li>You must be at least 18 years old</li>
                <li>You must provide accurate and complete registration information</li>
                <li>You must verify your university email address</li>
                <li>Drivers must have a valid driver's license and insurance</li>
              </ul>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For All Users:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Provide accurate profile information</li>
                    <li>Treat all users with respect and courtesy</li>
                    <li>Follow all applicable laws and regulations</li>
                    <li>Report inappropriate behavior or safety concerns</li>
                    <li>Maintain the security of your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Drivers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Maintain a valid driver's license and current vehicle insurance</li>
                    <li>Ensure your vehicle is safe and roadworthy</li>
                    <li>Arrive at pickup locations on time</li>
                    <li>Drive safely and follow traffic laws</li>
                    <li>Honor confirmed ride commitments</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">For Passengers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Be ready at agreed pickup times and locations</li>
                    <li>Pay agreed-upon ride costs promptly</li>
                    <li>Respect the driver's vehicle and rules</li>
                    <li>Follow safety guidelines and recommendations</li>
                    <li>Cancel bookings in advance when possible</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Safety & Liability */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">5. Safety & Liability</h2>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium">⚠️ Important Safety Notice</p>
                <p className="text-yellow-700 text-sm mt-1">
                  DegreeWheels is a platform that connects students but does not provide transportation services directly. 
                  All rides are arranged between individual users.
                </p>
              </div>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Users participate in ridesharing at their own risk</li>
                <li>DegreeWheels is not liable for accidents, injuries, or damages during rides</li>
                <li>Drivers are responsible for their own vehicle insurance</li>
                <li>Users should verify identity and meet in safe, public locations</li>
                <li>Report any safety concerns immediately</li>
                <li>Emergency services should be contacted for urgent situations</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">The following activities are strictly prohibited:</p>
                <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                  <li>Harassment, discrimination, or inappropriate behavior</li>
                  <li>Using the platform for commercial rideshare services</li>
                  <li>Providing false or misleading information</li>
                  <li>Using drugs or alcohol while driving or as a passenger</li>
                  <li>Sharing accounts or allowing unauthorized access</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Spam, fraud, or malicious activities</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Cost sharing is arranged directly between users</li>
                <li>DegreeWheels does not process payments or take fees</li>
                <li>Users should agree on costs before the ride</li>
                <li>Payment disputes should be resolved between users</li>
                <li>Report any payment-related issues to support</li>
              </ul>
            </section>

            {/* Privacy */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. By using DegreeWheels, you agree to our privacy practices.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. We'll notify users of significant changes via email 
                or in-app notifications. Continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700"><strong>Email:</strong> support@degreewheels.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> (555) 123-4567</p>
                <p className="text-gray-700"><strong>Address:</strong> University Student Services, Campus Building</p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="border-t pt-8 mt-8 text-center">
            <p className="text-sm text-gray-500">
              By using DegreeWheels, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
            <div className="mt-4">
              <button
                onClick={() => window.history.back()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Registration
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TermsPage