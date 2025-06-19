import React, { createContext, useContext, useState } from 'react'

const RideContext = createContext({})

export const useRide = () => {
  const context = useContext(RideContext)
  if (!context) {
    throw new Error('useRide must be used within a RideProvider')
  }
  return context
}

export const RideProvider = ({ children }) => {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)

  const value = {
    rides,
    setRides,
    loading,
    setLoading
  }

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  )
}