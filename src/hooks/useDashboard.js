import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    myRides: [],
    myRequests: [],
    myBookings: [],
    incomingRequests: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      console.log('Fetching dashboard data for user:', user.id)

      // Fetch all data in parallel - GET FULL DATA, NOT JUST COUNTS
      const [
        ridesResponse,
        requestsResponse,
        bookingsResponse,
        incomingResponse
      ] = await Promise.all([
        // My rides (as driver) - GET FULL DATA
        supabase
          .from('rides')
          .select(`
            *,
            driver:profiles!rides_driver_id_fkey(*),
            passengers:ride_bookings(
              *,
              passenger:profiles!ride_bookings_passenger_id_fkey(*)
            )
          `)
          .eq('driver_id', user.id)
          .order('departure_time', { ascending: false }),
        
        // My ride requests - GET FULL DATA
        supabase
          .from('ride_requests')
          .select(`
            *,
            requester:profiles!ride_requests_requester_id_fkey(*)
          `)
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false }),
        
        // My bookings (as passenger) - GET FULL DATA
        supabase
          .from('ride_bookings')
          .select(`
            *,
            ride:rides(*,
              driver:profiles!rides_driver_id_fkey(*)
            ),
            passenger:profiles!ride_bookings_passenger_id_fkey(*)
          `)
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false }),
        
        // Incoming requests (for my rides) - GET FULL DATA
        supabase
          .from('ride_bookings')
          .select(`
            *,
            ride:rides(*),
            passenger:profiles!ride_bookings_passenger_id_fkey(*)
          `)
          .eq('driver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ])

      // Check for errors
      if (ridesResponse.error) throw ridesResponse.error
      if (requestsResponse.error) throw requestsResponse.error
      if (bookingsResponse.error) throw bookingsResponse.error
      if (incomingResponse.error) throw incomingResponse.error

      const dashboardData = {
        myRides: ridesResponse.data || [],
        myRequests: requestsResponse.data || [],
        myBookings: bookingsResponse.data || [],
        incomingRequests: incomingResponse.data || []
      }

      console.log('✅ Dashboard data fetched:', {
        myRides: dashboardData.myRides.length,
        myRequests: dashboardData.myRequests.length,
        myBookings: dashboardData.myBookings.length,
        incomingRequests: dashboardData.incomingRequests.length
      })

      setDashboardData(dashboardData)
      setError(null)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message)
      setDashboardData({
        myRides: [],
        myRequests: [],
        myBookings: [],
        incomingRequests: []
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Approve booking request
  const approveRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('ride_bookings')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('driver_id', user.id)

      if (error) throw error
      
      await fetchDashboardData() // Refresh data
      return { success: true }
    } catch (error) {
      console.error('Error approving request:', error)
      return { success: false, error }
    }
  }

  // Reject booking request
  const rejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('ride_bookings')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('driver_id', user.id)

      if (error) throw error
      
      await fetchDashboardData() // Refresh data
      return { success: true }
    } catch (error) {
      console.error('Error rejecting request:', error)
      return { success: false, error }
    }
  }

  // Cancel booking request
  const cancelRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('ride_bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('passenger_id', user.id)

      if (error) throw error
      
      await fetchDashboardData() // Refresh data
      return { success: true }
    } catch (error) {
      console.error('Error cancelling request:', error)
      return { success: false, error }
    }
  }

  // Delete ride
  const deleteRide = async (rideId) => {
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', rideId)
        .eq('driver_id', user.id)

      if (error) throw error
      
      await fetchDashboardData() // Refresh data
      return { success: true }
    } catch (error) {
      console.error('Error deleting ride:', error)
      return { success: false, error }
    }
  }

  // Cancel ride request
  const cancelRideRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('ride_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('requester_id', user.id)

      if (error) throw error
      
      await fetchDashboardData() // Refresh data
      return { success: true }
    } catch (error) {
      console.error('Error cancelling ride request:', error)
      return { success: false, error }
    }
  }

  // Mark request as found
  const markRequestAsFound = async (requestId) => {
    try {
      const { error } = await supabase
        .from('ride_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('requester_id', user.id)

      if (error) throw error
      
      await fetchDashboardData() // Refresh data
      return { success: true }
    } catch (error) {
      console.error('Error marking request as found:', error)
      return { success: false, error }
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    loading,
    error,
    myRides: dashboardData.myRides,
    myRequests: dashboardData.myRequests,
    myBookings: dashboardData.myBookings,
    incomingRequests: dashboardData.incomingRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    deleteRide,
    cancelRideRequest,
    markRequestAsFound,
    refetch: fetchDashboardData
  }
}