import React, { useState } from 'react'
import { EnvelopeIcon, PhoneIcon, MapPinIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    // Store the message in Supabase table 'contact_messages'
    const { error } = await supabase
      .from('contact_messages')
      .insert([{ ...form, created_at: new Date().toISOString() }])
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full grid md:grid-cols-2 overflow-hidden">
        {/* Left: Info */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col justify-between p-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="mb-8 text-indigo-100">
              We'd love to hear from you! Whether you have a question, feedback, or need support, our team is here to help.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="w-6 h-6 mr-3 text-indigo-200" />
                <a href="mailto:support@degreewheels.com" className="underline hover:text-white">
                  support@degreewheels.com
                </a>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-6 h-6 mr-3 text-indigo-200" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-6 h-6 mr-3 text-indigo-200" />
                <span>DegreeWheels HQ, Dallas, TX</span>
              </div>
            </div>
          </div>
          <div className="mt-12 text-xs text-indigo-200">
            &copy; 2025 DegreeWheels. All rights reserved.
          </div>
        </div>
        {/* Right: Form */}
        <div className="p-8 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Your Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Your Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                rows={5}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg"
              disabled={status === 'loading'}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'success' && (
              <div className="text-green-600 text-center font-semibold mt-2">
                Thank you! Your message has been sent.
              </div>
            )}
            {status === 'error' && (
              <div className="text-red-600 text-center font-semibold mt-2">
                Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactUs