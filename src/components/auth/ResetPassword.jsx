import React from 'react'

const ResetPassword = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <p className="text-gray-600">Password reset functionality coming soon.</p>
    </div>
  </div>
)

export default ResetPassword

const resetPassword = async (email) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://degreewheels.com/reset-password'
  })
}