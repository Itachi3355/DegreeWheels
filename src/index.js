console.log('🚀 INDEX.JS LOADED - React App Starting')
console.log('🚀 Date:', new Date().toISOString())
console.log('🚀 Environment Variables Check:', {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL ? 'Present' : 'Missing',
  supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
  mapboxToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? 'Present' : 'Missing'
})

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// ✅ SUPPRESS DEPRECATION WARNINGS
const originalWarn = console.warn
const originalError = console.error

console.warn = (...args) => {
  const message = args[0]?.toString?.() || ''
  
  // Suppress specific deprecation warnings
  if (
    message.includes('-ms-high-contrast') ||
    message.includes('deprecated') ||
    message.includes('Deprecation')
  ) {
    return // Don't log these
  }
  
  originalWarn(...args)
}

console.error = (...args) => {
  const message = args[0]?.toString?.() || ''
  
  // Suppress CSS deprecation errors
  if (
    message.includes('-ms-high-contrast') ||
    message.includes('deprecated')
  ) {
    return // Don't log these
  }
  
  originalError(...args)
}

console.log('🔧 About to render App in StrictMode')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {(() => {
      console.log('🔧 Inside StrictMode, rendering App')
      return <App />
    })()}
  </React.StrictMode>
)

console.log('🔧 App render initiated')