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

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            setLoading(false);
        }
        // The onAuthStateChange will fire and handle the rest
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            try {
                // Fetch Profile from 'profiles' table
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                
                if (profile) {
                    // Normalize data structure for the app
                    setUserData({
                        ...profile,
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        accountTypes: profile.account_types || ['Fan'],
                        activeProfileRole: profile.active_role || 'Fan',
                        photoURL: profile.avatar_url
                    });
                }

                // Fetch Wallet
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('balance')
                    .eq('user_id', currentUser.id)
                    .single();
                
                if (wallet) setTokenBalance(wallet.balance);
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        } else {
            setUserData(null);
            setSubProfiles({});
        }
        setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
      if (supabase) await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      navigate('/');
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
  
  if (!user) return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => {}} />;
  
  // If user exists but no profile yet (e.g. midway through signup), show wizard
  if (user && !userData) return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} onSuccess={() => window.location.reload()} />;

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
