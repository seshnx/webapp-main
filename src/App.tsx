import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { useQuery } from 'convex/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

import { api } from '../convex/_generated/api';
import { useUserSync } from './hooks/useUserSync';
import { initializeSettingsFromStorage } from './hooks/useSettings';
import { LanguageProvider } from './contexts/LanguageContext';
import { queryClient } from './config/queryClient';
import type { AccountType } from './types';

const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));

export default function App(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded: clerkLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  // 1. Run the Sync Hook
  const { isReady: syncFinished } = useUserSync();

  // 2. Fetch Convex User Data
  const convexUser = useQuery(api.users.getUserByClerkId, 
    userId ? { clerkId: userId } : "skip"
  );

  // 3. Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newVal);
      return newVal;
    });
  }, []);

  useEffect(() => {
    const stored = initializeSettingsFromStorage();
    if (stored?.theme) {
      const isDark = stored.theme === 'dark' || 
        (stored.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
      setDarkMode(isDark);
    }
  }, []);

  // 4. Loading Logic Fix
  // We are loading if:
  // - Clerk hasn't initialized yet
  // - User is signed in, but the initial Convex query is still 'undefined' (fetching)
  // - User is signed in, but the record doesn't exist yet (null) AND sync isn't finished
  const isDataLoading = isSignedIn && convexUser === undefined;
  const isNewUserSyncing = isSignedIn && convexUser === null && !syncFinished;
  const isLoading = !clerkLoaded || isDataLoading || isNewUserSyncing;

  const handleLogout = useCallback(async () => {
    await clerk?.signOut();
    navigate('/login', { replace: true });
  }, [clerk, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
          <p className="text-sm text-gray-500 animate-pulse">Initializing SeshNx...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!isSignedIn && !!userId;
  const isOnLoginPage = location.pathname === '/login';

  // Auth Guard
  if (!isAuthenticated && !isOnLoginPage) {
    return (
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider userData={convexUser}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
          <Toaster position="bottom-right" />
          <Analytics />
          <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
            {location.pathname === '/settings' ? (
              <main className="p-6">
                <AppRoutes 
                   user={user} 
                   userData={convexUser} 
                   loading={isLoading} 
                   darkMode={darkMode} 
                   toggleTheme={() => setDarkMode(!darkMode)} 
                   handleLogout={handleLogout} 
                />
              </main>
            ) : (
              <MainLayout
                user={user}
                userData={convexUser}
                loading={isLoading}
                darkMode={darkMode}
                toggleTheme={() => setDarkMode(!darkMode)}
                handleLogout={handleLogout}
                onRoleSwitch={() => {}}
              />
            )}
          </Suspense>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
