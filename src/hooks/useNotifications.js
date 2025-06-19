import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)
  const userIdRef = useRef(null) // Track user ID changes

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
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      
      // Count unread notifications
      const unread = (data || []).filter(n => !n.is_read).length
      setUnreadCount(unread)
      
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Clean up subscription helper
  const cleanupSubscription = useCallback(() => {
    if (channelRef.current) {
      console.log('🔔 Cleaning up existing notification subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.warn('Error cleaning up subscription:', error)
      }
      channelRef.current = null
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [user?.id])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      )
      setUnreadCount(0)
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user?.id])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [user?.id, notifications])

  // Set up real-time subscription with enhanced cleanup
  useEffect(() => {
    // Always cleanup first
    cleanupSubscription()

    if (!user?.id) {
      userIdRef.current = null
      return
    }

    // Check if user changed
    if (userIdRef.current && userIdRef.current !== user.id) {
      console.log('🔔 User changed, cleaning up old subscription')
      cleanupSubscription()
    }
    
    userIdRef.current = user.id

    // Create new subscription only if we don't already have one for this user
    const channelName = `notifications_${user.id}_${Date.now()}` // Add timestamp for uniqueness
    console.log('🔔 Creating notification subscription:', channelName)
    
    try {
      channelRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 New notification received:', payload.new)
            setNotifications(prev => [payload.new, ...prev])
            if (!payload.new.is_read) {
              setUnreadCount(prev => prev + 1)
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 Notification subscription status:', status)
          if (status === 'CHANNEL_ERROR') {
            console.error('🔔 Notification subscription error')
            cleanupSubscription()
          }
        })
    } catch (error) {
      console.error('🔔 Error creating notification subscription:', error)
    }

    // Cleanup function
    return () => {
      console.log('🔔 useNotifications effect cleanup')
      cleanupSubscription()
    }
  }, [user?.id, cleanupSubscription])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🔔 useNotifications component unmount cleanup')
      cleanupSubscription()
    }
  }, [cleanupSubscription])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}