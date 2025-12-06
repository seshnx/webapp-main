import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { app, appId } from './config/firebase';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EDUSidebar from './components/EDUSidebar';
import Dashboard from './components/Dashboard';
import AuthWizard from './components/AuthWizard';
import SocialFeed from './components/SocialFeed';
import BookingSystem from './components/BookingSystem';
import Marketplace from './components/Marketplace';
import ChatInterface from './components/ChatInterface';
import StudioManager from './components/StudioManager';
import ProfileManager from './components/ProfileManager';
import SettingsTab from './components/SettingsTab';
import PublicProfileModal from './components/PublicProfileModal';
import TechServices from './components/TechServices';
import LegalDocs from './components/LegalDocs';
import PaymentsManager from './components/PaymentsManager';
import LabelManager from './components/LabelManager';

// EDU Components
import EduStudentDashboard from './components/EDU/EduStudentDashboard';
import EduStaffDashboard from './components/EDU/EduStaffDashboard';
import EduAdminDashboard from './components/EDU/EduAdminDashboard';
import EduInternDashboard from './components/EDU/EduInternDashboard'; 
import StudentEnrollment from './components/EDU/StudentEnrollment';

import { SchoolProvider } from './contexts/SchoolContext';
import PageTransition from './components/shared/PageTransition';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [subProfiles, setSubProfiles] = useState({}); 
  const [notifications, setNotifications] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // --- NAVIGATION SYNC ENGINE ---
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'dashboard'; 
    }
    return 'dashboard';
  });

  const setActiveTab = (newTab) => {
    setActiveTabState(newTab);
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== newTab) {
        const newUrl = `${window.location.pathname}?tab=${newTab}`;
        window.history.pushState({ tab: newTab }, '', newUrl);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || 'dashboard';
        setActiveTabState(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  // --- END NAVIGATION SYNC ---

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

  // --- RENDER HELPERS ---
  // ConvexProvider is now at root level in main.jsx, so hooks work everywhere
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1d21]"><Loader2 className="animate-spin text-brand-blue" size={48} /></div>;
  if (!user) return <AuthWizard darkMode={darkMode} toggleTheme={toggleTheme} />;
  if (user && !userData) return <AuthWizard user={user} isNewUser={true} darkMode={darkMode} toggleTheme={toggleTheme} />;

  // Render Logic
  const renderContent = () => {
    // 1. EDU Routing (Handles all edu-* sub-routes)
    if (activeTab.startsWith('edu-')) {
        if (activeTab === 'edu-enroll') return <StudentEnrollment user={user} userData={userData} />;
        
        if (userData?.accountTypes?.includes('Admin')) {
            return <EduAdminDashboard user={user} userData={userData} currentView={activeTab} />;
        }
        if (userData?.accountTypes?.includes('Instructor')) {
            return <EduStaffDashboard user={user} userData={userData} currentView={activeTab} />;
        }
        if (userData?.accountTypes?.includes('Intern')) {
            return <EduInternDashboard user={user} userData={userData} currentView={activeTab} />;
        }
        return <EduStudentDashboard user={user} userData={userData} />;
    }

    // 2. Main App Routing
    switch (activeTab) {
      case 'dashboard': 
      case 'home': 
        return <Dashboard 
                  user={user} 
                  userData={userData} 
                  subProfiles={subProfiles} 
                  notifications={notifications} 
                  setActiveTab={setActiveTab} 
                  tokenBalance={tokenBalance}
                />;
      
      case 'feed': 
      case 'social': 
        return <SocialFeed user={user} userData={userData} openPublicProfile={openPublicProfile} />;
      
      case 'bookings': 
      case 'find-talent': 
        return <BookingSystem user={user} userData={userData} openPublicProfile={openPublicProfile} />;
      
      case 'marketplace': return <Marketplace user={user} userData={userData} tokenBalance={tokenBalance} />;
      case 'messages': return <ChatInterface user={user} userData={userData} openPublicProfile={openPublicProfile} />;
      case 'tech': return <TechServices user={user} userData={userData} />;
      
      // FIX: Match the ID used in Sidebar ('studio-ops')
      case 'studio-ops': 
      case 'studio-manager': // Fallback
        return <StudioManager user={user} userData={userData} />;
      
      case 'label-manager': return <LabelManager user={user} userData={userData} />;
      case 'payments': return <PaymentsManager user={user} userData={userData} />;
      
      case 'profile': return <ProfileManager user={user} userData={userData} subProfiles={subProfiles} handleLogout={handleLogout} />;
      case 'settings': return <SettingsTab user={user} userData={userData} handleLogout={handleLogout} />;
      case 'legal': return <LegalDocs />;

      default: return <Dashboard user={user} userData={userData} setActiveTab={setActiveTab} subProfiles={subProfiles} notifications={notifications} />;
    }
  };

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
                <AnimatePresence mode="wait">
                    <PageTransition key={activeTab} className="max-w-7xl mx-auto">
                        {renderContent()}
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
      </div>
    </SchoolProvider>
  );

  // ConvexProvider is now at root level in main.jsx
  // ErrorBoundary is also at root, so we just return the app content
  return appContent;
}
