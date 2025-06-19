import { useState, useEffect } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// This hook is a wrapper around the AuthContext
export const useAuth = () => {
  return useAuthContext();
};

// Export as default as well for compatibility
export default useAuth;