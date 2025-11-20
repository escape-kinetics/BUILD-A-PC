import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Protects routes that require an *admin* user
const AdminRoute = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
      // If they are logged in but not admin, send to homepage
      return <Navigate to="/" replace />;
  }

  // Render the child admin route
  return <Outlet />;
};

export default AdminRoute;
