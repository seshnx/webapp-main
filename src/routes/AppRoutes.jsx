import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import DebugReport from '../components/DebugReport';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route Wrapper
 * 
 * Protects routes and redirects to login if user is not authenticated
 */
function ProtectedRoute({ children, user, loading }) {
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * AppRoutes - Simplified routing with only Login and Dashboard
 */
export default function AppRoutes({ user, userData, loading, darkMode, toggleTheme, handleLogout }) {
  return (
    <Routes>
      {/* Dashboard Route */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Dashboard 
              user={user} 
              userData={userData}
            />
          </ProtectedRoute>
        } 
      />
      
      {/* Debug Report Route - Test login destination */}
      <Route 
        path="/debug-report" 
        element={
          <ProtectedRoute user={user} loading={loading}>
            <DebugReport 
              user={user} 
              userData={userData}
            />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect dashboard aliases */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      
      {/* Test login route - handled in App.jsx, but included here for clarity */}
      {/* Fallback - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

