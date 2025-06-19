// File: src/components/common/PerformanceMonitor.jsx
// Add this to see what's causing re-renders:

import React, { useEffect, useRef } from 'react'

const PerformanceMonitor = ({ name, ...props }) => {
  const renderCount = useRef(0)
  const lastProps = useRef()

  useEffect(() => {
    renderCount.current += 1
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${name} rendered ${renderCount.current} times`)
      
      if (lastProps.current) {
        const changedProps = Object.keys(props).filter(key => 
          lastProps.current[key] !== props[key]
        )
        if (changedProps.length > 0) {
          console.log(`🔄 ${name} props changed:`, changedProps)
        }
      }
    }
    
    lastProps.current = props
  })

  return null
}

// Use it like this in components that re-render too much:
// <PerformanceMonitor name="RideSearch" rides={rides} requests={requests} />