import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Protects routes that require *any* logged-in user
const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Redirect to login page, but save the location they were trying to go
    return <Navigate to="/login" replace />;
  }

  // Render the child route
  return <Outlet />;
};

export default ProtectedRoute;
