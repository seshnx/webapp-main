import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { useQuery } from 'convex/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

// Generated Convex API
import { api } from '../convex/_generated/api';

// Hooks & Contexts
import { useUserSync } from './hooks/useUserSync';
import { initializeSettingsFromStorage } from './hooks/useSettings';
import { LanguageProvider } from './contexts/LanguageContext';
import { queryClient } from './config/queryClient';

// Types
import type { AccountType } from './types';

// =====================================================
// LAZY LOADED COMPONENTS
// =====================================================
const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));

export default function App(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Clerk Authentication
  const { isLoaded: clerkLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  // 2. Convex User Synchronization Hook
  // This automatically runs the syncUserFromClerk mutation when the user logs in
  const { syncStatus } = useUserSync();

  // 3. Convex User Data Query
  // Replacing legacy Neon/MongoDB fetches with a single Convex query
  const convexUser = useQuery(api.users.getUserByClerkId, 
    userId ? { clerkId: userId } : "skip"
  );

  // 4. Local Theme State (Maintained for legacy component compatibility)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Initialize theme from storage immediately on mount
  useEffect(() => {
    const storedSettings = initializeSettingsFromStorage();
    if (storedSettings?.theme) {
      const isDark = storedSettings.theme === 'dark' || 
        (storedSettings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      document.documentElement.classList.toggle('dark', isDark);
      setDarkMode(isDark);
    }
  }, []);

  // Sync darkMode state when Convex user settings change
  useEffect(() => {
    if (convexUser?.settings?.privacy) { // Using privacy field from schema as a proxy for loaded settings
       // Apply accessibility/theme logic here based on convexUser.settings
    }
  }, [convexUser]);

  const toggleTheme = (): void => setDarkMode(!darkMode);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      if (clerk) await clerk.signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      navigate('/login', { replace: true });
    }
  }, [navigate, clerk]);

  // =====================================================
  // RENDER LOGIC
  // =====================================================

  // Determine if we are fully "ready" (Clerk loaded + Convex synced + User data fetched)
  const isSyncing = syncStatus === 'syncing' || syncStatus === 'idle';
  const isLoading = !clerkLoaded || (isSignedIn && (isSyncing || convexUser === undefined));

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  const isAuthenticated = !!isSignedIn && !!userId;
  const hasUserData = !!convexUser;
  const isOnLoginPage = location.pathname === '/login';

  // AUTH GUARD: Show AuthWizard if not signed in
  if (!isAuthenticated && !isOnLoginPage) {
    return (
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // Handle Login Page redirect
  if (isOnLoginPage && isAuthenticated && hasUserData) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider userData={convexUser}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
          <Toaster position="bottom-right" />
          <Analytics />

          <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
            {location.pathname === '/settings' || location.pathname === '/debug-report' ? (
              <main className="p-6">
                <AppRoutes
                  user={user}
                  userData={convexUser}
                  loading={isLoading}
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                  handleLogout={handleLogout}
                />
              </main>
            ) : (
              <MainLayout
                user={user}
                userData={convexUser}
                loading={isLoading}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                onRoleSwitch={(newRole: AccountType) => {
                   // This would now typically be a Convex mutation to update activeRole
                }}
              />
            )}
          </Suspense>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
