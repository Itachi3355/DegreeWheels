import { supabase } from '../lib/supabase'

// Notification types
export const NOTIFICATION_TYPES = {
  RIDE_REQUEST: 'ride_request',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_REJECTED: 'request_rejected',
  RIDE_CANCELLED: 'ride_cancelled',
  PASSENGER_JOINED: 'passenger_joined',
  PASSENGER_LEFT: 'passenger_left',
  RIDE_REMINDER: 'ride_reminder'
}

// Create notification for ride request
export const createRideRequestNotification = async (driverId, passengerName, redirectPath) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: driverId,
        type: 'ride_request',
        title: '🚗 New Ride Request',
        message: `${passengerName} wants to join your ride`,
        data: { ridePath: redirectPath }
      }])

    if (error) throw error
  } catch (error) {
    console.error('Error creating ride request notification:', error)
  }
}

// Create notification for request approval
export const createRequestApprovedNotification = async (passengerId, redirectPath) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: passengerId,
        type: 'request_approved',
        title: '✅ Ride Request Approved',
        message: 'Your ride request has been approved!',
        data: { ridePath: redirectPath }
      }])

    if (error) throw error
  } catch (error) {
    console.error('Error creating request approved notification:', error)
  }
}

// Create notification for request rejection
export const createRequestRejectedNotification = async (passengerId, redirectPath) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: passengerId,
        type: 'request_rejected',
        title: '❌ Ride Request Declined',
        message: 'Your ride request was declined. Try finding another ride.',
        data: { ridePath: redirectPath }
      }])

    if (error) throw error
  } catch (error) {
    console.error('Error creating request rejected notification:', error)
  }
}

// Create notification for ride cancellation
export const createRideCancelledNotification = async (passengerIds, ridePath) => {
  const notifications = passengerIds.map(passengerId => ({
    user_id: passengerId,
    type: NOTIFICATION_TYPES.RIDE_CANCELLED,
    title: '⚠️ Ride Cancelled',
    message: 'Unfortunately, your ride has been cancelled by the driver',
    data: { ridePath },
    read: false
  }))

  return await supabase.from('notifications').insert(notifications)
}

// Create notification for passenger joining
export const createPassengerJoinedNotification = async (driverId, passengerName, ridePath) => {
  const notification = {
    user_id: driverId,
    type: NOTIFICATION_TYPES.PASSENGER_JOINED,
    title: '👋 New Passenger',
    message: `${passengerName} has joined your ride`,
    data: { ridePath },
    read: false
  }

  return await supabase.from('notifications').insert([notification])
}

// Create notification for ride reminder
export const createRideReminderNotification = async (userIds, ridePath, departureTime) => {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type: NOTIFICATION_TYPES.RIDE_REMINDER,
    title: '🚗 Ride Reminder',
    message: `Your ride is departing soon at ${new Date(departureTime).toLocaleTimeString()}`,
    data: { ridePath },
    read: false
  }))

  return await supabase.from('notifications').insert(notifications)
}

// Get notification icon based on type
export const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.RIDE_REQUEST:
      return '🚗'
    case NOTIFICATION_TYPES.REQUEST_APPROVED:
      return '✅'
    case NOTIFICATION_TYPES.REQUEST_REJECTED:
      return '❌'
    case NOTIFICATION_TYPES.RIDE_CANCELLED:
      return '⚠️'
    case NOTIFICATION_TYPES.PASSENGER_JOINED:
      return '🎉'
    case NOTIFICATION_TYPES.PASSENGER_LEFT:
      return '👋'
    case NOTIFICATION_TYPES.RIDE_REMINDER:
      return '⏰'
    default:
      return '🔔'
  }
}

// Get notification color based on type
export const getNotificationColor = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.RIDE_REQUEST:
      return 'bg-blue-100 text-blue-600'
    case NOTIFICATION_TYPES.REQUEST_APPROVED:
      return 'bg-green-100 text-green-600'
    case NOTIFICATION_TYPES.REQUEST_REJECTED:
      return 'bg-red-100 text-red-600'
    case NOTIFICATION_TYPES.RIDE_CANCELLED:
      return 'bg-yellow-100 text-yellow-600'
    case NOTIFICATION_TYPES.PASSENGER_JOINED:
      return 'bg-purple-100 text-purple-600'
    case NOTIFICATION_TYPES.PASSENGER_LEFT:
      return 'bg-gray-100 text-gray-600'
    case NOTIFICATION_TYPES.RIDE_REMINDER:
      return 'bg-orange-100 text-orange-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}