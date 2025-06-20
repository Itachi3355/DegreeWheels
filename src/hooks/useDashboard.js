import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export const useDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    myRides: [],
    myRequests: [],
    myBookings: [],
    incomingRequests: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  
  const fetchingRef = useRef(false)
  const lastFetchRef = useRef(0)
  const userIdRef = useRef(null)

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const now = Date.now()
    if (!forceRefresh && (fetchingRef.current || (now - lastFetchRef.current) < 1000)) {
      return
    }

    fetchingRef.current = true
    lastFetchRef.current = now
    
    try {
      setLoading(true)

      const [ridesResponse, requestsResponse, bookingsResponse, incomingResponse] = await Promise.all([
        supabase
          .from('rides')
          .select(`*, driver:profiles!rides_driver_id_fkey(*), passengers:ride_bookings(*, passenger:profiles!ride_bookings_passenger_id_fkey(*))`)
          .eq('driver_id', user.id)
          .order('departure_time', { ascending: false }),
        
        supabase
          .from('passenger_ride_requests')
          .select(`*, passenger:profiles!passenger_ride_requests_passenger_id_fkey(*)`)
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('ride_bookings')
          .select(`*, ride:rides(*, driver:profiles!rides_driver_id_fkey(*)), passenger:profiles!ride_bookings_passenger_id_fkey(*)`)
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('ride_bookings')
          .select(`*, ride:rides(*), passenger:profiles!ride_bookings_passenger_id_fkey(*)`)
          .eq('driver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ])

      if (ridesResponse.error) throw ridesResponse.error
      if (requestsResponse.error) throw requestsResponse.error
      if (bookingsResponse.error) throw bookingsResponse.error
      if (incomingResponse.error) throw incomingResponse.error

      const newDashboardData = {
        myRides: ridesResponse.data || [],
        myRequests: requestsResponse.data || [],
        myBookings: bookingsResponse.data || [],
        incomingRequests: incomingResponse.data || []
      }

      setDashboardData(newDashboardData)
      setError(null)
      setHasInitialLoad(true)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
      setDashboardData({
        myRides: [],
        myRequests: [],
        myBookings: [],
        incomingRequests: []
      })
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (user?.id && (userIdRef.current !== user.id || !hasInitialLoad)) {
      userIdRef.current = user.id
      fetchDashboardData()
    }
  }, [user?.id, hasInitialLoad])

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
      
      await fetchDashboardData(true) // Force refresh
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
      
      await fetchDashboardData(true) // Force refresh
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
      
      await fetchDashboardData(true) // Force refresh
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
      
      await fetchDashboardData(true) // Force refresh
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
        .from('passenger_ride_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('passenger_id', user.id)

      if (error) throw error
      
      await fetchDashboardData(true) // Force refresh
      return { success: true }
    } catch (error) {
      console.error('Error cancelling request:', error)
      return { success: false, error }
    }
  }

  // Mark request as found
  const markRequestAsFound = async (requestId) => {
    try {
      const { error } = await supabase
        .from('passenger_ride_requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('passenger_id', user.id)

      if (error) throw error
      
      await fetchDashboardData(true) // Force refresh
      return { success: true }
    } catch (error) {
      console.error('Error marking request as found:', error)
      return { success: false, error }
    }
  }

  return {
    loading,
    myRides: dashboardData.myRides,
    myRequests: dashboardData.myRequests,
    myBookings: dashboardData.myBookings,
    incomingRequests: dashboardData.incomingRequests,
    stats: {
      totalRides: dashboardData.myRides.length,
      totalRequests: dashboardData.myRequests.length,
      totalBookings: dashboardData.myBookings.length,
      incomingCount: dashboardData.incomingRequests.length
    },
    fetchDashboardData: () => fetchDashboardData(true),
    approveRequest,
    rejectRequest,
    cancelRequest,
    cancelRideRequest,
    markRequestAsFound,
    deleteRide,
    error,
    refetch: () => {
      if (!fetchingRef.current) {
        setLoading(true)
        lastFetchRef.current = 0
        fetchDashboardData(true)
      }
    }
  }
}