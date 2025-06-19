// src/components/common/LocationInput.jsx
import React, { useState, useEffect, useRef, memo } from 'react'

const LocationInput = memo(({ 
  placeholder = "Enter location", 
  onLocationSelect, 
  initialValue = "",
  className = ""
}) => {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

  // Only log when actually necessary
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 LocationInput state:', { 
        query: query.substring(0, 20) + (query.length > 20 ? '...' : ''), 
        suggestionsCount: suggestions.length, 
        showSuggestions, 
        loading 
      })
    }
  }, [query, suggestions.length, showSuggestions, loading])

  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    if (!mapboxToken) {
      console.error('❌ Mapbox token not available')
      return
    }

    try {
      setLoading(true)
      console.log('🔍 Searching for:', searchQuery)
      
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&country=US&types=place,locality,neighborhood,address&limit=5`
      
      console.log('🌐 API URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      console.log('📍 API Response:', data)
      
      if (data.features) {
        setSuggestions(data.features)
        setShowSuggestions(true)
        console.log(`✅ Found ${data.features.length} suggestions`)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
        console.log('❌ No suggestions in response')
      }
    } catch (error) {
      console.error('❌ Error searching locations:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchLocations(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleInputChange = (e) => {
    const value = e.target.value
    console.log('📝 Input changed:', value)
    setQuery(value)
    
    if (!value) {
      setSuggestions([])
      setShowSuggestions(false)
      if (onLocationSelect) {
        onLocationSelect(null)
      }
    }
  }

  const handleSuggestionClick = (suggestion) => {
    console.log('🎯 Suggestion clicked:', suggestion)
    const location = {
      name: suggestion.place_name,
      coordinates: suggestion.center,
      address: suggestion.place_name
    }
    
    setQuery(suggestion.place_name)
    setSuggestions([])
    setShowSuggestions(false)
    
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  const handleBlur = (e) => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 200)
  }

  // Show error if no token
  if (!mapboxToken) {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50"
        />
        <p className="text-red-600 text-xs mt-1">
          Mapbox token missing. Add REACT_APP_MAPBOX_ACCESS_TOKEN to .env
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          console.log('🔍 Input focused')
          if (query && suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        onBlur={handleBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoComplete="off"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur
            >
              <div className="font-medium text-gray-900">
                {suggestion.text}
              </div>
              <div className="text-sm text-gray-500">
                {suggestion.place_name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

LocationInput.displayName = 'LocationInput'

export default LocationInput