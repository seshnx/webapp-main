import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { useUserSync } from './hooks/useUserSync';
import { useStudioSubdomain } from './hooks/useStudioSubdomain';
import { LanguageProvider } from './contexts/LanguageContext';
import { UploadManagerProvider } from './contexts/UploadManagerContext';
import { queryClient } from './config/queryClient';

const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));
const SubdomainRouter = lazy(() => import('./components/SubdomainRouter'));
const SharedPostModal = lazy(() => import('./components/social/SharedPostModal'));

export default function App(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  // 1. Sync Logic (Returns data if it exists, otherwise undefined/null)
  const { userData } = useUserSync();
  // 2. Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Extract shared post ID from URL (/post/:id or /p/:id)
  const [dismissedSharedPostId, setDismissedSharedPostId] = useState<string | null>(null);

  useEffect(() => {
    setDismissedSharedPostId(null);
  }, [location.pathname]);

  const sharedPostId = useMemo(() => {
    const match = location.pathname.match(/^\/(?:post|p)\/([^/?#]+)/);
    const pid = match ? match[1] : null;
    if (!pid || pid === dismissedSharedPostId) return null;
    return pid;
  }, [location.pathname, dismissedSharedPostId]);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = useCallback(async () => {
    await clerk?.signOut();
    navigate('/login', { replace: true });
  }, [clerk, navigate]);

  // ── Subdomain bypass ────────────────────────────────────
  // Studio subdomains render their own UI without requiring auth.
  const { isSubdomain, slug } = useStudioSubdomain();
  if (isSubdomain && slug) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
              <Loader2 className="animate-spin text-brand-blue" size={48} />
            </div>
          }>
            <SubdomainRouter slug={slug} />
          </Suspense>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  // =========================================================
  // CRITICAL LOADING LOGIC:
  // We ONLY block the screen if Clerk is initializing.
  // =========================================================
  if (!clerkLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  const isAuthenticated = !!isSignedIn;
  const isOnLoginPage = location.pathname === '/login';
  const isTestLoginPage = location.pathname === '/test-login';

  // ── Public Routes Bypass ────────────────────────────────
  // Public studio profiles (/s/:slug), kiosk (/kiosk/:id), legal (/legal), and not-found pages
  // do not require authentication and must render AppRoutes directly.
  const isPublicRoute =
    location.pathname.startsWith('/s/') ||
    location.pathname.startsWith('/kiosk/') ||
    location.pathname === '/legal' ||
    location.pathname === '/studio-not-found';

  if (isPublicRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider userData={userData}>
          <UploadManagerProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
              <Toaster position="bottom-right" />
              <Suspense fallback={
                <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
                  <Loader2 className="animate-spin text-brand-blue" size={48} />
                </div>
              }>
                <AppRoutes
                  user={user}
                  userData={userData as any}
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                  handleLogout={handleLogout}
                  loading={false}
                />
              </Suspense>
            </div>
          </UploadManagerProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  // Check if authenticated user still needs onboarding (no roles, no zip, or metadata onboarding_completed !== true)
  const isProfileComplete = Boolean(
    user?.unsafeMetadata?.onboarding_completed === true ||
    (userData && userData.zipCode && userData.accountTypes && userData.accountTypes.length > 0)
  );

  const needsOnboarding = isAuthenticated && !isProfileComplete;

  // 3. Auth Guard: If not signed in, show AuthWizard (and SharedPostModal on top if viewing a shared post)
  if (!isAuthenticated && (!isOnLoginPage && !isTestLoginPage)) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          user={user}
          onSuccess={() => {
            const pending = sessionStorage.getItem('seshnx_pending_post_modal') || sharedPostId;
            if (pending) {
              sessionStorage.setItem('seshnx_pending_post_modal', pending);
              navigate(`/post/${pending}`, { replace: true });
            } else {
              navigate('/');
            }
          }}
          isNewUser={false}
        />

        {/* Render shared post modal on top of landing/auth page */}
        {sharedPostId && (
          <Suspense fallback={null}>
            <SharedPostModal
              postId={sharedPostId}
              onClose={() => {
                sessionStorage.removeItem('seshnx_pending_post_modal');
                if (sharedPostId) setDismissedSharedPostId(sharedPostId);
                if (location.pathname.startsWith('/post/') || location.pathname.startsWith('/p/')) {
                  navigate('/', { replace: true });
                }
              }}
            />
          </Suspense>
        )}
      </Suspense>
    );
  }

  // 3b. Onboarding Guard: If authenticated but hasn't finished profile setup, require onboarding
  if (needsOnboarding && (!isOnLoginPage && !isTestLoginPage)) {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider userData={userData}>
          <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
            <Toaster position="bottom-right" />
            <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
              <AuthWizard
                darkMode={darkMode}
                toggleTheme={toggleTheme}
                user={user}
                onSuccess={() => {
                  const pending = sessionStorage.getItem('seshnx_pending_post_modal') || sharedPostId;
                  if (pending) {
                    sessionStorage.setItem('seshnx_pending_post_modal', pending);
                    navigate(`/post/${pending}`, { replace: true });
                  } else {
                    navigate('/');
                  }
                }}
                isNewUser={true}
              />
            </Suspense>
          </div>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  // Handle login page explicitly
  if (isOnLoginPage) {
    if (isAuthenticated) {
      if (needsOnboarding) {
        return (
          <QueryClientProvider client={queryClient}>
            <LanguageProvider userData={userData}>
              <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
                <Toaster position="bottom-right" />
                <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
                  <AuthWizard
                    darkMode={darkMode}
                    toggleTheme={toggleTheme}
                    user={user}
                    onSuccess={() => {
                      const pending = sessionStorage.getItem('seshnx_pending_post_modal');
                      navigate(pending ? `/post/${pending}` : '/', { replace: true });
                    }}
                    isNewUser={true}
                  />
                </Suspense>
              </div>
            </LanguageProvider>
          </QueryClientProvider>
        );
      }
      // If already signed in with completed profile, check if there was a pending shared post
      const pending = sessionStorage.getItem('seshnx_pending_post_modal');
      return <Navigate to={pending ? `/post/${pending}` : "/"} replace />;
    }
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          user={user}
          onSuccess={() => {
            const pending = sessionStorage.getItem('seshnx_pending_post_modal');
            navigate(pending ? `/post/${pending}` : '/', { replace: true });
          }}
          isNewUser={false}
        />
      </Suspense>
    );
  }

  // 4. Render Layout (Non-blocking)
  // Even if userData is still undefined (loading from Convex), 
  // we show the layout and pass the state down.
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider userData={userData}>
        <UploadManagerProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
            <Toaster position="bottom-right" />
            <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
              {location.pathname === '/settings' ? (
                <main className="p-6">
                  <AppRoutes
                    user={user}
                    userData={userData as any}
                    darkMode={darkMode}
                    toggleTheme={toggleTheme}
                    handleLogout={handleLogout}
                    loading={userData === undefined}
                  />
                </main>
              ) : (
                <MainLayout
                  user={user}
                  userData={userData}
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                  handleLogout={handleLogout}
                  loading={userData === undefined} // Pass loading state to MainLayout
                />
              )}
            </Suspense>
          </div>
        </UploadManagerProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
