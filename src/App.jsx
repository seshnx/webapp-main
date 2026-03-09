import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Config & Contexts
import { initializeSettingsFromStorage } from './hooks/useSettings';
import { LanguageProvider } from './contexts/LanguageContext';
import { getUserWithProfile, createClerkUser } from './config/neonQueries';
import { UserData, AccountType } from './types';

// Components
const AuthWizard = lazy(() => import('./components/AuthWizard.clerk'));
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

  // --- DEV OVERRIDE TOGGLE ---
  // Set VITE_DEV_AUTH_OVERRIDE=true in Vercel settings to bypass auth
  const isDevOverrideEnabled = import.meta.env.VITE_DEV_AUTH_OVERRIDE === 'true';

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

  // 2. Auth Guard & Routing (Bypassed if Override is active)
  useEffect(() => {
    if (isDevOverrideEnabled) {
      setUserData({
        id: 'dev-admin',
        firstName: 'Dev',
        lastName: 'Override',
        email: 'admin@local.dev',
        accountTypes: ['Technician', 'Studio', 'Producer'],
        activeProfileRole: 'Technician',
        settings: { theme: 'dark', language: 'en' }
      });
      setLoading(false);
      return;
    }

    if (clerkLoaded && !isSignedIn && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [clerkLoaded, isSignedIn, isDevOverrideEnabled, navigate, location.pathname]);

  // 3. User Data Sync (Neon DB)
  useEffect(() => {
    if (isDevOverrideEnabled || !isSignedIn || !userId) return;

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
  }, [userId, isSignedIn, user, isDevOverrideEnabled]);

  const handleLogout = useCallback(async () => {
    if (isDevOverrideEnabled) {
      window.location.href = '/login';
      return;
    }
    await clerk?.signOut();
    navigate('/login');
  }, [clerk, isDevOverrideEnabled, navigate]);

  // --- RENDER LOGIC ---

  if ((!clerkLoaded && !isDevOverrideEnabled) || (loading && !isDevOverrideEnabled)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
        <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
    );
  }

  // Show Login Wizard if not authenticated
  if (!isSignedIn && !isDevOverrideEnabled) {
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
            user={isDevOverrideEnabled ? userData! : { id: userId, ...user }}
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
