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

    // Helper function to load user data
    const loadUserData = async (userId) => {
        if (!userId) {
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
            return;
        }

        try {
            // Fetch Profile from 'profiles' table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (profile && !profileError) {
                // Normalize data structure for the app
                // Even if account_types is empty, set a default so user can use the app
                const accountTypes = profile.account_types && profile.account_types.length > 0 
                    ? profile.account_types 
                    : ['Fan'];
                
                setUserData({
                    ...profile,
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    accountTypes: accountTypes,
                    activeProfileRole: profile.active_role || accountTypes[0],
                    photoURL: profile.avatar_url || null
                });
                
                console.log('Profile loaded:', { 
                    userId, 
                    hasAccountTypes: profile.account_types?.length > 0,
                    accountTypes: accountTypes 
                });
            } else {
                // Profile doesn't exist or error - set default userData to prevent crashes
                console.log('Profile not found or error, setting default userData');
                setUserData({
                    id: userId,
                    firstName: '',
                    lastName: '',
                    accountTypes: ['Fan'],
                    activeProfileRole: 'Fan',
                    photoURL: null,
                    email: null,
                    settings: {}
                });
                
                if (profileError && profileError.code !== 'PGRST116') {
                    console.error("Error fetching profile:", profileError);
                }
            }

            // Fetch Wallet (optional, don't fail if missing)
            const { data: wallet } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', userId)
                .single();
            
            if (wallet) setTokenBalance(wallet.balance);
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    // 1. Get initial session and load data immediately
    // Use Promise.race to timeout after 3 seconds (reduced from 5)
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 3000));
    
    Promise.race([sessionPromise, timeoutPromise]).then(async (result) => {
        if (result.timeout) {
            console.warn("Session check timed out - this may be due to Tracking Prevention blocking storage");
            // Don't try to signOut if storage is blocked - it will fail
            setUser(null);
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
            setLoading(false);
            return;
        }
        
        const { data: { session }, error } = result;
        
        if (error) {
            console.error("Error getting session:", error);
            // If error is related to storage, it's likely Tracking Prevention
            if (error.message?.includes('storage') || error.message?.includes('localStorage')) {
                console.warn("Storage access blocked - session cannot be persisted");
            }
            setUser(null);
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
            setLoading(false);
            return;
        }
        
        // Validate session exists and has a valid user
        const currentUser = session?.user ?? null;
        
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            // Load user data without additional timeout - if it fails, user just won't have profile yet
            await loadUserData(currentUser.id);
        } else {
            // No valid session
            setUser(null);
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
        }
        
        setLoading(false);
    }).catch((err) => {
        console.error("Session check failed:", err);
        // Check if it's a storage-related error
        if (err.message?.includes('storage') || err.message?.includes('localStorage') || err.name === 'QuotaExceededError') {
            console.warn("Storage access blocked - continuing without session persistence");
        }
        setUser(null);
        setUserData(null);
        setSubProfiles({});
        setTokenBalance(0);
        setLoading(false);
    });

    // 2. Listen for auth changes (for subsequent logins/logouts, including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        const currentUser = session?.user ?? null;
        
        if (currentUser && currentUser.id) {
            setUser(currentUser);
            // Load user data - this is critical for OAuth callbacks
            await loadUserData(currentUser.id);
            
            // If this is a SIGNED_IN event (like OAuth callback) and profile has no account_types,
            // set a default so components don't crash
            if (event === 'SIGNED_IN') {
                // Check if profile needs setup
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_types, first_name, last_name, avatar_url, active_role')
                    .eq('id', currentUser.id)
                    .single();
                
                // If profile exists but has no account_types, set default
                if (profile && (!profile.account_types || profile.account_types.length === 0)) {
                    console.log('New OAuth user detected - setting default account_types');
                    // Update profile with default Fan role
                    await supabase
                        .from('profiles')
                        .update({ 
                            account_types: ['Fan'],
                            active_role: 'Fan',
                            preferred_role: 'Fan'
                        })
                        .eq('id', currentUser.id);
                    
                    // Reload user data
                    await loadUserData(currentUser.id);
                } else if (!profile) {
                    // Profile doesn't exist yet - set temporary userData so components don't crash
                    setUserData({
                        id: currentUser.id,
                        firstName: currentUser.user_metadata?.first_name || currentUser.user_metadata?.given_name || '',
                        lastName: currentUser.user_metadata?.last_name || currentUser.user_metadata?.family_name || '',
                        accountTypes: ['Fan'],
                        activeProfileRole: 'Fan',
                        photoURL: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null
                    });
                }
            }
        } else {
            setUser(null);
            setUserData(null);
            setSubProfiles({});
            setTokenBalance(0);
        }
        setLoading(false);
    });

    // 3. Safety timeout - ensure loading always resolves (reduced to 3s to match session timeout)
    const timeoutId = setTimeout(() => {
        console.warn("Loading timeout - forcing loading to false");
        setUser(null);
        setUserData(null);
        setLoading(false);
    }, 3000); // 3 second timeout

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = useCallback(async () => {
      try {
          if (supabase) {
              const { error } = await supabase.auth.signOut();
              if (error) {
                  console.error("Logout error:", error);
              }
          }
      } catch (err) {
          console.error("Logout failed:", err);
      } finally {
          // Always clear state and navigate, even if signOut fails
          setUser(null);
          setUserData(null);
          setSubProfiles({});
          setTokenBalance(0);
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>;
  
  // Only show AuthWizard if there's no user
  // Don't show onboarding automatically - let user complete signup flow first
  if (!user || !user.id) {
    return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => {}} isNewUser={false} />;
  }
  
  // If user exists but no profile data AND we're coming from signup (check URL or session)
  // Only show onboarding if explicitly needed (e.g., from OAuth callback)
  const isFromSignup = new URLSearchParams(window.location.search).get('intent') === 'signup';
  if (user && user.id && !userData && isFromSignup) {
    return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => window.location.href = '/'} />;
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
