import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import DebugReport from '../components/DebugReport';
import ProfileManager from '../components/ProfileManager';
import SettingsTab from '../components/SettingsTab';
import { supabase } from '../config/supabase';
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
 * AppRoutes - Full routing with all modules
 * MainLayout handles most routes, but Settings and Debug Report use direct routes
 */
export default function AppRoutes({ user, userData, loading, darkMode, toggleTheme, handleLogout }) {
  return (
    <Routes>
      {/* MainLayout handles these routes internally via activeTab */}
      {/* Dashboard and all main modules are handled by MainLayout */}
      <Route path="/" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/tech" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/legal" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-student" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-intern" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-overview" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-admin" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/studio-ops" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      
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
      
      {/* Settings Route - Uses direct route */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute user={user} loading={loading}>
            <SettingsTab 
              user={user} 
              userData={userData}
              onUpdate={async (newSettings) => {
                // Save settings to database
                if (user?.id && supabase) {
                  try {
                    const { error } = await supabase
                      .from('profiles')
                      .update({ 
                        settings: newSettings, 
                        updated_at: new Date().toISOString() 
                      })
                      .eq('id', user.id);
                    
                    if (error) {
                      console.error('Settings save failed:', error);
                    }
                  } catch (err) {
                    console.error('Settings save error:', err);
                  }
                }
              }}
              onRoleSwitch={async (newRole) => {
                // Role switch - update active role in database
                if (user?.id && supabase) {
                  try {
                    await supabase
                      .from('profiles')
                      .update({ 
                        active_role: newRole, 
                        updated_at: new Date().toISOString() 
                      })
                      .eq('id', user.id);
                    console.log('Role switched to:', newRole);
                  } catch (err) {
                    console.error('Role switch failed:', err);
                  }
                }
              }}
            />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect dashboard aliases */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/social" element={<Navigate to="/feed" replace />} />
      <Route path="/chat" element={<Navigate to="/messages" replace />} />
      <Route path="/billing" element={<Navigate to="/payments" replace />} />
      
      {/* Fallback - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

