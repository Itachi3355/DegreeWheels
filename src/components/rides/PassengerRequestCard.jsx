import React, { useState } from 'react'
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, UserIcon, PhoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const PassengerRequestCard = ({ request, onOfferSent, onRequestUpdate }) => {
  const { user } = useAuth()
  const [contacting, setContacting] = useState(false)
  const [offering, setOffering] = useState(false)

  const handleContact = async () => {
    try {
      setContacting(true)
      
      if (request.passenger?.email) {
        await navigator.clipboard.writeText(request.passenger.email)
        toast.success(`Email copied: ${request.passenger.email}`)
      } else {
        toast.error('No contact information available')
      }
      
    } catch (error) {
      console.error('Error contacting passenger:', error)
      toast.error('Failed to copy contact info')
    } finally {
      setContacting(false)
    }
  }

  const handleOffer = async () => {
    try {
      setOffering(true)
      
      // Get current user's profile details
      const { data: driverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching driver profile:', profileError)
        throw profileError
      }

      // Create actual ride offer in database
      const { data, error } = await supabase
        .from('ride_offers')
        .insert([{
          request_id: request.id,
          driver_id: user.id,
          passenger_id: request.requester_id,
          driver_name: driverProfile.full_name,
          driver_email: driverProfile.email,
          driver_phone: driverProfile.phone,
          message: `Hi! I can offer you a ride from ${request.origin} to ${request.destination} on ${new Date(request.departure_time).toLocaleDateString()}. I can accommodate ${request.seats_needed} passenger${request.seats_needed > 1 ? 's' : ''}. Please contact me to arrange details.`,
          status: 'pending'
        }])
        .select()

      if (error) {
        console.error('Error creating ride offer:', error)
        throw error
      }

      console.log('Ride offer created successfully:', data)
      toast.success('Ride offer sent successfully!')
      
      if (onOfferSent) {
        onOfferSent()
      }
      
    } catch (error) {
      console.error('Error offering ride:', error)
      toast.error('Failed to send offer. Please try again.')
    } finally {
      setOffering(false)
    }
  }

  const isOwnRequest = request.passenger_id === user?.id
  const hasOffered = request.ride_offers?.some(offer => 
    offer.driver_id === user?.id && offer.status === 'pending'
  )
  const pendingOffers = request.ride_offers?.filter(offer => offer.status === 'pending') || []
  const hasOffers = pendingOffers.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Type indicator */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
              Passenger Request
            </span>
            {isOwnRequest && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                Your Request
              </span>
            )}
            {hasOffered && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Offer Sent
              </span>
            )}
          </div>

          {/* Route */}
          <div className="flex items-center space-x-2 mb-3">
            <MapPinIcon className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-medium text-gray-900">
              {request.origin} → {request.destination}
            </span>
          </div>
          
          {/* Time and Price */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-2" />
              <span>
                {new Date(request.departure_time).toLocaleDateString()} at{' '}
                {new Date(request.departure_time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-4 h-4 mr-2" />
              <span>Budget: Negotiable</span>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-medium text-sm">
                {request.passenger?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{request.passenger?.full_name}</p>
              <p className="text-sm text-gray-500">{request.passenger?.email}</p>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}

          {/* Status and Offers */}
          <div className="flex items-center space-x-4 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              hasOffers ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {hasOffers ? `${pendingOffers.length} Driver(s) Interested` : 'Looking for Driver'}
            </span>
          </div>

          {/* Show offers for own requests */}
          {isOwnRequest && hasOffers && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Drivers who want to offer you a ride:
              </h4>
              <div className="space-y-2">
                {pendingOffers.slice(0, 3).map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{offer.driver_name}</p>
                      <p className="text-xs text-gray-500">{offer.driver_email}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {pendingOffers.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{pendingOffers.length - 3} more offers in your dashboard
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {!isOwnRequest && (
          <div className="flex flex-col space-y-2 ml-4">
            {!hasOffered ? (
              <>
                <button
                  onClick={handleOffer}
                  disabled={offering}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50 min-w-[100px]"
                >
                  {offering ? 'Sending...' : 'Offer Ride'}
                </button>
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center"
                >
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  {contacting ? 'Copying...' : 'Contact'}
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    ✓ Offer Sent!
                  </p>
                  <p className="text-xs text-green-600">
                    Passenger will see your details
                  </p>
                </div>
                <button
                  onClick={handleContact}
                  disabled={contacting}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center"
                >
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  {contacting ? 'Copying...' : 'Contact'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Show status for own requests */}
        {isOwnRequest && (
          <div className="ml-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Your request</p>
              <p className="text-xs text-gray-400">
                Posted {new Date(request.created_at).toLocaleDateString()}
              </p>
              {hasOffers && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Check Dashboard for offers!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Show offer status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {hasMyOffer ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✅ Offer Sent
            </span>
          ) : (
            <button
              onClick={handleOffer}
              disabled={offering}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {offering ? 'Sending...' : 'Offer Ride'}
            </button>
          )}

          {totalOffers > 0 && (
            <span className="text-sm text-gray-500">
              {totalOffers} offer{totalOffers !== 1 ? 's' : ''} received
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PassengerRequestCard