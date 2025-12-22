import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Loader2 } from 'lucide-react';

// Retry wrapper for lazy loading to handle network errors and failed imports
const retryLazyLoad = (importFn, retries = 3, delay = 100) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (attemptNumber) => {
        // Wrap in try-catch to handle synchronous errors
        try {
          const promise = importFn();
          // If it's already a promise, handle it
          if (promise && typeof promise.then === 'function') {
            promise
              .then((module) => {
                // Ensure we get the default export
                resolve(module.default ? module : { default: module });
              })
              .catch((error) => {
                if (attemptNumber < retries) {
                  console.warn(`Lazy load failed, retrying... (${attemptNumber + 1}/${retries})`, error);
                  setTimeout(() => attempt(attemptNumber + 1), delay * (attemptNumber + 1));
                } else {
                  console.error('Lazy load failed after retries:', error);
                  reject(error);
                }
              });
          } else {
            resolve(promise);
          }
        } catch (error) {
          // Handle synchronous errors (like circular dependencies)
          if (attemptNumber < retries) {
            console.warn(`Lazy load sync error, retrying... (${attemptNumber + 1}/${retries})`, error);
            setTimeout(() => attempt(attemptNumber + 1), delay * (attemptNumber + 1));
          } else {
            console.error('Lazy load failed after retries (sync error):', error);
            reject(error);
          }
        }
      };
      attempt(0);
    });
  });
};

// Lazy load components to avoid circular dependencies with retry mechanism
// Note: Dashboard is handled by MainLayout, not needed here
const DebugReport = retryLazyLoad(() => import('../components/DebugReport'));
const ProfileManager = retryLazyLoad(() => import('../components/ProfileManager'));
const SettingsTab = retryLazyLoad(() => import('../components/SettingsTab'));

/**
 * Protected Route Wrapper
 * 
 * Protects routes and redirects to login if user is not authenticated
 * Uses useNavigate hook instead of Navigate component to avoid initialization issues
 */
function ProtectedRoute({ children, user, loading }) {
  const navigate = useNavigate();

  // Check if user is authenticated - use useEffect to navigate to avoid initialization issues
  // NOTE: This must be called before any conditional returns to satisfy React's rules of hooks
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  return children;
}

/**
 * Redirect Component
 * 
 * Uses useNavigate hook instead of Navigate component to avoid initialization issues
 */
function Redirect({ to, replace = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname !== to) {
      navigate(to, { replace });
    }
  }, [to, replace, navigate, location.pathname]);
  
  return null;
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
      {/* Support nested routes for better URL navigation */}
      <Route path="/" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/feed/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/messages/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/marketplace/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/tech/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/payments/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/profile/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/legal" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-student/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-intern/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-overview/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-admin/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      <Route path="/studio-ops/*" element={<ProtectedRoute user={user} loading={loading}><div /></ProtectedRoute>} />
      
      {/* Debug Report Route - Test login destination */}
      <Route 
        path="/debug-report" 
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <DebugReport 
                user={user} 
                userData={userData}
              />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Settings Route - Uses direct route */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
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
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect dashboard aliases */}
      <Route path="/dashboard" element={<Redirect to="/" />} />
      <Route path="/home" element={<Redirect to="/" />} />
      <Route path="/social" element={<Redirect to="/feed" />} />
      <Route path="/chat" element={<Redirect to="/messages" />} />
      <Route path="/billing" element={<Redirect to="/payments" />} />
      
      {/* Fallback - redirect to dashboard */}
      <Route path="*" element={<Redirect to="/" />} />
    </Routes>
  );
}

