import React, { useState, useEffect } from 'react'
import { CheckIcon, XMarkIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ReceivedOffers = ({ onOffersUpdate }) => {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOffers()
    }
  }, [user])

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_offers')
        .select(`
          *,
          request:passenger_ride_requests(
            id,
            origin,
            destination,
            preferred_departure_time,
            max_price,
            notes,
            status
          )
        `)
        .eq('passenger_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOffers(data || [])
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOfferResponse = async (offerId, requestId, status) => {
    try {
      if (status === 'accepted') {
        // Get the full offer and request details first
        const { data: offerData, error: offerFetchError } = await supabase
          .from('ride_offers')
          .select(`
            *,
            request:passenger_ride_requests(*)
          `)
          .eq('id', offerId)
          .single()

        if (offerFetchError) throw offerFetchError

        // ✅ 1. Create a ride booking
        const booking = {
          passenger_id: offerData.passenger_id,
          driver_id: offerData.driver_id,
          original_request_id: requestId,
          original_offer_id: offerId,
          origin: offerData.request.origin,
          destination: offerData.request.destination,
          departure_time: offerData.request.preferred_departure_time,
          agreed_price: offerData.request.max_price,
          passenger_name: user.profile?.full_name || user.email,
          passenger_email: user.email,
          passenger_phone: user.profile?.phone,
          driver_name: offerData.driver_name,
          driver_email: offerData.driver_email,
          driver_phone: offerData.driver_phone,
          status: 'confirmed',
          notes: offerData.request.notes,
          created_at: new Date().toISOString()
        }

        const { data: bookingResult, error: bookingError } = await supabase
          .from('ride_bookings')
          .insert([booking])
          .select()

        if (bookingError) throw bookingError

        // 2. Update the offer status to accepted
        const { error: offerError } = await supabase
          .from('ride_offers')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('id', offerId)

        if (offerError) throw offerError

        // 3. Update the passenger request status to completed
        const { error: requestError } = await supabase
          .from('passenger_ride_requests')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString() 
          })
          .eq('id', requestId)

        if (requestError) throw requestError

        // 4. Decline all other pending offers for this request
        const { error: declineError } = await supabase
          .from('ride_offers')
          .update({ 
            status: 'declined',
            updated_at: new Date().toISOString() 
          })
          .eq('request_id', requestId)
          .neq('id', offerId)
          .eq('status', 'pending')

        if (declineError) throw declineError

        toast.success('🎉 Ride booked! Check your "My Bookings" tab to see the details.')
        
      } else {
        // Just decline this specific offer
        const { error } = await supabase
          .from('ride_offers')
          .update({ 
            status: 'declined',
            updated_at: new Date().toISOString() 
          })
          .eq('id', offerId)

        if (error) throw error
        
        toast.success('Offer declined.')
      }

      await fetchOffers()
      
      if (onOffersUpdate) {
        onOffersUpdate()
      }
      
    } catch (error) {
      console.error('Error responding to offer:', error)
      toast.error('Failed to respond to offer')
    }
  }

  const copyContact = async (contact) => {
    try {
      await navigator.clipboard.writeText(contact)
      toast.success(`Contact copied: ${contact}`)
    } catch (error) {
      toast.error('Failed to copy contact')
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading offers...</div>
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending ride offers</h3>
        <p className="text-gray-600">Drivers who want to offer you rides will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">New Ride Offers</h3>
        <p className="text-sm text-blue-700">
          Drivers have offered to give you rides for your requests. Accept an offer to complete the booking!
        </p>
      </div>

      {offers.map((offer) => (
        <div key={offer.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Request details */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Your Request: {offer.request?.origin} → {offer.request?.destination}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(offer.request?.preferred_departure_time).toLocaleDateString()} at{' '}
                  {new Date(offer.request?.preferred_departure_time).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                {offer.request?.max_price && (
                  <p className="text-sm text-gray-500">
                    Your budget: ${offer.request.max_price}
                  </p>
                )}
              </div>

              {/* Driver info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{offer.driver_name}</p>
                  <p className="text-sm text-gray-500">{offer.driver_email}</p>
                  {offer.driver_phone && (
                    <p className="text-sm text-gray-500">{offer.driver_phone}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              {offer.message && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{offer.message}</p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Offer received {new Date(offer.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={() => handleOfferResponse(offer.id, offer.request_id, 'accepted')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center min-w-[100px] justify-center"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Accept
              </button>
              
              <button
                onClick={() => copyContact(offer.driver_email)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
              >
                <PhoneIcon className="w-4 h-4 mr-1" />
                Contact
              </button>
              
              <button
                onClick={() => handleOfferResponse(offer.id, offer.request_id, 'declined')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReceivedOffers