import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useRides = () => {
  const { user } = useAuth()
  const [rides, setRides] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requestsError, setRequestsError] = useState(null)

  const fetchRides = useCallback(async () => {
    if (!user?.id) {
      console.log('No user found, skipping rides fetch')
      return
    }

    console.log('Fetching rides from Supabase...')
    console.log('🔍 User ID:', user.id)
    setError(null)

    try {
      // Fetch rides with detailed logging
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('status', 'active')
        .order('departure_time', { ascending: true })

      console.log('🔍 Rides query result:', { 
        data: ridesData, 
        error: ridesError,
        count: ridesData?.length 
      })

      if (ridesError) {
        console.error('❌ Error fetching rides:', ridesError)
        throw ridesError
      }

      console.log('Rides fetched successfully:', ridesData?.length || 0)
      console.log('🔍 First ride (if any):', ridesData?.[0])
      setRides(ridesData || [])

    } catch (error) {
      console.error('Error in fetchRides:', error)
      setError(error.message)
    }
  }, [user?.id])

  const fetchRequests = useCallback(async () => {
    if (!user?.id) {
      console.log('No user found, skipping requests fetch')
      return
    }

    console.log('🔍 === FETCHING RIDE REQUESTS DEBUG ===')
    console.log('🔍 Current user:', user.id)
    console.log('🔍 Current user email:', user.email)

    try {
      // ✅ FIX: Use the correct table name 'passenger_ride_requests'
      const { data: requestsData, error: requestsError } = await supabase
        .from('passenger_ride_requests')  // ✅ CHANGE THIS LINE
        .select(`
          *,
          passenger:profiles!passenger_ride_requests_passenger_id_fkey(
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('preferred_departure_time', { ascending: true })  // ✅ Use correct column name

      if (requestsError) {
        console.error('❌ Error fetching requests:', requestsError)
        throw requestsError
      }

      console.log('🔍 Raw requests data:', requestsData)
      console.log('🔍 Total requests found:', requestsData?.length || 0)

      if (!requestsData || requestsData.length === 0) {
        console.log('🔍 No requests found')
        setRequests([])
        return
      }

      // Debug each request
      requestsData.forEach((request, index) => {
        console.log(`🔍 Request ${index + 1}:`, request)
      })

      // Filter out own requests (so users don't see their own requests to offer rides to)
      const filteredRequests = requestsData.filter(request => {
        const isOwnRequest = request.passenger_id === user.id  // ✅ Use correct column name
        console.log(`🔍 Comparing: ${request.passenger_id} !== ${user.id}`)
        return !isOwnRequest
      })

      console.log('🔍 Filtered requests (excluding own):', filteredRequests.length)
      console.log('🔍 Final filtered requests:', filteredRequests)

      setRequests(filteredRequests)

    } catch (error) {
      console.error('❌ Error fetching requests:', error)
      setRequestsError(error.message)
    }
  }, [user?.id, user?.email])

  // Combined fetch function
  const fetchAllData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user found, skipping all data fetch')
      setLoading(false)
      return
    }

    console.log('🔄 Starting to fetch all ride data...')
    setLoading(true)
    setError(null)
    setRequestsError(null)

    try {
      // Fetch both rides and requests concurrently
      await Promise.all([
        fetchRides(),
        fetchRequests()
      ])

      console.log('✅ All data fetched successfully')
    } catch (error) {
      console.error('❌ Error fetching all data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, fetchRides, fetchRequests])

  // Use useEffect with proper dependencies
  useEffect(() => {
    console.log('useRides useEffect - checking conditions:', {
      hasUser: !!user,
      userId: user?.id,
      loading
    })

    if (user?.id) {
      console.log('useRides useEffect - fetching data')
      fetchAllData()
    } else {
      setLoading(false)
    }
  }, [user?.id]) // Only depend on user ID

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    if (user?.id) {
      fetchAllData()
    }
  }, [user?.id, fetchAllData])

  // Search function
  const searchRides = useCallback(async (filters) => {
    if (!user?.id) return

    setLoading(true)
    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('status', 'active')

      if (filters.origin) {
        query = query.ilike('origin', `%${filters.origin}%`)
      }
      if (filters.destination) {
        query = query.ilike('destination', `%${filters.destination}%`)
      }
      if (filters.date) {
        query = query.gte('departure_time', `${filters.date}T00:00:00`)
        query = query.lt('departure_time', `${filters.date}T23:59:59`)
      }

      const { data, error } = await query.order('departure_time', { ascending: true })

      if (error) throw error
      setRides(data || [])
    } catch (error) {
      console.error('Search error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 useRides Summary:', {
        userId: user?.id,
        ridesCount: rides?.length || 0,
        requestsCount: requests?.length || 0,
        loading,
        error: !!error
      })
    }
  }, [user?.id, rides?.length, requests?.length, loading, error])

  return {
    rides,
    requests,
    loading,
    error,
    requestsError,
    refetch,
    searchRides,
    fetchRides: fetchAllData
  }
}