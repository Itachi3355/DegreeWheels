import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const DebugRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      console.log('Fetching requests for user:', user.id)
      
      // Check both tables
      const { data: regularRequests, error: error1 } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('passenger_id', user.id)

      const { data: postedRequests, error: error2 } = await supabase
        .from('ride_requests_by_passengers')
        .select('*')
        .eq('passenger_id', user.id)

      console.log('Regular requests:', regularRequests)
      console.log('Posted requests:', postedRequests)
      console.log('Errors:', error1, error2)

      setRequests({
        regular: regularRequests || [],
        posted: postedRequests || []
      })
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading debug info...</div>

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">Debug: Ride Requests</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Regular Ride Requests: {requests.regular.length}</h4>
          <pre className="text-xs bg-white p-2 rounded">
            {JSON.stringify(requests.regular, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Posted Requests: {requests.posted.length}</h4>
          <pre className="text-xs bg-white p-2 rounded">
            {JSON.stringify(requests.posted, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default DebugRequests