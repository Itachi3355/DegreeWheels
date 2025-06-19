import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { createRideRequestNotification } from '../utils/notificationHelpers'

export const useBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState({ asPassenger: [], asDriver: [] })
  const [loading, setLoading] = useState(true)

  // Fetch user's bookings
  const fetchBookings = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get bookings where user is passenger (simpler query first)
      const { data: passengerBookings, error: passengerError } = await supabase
        .from('ride_bookings')
        .select(`
          *,
          ride:rides(*)
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false })

      if (passengerError) {
        console.error('Passenger bookings error:', passengerError)
        throw passengerError
      }

      // Get bookings where user is driver
      const { data: driverBookings, error: driverError } = await supabase
        .from('ride_bookings')
        .select(`
          *,
          ride:rides(*)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })

      if (driverError) {
        console.error('Driver bookings error:', driverError)
        throw driverError
      }

      // Get passenger details separately for driver bookings
      const driverBookingsWithPassengers = await Promise.all(
        (driverBookings || []).map(async (booking) => {
          const { data: passenger } = await supabase
            .from('profiles')
            .select('full_name, phone, email')
            .eq('id', booking.passenger_id)
            .single()
          
          return { ...booking, passenger }
        })
      )

      setBookings({
        asPassenger: passengerBookings || [],
        asDriver: driverBookingsWithPassengers || []
      })

    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  // Book a ride
  const bookRide = async (rideId, driverId, seatsRequested = 1, pickupNotes = '') => {
    try {
      // Check if already booked - REMOVE .single() 
      const { data: existing, error: checkError } = await supabase
        .from('ride_bookings')
        .select('id')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing booking:', checkError)
        // Continue anyway, let the unique constraint handle duplicates
      }

      if (existing && existing.length > 0) {
        toast.error('You have already requested this ride')
        return { success: false, error: 'Already booked' }
      }

      const { data, error } = await supabase
        .from('ride_bookings')
        .insert([
          {
            ride_id: rideId,
            passenger_id: user.id,
            driver_id: driverId,
            seats_requested: seatsRequested,
            pickup_notes: pickupNotes,
            status: 'pending'
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Create notification for driver
      await createRideRequestNotification(
        driverId,
        user.full_name || user.email,
        `/dashboard?tab=incoming`
      )

      toast.success('🎉 Ride booking request sent!')
      fetchBookings() // Refresh bookings
      return { success: true, booking: data }

    } catch (error) {
      console.error('Error booking ride:', error)
      
      if (error.code === '23505') {
        toast.error('You have already requested this ride')
      } else {
        toast.error('Failed to book ride. Please try again.')
      }
      
      return { success: false, error }
    }
  }

  // Update booking status
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const { data, error } = await supabase
        .from('ride_bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error

      const statusMessage = {
        accepted: '✅ Booking accepted!',
        declined: '❌ Booking declined',
        cancelled: '🚫 Booking cancelled',
        completed: '🎉 Ride completed!'
      }

      toast.success(statusMessage[status] || 'Booking updated')
      fetchBookings() // Refresh bookings
      return { success: true, booking: data }

    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
      return { success: false, error }
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [user])

  return {
    bookings,
    loading,
    bookRide,
    updateBookingStatus,
    cancelBooking: (bookingId) => updateBookingStatus(bookingId, 'cancelled'),
    refetch: fetchBookings
  }
}