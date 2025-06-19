import React, { useState } from 'react'
import { motion } from 'framer-motion'
import LocationInput from '../common/LocationInput'
import Map from '../common/Map'
import { MapPinIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const RoutePlanner = () => {
  const [route, setRoute] = useState({
    origin: '',
    destination: '',
    originCoordinates: null,
    destinationCoordinates: null
  })
  
  const [routeInfo, setRouteInfo] = useState(null)

  const handleOriginSelect = (location) => {
    setRoute(prev => ({
      ...prev,
      origin: location ? location.name : '',
      originCoordinates: location ? location.coordinates : null
    }))
  }

  const handleDestinationSelect = (location) => {
    setRoute(prev => ({
      ...prev,
      destination: location ? location.name : '',
      destinationCoordinates: location ? location.coordinates : null
    }))
  }

  const mockRideData = route.originCoordinates && route.destinationCoordinates ? [{
    id: 'route-preview',
    origin: route.origin,
    destination: route.destination,
    origin_coordinates: route.originCoordinates,
    destination_coordinates: route.destinationCoordinates,
    departure_time: new Date().toISOString(),
    available_seats: 4
  }] : []

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Planner</h1>
          <p className="text-lg text-gray-600">
            Plan your route and visualize your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Plan Your Route
              </h2>
              
              <div className="space-y-6">
                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-1 text-green-600" />
                    From (Starting Point)
                  </label>
                  <LocationInput
                    placeholder="Enter pickup location..."
                    onLocationSelect={handleOriginSelect}
                    initialValue={route.origin}
                    className="w-full"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-1 text-red-600" />
                    To (Destination)
                  </label>
                  <LocationInput
                    placeholder="Enter destination..."
                    onLocationSelect={handleDestinationSelect}
                    initialValue={route.destination}
                    className="w-full"
                  />
                </div>

                {/* Route Summary */}
                {route.origin && route.destination && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-3">Route Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-600 truncate">{route.origin}</span>
                      </div>
                      <div className="flex items-center ml-2">
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-gray-500 text-xs">Route</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-gray-600 truncate">{route.destination}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Route Visualization
              </h2>
              <Map 
                rides={mockRideData}
                height="600px"
                showRoute={true}
                center={route.originCoordinates || [-97.1331, 33.2148]}
                zoom={route.originCoordinates ? 12 : 11}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default RoutePlanner