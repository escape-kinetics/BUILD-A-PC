import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './theme.css';

// Page Components
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BuilderPage from './pages/BuilderPage';
import SavedBuildsPage from './pages/SavedBuildsPage';
import AdminDashboard from './pages/AdminDashboard';

// Helper Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/builder" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (Must be logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/builder/:build_id" element={<BuilderPage />} /> {/* For editing */}
            <Route path="/builds" element={<SavedBuildsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          {/* 404 Not Found */}
          <Route path="*" element={<h2>404: Page Not Found</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
