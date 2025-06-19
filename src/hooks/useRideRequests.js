import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const useRideRequests = () => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const createRideRequest = async (rideId, message = '') => {
    if (!user) {
      toast.error('Please log in to request a ride')
      return { success: false, error: 'Not authenticated' }
    }

    try {
      setLoading(true)
      console.log('Creating ride request:', { rideId, userId: user.id, message })

      // Check if user already has a pending/confirmed request for this ride
      const { data: existingRequest, error: checkError } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Database check error:', checkError)
        throw checkError
      }

      if (existingRequest) {
        toast.error('You already have a request for this ride')
        return { success: false, error: 'Request already exists' }
      }

      // Check if ride has available seats
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('available_seats, driver_id')
        .eq('id', rideId)
        .single()

      if (rideError) throw rideError

      if (ride.available_seats <= 0) {
        toast.error('This ride is full')
        return { success: false, error: 'Ride is full' }
      }

      if (ride.driver_id === user.id) {
        toast.error('You cannot request your own ride')
        return { success: false, error: 'Cannot request own ride' }
      }

      // Create the ride request
      const { data, error } = await supabase
        .from('ride_requests')
        .insert([
          {
            ride_id: rideId,
            passenger_id: user.id,
            status: 'pending',
            message: message,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Ride request sent successfully!')
      console.log('Ride request created:', data)
      
      return { success: true, data }
    } catch (error) {
      console.error('Error creating ride request:', error)
      toast.error(error.message || 'Failed to send ride request')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const cancelRideRequest = async (requestId) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('ride_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('passenger_id', user.id) // Ensure user can only cancel their own requests

      if (error) throw error

      toast.success('Ride request cancelled')
      return { success: true }
    } catch (error) {
      console.error('Error cancelling ride request:', error)
      toast.error(error.message || 'Failed to cancel request')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const getUserRideRequests = async () => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('ride_requests')
        .select(`
          *,
          ride:rides!ride_requests_ride_id_fkey(
            *,
            driver:profiles!rides_driver_id_fkey(*)
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user ride requests:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createRideRequest,
    cancelRideRequest,
    getUserRideRequests
  }
}