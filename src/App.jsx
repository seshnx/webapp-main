import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './config/supabase'; 
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Core components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EDUSidebar from './components/EDUSidebar';
import AuthWizard from './components/AuthWizard';
import PublicProfileModal from './components/PublicProfileModal';
import AppRoutes from './routes/AppRoutes';
import { SchoolProvider } from './contexts/SchoolContext';
import PageTransition from './components/shared/PageTransition';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [subProfiles, setSubProfiles] = useState({}); 
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Tab Logic
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard' || path === '/home') return 'dashboard';
    if (path === '/feed' || path === '/social') return 'feed';
    if (path === '/bookings' || path === '/find-talent') return 'bookings';
    if (path.startsWith('/edu')) {
      return path === '/edu/enroll' ? 'edu-enroll' : 'edu-overview';
    }
    return path.substring(1) || 'dashboard';
  };

  const activeTab = getActiveTab();
  
  const setActiveTab = (newTab) => {
    const routeMap = {
      'dashboard': '/', 'home': '/', 'feed': '/feed', 'social': '/feed',
      'bookings': '/bookings', 'find-talent': '/bookings', 'marketplace': '/marketplace',
      'seshfx': '/marketplace?tab=fx', 'messages': '/messages', 'settings': '/settings',
      'profile': '/profile', 'edu-enroll': '/edu/enroll', 'edu-overview': '/edu',
    };
    
    if (newTab.startsWith('edu-') && !routeMap[newTab]) {
       navigate(`/edu/${newTab.replace('edu-', '')}`);
    } else {
       navigate(routeMap[newTab] || '/');
    }
  };
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [pendingChatTarget, setPendingChatTarget] = useState(null);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

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

  // --- SUPABASE AUTH & DATA LISTENER ---
  useEffect(() => {
    if (!supabase) {
        setLoading(false);
        return;
    }

    /**
     * ROBUST USER DATA LOADER
     * This function is designed to never throw an uncaught error.
     * It will always set userData to *something*, preventing the "null account" crash.
     */
    const loadUserData = async (userId) => {
        // 1. Sanity Check
        if (!userId) {
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
            return;
        }

        try {
            // 2. Safe Auth Retrieval
            // We fetch the latest auth object to get metadata (names/avatar) even if the profile table is empty
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user || null;
            
            // 3. Fetch Profile (Safely)
            // .maybeSingle() returns null instead of throwing an error if 0 rows are found
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            
            if (profileError) {
                console.warn("Minor warning fetching profile:", profileError.message);
            }

            // 4. Construct Fallback/Default Data
            // We use the most reliable source available for each field
            const currentEmail = profile?.email || authUser?.email || user?.email || '';
            const metadata = authUser?.user_metadata || {};
            
            const currentFirstName = 
                profile?.first_name || 
                metadata.first_name || 
                metadata.given_name || 
                'User';
                
            const currentLastName = 
                profile?.last_name || 
                metadata.last_name || 
                metadata.family_name || 
                '';

            // Base object that guarantees the app can render
            let finalUserData = {
                id: userId,
                firstName: currentFirstName,
                lastName: currentLastName,
                email: currentEmail,
                accountTypes: ['Fan'], // Safe default
                activeProfileRole: 'Fan',
                photoURL: profile?.avatar_url || metadata.avatar_url || metadata.picture || null,
                settings: profile?.settings || {},
                effectiveDisplayName: profile?.effective_display_name || currentFirstName
            };

            // 5. Merge Real Profile Data (if it exists)
            if (profile) {
                const accountTypes = profile.account_types && profile.account_types.length > 0 
                    ? profile.account_types 
                    : ['Fan'];
                
                finalUserData = {
                    ...finalUserData,
                    ...profile, // Overwrite defaults with DB data
                    accountTypes,
                    activeProfileRole: profile.active_role || accountTypes[0],
                };
            } else {
                console.log("No profile row found. Using auth metadata fallbacks.");
            }

            // 6. Set State (The most important part)
            setUserData(finalUserData);

            // 7. Fetch Wallet (Non-blocking)
            try {
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('balance')
                    .eq('user_id', userId)
                    .maybeSingle();
                
                if (wallet) setTokenBalance(wallet.balance);
            } catch (wErr) {
                console.warn("Wallet fetch failed silently:", wErr);
            }

        } catch (err) {
            console.error("CRITICAL: Error loading user data:", err);
            // FAILSAFE: Ensure we still have a user object so the app doesn't white-screen
            if (!userData) {
                setUserData({
                    id: userId,
                    firstName: 'User',
                    lastName: '',
                    accountTypes: ['Fan'],
                    activeProfileRole: 'Fan',
                    effectiveDisplayName: 'User'
                });
            }
        }
    };

    // 1. Get initial session
    const loadInitialSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            const currentUser = session?.user ?? null;
            
            if (currentUser && currentUser.id) {
                console.log('Session restored:', currentUser.id);
                setUser(currentUser);
                await loadUserData(currentUser.id);
            } else {
                setUser(null);
                setUserData(null);
                setSubProfiles({});
            }
        } catch (err) {
            console.error("Session check failed:", err);
            setUser(null);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };
    
    loadInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event);
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
            setUser(currentUser);
            // Refresh data on sign-in or token refresh
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await loadUserData(currentUser.id);
            }
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
            navigate('/');
        }
        
        setLoading(false);
    });

    // 3. Safety timeout to prevent infinite loading screens
    const timeoutId = setTimeout(() => {
        if (loading) {
            console.warn("Force clearing loading state after timeout");
            setLoading(false);
        }
    }, 8000);

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array = runs once on mount

  const handleLogout = useCallback(async () => {
      try {
          if (supabase) {
              await supabase.auth.signOut();
          }
      } catch (err) {
          console.error("Logout error:", err);
      } finally {
          setUser(null);
          setUserData(null);
          setSubProfiles({});
          navigate('/');
      }
  }, [navigate]);

  const openPublicProfile = (uid, name) => setViewingProfile({ uid, name });

  const handleRoleSwitch = async (newRole) => {
      if (!user || !supabase) return;
      
      // Optimistic update
      setUserData(prev => ({ ...prev, activeProfileRole: newRole }));
      
      try {
          await supabase
              .from('profiles')
              .update({ active_role: newRole })
              .eq('id', user.id);
      } catch (e) {
          console.error("Role switch failed:", e);
      }
  };

  if (loading) return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
      </div>
  );
  
  // OAuth Signup Handler
  const isFromSignup = new URLSearchParams(window.location.search).get('intent') === 'signup';
  if (user && !userData && isFromSignup) {
    return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => window.location.href = '/'} />;
  }
  
  // Auth Guard: Login Page Logic
  if (location.pathname === '/login') {
    // If logged in, go to home
    if (user && userData) {
        navigate('/', { replace: true });
        return null;
    }
    // If not logged in, show AuthWizard
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => {}} isNewUser={false} />;
  }
  
  // Auth Guard: Protected Routes
  if (!user && location.pathname !== '/login') {
    navigate('/login', { replace: true });
    return null;
  }

  const isEduMode = activeTab.startsWith('edu-');
  const showAdminSidebar = isEduMode && (userData?.accountTypes?.includes('EDUAdmin') || userData?.accountTypes?.includes('EDUStaff'));

  return (
    <SchoolProvider user={user} userData={userData}>
      <div className="flex h-screen flex-col bg-gray-50 dark:bg-[#1a1d21] overflow-hidden selection:bg-brand-blue selection:text-white">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

        <Navbar 
            user={user} 
            userData={userData} 
            subProfiles={subProfiles} 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            tokenBalance={tokenBalance} 
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            onRoleSwitch={handleRoleSwitch}
            openPublicProfile={openPublicProfile}
        />

        <div className="flex flex-1 overflow-hidden relative">
            <div className={`lg:static lg:w-64 fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                {showAdminSidebar ? (
                    <EDUSidebar 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        isStaff={userData?.accountTypes?.includes('EDUStaff')} 
                        isAdmin={userData?.accountTypes?.includes('EDUAdmin')} 
                    />
                ) : (
                    <Sidebar 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        userData={userData}
                        handleLogout={handleLogout}
                    />
                )}
            </div>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth" id="main-scroll">
                <PageTransition key={location.pathname} className="max-w-7xl mx-auto">
                    <AppRoutes
                      user={user}
                      userData={userData}
                      subProfiles={subProfiles}
                      tokenBalance={tokenBalance}
                      setActiveTab={setActiveTab}
                      handleLogout={handleLogout}
                      openPublicProfile={openPublicProfile}
                      pendingChatTarget={pendingChatTarget}
                      clearPendingChatTarget={() => setPendingChatTarget(null)}
                      loading={loading}
                      darkMode={darkMode}
                      toggleTheme={toggleTheme}
                    />
                </PageTransition>
            </main>
        </div>

        <AnimatePresence>
          {viewingProfile && (
              <PublicProfileModal 
                  userId={viewingProfile.uid} 
                  currentUser={user}
                  currentUserData={userData}
                  onClose={() => setViewingProfile(null)}
                  onMessage={(targetId, targetName) => {
                      setViewingProfile(null);
                      setPendingChatTarget({ uid: targetId, name: targetName });
                      setActiveTab('messages');
                  }}
              />
          )}
        </AnimatePresence>
      </div>
    </SchoolProvider>
  );
}
