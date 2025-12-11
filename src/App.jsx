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
  const [loading, setLoading] = useState(true);
  
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
      'seshfx': '/marketplace?tab=fx',
      'messages': '/messages',
      'tech': '/tech',
      'business-center': '/business-center',
      'studio-ops': '/business-center',
      'studio-manager': '/business-center',
      'label-manager': '/business-center',
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
  const [pendingChatTarget, setPendingChatTarget] = useState(null); // Target user to open chat with

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

        setLoading(false);
        return () => { unsubUser(); unsubWallet(); unsubProfiles(); };
      } else {
        setUser(null);
        setUserData(null);
        setSubProfiles({});
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = useCallback(() => signOut(auth), [auth]);

  // --- AUTO-LOGOUT (Dual Timer) ---
  useEffect(() => {
    if (!user) return;

    // Configuration
    const TIMEOUT_FOREGROUND_MS = 30 * 60 * 1000; // 30 minutes (App Tab)
    const TIMEOUT_BACKGROUND_MS = 15 * 60 * 1000; // 15 minutes (Different Tab)
    const STORAGE_KEY = 'seshnx_last_active';
    
    // Set initial activity timestamp if not present
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    // Function to update activity timestamp (shared across tabs via localStorage)
    const updateActivity = () => {
       localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    // Periodic Check
    const checkInactivity = () => {
      const lastActive = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      const now = Date.now();
      const elapsed = now - lastActive;
      
      // Strict rule: If tab is hidden (background), use shorter timeout.
      const currentLimit = document.hidden ? TIMEOUT_BACKGROUND_MS : TIMEOUT_FOREGROUND_MS;
      
      if (elapsed > currentLimit) {
        console.log(`User inactive for ${(elapsed/60000).toFixed(1)}m (Limit: ${currentLimit/60000}m). Logging out...`);
        handleLogout();
      }
    };

    // Events to monitor for activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttled event handler to prevent excessive localStorage writes
    let lastThrottled = 0;
    const handleEvent = () => {
        const now = Date.now();
        // Only update localStorage max once every 5 seconds to avoid performance hit
        if (now - lastThrottled > 5000) { 
            updateActivity();
            lastThrottled = now;
        }
    };

    // Handle Tab Switching / Visibility Changes
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            // Tab just became visible (User switched back to App Tab)
            // Check if they violated the 15-minute background rule while away
            const lastActive = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
            const now = Date.now();
            
            if (now - lastActive > TIMEOUT_BACKGROUND_MS) {
                console.log("Returned after background timeout (>15m). Logging out...");
                handleLogout();
            } else {
                // Safe to continue, update activity so they don't get hit by the 30m rule instantly if close
                updateActivity();
            }
        }
    };

    // Setup listeners
    events.forEach(event => window.addEventListener(event, handleEvent));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup periodic check (every 1 minute)
    const intervalId = setInterval(checkInactivity, 60 * 1000); 

    return () => {
      events.forEach(event => window.removeEventListener(event, handleEvent));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user, handleLogout]);

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

  // --- RENDER HELPERS ---
  // ConvexProvider is now at root level in main.jsx, so hooks work everywhere
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>;
  if (!user) return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} />;
  if (user && !userData) return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} />;

  // React Router handles all routing - no need for custom render logic

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
                        isStaff={userData.accountTypes?.includes('Instructor')} 
                        isAdmin={userData.accountTypes?.includes('Admin')} 
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
                      // Set the pending chat target so ChatInterface can auto-open the conversation
                      setPendingChatTarget({ uid: targetId, name: targetName });
                      setActiveTab('messages');
                  }}
              />
          )}
        </AnimatePresence>
      </div>
    </SchoolProvider>
  );

  // ConvexProvider is now at root level in main.jsx
  // ErrorBoundary is also at root, so we just return the app content
  return appContent;
}
