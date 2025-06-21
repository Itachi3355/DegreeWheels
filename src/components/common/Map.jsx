// src/components/common/Map.jsx
import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

// Set access token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
const calculateMapDistance = (originCoords, destCoords) => {
    if (!originCoords || !destCoords) return 'N/A'
    
    try {
      // ✅ STANDARDIZE: Use the same parsing logic as RideSearch
      let originLatLng, destLatLng
      
      // Parse origin coordinates
      if (typeof originCoords === 'string') {
        // Handle string format: "(-96.944127,32.82938)"
        const cleanOrigin = originCoords.replace(/[()]/g, '').split(',').map(Number)
        originLatLng = [cleanOrigin[1], cleanOrigin[0]] // [lat, lng]
      } else if (Array.isArray(originCoords)) {
        // Handle array format: [-96.944127, 32.82938] (lng, lat from Mapbox)
        originLatLng = [originCoords[1], originCoords[0]] // Convert to [lat, lng]
      } else {
        return 'N/A'
      }
      
      // Parse destination coordinates
      if (typeof destCoords === 'string') {
        // Handle string format: "(-96.944127,32.82938)"
        const cleanDest = destCoords.replace(/[()]/g, '').split(',').map(Number)
        destLatLng = [cleanDest[1], cleanDest[0]] // [lat, lng]
      } else if (Array.isArray(destCoords)) {
        // Handle array format: [-96.944127, 32.82938] (lng, lat from Mapbox)
        destLatLng = [destCoords[1], destCoords[0]] // Convert to [lat, lng]
      } else {
        return 'N/A'
      }
      
      console.log('🗺️ Map distance calculation:', {
        origin: originLatLng,
        dest: destLatLng,
        originRaw: originCoords,
        destRaw: destCoords
      })
      
      const [lat1, lon1] = originLatLng
      const [lat2, lon2] = destLatLng
      
      const R = 3959 // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      const result = Math.round(distance * 10) / 10 // Round to 1 decimal place
      console.log('🗺️ Map calculated distance:', result, 'miles')
      return result
      
    } catch (error) {
      console.warn('Error calculating map distance:', error)
      return 'N/A'
    }
  }
  export { calculateMapDistance }
