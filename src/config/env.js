// File: src/config/env.js
// Create this file to validate environment variables

const requiredEnvVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
  'REACT_APP_MAPBOX_ACCESS_TOKEN'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`)
  })
  console.error('Please check your .env file')
}

export const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY
  },
  mapbox: {
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  },
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Campus RideShare',
    version: process.env.REACT_APP_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development'
  }
}

console.log('🔧 Environment loaded:', {
  supabaseUrl: config.supabase.url ? '✅' : '❌',
  supabaseKey: config.supabase.anonKey ? '✅' : '❌',
  mapboxToken: config.mapbox.accessToken ? '✅' : '❌',
  environment: config.app.environment
})