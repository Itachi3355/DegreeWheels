import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)
  const userIdRef = useRef(null)

  // Mock notifications fallback
  const getMockNotifications = () => [
    {
      id: Date.now() + 1,
      type: 'ride_request',
      title: '🚗 New ride request',
      message: 'Someone wants to join your ride to Dallas',
      created_at: new Date().toISOString(),
      read: false
    },
    {
      id: Date.now() + 2,
      type: 'ride_confirmed',
      title: '✅ Ride confirmed',
      message: 'Your ride to Austin has been confirmed',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: Date.now() + 3,
      type: 'ride_reminder',
      title: '⏰ Ride reminder',
      message: 'Your ride starts in 30 minutes',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      read: false
    }
  ]

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔔 Fetching notifications for user:', user.id)
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('❌ Error fetching notifications:', error)
        
        // Use mock data if table doesn't exist or other DB errors
        const mockData = getMockNotifications()
        setNotifications(mockData)
        setUnreadCount(mockData.filter(n => !n.read).length)
        setError('Using demo notifications (database not configured)')
      } else {
        console.log('✅ Fetched notifications:', data)
        setNotifications(data || [])
        setUnreadCount((data || []).filter(n => !n.read).length)
        setError(null)
      }
    } catch (error) {
      console.error('❌ Error in fetchNotifications:', error)
      
      // Fallback to mock data
      const mockData = getMockNotifications()
      setNotifications(mockData)
      setUnreadCount(mockData.filter(n => !n.read).length)
      setError('Database connection failed - using demo data')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user?.id) return

    // Update local state immediately
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      console.log('🔔 Marking notification as read:', notificationId)
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error marking notification as read:', error)
        // Revert local state on error
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
        )
        setUnreadCount(prev => prev + 1)
      } else {
        console.log('✅ Notification marked as read')
      }
    } catch (error) {
      console.error('❌ Error in markAsRead:', error)
      // Revert local state on error
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      )
      setUnreadCount(prev => prev + 1)
    }
  }, [user?.id])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    // Store original state for potential revert
    const originalNotifications = [...notifications]
    const originalUnreadCount = unreadCount

    // Update local state immediately
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)

    try {
      console.log('🔔 Marking all notifications as read')
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('❌ Error marking all notifications as read:', error)
        // Revert on error
        setNotifications(originalNotifications)
        setUnreadCount(originalUnreadCount)
      } else {
        console.log('✅ All notifications marked as read')
      }
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error)
      // Revert on error
      setNotifications(originalNotifications)
      setUnreadCount(originalUnreadCount)
    }
  }, [user?.id, notifications, unreadCount])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user?.id) return

    // Store original notification for potential revert
    const originalNotification = notifications.find(n => n.id === notificationId)
    
    // Update local state immediately
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    if (originalNotification && !originalNotification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    try {
      console.log('🔔 Deleting notification:', notificationId)
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Error deleting notification:', error)
        // Revert on error
        if (originalNotification) {
          setNotifications(prev => [...prev, originalNotification].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          ))
          if (!originalNotification.read) {
            setUnreadCount(prev => prev + 1)
          }
        }
      } else {
        console.log('✅ Notification deleted')
      }
    } catch (error) {
      console.error('❌ Error in deleteNotification:', error)
      // Revert on error
      if (originalNotification) {
        setNotifications(prev => [...prev, originalNotification].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        ))
        if (!originalNotification.read) {
          setUnreadCount(prev => prev + 1)
        }
      }
    }
  }, [user?.id, notifications])

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return

    // Clean up previous subscription if user changed
    if (channelRef.current && userIdRef.current !== user.id) {
      console.log('🔔 Cleaning up previous subscription for user:', userIdRef.current)
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    userIdRef.current = user.id
    fetchNotifications()

    // Only set up real-time if we don't have errors
    if (!error) {
      // Create new subscription
      const channelName = `notifications_${user.id}_${Date.now()}`
      console.log('🔔 Creating notification subscription:', channelName)

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Notification change received:', payload)
            
            if (payload.eventType === 'INSERT') {
              setNotifications(prev => [payload.new, ...prev])
              if (!payload.new.read) {
                setUnreadCount(prev => prev + 1)
              }
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(prev => 
                prev.map(n => n.id === payload.new.id ? payload.new : n)
              )
            } else if (payload.eventType === 'DELETE') {
              setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
              if (!payload.old.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 Notification subscription status:', status)
        })

      channelRef.current = channel
    }

    return () => {
      if (channelRef.current) {
        console.log('🔔 Cleaning up notification subscription')
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user?.id, error])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log('🔔 useNotifications component unmount cleanup')
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}