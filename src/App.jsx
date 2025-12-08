import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { app, appId } from './config/firebase';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Core components (always needed - keep as static imports)
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EDUSidebar from './components/EDUSidebar';
import AuthWizard from './components/AuthWizard';
import PublicProfileModal from './components/PublicProfileModal';
import AppRoutes from './routes/AppRoutes';
import { SchoolProvider } from './contexts/SchoolContext';
import PageTransition from './components/shared/PageTransition';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [subProfiles, setSubProfiles] = useState({}); 
  const [notifications, setNotifications] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState(null);
  
  // React Router navigation - MUST be called before any early returns
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map route paths to tab IDs for sidebar compatibility
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard' || path === '/home') return 'dashboard';
    if (path === '/feed' || path === '/social') return 'feed';
    if (path === '/bookings' || path === '/find-talent') return 'bookings';
    if (path.startsWith('/edu')) {
      if (path === '/edu/enroll') return 'edu-enroll';
      return 'edu-overview'; // Default EDU tab
    }
    return path.substring(1) || 'dashboard';
  };

  const activeTab = getActiveTab();
  
  // Wrapper for setActiveTab to use React Router
  const setActiveTab = (newTab) => {
    // Map tab IDs to routes
    const routeMap = {
      'dashboard': '/',
      'home': '/',
      'feed': '/feed',
      'social': '/feed',
      'bookings': '/bookings',
      'find-talent': '/bookings',
      'marketplace': '/marketplace',
      'messages': '/messages',
      'tech': '/tech',
      'studio-ops': '/studio-ops',
      'studio-manager': '/studio-ops',
      'label-manager': '/label-manager',
      'payments': '/payments',
      'profile': '/profile',
      'settings': '/settings',
      'legal': '/legal',
      'edu-enroll': '/edu/enroll',
      'edu-overview': '/edu',
    };
    
    // Handle EDU sub-routes
    if (newTab.startsWith('edu-')) {
      if (newTab === 'edu-enroll') {
        navigate('/edu/enroll');
      } else {
        navigate(`/edu/${newTab.replace('edu-', '')}`);
      }
    } else {
      const route = routeMap[newTab] || '/';
      navigate(route);
    }
  };
  
  // All hooks must be called before any conditional returns
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);

  // DARK MODE STATE
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

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // User Data Listener
        const userRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profiles/main`);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) setUserData(docSnap.data());
            else setUserData(null); 
        });

        // Wallet Listener
        const walletRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/wallet/account`);
        const unsubWallet = onSnapshot(walletRef, (doc) => {
            if (doc.exists()) setTokenBalance(doc.data().balance || 0);
        });

        // Sub-Profiles Listener
        const profilesRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/profiles`);
        const unsubProfiles = onSnapshot(profilesRef, (snapshot) => {
            const profiles = {};
            snapshot.forEach(doc => {
                if (doc.id !== 'main') {
                    profiles[doc.id] = doc.data();
                }
            });
            setSubProfiles(profiles);
        });
        
        // Placeholder Notifications
        setNotifications([
            { id: 1, text: 'Welcome to SeshNx!', type: 'system', timestamp: new Date() }
        ]);

        setLoading(false);
        return () => { unsubUser(); unsubWallet(); unsubProfiles(); };
      } else {
        setUser(null);
        setUserData(null);
        setSubProfiles({});
        setTokenBalance(0);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);
  const openPublicProfile = (uid, name) => setViewingProfile({ uid, name });

  // --- ROLE SWITCH HANDLER ---
  const handleRoleSwitch = async (newRole) => {
      if (!user) return;
      try {
          const userRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles/main`);
          await updateDoc(userRef, { activeProfileRole: newRole });
      } catch (e) {
          console.error("Role switch failed:", e);
      }
  };

  // Auth gating helper - opens AuthWizard modal when actions require authentication
  const requireAuth = useCallback((intent = 'general', meta = {}) => {
    if (user) return true;
    setAuthIntent({ intent, meta });
    setAuthModalOpen(true);
    setSidebarOpen(false);
    return false;
  }, [user]);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthIntent(null);
  }, []);

  useEffect(() => {
    if (user && !userData && !loading) {
      setAuthModalOpen(true);
      setAuthIntent({ intent: 'onboarding' });
    }
  }, [user, userData, loading]);

  // --- RENDER HELPERS ---
  // ConvexProvider is now at root level in main.jsx, so hooks work everywhere
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>;

  // --- UNAUTHENTICATED LANDING ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-lg space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">
            Log in to get access to this and more
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold dark:text-white">Welcome to SeshNx</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to unlock social feed, marketplace, education dashboards, and messaging.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-600 transition"
              onClick={() => { setAuthIntent({ intent: 'login' }); setAuthModalOpen(true); }}
            >
              Log in
            </button>
            <button
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => { setAuthIntent({ intent: 'signup' }); setAuthModalOpen(true); }}
            >
              Create account
            </button>
          </div>
        </div>

        <AnimatePresence>
          {authModalOpen && (
            <div className="fixed inset-0 z-[12000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <AuthWizard 
                user={user}
                isNewUser={false}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
                onSuccess={closeAuthModal}
                onClose={closeAuthModal}
                intent={authIntent}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (user && !userData) return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} />;

  const isEduMode = activeTab.startsWith('edu-');
  const showAdminSidebar = isEduMode && (userData?.accountTypes?.includes('Admin') || userData?.accountTypes?.includes('Instructor'));

  const appContent = (
    <SchoolProvider user={user} userData={userData}>
      <div className="flex h-screen flex-col bg-gray-50 dark:bg-[#1a1d21] overflow-hidden selection:bg-brand-blue selection:text-white">
        <Toaster 
          position="bottom-right"
          toastOptions={{
              style: { background: '#333', color: '#fff' },
              success: { style: { background: 'green' }, iconTheme: { primary: 'white', secondary: 'green' } },
              error: { style: { background: 'red' } },
          }}
        />

        {/* 1. Navbar */}
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
            requireAuth={requireAuth}
        />

        {/* 2. Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
            
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} bg-white dark:bg-[#23262f] border-r dark:border-gray-800`}>
                {showAdminSidebar ? (
                    <EDUSidebar 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
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
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={location.pathname} className="max-w-7xl mx-auto">
                        <AppRoutes
                          user={user}
                          userData={userData}
                          subProfiles={subProfiles}
                          notifications={notifications}
                          tokenBalance={tokenBalance}
                          setActiveTab={setActiveTab}
                          handleLogout={handleLogout}
                          openPublicProfile={openPublicProfile}
                          requireAuth={requireAuth}
                        />
                    </PageTransition>
                </AnimatePresence>
            </main>
        </div>

        {/* Public Profile Modal */}
        <AnimatePresence>
          {viewingProfile && (
              <PublicProfileModal 
                  userId={viewingProfile.uid} 
                  currentUser={user}
                  currentUserData={userData}
                  onClose={() => setViewingProfile(null)}
                  onMessage={(targetId, targetName) => {
                      setViewingProfile(null);
                      setActiveTab('messages');
                      // TODO: Open chat with specific user
                  }}
              />
          )}
        </AnimatePresence>

        {/* Auth modal for gated interactions and onboarding */}
        <AnimatePresence>
          {authModalOpen && (
            <div className="fixed inset-0 z-[12000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <AuthWizard 
                user={user}
                isNewUser={user && !userData}
                darkMode={darkMode}
                toggleTheme={toggleTheme}
                onSuccess={closeAuthModal}
                onClose={closeAuthModal}
                intent={authIntent}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </SchoolProvider>
  );

  // ConvexProvider is now at root level in main.jsx
  // ErrorBoundary is also at root, so we just return the app content
  return appContent;
}
