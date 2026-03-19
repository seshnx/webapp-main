import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useSettings, initializeSettingsFromStorage } from './hooks/useSettings';
import { LanguageProvider } from './contexts/LanguageContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Lazy load components to avoid initialization order issues
const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));

export default function App() {
  // Clerk authentication hooks
  const { isLoaded: clerkLoaded, isSignedIn, userId: clerkId } = useAuth();
  const { user } = useUser();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // These hooks must be called unconditionally at the top level
  const navigate = useNavigate();
  const location = useLocation();

  // Convex hooks for user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );
  const updateProfileMutation = useMutation(api.users.updateProfile);

  // Dark Mode - now synced with user settings
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Initialize settings from storage on mount
  useEffect(() => {
    const storedSettings = initializeSettingsFromStorage();
    if (storedSettings) {
      // Apply stored settings immediately
      const root = document.documentElement;

      // Apply theme
      if (storedSettings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          setDarkMode(true);
        } else {
          root.classList.remove('dark');
          setDarkMode(false);
        }
      } else if (storedSettings.theme === 'dark') {
        root.classList.add('dark');
        setDarkMode(true);
      } else {
        root.classList.remove('dark');
        setDarkMode(false);
      }
    }
  }, []);

  // Apply settings from userData when it loads
  useEffect(() => {
    if (userData?.settings) {
      const settings = userData.settings;
      const root = document.documentElement;

      // Apply theme
      if (settings.theme) {
        if (settings.theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
            setDarkMode(true);
          } else {
            root.classList.remove('dark');
            setDarkMode(false);
          }
        } else if (settings.theme === 'dark') {
          root.classList.add('dark');
          setDarkMode(true);
        } else {
          root.classList.remove('dark');
          setDarkMode(false);
        }
      }

      // Apply font size
      if (settings.accessibility?.fontSize) {
        const fontSizes = {
          small: '14px',
          medium: '16px',
          large: '18px',
          xlarge: '20px',
        };
        root.style.fontSize = fontSizes[settings.accessibility.fontSize] || fontSizes.medium;
      }

      // Apply reduced motion
      if (settings.accessibility?.reducedMotion) {
        root.classList.add('reduce-motion');
        root.style.setProperty('--motion-duration', '0s');
      } else {
        root.classList.remove('reduce-motion');
        root.style.removeProperty('--motion-duration');
      }

      // Apply high contrast
      if (settings.accessibility?.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }

      // Apply language
      if (settings.language) {
        document.documentElement.lang = settings.language;
      }
    }
  }, [userData?.settings]);

  useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // --- CLERK AUTH & USER DATA LOADER ---
  useEffect(() => {
    // Wait for Clerk to load
    if (!clerkLoaded) {
      return;
    }

    // Clear user data if not signed in
    if (!clerkId || !isSignedIn) {
      setUserData(null);
      setLoading(false);
      return;
    }

    // Convex user data is loaded reactively
    if (convexUser !== undefined) {
      if (convexUser) {
        // Construct userData object compatible with existing components
        const finalUserData = {
          id: clerkId,
          firstName: user?.firstName || convexUser.firstName || 'User',
          lastName: user?.lastName || convexUser.lastName || '',
          email: user?.primaryEmailAddress?.emailAddress || convexUser.email || '',
          accountTypes: convexUser.accountTypes || ['Fan'],
          activeProfileRole: convexUser.activeRole || convexUser.accountTypes?.[0] || 'Fan',
          preferredRole: convexUser.preferredRole || convexUser.accountTypes?.[0] || 'Fan',
          photoURL: user?.imageUrl || convexUser.imageUrl || null,
          settings: convexUser.settings || {},
          effectiveDisplayName: convexUser.profileName || user?.firstName || convexUser.firstName || 'User',
          zipCode: convexUser.zipCode,
          // Include all Convex user fields
          ...convexUser
        };

        setUserData(finalUserData);
        setLoading(false);
      } else {
        // Profile doesn't exist in Convex yet - create minimal userData from Clerk
        const metadata = user?.publicMetadata || {};
        const minimalUserData = {
          id: clerkId,
          firstName: user?.firstName || metadata.firstName || 'User',
          lastName: user?.lastName || metadata.lastName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          accountTypes: metadata.accountTypes || ['Fan'],
          activeProfileRole: metadata.activeRole || 'Fan',
          photoURL: user?.imageUrl || null,
          settings: {},
          effectiveDisplayName: user?.firstName || metadata.firstName || 'User'
        };

        setUserData(minimalUserData);
        setLoading(false);

        // Note: User will be created by Clerk webhook or can be created on-demand
        console.log("User profile not yet created in Convex - will be created by webhook");
      }
    }
  }, [clerkId, isSignedIn, clerkLoaded, convexUser, user]);

  const handleLogout = useCallback(async () => {
    try {
      // Clear state immediately for responsive UI
      setUserData(null);

      // Sign out from Clerk - the useAuth hook will handle the actual sign out
      // We just need to navigate to login
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      // Even if signOut fails, clear state and redirect
      setUserData(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Show loading spinner while Clerk loads or userData is being fetched
  if (!clerkLoaded || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  // Check if coming from OAuth signup flow
  const isFromSignup = new URLSearchParams(window.location.search).get('intent') === 'signup';

  // === AUTHENTICATION GUARD ===
  const isAuthenticated = isSignedIn && userId;
  const hasUserData = userData && userData.id;
  const isOnLoginPage = location.pathname === '/login';
  const isTestLoginPage = location.pathname === '/test-login';

  // CRITICAL: If no user is logged in with Clerk, show AuthWizard
  if (!isAuthenticated && !isOnLoginPage && !isTestLoginPage) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // CRITICAL: If user exists but no userData, show loading
  if (isAuthenticated && !hasUserData && !isOnLoginPage && !isTestLoginPage) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  // Handle test login page
  if (isTestLoginPage) {
    if (isAuthenticated && hasUserData) {
      navigate('/debug-report', { replace: true });
      return null;
    }
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/debug-report')} isNewUser={false} />
      </Suspense>
    );
  }

  // Handle login page
  if (isOnLoginPage) {
    if (isAuthenticated && hasUserData) {
      navigate('/', { replace: true });
      return null;
    }
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // Handle OAuth onboarding
  if (isAuthenticated && !hasUserData && isFromSignup) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/debug-report')} />
      </Suspense>
    );
  }

  // Require authentication for all other routes
  if (!isAuthenticated || !hasUserData) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // Render app with full layout (Sidebar + Navbar + Content)
  return (
    <LanguageProvider userData={userData}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

        {/* Check if we're on a special route that needs different layout */}
        {location.pathname === '/settings' || location.pathname === '/debug-report' ? (
          // Settings and Debug Report use simple layout
          <main className="p-6">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
              <AppRoutes
                user={{ id: userId, ...user }}
                userData={userData}
                loading={loading}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
              />
            </Suspense>
          </main>
        ) : (
          // All other routes use MainLayout with Sidebar + Navbar
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-brand-blue" size={32} /></div>}>
            <MainLayout
              user={{ id: userId, ...user }}
              userData={userData}
              loading={loading}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
              handleLogout={handleLogout}
            />
          </Suspense>
        )}
      </div>
    </LanguageProvider>
  );
}