const Map = ({ 
  rides = [], 
  height = '400px', 
  center = [-98.5795, 39.8283], 
  zoom = 4,
  showRoute = false,
  onRideSelect,
  mapId = Math.random().toString(36) // 🔧 ADD: Unique map ID
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)

  console.log('🔧 Mapbox Access Token:', mapboxgl.accessToken ? 'Token exists' : 'MISSING!')
  console.log('🔧 Token length:', mapboxgl.accessToken?.length || 0)

  // Initialize map
  useEffect(() => {
    if (map.current) return // Map already initialized

    console.log('🗺️ Initializing map...')

    if (!mapboxgl.accessToken) {
      console.error('❌ Mapbox access token is missing!')
      setMapError('Mapbox access token is not configured')
      return
    }

    // 🔧 FIX: Check if container is available
    if (!mapContainer.current) {
      console.warn('⚠️ Map container not ready')
      return
    }

    try {
      // Enhanced WebGL and CSP compatibility check
      const isWebGLSupported = () => {
        try {
          const canvas = document.createElement('canvas')
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
          return !!(gl && gl.getExtension)
        } catch (e) {
          return false
        }
      }

      if (!isWebGLSupported()) {
        console.error('❌ WebGL is not available in this browser/environment')
        setMapError('WebGL is not supported. Map requires WebGL to function.')
        return
      }

      // Check Mapbox GL JS support with CSP considerations
      if (!mapboxgl.supported({ failIfMajorPerformanceCaveat: false })) {
        console.error('❌ Mapbox GL JS is not supported')
        setMapError('Your browser does not support Mapbox GL JS')
        return
      }

      // 🔧 Initialize map with error handling
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
        attributionControl: false,
        maxRetries: 2,
        retryTimeout: 5000
      })

      // Enhanced error handling for map events
      map.current.on('error', (e) => {
        console.warn('⚠️ Map warning (non-critical):', e.error?.message || 'Unknown')
        
        // Don't show error UI for these common network issues
        const isNetworkError = e.error?.message?.includes('send') || 
                               e.error?.message?.includes('fetch') ||
                               e.error?.message?.includes('network')
        
        if (!isNetworkError) {
          if (e.error?.message?.includes('send')) {
            // Just log network issues, don't show error to user
            console.warn('🌐 Network connectivity issue (continuing without error)')
          } else {
            setMapError(`Map error: ${e.error?.message || 'Unknown error'}`)
          }
        }
      })

      map.current.on('style.load', () => {
        console.log('🗺️ Map style loaded')
        setMapLoaded(true)
        setMapError(null)
      })

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully')
        setMapLoaded(true)
        setMapError(null)
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    } catch (error) {
      console.error('❌ Error initializing map:', error)
      if (error.message?.includes('container')) {
        setMapError('Map container initialization failed. Trying to continue without map.')
      } else if (error.message?.includes('WebGL')) {
        setMapError('WebGL initialization failed. Please enable hardware acceleration in your browser.')
      } else if (error.message?.includes('worker')) {
        setMapError('Web worker creation failed. Please check Content Security Policy settings.')
      } else if (error.message?.includes('send')) {
        setMapError('Network connectivity issue. Map cannot connect to Mapbox servers.')
      } else {
        setMapError(`Failed to initialize map: ${error.message}`)
      }
    }
  }, [center, zoom])

  // Add markers when map is ready
  useEffect(() => {
    if (!map.current || !mapLoaded || mapError) {
      return
    }

    // Clear existing markers
    markers.current.forEach(marker => {
      try {
        marker.remove()
      } catch (e) {
        console.warn('Warning removing marker:', e)
      }
    })
    markers.current = []

    // If no rides, set default view
    if (!rides || rides.length === 0) {
      try {
        map.current.setCenter(center)
        map.current.setZoom(zoom)
      } catch (e) {
        console.warn('Warning setting default view:', e)
      }
      return
    }

    // Add markers for rides with valid coordinates
    let validMarkers = 0
    
    rides.forEach((ride, index) => {
      if (!ride.origin_coordinates || !ride.destination_coordinates) {
        return
      }

      try {
        // 🔧 IMPROVED: Enhanced coordinate parsing for multiple formats
        const parseCoords = (coordString) => {
          try {
            if (!coordString) return null
            
            // Handle different coordinate formats
            if (typeof coordString === 'string') {
              // Format: "(-83.0458,42.3314)" - Remove parentheses and split
              if (coordString.startsWith('(') && coordString.endsWith(')')) {
                const cleanCoords = coordString.slice(1, -1) // Remove parentheses
                const [lng, lat] = cleanCoords.split(',').map(coord => parseFloat(coord.trim()))
                if (!isNaN(lng) && !isNaN(lat)) {
                  return [lng, lat]
                }
              }
              
              // Format: "[-83.0458,42.3314]" or "{lng: -83.0458, lat: 42.3314}"
              try {
                const coords = JSON.parse(coordString)
                if (Array.isArray(coords) && coords.length === 2) {
                  return [parseFloat(coords[0]), parseFloat(coords[1])]
                }
                if (coords.lng !== undefined && coords.lat !== undefined) {
                  return [parseFloat(coords.lng), parseFloat(coords.lat)]
                }
              } catch (e) {
                // Not JSON format, continue to other parsing methods
              }
              
              // Format: "-83.0458,42.3314" - Simple comma-separated
              if (coordString.includes(',')) {
                const [lng, lat] = coordString.split(',').map(coord => parseFloat(coord.trim()))
                if (!isNaN(lng) && !isNaN(lat)) {
                  return [lng, lat]
                }
              }
            }
            
            // Handle array format
            if (Array.isArray(coordString) && coordString.length === 2) {
              return [parseFloat(coordString[0]), parseFloat(coordString[1])]
            }
            
            // Handle object format
            if (coordString.lng !== undefined && coordString.lat !== undefined) {
              return [parseFloat(coordString.lng), parseFloat(coordString.lat)]
            }
            
            return null
          } catch (e) {
            console.warn('Error parsing coordinates:', e, coordString)
            return null
          }
        }

        const originCoords = parseCoords(ride.origin_coordinates)
        const destCoords = parseCoords(ride.destination_coordinates)

        if (!originCoords || !destCoords) {
          console.warn(`Invalid coordinates for ride ${ride.id}:`, {
            origin: ride.origin_coordinates,
            destination: ride.destination_coordinates
          })
          return
        }

        // Validate coordinate ranges
        const [originLng, originLat] = originCoords
        const [destLng, destLat] = destCoords
        
        if (originLng < -180 || originLng > 180 || originLat < -90 || originLat > 90 ||
            destLng < -180 || destLng > 180 || destLat < -90 || destLat > 90) {
          console.warn(`Invalid coordinate ranges for ride ${ride.id}`)
          return
        }

        // Create origin marker (green)
        const originMarker = new mapboxgl.Marker({ 
          color: '#10B981',
          scale: 0.8
        })
          .setLngLat(originCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-3">
                  <h3 class="font-semibold text-green-700 mb-2">🟢 Pickup Location</h3>
                  <p class="text-sm font-medium mb-1">${ride.origin}</p>
                  <p class="text-xs text-gray-600 mb-2">
                    ${ride.departure_time ? new Date(ride.departure_time).toLocaleDateString() : 
                      ride.preferred_departure_time ? new Date(ride.preferred_departure_time).toLocaleDateString() : 
                      'Date TBD'}
                  </p>
                  <p class="text-xs text-blue-600 font-medium">
                    📏 Distance: ~${calculateMapDistance(originCoords, destCoords)} miles
                  </p>
                  <p class="text-xs text-blue-600">${ride.available_seats || ride.passenger_count || 1} ${ride.available_seats ? 'seats available' : 'passenger(s)'}</p>
                </div>
              `)
          )

        // Create destination marker (red)
        const destMarker = new mapboxgl.Marker({ 
          color: '#EF4444',
          scale: 0.8
        })
          .setLngLat(destCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-3">
                  <h3 class="font-semibold text-red-700 mb-2">🎯 Destination</h3>
                  <p class="text-sm font-medium mb-1">${ride.destination}</p>
                  <p class="text-xs text-gray-600 mb-2">
                    ${ride.driver?.full_name || ride.passenger?.full_name || ride.requester?.full_name || 'Unknown'}
                  </p>
                  <p class="text-xs text-red-600 font-medium">
                    📏 Distance: ~${calculateMapDistance(originCoords, destCoords)} miles
                  </p>
                  ${ride.notes ? `<p class="text-xs text-gray-500 mt-1 italic">"${ride.notes}"</p>` : ''}
                </div>
              `)
          )

        // Add markers to map
        originMarker.addTo(map.current)
        destMarker.addTo(map.current)

        markers.current.push(originMarker, destMarker)
        validMarkers += 2
        // Draw route line between origin and destination
        if (map.current.isStyleLoaded()) {
  drawRoute(originCoords, destCoords, `route-${ride.id}`)
} else {
  map.current.once('styledata', () => {
    drawRoute(originCoords, destCoords, `route-${ride.id}`)
  })
}
        // Add distance label between markers
        if (validMarkers >= 2) {
          const midpoint = [
            (originCoords[0] + destCoords[0]) / 2,
            (originCoords[1] + destCoords[1]) / 2
          ]
          
          const distance = calculateMapDistance(originCoords, destCoords)
          
          // Create distance label
          const distanceEl = document.createElement('div')
          distanceEl.className = 'distance-label'
          distanceEl.innerHTML = `
            <div style="
              background: rgba(255, 255, 255, 0.95); 
              padding: 4px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: 600; 
              color: #4F46E5;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              border: 1px solid #E5E7EB;
            ">
              📏 ${distance} mi
            </div>
          `
          
          const distanceMarker = new mapboxgl.Marker({
            element: distanceEl,
            anchor: 'center'
          })
            .setLngLat(midpoint)
            .addTo(map.current)
            
          markers.current.push(distanceMarker)
        }

      } catch (error) {
        console.error(`❌ Error adding markers for ride ${ride.id}:`, error)
      }
    })

    // Fit bounds if we have valid markers
    if (validMarkers > 0 && markers.current.length > 0) {
      try {
        const bounds = new mapboxgl.LngLatBounds()
        markers.current.forEach(marker => {
          bounds.extend(marker.getLngLat())
        })
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        })
      } catch (error) {
        console.error('❌ Error fitting bounds:', error)
      }
    }

  }, [rides, mapLoaded, mapError])

  // ✅ ADD: Distance calculation function for map popups
  

  // Show error state with helpful troubleshooting
  if (mapError) {
    return (
      <div 
        className="w-full rounded-lg shadow-lg bg-gray-100 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Temporarily Unavailable</h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          
          <button
            onClick={() => setMapError(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm w-full"
          >
            ✅ Continue Without Map
          </button>
        </div>
      </div>
    )
  }
  // ...existing code...

// Draw a route (polyline) between two points
const drawRoute = (originCoords, destCoords, routeId) => {
  if (!map.current || !originCoords || !destCoords) return

  // Remove existing route with same id if present
  if (map.current.getSource(routeId)) {
    try {
      map.current.removeLayer(routeId)
      map.current.removeSource(routeId)
    } catch (e) {
      // ignore
    }
  }

  map.current.addSource(routeId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [originCoords, destCoords]
      }
    }
  })

  map.current.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3B82F6',
      'line-width': 4,
      'line-opacity': 0.7
    }
  })
}

  return (
    <div className="relative w-full h-full"> {/* 🔧 CHANGE: Use h-full instead of setting explicit height */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg shadow-lg" // 🔧 CHANGE: Use h-full
        id={`map-container-${mapId}`}
      />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {mapLoaded && !mapError && rides.length > 0 && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md text-sm z-10">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Pickup Location</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Destination</span>
          </div>
          <div className="text-xs text-gray-600 border-t pt-2">
            📏 Click markers to see distance
          </div>
        </div>
      )}
    </div>
  )
}

export default Map