import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/layout/Header'
import ErrorBoundary from './components/common/ErrorBoundary'

// Direct imports from components that actually exist
import Landing from './components/pages/Landing'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard/Dashboard'
import RideSearch from './components/rides/RideSearch'
import CreateRideForm from './components/rides/CreateRideForm'
import RideDetails from './components/rides/RideDetails'
import ProfilePage from './components/pages/ProfilePage'
import SettingsPage from './components/pages/SettingsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoutePlanner from './components/routes/RoutePlanner'
import BookingsDashboard from './components/bookings/BookingsDashboard'
import MyRides from './components/rides/MyRides'

// Simple wrapper for OfferRide page
const OfferRidePage = () => <CreateRideForm />

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Header />
            
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <ProtectedRoute>
                      <RideSearch />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/offer-ride" 
                  element={
                    <ProtectedRoute>
                      <OfferRidePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ride/:id" 
                  element={
                    <ProtectedRoute>
                      <RideDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/route-planner" 
                  element={
                    <ProtectedRoute>
                      <RoutePlanner />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bookings" 
                  element={
                    <ProtectedRoute>
                      <BookingsDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-rides" 
                  element={
                    <ProtectedRoute>
                      <MyRides />
                    </ProtectedRoute>
                  } 
                />
                {/* ✅ SIMPLIFIED CHAT ROUTES - Create simple placeholder */}
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat Coming Soon</h1>
                          <p className="text-gray-600">Chat functionality will be available soon.</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:roomId" 
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat Room Coming Soon</h1>
                          <p className="text-gray-600">Chat rooms will be available soon.</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/rides" 
                  element={
                    <ProtectedRoute>
                      <RideSearch />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
