// File: src/utils/analytics.js
// CREATE THIS NEW FILE:

import { supabase } from '../lib/supabase'

export const trackEvent = async (eventType, eventData, userId) => {
  try {
    // Simple local storage tracking (no external service needed)
    const analytics = JSON.parse(localStorage.getItem('rideshare_analytics') || '[]')
    
    const event = {
      id: Date.now(),
      type: eventType,
      data: eventData,
      userId: userId,
      timestamp: new Date().toISOString()
    }
    
    analytics.push(event)
    
    // Keep only last 100 events to avoid storage bloat
    if (analytics.length > 100) {
      analytics.shift()
    }
    
    localStorage.setItem('rideshare_analytics', JSON.stringify(analytics))
    
    // Also save to database for admin insights
    await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        activity_type: eventType,
        activity_data: eventData,
        created_at: new Date().toISOString()
      }])
      .catch(err => console.log('Analytics DB save failed (non-critical):', err))
    
  } catch (error) {
    console.log('Analytics error (non-critical):', error)
  }
}

// Quick tracking functions
export const trackRideSearch = (filters, userId) => 
  trackEvent('ride_search', filters, userId)

export const trackRideOffer = (rideData, userId) => 
  trackEvent('ride_offer', rideData, userId)

export const trackPassengerRequest = (requestData, userId) => 
  trackEvent('passenger_request', requestData, userId)