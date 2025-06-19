// File: src/hooks/useChat.js
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const useChat = (rideId, isActive = true) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  // Fetch messages function
  const fetchMessages = async () => {
    try {
      console.log('💬 Fetching messages for ride:', rideId)
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true })

      if (error) throw error

      console.log('💬 Fetched messages:', data?.length || 0)
      setMessages(data || [])
    } catch (error) {
      console.error('💬 Error fetching messages:', error)
      setError(error.message)
    }
  }

  // Fetch participants function
  const fetchParticipants = async () => {
    try {
      console.log('💬 Fetching participants for ride:', rideId)

      // Get ride details with driver info
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select(`
          *,
          driver:profiles!rides_driver_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('id', rideId)
        .single()

      if (rideError) throw rideError

      // Get bookings for this ride
      const { data: bookings, error: bookingsError } = await supabase
        .from('ride_bookings')
        .select(`
          passenger_id,
          passenger:profiles!ride_bookings_passenger_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('ride_id', rideId)
        .eq('status', 'accepted')

      if (bookingsError) throw bookingsError

      // Combine driver and passengers
      const participantsList = [ride.driver]
      if (bookings) {
        bookings.forEach(booking => {
          if (booking.passenger) {
            participantsList.push(booking.passenger)
          }
        })
      }

      console.log('💬 Fetched participants:', participantsList.length)
      setParticipants(participantsList)
    } catch (error) {
      console.error('💬 Error fetching participants:', error)
      setError(error.message)
    }
  }

  // Cleanup subscription function
  const cleanupSubscription = () => {
    if (channelRef.current) {
      console.log('💬 Cleaning up chat subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.warn('💬 Error cleaning up subscription:', error)
      }
      channelRef.current = null
    }
  }

  // Send message function
  const sendMessage = async (content) => {
    try {
      console.log('💬 Sending message:', content)

      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        ride_id: rideId,
        sender_id: user.id,
        content: content,
        message_type: 'text',
        metadata: {},
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          full_name: user.full_name || user.email,
          email: user.email
        }
      }

      // Add optimistic message immediately to UI
      setMessages(prev => [...prev, optimisticMessage])

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            ride_id: rideId,
            sender_id: user.id,
            content: content,
            message_type: 'text',
            metadata: {}
          }
        ])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            full_name,
            email
          )
        `)

      if (error) throw error

      console.log('💬 Message sent successfully:', data)

      // Replace optimistic message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? data[0] : msg
        )
      )

      return data[0]
    } catch (error) {
      console.error('💬 Error sending message:', error)
      
      // Remove optimistic message on error
      setMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      )
      
      throw error
    }
  }

  // Share location function
  const shareLocation = async (latitude, longitude) => {
    try {
      console.log('💬 Sharing location:', { latitude, longitude })

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            ride_id: rideId,
            sender_id: user.id,
            content: `Location: ${latitude}, ${longitude}`,
            message_type: 'location',
            location: { latitude, longitude }
          }
        ])
        .select()

      if (error) throw error

      console.log('💬 Location shared successfully:', data)
      return data[0]
    } catch (error) {
      console.error('💬 Error sharing location:', error)
      throw error
    }
  }

  // Main effect with inline subscription setup
  useEffect(() => {
    if (!rideId || !isActive || !user?.id) {
      setMessages([])
      setParticipants([])
      setLoading(false)
      return
    }

    console.log('💬 useChat effect running for:', rideId, 'active:', isActive)
    
    // Initialize chat
    const initializeChat = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch initial data
        await Promise.all([
          fetchMessages(),
          fetchParticipants()
        ])
        
        // Setup real-time subscription
        cleanupSubscription() // Clean up any existing subscription
        
        const channelName = `chat_${rideId}`
        console.log('💬 Creating chat subscription:', channelName)

        try {
          channelRef.current = supabase
            .channel(channelName, {
              config: {
                broadcast: { self: false }
              }
            })
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `ride_id=eq.${rideId}`
              },
              async (payload) => {
                console.log('💬 New message received via subscription:', payload.new)
                
                // Only add if it's not from current user (to avoid duplicates with optimistic updates)
                if (payload.new.sender_id !== user.id) {
                  // Fetch the complete message with sender info
                  const { data: newMessage } = await supabase
                    .from('messages')
                    .select(`
                      *,
                      sender:profiles!messages_sender_id_fkey(
                        id,
                        full_name,
                        email
                      )
                    `)
                    .eq('id', payload.new.id)
                    .single()

                  if (newMessage) {
                    setMessages(prev => {
                      // Check if message already exists
                      if (prev.some(msg => msg.id === newMessage.id)) {
                        return prev
                      }
                      return [...prev, newMessage]
                    })
                  }
                }
              }
            )
            .subscribe((status, error) => {
              console.log('💬 Chat subscription status:', status)
              if (error) {
                console.error('💬 Subscription error:', error)
              }
            })

        } catch (error) {
          console.error('💬 Error setting up chat subscription:', error)
        }
        
      } catch (error) {
        console.error('💬 Error initializing chat:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    initializeChat()

    // Cleanup function
    return () => {
      console.log('💬 useChat cleanup for:', rideId)
      cleanupSubscription()
    }
  }, [rideId, isActive, user?.id])

  return {
    messages,
    participants,
    sendMessage,
    shareLocation,
    loading,
    error
  }
}

export default useChat