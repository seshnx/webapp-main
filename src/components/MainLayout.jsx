import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SchoolProvider } from '../contexts/SchoolContext';
import { supabase } from '../config/supabase';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './shared/ErrorBoundary';

// Lazy load ALL components to prevent initialization errors
const Sidebar = lazy(() => import('./Sidebar'));
const Navbar = lazy(() => import('./Navbar'));
const PublicProfileModal = lazy(() => import('./PublicProfileModal'));
const Dashboard = lazy(() => import('./Dashboard'));
const SocialFeed = lazy(() => import('./SocialFeed'));
const ChatInterface = lazy(() => import('./ChatInterface'));
const BookingSystem = lazy(() => import('./BookingSystem'));
const Marketplace = lazy(() => import('./Marketplace'));
const TechServices = lazy(() => import('./TechServices'));
const PaymentsManager = lazy(() => import('./PaymentsManager'));
const ProfileManager = lazy(() => import('./ProfileManager'));
const BusinessCenter = lazy(() => import('./BusinessCenter'));
const LegalDocs = lazy(() => import('./LegalDocs'));
const EduStudentDashboard = lazy(() => import('./EDU/EduStudentDashboard'));
const EduInternDashboard = lazy(() => import('./EDU/EduInternDashboard'));
const EduStaffDashboard = lazy(() => import('./EDU/EduStaffDashboard'));
const EduAdminDashboard = lazy(() => import('./EDU/EduAdminDashboard'));

// Shared loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="animate-spin text-brand-blue" size={24} />
  </div>
);

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

  const openPublicProfile = useCallback((uid, name) => {
    setViewingProfile({ uid, name });
  }, []);

  const clearPendingChatTarget = useCallback(() => {
    setPendingChatTarget(null);
  }, []);

  // Determine which content to render based on activeTab
  // Using a function instead of useMemo to avoid hook initialization issues
  const renderContent = () => {
    // Guard: Return loading if userData is not ready
    if (!userData || !userData.id) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    const LoadingFallback = () => (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );

    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary name="Dashboard">
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard
                user={user}
                userData={userData}
                setActiveTab={setActiveTab}
                bookingCount={0}
                subProfiles={subProfiles}
                tokenBalance={tokenBalance}
              />
            </Suspense>
          </ErrorBoundary>
        );

      case 'feed':
      case 'social':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SocialFeed
              user={user}
              userData={userData}
              openPublicProfile={openPublicProfile}
            />
          </Suspense>
        );

      case 'messages':
      case 'chat':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ChatInterface
              user={user}
              userData={userData}
              openPublicProfile={openPublicProfile}
              pendingChatTarget={pendingChatTarget}
              clearPendingChatTarget={clearPendingChatTarget}
            />
          </Suspense>
        );

      case 'bookings':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BookingSystem
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      case 'marketplace':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Marketplace
              user={user}
              userData={userData}
              tokenBalance={tokenBalance}
            />
          </Suspense>
        );

      case 'tech':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TechServices
              user={user}
              userData={userData}
              openPublicProfile={openPublicProfile}
            />
          </Suspense>
        );

      case 'payments':
      case 'billing':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PaymentsManager
              user={user}
              userData={userData}
              tokenBalance={tokenBalance}
            />
          </Suspense>
        );

      case 'profile':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileManager
              user={user}
              userData={userData}
              subProfiles={subProfiles}
              handleLogout={handleLogout}
              openPublicProfile={openPublicProfile}
            />
          </Suspense>
        );

      case 'business-center':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BusinessCenter
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      case 'legal':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LegalDocs />
          </Suspense>
        );

      case 'edu-student':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <EduStudentDashboard
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      case 'edu-intern':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <EduInternDashboard
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      case 'edu-overview':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <EduStaffDashboard
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      case 'edu-admin':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <EduAdminDashboard
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      case 'studio-ops':
        // Studio operations are handled within BusinessCenter
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BusinessCenter
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard
              user={user}
              userData={userData}
              setActiveTab={setActiveTab}
              bookingCount={0}
              subProfiles={subProfiles}
              tokenBalance={tokenBalance}
            />
          </Suspense>
        );
    }
  };

  return (
    <SchoolProvider user={user} userData={userData}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#1a1d21]">
        {/* Sidebar */}
        <Suspense fallback={<LoadingFallback />}>
          <Sidebar
            userData={userData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleLogout={handleLogout}
          />
        </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

        {/* Public Profile Modal */}
        {viewingProfile && (
          <Suspense fallback={null}>
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
          </Suspense>
        )}
      </div>
    </SchoolProvider>
  );
}

