import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { updateProfile } from '../config/neonQueries';

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
const ClientPortal = retryLazyLoad(() => import('../components/studio/portal/ClientPortal'));

/**
 * Protected Route Wrapper
 *
 * Protects routes and redirects to login if user is not authenticated
 * Uses Clerk auth instead of Supabase
 */
function ProtectedRoute({ children, loading }) {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated - use useEffect to navigate to avoid initialization issues
  // NOTE: This must be called before any conditional returns to satisfy React's rules of hooks
  useEffect(() => {
    if (isLoaded && !isSignedIn && !loading) {
      navigate('/login', { replace: true });
    }
  }, [isLoaded, isSignedIn, loading, navigate]);

  // Show loading while checking auth
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!isSignedIn) {
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
 * MainLayout handles these routes internally via activeTab with URL-based navigation
 * Now uses Clerk authentication instead of Supabase
 * Note: / is now a redirect to /dashboard for better breadcrumb navigation
 */
export default function AppRoutes({ user, userData, loading, darkMode, toggleTheme, handleLogout, onUserDataUpdate }) {
  const { userId } = useAuth();

  return (
    <Routes>
      {/* MainLayout handles these routes internally via activeTab with URL sync */}
      {/* Dashboard and all main modules are handled by MainLayout */}
      {/* Support nested routes for better URL navigation */}
      <Route path="/dashboard" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/feed/discover" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/my-bookings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/calendar" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/find-talent" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/find-bookings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/broadcast-list" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/tech" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center/:tab" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center/tech/:subtab" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/legal" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-student" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-intern" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-overview" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-admin" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/studio-ops" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/dashboard" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/contracts" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />

      {/* Debug Report Route - Test login destination */}
      <Route
        path="/debug-report"
        element={
          <ProtectedRoute loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <DebugReport
                user={user}
                userData={userData}
              />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Settings Route - Uses direct route with Neon queries */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <SettingsTab
              user={user}
              userData={userData}
              onUpdate={async (newData) => {
                // Handle both settings updates (object) and userData updates (UserData object)
                if (onUserDataUpdate && newData) {
                  // If it's a settings object (has settings property), save to DB
                  if (newData.settings && userId) {
                    try {
                      await updateProfile(userId, {
                        settings: newData.settings,
                      });
                      console.log('Settings saved successfully');
                    } catch (err) {
                      console.error('Settings save failed:', err);
                    }
                  } else {
                    // It's a full userData update (from role changes)
                    onUserDataUpdate(newData);
                  }
                }
              }}
              onRoleSwitch={async (newRole) => {
                // Role switch - update active role in database using Neon
                if (userId) {
                  try {
                    await updateProfile(userId, {
                      active_role: newRole,
                    });
                    console.log('Role switched to:', newRole);
                    // Reload page to reflect changes
                    window.location.reload();
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

      {/* Client Portal Route - Self-service client portal */}
      <Route
        path="/studio/:studioId/portal"
        element={
          <ProtectedRoute loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <ClientPortal
                user={user}
                userData={userData}
              />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Redirect dashboard aliases */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="/social" element={<Navigate to="/feed" replace />} />
      <Route path="/chat" element={<Navigate to="/messages" replace />} />
      <Route path="/billing" element={<Navigate to="/payments" replace />} />

      {/* Fallback - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
