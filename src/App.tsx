import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Config & Contexts
import { initializeSettingsFromStorage } from './hooks/useSettings';
import { LanguageProvider } from './contexts/LanguageContext';
import { getUserWithProfile, createClerkUser } from './config/neonQueries';
import { UserData, AccountType } from './types';

// Components
const AuthWizard = lazy(() => import('./components/AuthWizard'));
const MainLayout = lazy(() => import('./components/MainLayout'));

export default function App(): JSX.Element {
  const { isLoaded: clerkLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // 1. Initial Theme & Settings Setup
  useEffect(() => {
    const stored = initializeSettingsFromStorage();
    if (stored?.theme) {
      const isDark = stored.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : stored.theme === 'dark';
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // 2. Auth Guard & Routing
  useEffect(() => {
    if (clerkLoaded && !isSignedIn && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [clerkLoaded, isSignedIn, navigate, location.pathname]);

  // 3. User Data Sync (Neon DB)
  useEffect(() => {
    // If not signed in, just stop loading and return
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    // If signed in but no userId yet, wait
    if (!userId) return;

    let mounted = true;
    const syncUser = async () => {
      try {
        const profile = await getUserWithProfile(userId);
        if (profile && mounted) {
          setUserData({
            id: userId,
            firstName: user?.firstName || profile.first_name || 'User',
            lastName: user?.lastName || profile.last_name || '',
            email: user?.primaryEmailAddress?.emailAddress || profile.email || '',
            accountTypes: profile.account_types || ['Fan'],
            activeProfileRole: profile.active_role || 'Fan',
            ...profile
          });
        } else if (mounted) {
          // If profile missing in Neon, create it
          await createClerkUser({
            id: userId,
            email: user?.primaryEmailAddress?.emailAddress || '',
            first_name: user?.firstName,
            last_name: user?.lastName,
          });
          setUserData({ id: userId, firstName: user?.firstName || 'User', settings: {} });
        }
      } catch (err) {
        console.error("Neon Sync Error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    syncUser();
    return () => { mounted = false; };
  }, [userId, isSignedIn, user]);

  const handleLogout = useCallback(async () => {
    await clerk?.signOut();
    navigate('/login');
  }, [clerk, navigate]);

  // --- RENDER LOGIC ---

  if (!clerkLoaded || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  // Show Login Wizard if not authenticated
  if (!isSignedIn) {
    return (
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => navigate('/')} isNewUser={false} />
      </Suspense>
    );
  }

  return (
    <LanguageProvider userData={userData}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21] transition-colors duration-300">
        <Toaster position="bottom-right" />
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <MainLayout
            user={{ id: userId, ...user }}
            userData={userData}
            loading={loading}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
            onRoleSwitch={(newRole: AccountType) => {
              setUserData(prev => prev ? { ...prev, activeProfileRole: newRole } : null);
            }}
          />
        </Suspense>
      </div>
    </LanguageProvider>
  );
}
