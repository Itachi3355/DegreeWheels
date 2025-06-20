// File: src/components/routes/ProtectedRoute.jsx
// Make sure it's properly passing children:

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute - user:', user?.email, 'loading:', loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 🔧 IMPORTANT: Make sure children are being returned!
  return <>{children}</>
}