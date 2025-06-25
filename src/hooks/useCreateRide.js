import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export const useCreateRide = () => {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const createRide = async (rideData) => {
    if (!user) {
      toast.error('Please log in to create a ride')
      return { success: false, error: 'Not authenticated' }
    }

    try {
      setLoading(true)
      console.log('Creating ride:', rideData)

      // Validate required fields
      const requiredFields = ['origin', 'destination', 'departure_time', 'available_seats']
      const missingFields = requiredFields.filter(field => !rideData[field])
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate departure time is in the future
      const departureTime = new Date(rideData.departure_time)
      const now = new Date()
      
      if (departureTime <= now) {
        throw new Error('Departure time must be in the future')
      }

      // Validate seats
      if (rideData.available_seats < 1 || rideData.available_seats > 8) {
        throw new Error('Available seats must be between 1 and 8')
      }

      // Convert coordinates to Postgres point format
      const toPointString = (coords) =>
        Array.isArray(coords) && coords.length === 2
          ? `(${coords[0]},${coords[1]})`
          : null;

      // Prepare ride data for database
      const availableSeats = parseInt(rideData.available_seats)
      const ridePayload = {
        driver_id: user.id,
        origin: rideData.origin.trim(),
        destination: rideData.destination.trim(),
        origin_coordinates: toPointString(rideData.origin_coordinates), // <-- convert to point
        destination_coordinates: toPointString(rideData.destination_coordinates), // <-- convert to point
        departure_time: departureTime.toISOString(),
        available_seats: availableSeats,
        total_seats: availableSeats, // Add total_seats field
        description: rideData.description ? rideData.description.trim() : null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Ride payload:', ridePayload)

      // Create the ride
      const { data, error } = await supabase
        .from('rides')
        .insert([ridePayload])
        .select()
        .single()

      if (error) throw error

      console.log('Ride created successfully:', data)
      toast.success('Ride created successfully!')
      
      return { success: true, data }
    } catch (error) {
      console.error('Error creating ride:', error)
      toast.error(error.message || 'Failed to create ride')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createRide
  }
}

// This function is used to fetch ride requests based on ride ID, passenger ID, and status
export const useFetchRideRequests = () => {
  const fetchRideRequests = async ({ rideId, passengerId, status }) => {
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('ride_id', rideId)
        .eq('passenger_id', passengerId)
        .in('status', status)

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching ride requests:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    fetchRideRequests
  }
}