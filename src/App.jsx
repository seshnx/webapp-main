import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useSettings, initializeSettingsFromStorage } from './hooks/useSettings';
import { LanguageProvider } from './contexts/LanguageContext';
import { getUserWithProfile, updateProfile, createClerkUser } from './config/neonQueries';

// Lazy load components to avoid initialization order issues
const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));

export default function App() {
  // Clerk authentication hooks
  const { isLoaded: clerkLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // These hooks must be called unconditionally at the top level
  const navigate = useNavigate();
  const location = useLocation();

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

    let isMounted = true;

    /**
     * Load user data from Neon database
     * Uses Clerk user ID to fetch profile data
     */
    const loadUserData = async () => {
      if (!userId || !isSignedIn) {
        if (isMounted) {
          setUserData(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch user with profile from Neon
        const userWithProfile = await getUserWithProfile(userId);

        if (userWithProfile) {
          // Construct userData object compatible with existing components
          const finalUserData = {
            id: userId,
            firstName: user?.firstName || userWithProfile.first_name || 'User',
            lastName: user?.lastName || userWithProfile.last_name || '',
            email: user?.primaryEmailAddress?.emailAddress || userWithProfile.email || '',
            accountTypes: userWithProfile.account_types || ['Fan'],
            activeProfileRole: userWithProfile.active_role || userWithProfile.account_types?.[0] || 'Fan',
            preferredRole: userWithProfile.preferred_role || userWithProfile.account_types?.[0] || 'Fan',
            photoURL: user?.imageUrl || userWithProfile.photo_url || userWithProfile.avatar_url || null,
            settings: userWithProfile.settings || {},
            effectiveDisplayName: userWithProfile.effective_display_name || user?.firstName || userWithProfile.first_name || 'User',
            zipCode: userWithProfile.zip_code,
            // Additional profile fields
            ...userWithProfile
          };

          if (isMounted) {
            setUserData(finalUserData);
          }
        } else {
          // Profile doesn't exist - create minimal userData from Clerk user
          const metadata = user?.publicMetadata || {};
          const minimalUserData = {
            id: userId,
            firstName: user?.firstName || metadata.first_name || 'User',
            lastName: user?.lastName || metadata.last_name || '',
            email: user?.primaryEmailAddress?.emailAddress || '',
            accountTypes: metadata.account_types || ['Fan'],
            activeProfileRole: metadata.active_role || 'Fan',
            photoURL: user?.imageUrl || null,
            settings: {},
            effectiveDisplayName: user?.firstName || metadata.first_name || 'User'
          };

          if (isMounted) {
            setUserData(minimalUserData);
          }

          // Create user in Neon database if they don't exist
          try {
            console.log('📝 Creating user in Neon database...');

            const metadata = user?.publicMetadata || {};

            // First, create the clerk user record
            await createClerkUser({
              id: userId,
              email: user?.primaryEmailAddress?.emailAddress || '',
              phone: user?.primaryPhoneNumber?.phoneNumber || null,
              first_name: user?.firstName || metadata.first_name || null,
              last_name: user?.lastName || metadata.last_name || null,
              username: user?.username || metadata.username || null,
              profile_photo_url: user?.imageUrl || null,
              account_types: metadata.account_types || ['Fan'],
              active_role: metadata.active_role || 'Fan',
              bio: metadata.bio || null,
              zip_code: metadata.zip_code || null,
            });

            console.log('✅ User created in Neon database');

            // Then, try to create the extended profile (if needed)
            // Note: This is optional and will only create the profiles table record
            // The clerk_users table is the critical one that was just created
          } catch (err) {
            console.error("❌ Failed to create user in Neon:", err);
            // Don't block the app - user can still function with Clerk data
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        // Set minimal userData on error to prevent crashes
        if (isMounted) {
          const metadata = user?.publicMetadata || {};
          setUserData({
            id: userId,
            firstName: user?.firstName || metadata.first_name || 'User',
            lastName: user?.lastName || metadata.last_name || '',
            email: user?.primaryEmailAddress?.emailAddress || '',
            accountTypes: metadata.account_types || ['Fan'],
            activeProfileRole: metadata.active_role || 'Fan',
            photoURL: user?.imageUrl || null,
            settings: {}
          });
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [userId, isSignedIn, clerkLoaded, user]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('=== APP LOGOUT ===');

      // Sign out from Clerk - this clears the session
      if (clerk) {
        await clerk.signOut();
        console.log('✅ Clerk signOut successful');
      }

      // Clear local state
      setUserData(null);
      console.log('✅ Local state cleared');

      // Navigate to login
      navigate('/login', { replace: true });
      console.log('✅ Navigated to login');
    } catch (err) {
      console.error("Logout error:", err);
      // Even if signOut fails, clear state and redirect
      setUserData(null);
      navigate('/login', { replace: true });
    }
  }, [navigate, clerk]);

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
