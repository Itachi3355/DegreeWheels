import { supabase } from '../lib/supabase'

export const checkStatusConstraint = async () => {
  // Get constraint info from database
  const { data, error } = await supabase
    .rpc('get_constraint_info', {
      table_name: 'ride_requests',
      constraint_name: 'ride_requests_status_check'
    })

  if (error) {
    console.error('Error getting constraint info:', error)
    
    // Alternative: try to create a test record with different status values
    const testStatuses = ['pending', 'approved', 'accepted', 'confirmed', 'rejected', 'denied', 'declined']
    
    for (const status of testStatuses) {
      console.log(`Testing status: ${status}`)
      // This would help identify valid values
    }
  }
  
  return data
}