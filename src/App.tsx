import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { useUserSync } from './hooks/useUserSync';
import { LanguageProvider } from './contexts/LanguageContext';
import { queryClient } from './config/queryClient';

const AuthWizard = lazy(() => import('./components/AuthWizard'));
const AppRoutes = lazy(() => import('./routes/AppRoutes'));
const MainLayout = lazy(() => import('./components/MainLayout'));

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

  // 3. Auth Guard: If not signed in, show AuthWizard
  // Note: We render AuthWizard for both root and /login if unauthenticated
  if (!isAuthenticated && (!isOnLoginPage && !isTestLoginPage)) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // Handle login page explicitly
  if (isOnLoginPage) {
    if (isAuthenticated) {
      // If already signed in but at /login, go home
      return <Navigate to="/" replace />;
    }
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  // 4. Render Layout (Non-blocking)
  // Even if userData is still undefined (loading from Convex), 
  // we show the layout and pass the state down.
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider userData={userData}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
          <Toaster position="bottom-right" />
          <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
            {location.pathname === '/settings' ? (
              <main className="p-6">
                <AppRoutes 
                  user={user} 
                  userData={userData} 
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
      </LanguageProvider>
    </QueryClientProvider>
  );
}
