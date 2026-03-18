import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

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

  // 1. Fetch User Data (Non-blocking)
  const { userData } = useUserSync();

  // 2. Theme Authority
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      // Force update the DOM immediately
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Sync DOM with state on every mount/change to prevent "MainLayout" overrides
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = useCallback(async () => {
    await clerk?.signOut();
    navigate('/login', { replace: true });
  }, [clerk, navigate]);

  // 3. The Loading Fix: Only block while Clerk is initializing.
  // We show the UI as soon as we know if the user is signed in or not.
  if (!clerkLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  const isAuthenticated = !!isSignedIn;
  const isOnLoginPage = location.pathname === '/login';

  if (!isAuthenticated && !isOnLoginPage) {
    return (
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} />
      </Suspense>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* We pass userData here, but components must handle it being undefined while loading */}
      <LanguageProvider userData={userData}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
          <Toaster position="bottom-right" />
          <Analytics />
          
          <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>}>
            <div className="content-container">
              {location.pathname === '/settings' ? (
                <main className="p-6">
                  <AppRoutes 
                    user={user} 
                    userData={userData} 
                    darkMode={darkMode} 
                    toggleTheme={toggleTheme} 
                    handleLogout={handleLogout} 
                  />
                </main>
              ) : (
                <MainLayout
                  user={user}
                  userData={userData}
                  loading={userData === undefined} // MainLayout can show its own inner skeletons
                  darkMode={darkMode}
                  toggleTheme={toggleTheme}
                  handleLogout={handleLogout}
                />
              )}
            </div>
          </Suspense>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
