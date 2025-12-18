import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SchoolProvider } from '../contexts/SchoolContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import SocialFeed from './SocialFeed';
import ChatInterface from './ChatInterface';
import BookingSystem from './BookingSystem';
import Marketplace from './Marketplace';
import TechServices from './TechServices';
import PaymentsManager from './PaymentsManager';
import ProfileManager from './ProfileManager';
import BusinessCenter from './BusinessCenter';
import LegalDocs from './LegalDocs';
import PublicProfileModal from './PublicProfileModal';
import { supabase } from '../config/supabase';

// EDU Components
import EduStudentDashboard from './EDU/EduStudentDashboard';
import EduInternDashboard from './EDU/EduInternDashboard';
import EduStaffDashboard from './EDU/EduStaffDashboard';
import EduAdminDashboard from './EDU/EduAdminDashboard';

export default function MainLayout({ 
  user, 
  userData, 
  loading, 
  darkMode, 
  toggleTheme, 
  handleLogout 
}) {
  // Helper function to get tab from pathname
  const getTabFromPath = (path) => {
    if (path === '/') return 'dashboard';
    if (path === '/feed' || path === '/social') return 'feed';
    if (path === '/messages' || path === '/chat') return 'messages';
    if (path === '/bookings') return 'bookings';
    if (path === '/marketplace') return 'marketplace';
    if (path === '/tech') return 'tech';
    if (path === '/payments' || path === '/billing') return 'payments';
    if (path === '/profile') return 'profile';
    if (path === '/business-center') return 'business-center';
    if (path === '/legal') return 'legal';
    if (path === '/studio-ops') return 'studio-ops';
    if (path.startsWith('/edu-')) return path.substring(1);
    return 'dashboard'; // default
  };

  // Initialize activeTab from current pathname
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subProfiles, setSubProfiles] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [pendingChatTarget, setPendingChatTarget] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track if we're initializing to prevent navigation loops
  const isInitializingRef = useRef(true);
  // Track if activeTab change came from pathname (to prevent navigation loop)
  const fromPathnameRef = useRef(false);
  // Track previous pathname to detect actual changes
  const prevPathnameRef = useRef(location.pathname);
  // Track if user is currently navigating (to prevent pathname sync from overriding)
  const isNavigatingRef = useRef(false);

  // Sync activeTab with route (pathname is source of truth)
  useEffect(() => {
    const path = location.pathname;
    
    // Only sync if pathname actually changed (not just a re-render)
    if (prevPathnameRef.current === path) {
      // Still mark initialization as complete even if pathname didn't change
      if (isInitializingRef.current) {
        isInitializingRef.current = false;
      }
      return;
    }
    
    prevPathnameRef.current = path;
    const newTab = getTabFromPath(path);
    
    // If we were navigating, this is the completion of that navigation
    // Reset the flag and update activeTab
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
    }
    
    // Always update from pathname (pathname is source of truth)
    // Use functional update to compare against latest state
    setActiveTab(prevTab => {
      if (prevTab !== newTab) {
        fromPathnameRef.current = true; // Mark that this change came from pathname
        return newTab;
      }
      return prevTab; // No change needed
    });
    
    // Mark initialization as complete after first sync
    if (isInitializingRef.current) {
      isInitializingRef.current = false;
    }
  }, [location.pathname]); // Only depend on pathname

  // Update URL when tab changes (only if user-initiated, not from pathname sync)
  useEffect(() => {
    // Skip navigation during initialization
    if (isInitializingRef.current) {
      return;
    }
    
    // Skip navigation if the change came from pathname sync
    if (fromPathnameRef.current) {
      fromPathnameRef.current = false; // Reset flag
      return;
    }
    
    const tabRoutes = {
      'dashboard': '/',
      'feed': '/feed',
      'messages': '/messages',
      'bookings': '/bookings',
      'marketplace': '/marketplace',
      'tech': '/tech',
      'payments': '/payments',
      'profile': '/profile',
      'business-center': '/business-center',
      'legal': '/legal',
      'edu-student': '/edu-student',
      'edu-intern': '/edu-intern',
      'edu-overview': '/edu-overview',
      'edu-admin': '/edu-admin',
      'studio-ops': '/studio-ops',
    };

    const route = tabRoutes[activeTab];
    // Only navigate if route exists and pathname doesn't match
    if (route && location.pathname !== route) {
      isNavigatingRef.current = true; // Mark that we're navigating
      navigate(route, { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  // Load sub-profiles
  useEffect(() => {
    if (!user?.id || !supabase) return;

    const loadSubProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('sub_profiles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.warn('Error loading sub-profiles:', error);
          return;
        }

        const profiles = {};
        data?.forEach(profile => {
          profiles[profile.role] = profile;
        });
        setSubProfiles(profiles);
      } catch (err) {
        console.error('Failed to load sub-profiles:', err);
      }
    };

    loadSubProfiles();
  }, [user?.id]);

  // Load token balance
  useEffect(() => {
    if (!user?.id || !supabase) return;

    const loadBalance = async () => {
      try {
        const { data } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setTokenBalance(data.balance || 0);
        }
      } catch (err) {
        console.warn('Failed to load token balance:', err);
      }
    };

    loadBalance();
  }, [user?.id]);

  const handleRoleSwitch = async (newRole) => {
    if (!user || !supabase) return;
    
    // Optimistic update
    const updatedUserData = { ...userData, activeProfileRole: newRole };
    
    try {
      await supabase
        .from('profiles')
        .update({ active_role: newRole, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch (e) {
      console.error("Role switch failed:", e);
    }
  };

  const openPublicProfile = (uid, name) => {
    setViewingProfile({ uid, name });
  };

  const clearPendingChatTarget = () => {
    setPendingChatTarget(null);
  };

  // Determine which content to render based on activeTab (memoized to prevent remounts)
  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            userData={userData}
            setActiveTab={setActiveTab}
            bookingCount={0}
            subProfiles={subProfiles}
            tokenBalance={tokenBalance}
          />
        );

      case 'feed':
      case 'social':
        return (
          <SocialFeed
            user={user}
            userData={userData}
            openPublicProfile={openPublicProfile}
          />
        );

      case 'messages':
      case 'chat':
        return (
          <ChatInterface
            user={user}
            userData={userData}
            openPublicProfile={openPublicProfile}
            pendingChatTarget={pendingChatTarget}
            clearPendingChatTarget={clearPendingChatTarget}
          />
        );

      case 'bookings':
        return (
          <BookingSystem
            user={user}
            userData={userData}
            subProfiles={subProfiles}
          />
        );

      case 'marketplace':
        return (
          <Marketplace
            user={user}
            userData={userData}
            tokenBalance={tokenBalance}
          />
        );

      case 'tech':
        return (
          <TechServices
            user={user}
            userData={userData}
            openPublicProfile={openPublicProfile}
          />
        );

      case 'payments':
      case 'billing':
        return (
          <PaymentsManager
            user={user}
            userData={userData}
            tokenBalance={tokenBalance}
          />
        );

      case 'profile':
        return (
          <ProfileManager
            user={user}
            userData={userData}
            subProfiles={subProfiles}
            handleLogout={handleLogout}
            openPublicProfile={openPublicProfile}
          />
        );

      case 'business-center':
        return (
          <BusinessCenter
            user={user}
            userData={userData}
          />
        );

      case 'legal':
        return <LegalDocs />;

      case 'edu-student':
        return (
          <EduStudentDashboard
            user={user}
            userData={userData}
          />
        );

      case 'edu-intern':
        return (
          <EduInternDashboard
            user={user}
            userData={userData}
          />
        );

      case 'edu-overview':
        return (
          <EduStaffDashboard
            user={user}
            userData={userData}
          />
        );

      case 'edu-admin':
        return (
          <EduAdminDashboard
            user={user}
            userData={userData}
          />
        );

      case 'studio-ops':
        // Studio operations are handled within BusinessCenter
        return (
          <BusinessCenter
            user={user}
            userData={userData}
          />
        );

      default:
        return (
          <Dashboard
            user={user}
            userData={userData}
            setActiveTab={setActiveTab}
            bookingCount={0}
            subProfiles={subProfiles}
            tokenBalance={tokenBalance}
          />
        );
    }
  }, [activeTab, user, userData, subProfiles, tokenBalance, pendingChatTarget, viewingProfile, handleLogout, setActiveTab, openPublicProfile, clearPendingChatTarget]);

  return (
    <SchoolProvider user={user} userData={userData}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#1a1d21]">
        {/* Sidebar */}
        <Sidebar
          userData={userData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          user={user}
          userData={userData}
          subProfiles={subProfiles}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onRoleSwitch={handleRoleSwitch}
          openPublicProfile={openPublicProfile}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent}
        </main>
      </div>

        {/* Public Profile Modal */}
        {viewingProfile && (
          <PublicProfileModal
            userId={viewingProfile.uid}
            currentUser={user}
            currentUserData={userData}
            onClose={() => setViewingProfile(null)}
            onMessage={(uid, name) => {
              setPendingChatTarget({ uid, name });
              setActiveTab('messages');
              setViewingProfile(null);
            }}
          />
        )}
      </div>
    </SchoolProvider>
  );
}

