// File: src/utils/matchingAlgorithm.js
// CREATE THIS NEW FILE:

export const calculateCompatibilityScore = (ride, userPreferences) => {
  let score = 0
  
  // University matching (highest priority)
  if (ride.driver?.university === userPreferences?.university) score += 30
  
  // Music preference matching
  if (ride.driver?.music_preference === userPreferences?.music_preference) score += 15
  
  // Conversation level matching  
  if (ride.driver?.conversation_level === userPreferences?.conversation_level) score += 10
  
  // Time preference (within 2 hours)
  const rideHour = new Date(ride.departure_time).getHours()
  const preferredHour = userPreferences?.preferred_departure_time
  if (preferredHour && Math.abs(rideHour - preferredHour) <= 2) score += 10
  
  // Same gender preference (safety)
  if (userPreferences?.same_gender_only && ride.driver?.gender === userPreferences?.gender) score += 15
  
  return score
}

export const findCompatibleRides = (userPreferences, availableRides) => {
  return availableRides
    .map(ride => ({
      ...ride,
      compatibilityScore: calculateCompatibilityScore(ride, userPreferences)
    }))
    .filter(ride => ride.compatibilityScore > 20) // Only show decent matches
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
}