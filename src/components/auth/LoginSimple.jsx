import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const LoginSimple = () => {
  const { user, loading, initialized, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  console.log('LoginSimple - user:', user?.email, 'loading:', loading, 'initialized:', initialized)
  
  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      console.log('Starting sign out process...')
      const result = await signOut()
      if (result?.error) {
        console.error('Sign out error:', result.error)
        alert('Sign out failed: ' + result.error.message)
        setIsSigningOut(false)
      } else {
        console.log('Sign out successful')
        // Don't reset isSigningOut here - let the user state change handle it
      }
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Sign out failed: ' + error.message)
      setIsSigningOut(false)
    }
  }
  
  // Reset signing out state when user becomes null
  useEffect(() => {
    if (!user && isSigningOut) {
      console.log('Sign out completed, resetting state')
      setIsSigningOut(false)
    }
  }, [user, isSigningOut])
  
  // Show loading state while auth is being initialized
  if (!initialized || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>
            {isSigningOut ? 'Signing out...' : 'Initializing...'}
          </p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '15px', lineHeight: '1.4' }}>
            <p>User: {user?.email || 'None'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Initialized: {initialized ? 'Yes' : 'No'}</p>
            <p>Signing Out: {isSigningOut ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
          Authentication Test
        </h1>
        
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>
          <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Initialized:</strong> {initialized ? 'Yes' : 'No'}</p>
          <p><strong>Signing Out:</strong> {isSigningOut ? 'Yes' : 'No'}</p>
        </div>
        
        {user ? (
          <div>
            <div style={{ padding: '15px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', marginBottom: '20px' }}>
              <p style={{ color: '#166534', margin: 0, fontWeight: '600' }}>
                ✅ Logged in as: <strong>{user.email}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Go to Dashboard
              </button>
              
              <button 
                onClick={handleSignOut}
                disabled={isSigningOut}
                style={{
                  backgroundColor: isSigningOut ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSigningOut ? 'not-allowed' : 'pointer',
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '14px',
                  opacity: isSigningOut ? 0.7 : 1
                }}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ padding: '15px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', marginBottom: '20px' }}>
              <p style={{ color: '#166534', margin: 0, fontWeight: '600' }}>
                ✅ Successfully signed out!
              </p>
            </div>
            
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              The authentication system is working correctly. You can now test the login flow.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Back to Home (Test Full Flow)
              </button>
              
              <button 
                onClick={() => window.location.href = '/login'}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Go to Login Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginSimple