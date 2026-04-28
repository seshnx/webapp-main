import React, { lazy, Suspense, useEffect, ComponentType, LazyExoticComponent } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import type { UserData, AccountType } from '@/types';

// =====================================================
// TYPES
// =====================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  loading: boolean;
}

interface RedirectProps {
  to: string;
  replace?: boolean;
}

interface AppRoutesProps {
  user: {
    id?: string;
    [key: string]: any;
  };
  userData: UserData | null;
  loading: boolean;
  darkMode: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
  onUserDataUpdate?: (data: UserData | Partial<UserData>) => void;
}

// =====================================================
// RETRY LAZY LOAD UTILITIES
// =====================================================

/**
 * Retry wrapper for lazy loading to handle network errors and failed imports
 * @param importFn - Function that returns a dynamic import promise
 * @param retries - Number of retry attempts (default: 3)
 * @param delay - Base delay between retries in ms (default: 100)
 * @returns A lazy-loaded component with retry logic
 */
const retryLazyLoad = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  delay = 100
): LazyExoticComponent<T> => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (attemptNumber: number): void => {
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
            resolve(promise as any);
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

// =====================================================
// LAZY LOADED COMPONENTS
// =====================================================

import {
  Dashboard,
  StudioManager,
  ProfileManager,
  SettingsTab,
  ClientPortal,
  PublicLegalPage,
  StudioKiosk,
  StudioPublicProfile,
  StudioNotFound,
  PlansPage,
  StudioPricingPage
} from './lazyComponents';

// Local lazy components not yet in central registry
const DebugReport = retryLazyLoad(() => import('../components/DebugReport'));

// =====================================================
// COMPONENTS
// =====================================================

/**
 * Protected Route Wrapper
 *
 * Protects routes and redirects to login if user is not authenticated
 * Uses Clerk auth instead of Supabase
 */
function ProtectedRoute({ children, loading }: ProtectedRouteProps): React.ReactNode {
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

  return <>{children}</>;
}

/**
 * Redirect Component
 *
 * Uses useNavigate hook instead of Navigate component to avoid initialization issues
 */
function Redirect({ to, replace = true }: RedirectProps): null {
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
export default function AppRoutes({
  user,
  userData,
  loading,
  darkMode,
  toggleTheme,
  handleLogout,
  onUserDataUpdate
}: AppRoutesProps): JSX.Element {
  const { userId } = useAuth();

  // Convex mutation for profile updates
  const updateProfile = useMutation(api.users.updateProfile);

  return (
    <Routes>
      {/* ACTIVE MODULES: Feed, Bookings, Profile, Settings */}
      <Route path="/feed" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/feed/discover" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/my-bookings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/calendar" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/find-talent" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/find-bookings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/bookings/broadcast-list" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />

      {/* Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <Dashboard
                user={user}
                userData={userData}
                subProfiles={{}}
                setActiveTab={() => {}}
                bookingCount={0}
                tokenBalance={0}
              />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Studio Manager Route */}
      <Route
        path="/studio-manager"
        element={
          <ProtectedRoute loading={loading}>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <StudioManager
                user={user}
                userData={userData}
              />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* CORE MODULE ROUTES - Handled by MainLayout */}
      <Route path="/messages" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/marketplace/:tab" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/tech" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/tech/:tab" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center/:tab" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/business-center/tech/:subtab" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      {/* Public Legal Page - Accessible without authentication */}
      <Route
        path="/legal"
        element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
            <PublicLegalPage />
          </Suspense>
        }
      />

      {/* Public Kiosk Route - Accessible without authentication */}
      <Route
        path="/kiosk/:studioId"
        element={
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
            <StudioKiosk />
          </Suspense>
        }
      />

      {/* LABEL & STUDIO OPS ROUTES */}
      <Route path="/studio-ops" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/dashboard" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/contracts" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/roster" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/releases" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/royalties" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels/campaigns" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />

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
              onUpdate={async (newData: UserData | Partial<UserData>) => {
                // Handle both settings updates (object) and userData updates (UserData object)
                if (onUserDataUpdate && newData) {
                  // If it's a settings object (has settings property), save to Convex
                  if ('settings' in newData && newData.settings && userId) {
                    try {
                      await updateProfile({
                        clerkId: userId,
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
              onRoleSwitch={async (newRole: AccountType) => {
                // Role switch - update active role in Convex
                if (userId) {
                  try {
                    await updateProfile({
                      clerkId: userId,
                      activeRole: newRole,
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

      {/* Redirect root to feed (active module) */}
      <Route path="/" element={<Navigate to="/feed" replace />} />

      {/* Redirect disabled routes to active modules */}
      <Route path="/home" element={<Navigate to="/feed" replace />} />
      <Route path="/social" element={<Navigate to="/feed" replace />} />
      {/* EDU ROUTES - Handled by MainLayout */}
      <Route path="/edu-student" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-intern" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-overview" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-admin" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-courses" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-roster" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-cohorts" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-announcements" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-learning-paths" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-resources" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-staff" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-roles" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-partners" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-audit" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-hours" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-evaluations" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-settings" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/edu-course-builder" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/studio-ops" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />
      <Route path="/labels" element={<ProtectedRoute loading={loading}><div /></ProtectedRoute>} />

      {/* Public Studio Profile - NO ProtectedRoute wrapper */}
      <Route path="/s/:slug" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
          <StudioPublicProfile />
        </Suspense>
      } />

      {/* Studio Not Found - for invalid slugs */}
      <Route path="/studio-not-found" element={
        <StudioNotFound />
      } />

      {/* Plans Page - Role-aware paywall for org subscriptions */}
      <Route path="/plans" element={
        <ProtectedRoute loading={loading}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
            <PlansPage />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Studio Pricing - Clerk PricingTable for plan upgrades */}
      <Route path="/studio-pricing" element={
        <ProtectedRoute loading={loading}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
            <StudioPricingPage />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Fallback - redirect to feed */}
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}
