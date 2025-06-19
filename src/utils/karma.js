export const KARMA_POINTS = {
  RIDE_OFFER: 10,
  RIDE_COMPLETE: 15,
  POSITIVE_RATING: 5,
  EVENT_PARTICIPATION: 20,
  PROFILE_COMPLETE: 25,
  FIRST_RIDE: 30,
  WEEKLY_ACTIVE: 5,
  MONTHLY_ACTIVE: 20,
  HELP_NEWBIE: 15,
  CARBON_SAVER: 8
}

export const KARMA_LEVELS = [
  { name: 'New Member', min: 0, max: 99, color: 'bg-gray-500', icon: '🌱' },
  { name: 'Active Member', min: 100, max: 249, color: 'bg-blue-500', icon: '🚗' },
  { name: 'Regular Contributor', min: 250, max: 499, color: 'bg-green-500', icon: '⭐' },
  { name: 'Campus Champion', min: 500, max: 999, color: 'bg-purple-500', icon: '🏆' },
  { name: 'Eco Warrior', min: 1000, max: Infinity, color: 'bg-yellow-500', icon: '🌟' }
]

export class KarmaSystem {
  static calculateKarma(userActivity) {
    const {
      ridesOffered = 0,
      ridesCompleted = 0,
      positiveRatings = 0,
      eventsParticipated = 0,
      profileComplete = false,
      isFirstRide = false,
      weeklyActive = 0,
      monthlyActive = 0,
      helpedNewbies = 0,
      carbonSaved = 0
    } = userActivity

    let totalPoints = 0
    
    totalPoints += ridesOffered * KARMA_POINTS.RIDE_OFFER
    totalPoints += ridesCompleted * KARMA_POINTS.RIDE_COMPLETE
    totalPoints += positiveRatings * KARMA_POINTS.POSITIVE_RATING
    totalPoints += eventsParticipated * KARMA_POINTS.EVENT_PARTICIPATION
    totalPoints += profileComplete ? KARMA_POINTS.PROFILE_COMPLETE : 0
    totalPoints += isFirstRide ? KARMA_POINTS.FIRST_RIDE : 0
    totalPoints += weeklyActive * KARMA_POINTS.WEEKLY_ACTIVE
    totalPoints += monthlyActive * KARMA_POINTS.MONTHLY_ACTIVE
    totalPoints += helpedNewbies * KARMA_POINTS.HELP_NEWBIE
    totalPoints += Math.floor(carbonSaved / 10) * KARMA_POINTS.CARBON_SAVER

    return totalPoints
  }

  static getKarmaLevel(points) {
    return KARMA_LEVELS.find(level => points >= level.min && points <= level.max) || KARMA_LEVELS[0]
  }

  static getNextLevel(points) {
    const currentLevel = this.getKarmaLevel(points)
    const currentIndex = KARMA_LEVELS.findIndex(level => level.name === currentLevel.name)
    return KARMA_LEVELS[currentIndex + 1] || null
  }

  static getProgressToNextLevel(points) {
    const nextLevel = this.getNextLevel(points)
    if (!nextLevel) return 100
    
    const currentLevel = this.getKarmaLevel(points)
    const progress = ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    return Math.min(100, Math.max(0, progress))
  }
}