// src/components/common/LocationInput.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

const LocationInput = ({ 
  placeholder = "Enter location...", 
  onLocationSelect, 
  initialValue = "",
  className = ""
}) => {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const abortControllerRef = useRef(null) // ✅ FIX: Add abort controller

  // ✅ FIX: Update query when initialValue changes without causing re-renders
  useEffect(() => {
    if (initialValue !== query) {
      setQuery(initialValue)
    }
  }, [initialValue])

  // ✅ FIX: Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // ✅ FIX: Memoized fetch function to prevent duplicate calls
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (!MAPBOX_TOKEN) {
      console.error('❌ Mapbox token not found - Please check your .env file')
      return
    }

    // ✅ FIX: Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setIsLoading(true)
      console.log('🔍 Searching for:', searchQuery)
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=US&` +
        `types=place,locality,neighborhood,address,poi&` +
        `limit=5`,
        { signal: abortControllerRef.current.signal } // ✅ FIX: Add abort signal
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      const formattedSuggestions = data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name,
        coordinates: feature.center
      }))

      console.log('📍 Formatted suggestions:', formattedSuggestions)
      setSuggestions(formattedSuggestions)
      setShowSuggestions(true)
      setSelectedIndex(-1)

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🔄 Request aborted (this is normal)')
        return
      }
      console.error('❌ Error fetching location suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, [MAPBOX_TOKEN])

  // ✅ FIX: Debounced search with proper cleanup
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, fetchSuggestions])

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      if (onLocationSelect) {
        onLocationSelect(null)
      }
    }
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    console.log('📍 Selected location:', suggestion)
    setQuery(suggestion.name)
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    if (onLocationSelect) {
      onLocationSelect(suggestion)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
      default:
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPinIcon className="h-6 w-6 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${className}`}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* ✅ FIX: Better suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-4 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="truncate font-medium">{suggestion.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Debug Info - Only in development */}
      {process.env.NODE_ENV === 'development' && !MAPBOX_TOKEN && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ Mapbox token missing. Add REACT_APP_MAPBOX_ACCESS_TOKEN to your .env file
        </div>
      )}
    </div>
  )
}

export default LocationInput