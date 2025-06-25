/*
 * Copyright (c) 2025 DegreeWheels
 * Licensed under the MIT License
 */

import { createClient } from '@supabase/supabase-js'

// Use process.env instead of import.meta.env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('🔧 Supabase initialized:', {
  url: supabaseUrl ? '✅' : '❌',
  key: supabaseKey ? '✅' : '❌'
})

// Auth helpers
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const createProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
  return { data, error }
}

export const createRide = async (rideData) => {
  const { data, error } = await supabase
    .from('rides')
    .insert([rideData])
    .select()
  return { data, error }
}

export const getRides = async (filters = {}) => {
  let query = supabase
    .from('rides')
    .select(`
      *,
      driver:profiles!rides_driver_id_fkey(*),
      passengers:ride_requests(
        *,
        passenger:profiles!ride_requests_passenger_id_fkey(*)
      )
    `)
    .eq('status', 'active')
    .order('departure_time', { ascending: true })

  if (filters.origin) {
    query = query.ilike('origin', `%${filters.origin}%`)
  }
  if (filters.destination) {
    query = query.ilike('destination', `%${filters.destination}%`)
  }

  const { data, error } = await query
  return { data, error }
}