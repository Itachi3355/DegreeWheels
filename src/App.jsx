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
import RideRequestForm from './components/rides/RideRequestForm'
import RideOffer from './components/rides/RideOffer'
import ContactUs from './components/pages/ContactUs'
// Simple pages for missing components
const TermsPage = () => (
  <div className="min-h-screen bg-gray-50 pt-20 px-4">
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <p className="text-gray-600">Terms of service content will be added here.</p>
    </div>
  </div>
)

const PrivacyPage = () => (
  <div className="min-h-screen bg-gray-50 pt-20 px-4">
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-600">Privacy policy content will be added here.</p>
    </div>
  </div>
)

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
                
               
                <Route path="/contact" element={<ContactUs />} />
                
                <Route 
                  path="/offer-ride" 
                  element={
                    <ProtectedRoute>
                      <RideOffer />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/request-ride" 
                  element={
                    <ProtectedRoute>
                      <RideRequestForm />
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
                
                {/* Rides routes */}
                <Route 
                  path="/rides/create" 
                  element={
                    <ProtectedRoute>
                      <CreateRideForm />
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
                
                {/* Simplified Chat Routes */}
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
                
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
