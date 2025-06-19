import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// 🔧 Suppress CSS deprecation warnings
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0]?.includes?.('-ms-high-contrast') || 
      args[0]?.includes?.('deprecated')) {
    return // Suppress these warnings
  }
  originalWarn(...args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)