// Create: src/components/pages/PrivacyPage.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, EyeIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const PrivacyPage = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Meet • Move • Share • Study</p>
            <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">1. Our Commitment to Privacy</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                At DegreeWheels, protecting your privacy is fundamental to our <strong>Meet, Move, Share, Study</strong> philosophy. 
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our university rideshare platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <UserIcon className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Personal Information:</h3>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                    <li>Name, email address, phone number</li>
                    <li>University affiliation and student status</li>
                    <li>Profile photo (optional)</li>
                    <li>Emergency contact information</li>
                    <li>Driver's license information (for drivers)</li>
                    <li>Vehicle information (for drivers)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Ride Information:</h3>
                  <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                    <li>Pickup and drop-off locations</li>
                    <li>Ride dates and times</li>
                    <li>Cost sharing arrangements</li>
                    <li>Ride preferences (music, conversation level)</li>
                    <li>Ratings and reviews</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Technical Information:</h3>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 text-sm">
                    <li>Device type and operating system</li>
                    <li>IP address and location data</li>
                    <li>App usage analytics</li>
                    <li>Crash reports and performance data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <EyeIcon className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">MEET & CONNECT:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Match you with compatible riders</li>
                    <li>Verify university student status</li>
                    <li>Enable safe communication</li>
                    <li>Build trust through ratings</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">MOVE & SHARE:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Coordinate ride logistics</li>
                    <li>Process ride requests and offers</li>
                    <li>Send notifications and updates</li>
                    <li>Handle emergency situations</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Platform Improvement:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Analyze usage patterns to improve features</li>
                  <li>Ensure platform safety and security</li>
                  <li>Provide customer support</li>
                  <li>Comply with legal requirements</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="w-6 h-6 text-orange-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">4. Information Sharing</h2>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium">🔒 We DO NOT sell your personal information to third parties.</p>
              </div>

              <p className="text-gray-700 mb-4">We only share information in these specific circumstances:</p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>With Ride Partners:</strong> Basic profile info, contact details, and ride preferences to facilitate safe ridesharing</li>
                <li><strong>University Partners:</strong> Aggregated, anonymous usage statistics for campus transportation planning</li>
                <li><strong>Service Providers:</strong> Trusted partners who help us operate the platform (with strict confidentiality agreements)</li>
                <li><strong>Safety & Legal:</strong> When required by law or to protect user safety in emergency situations</li>
                <li><strong>Business Transfers:</strong> In the unlikely event of a merger or acquisition (with advance notice)</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Technical Safeguards:</h3>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                    <li>Encrypted data transmission (HTTPS/SSL)</li>
                    <li>Secure database storage</li>
                    <li>Regular security audits</li>
                    <li>Access controls and monitoring</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Operational Safeguards:</h3>
                  <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                    <li>Employee background checks</li>
                    <li>Limited access on need-to-know basis</li>
                    <li>Privacy training for staff</li>
                    <li>Incident response procedures</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-2">You Have the Right To:</h3>
                <ul className="list-disc list-inside space-y-1 text-indigo-800 text-sm">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Update:</strong> Correct inaccurate or incomplete information</li>
                  <li><strong>Delete:</strong> Request deletion of your account and data</li>
                  <li><strong>Restrict:</strong> Limit how we use your information</li>
                  <li><strong>Portability:</strong> Export your data in a standard format</li>
                  <li><strong>Object:</strong> Opt out of certain data processing activities</li>
                </ul>
              </div>

              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at <strong>privacy@degreewheels.com</strong> or through your account settings.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Active accounts:</strong> We keep your information while your account is active</li>
                <li><strong>Inactive accounts:</strong> Data is deleted after 2 years of inactivity</li>
                <li><strong>Ride history:</strong> Retained for 1 year for safety and support purposes</li>
                <li><strong>Legal requirements:</strong> Some data may be retained longer if required by law</li>
                <li><strong>Account deletion:</strong> Most data is deleted within 30 days of account closure</li>
              </ul>
            </section>

            {/* Contact & Updates */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us & Policy Updates</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Questions or Concerns:</h3>
                <p className="text-gray-700"><strong>Email:</strong> privacy@degreewheels.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> (555) 123-4567</p>
                <p className="text-gray-700"><strong>Mail:</strong> DegreeWheels Privacy Office, University Campus</p>
              </div>

              <p className="text-gray-700">
                We may update this Privacy Policy to reflect changes in our practices or applicable laws. 
                We'll notify you of significant changes via email or in-app notifications.
              </p>
            </section>

          </div>

          {/* Footer */}
          <div className="border-t pt-8 mt-8 text-center">
            <p className="text-sm text-gray-500">
              By using DegreeWheels, you acknowledge that you have read and understood this Privacy Policy.
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

export default PrivacyPage