import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SchoolProvider } from '../contexts/SchoolContext';
import { updateProfile } from '../config/neonQueries';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './shared/ErrorBoundary';
import MobileBottomNav from './MobileBottomNav';

// Retry wrapper for lazy loading to handle initialization errors
const retryLazyLoad = (importFn, retries = 3, delay = 100) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (attemptNumber) => {
        // Wrap in try-catch to handle synchronous errors
        try {
          const promise = importFn();
          // If it's already a promise, handle it
          if (promise && typeof promise.then === 'function') {
            promise
              .then((module) => {
                // Ensure we get the default export
                resolve(module.default ? module : { default: module });
              })
              .catch((error) => {
                if (attemptNumber < retries) {
                  console.warn(`Lazy load failed, retrying... (${attemptNumber + 1}/${retries})`, error);
                  setTimeout(() => attempt(attemptNumber + 1), delay * (attemptNumber + 1));
                } else {
                  console.error('Lazy load failed after retries:', error);
                  reject(error);
                }
              });
          } else {
            resolve(promise);
          }
        } catch (error) {
          // Handle synchronous errors (like circular dependencies)
          if (attemptNumber < retries) {
            console.warn(`Lazy load sync error, retrying... (${attemptNumber + 1}/${retries})`, error);
            setTimeout(() => attempt(attemptNumber + 1), delay * (attemptNumber + 1));
          } else {
            console.error('Lazy load failed after retries (sync error):', error);
            reject(error);
          }
        }
      };
      attempt(0);
    });
  });
};

// Lazy load ALL components to prevent initialization errors with retry mechanism
const Sidebar = retryLazyLoad(() => import('./Sidebar'));
const Navbar = retryLazyLoad(() => import('./Navbar'));
const PublicProfileModal = retryLazyLoad(() => import('./PublicProfileModal'));
const Dashboard = retryLazyLoad(() => import('./Dashboard'));
const SocialFeed = retryLazyLoad(() => import('./SocialFeed'));
const ChatInterface = retryLazyLoad(() => import('./ChatInterface'));
const BookingSystem = retryLazyLoad(() => import('./BookingSystem'));
const Marketplace = retryLazyLoad(() => import('./Marketplace'));
const TechServices = retryLazyLoad(() => import('./TechServices'));
const PaymentsManager = retryLazyLoad(() => import('./PaymentsManager'));
const ProfileManager = retryLazyLoad(() => import('./ProfileManager'));
const BusinessCenter = retryLazyLoad(() => import('./BusinessCenter'));
const LegalDocs = retryLazyLoad(() => import('./LegalDocs'));
const EduStudentDashboard = retryLazyLoad(() => import('./EDU/EduStudentDashboard'));
const EduInternDashboard = retryLazyLoad(() => import('./EDU/EduInternDashboard'));
const EduStaffDashboard = retryLazyLoad(() => import('./EDU/EduStaffDashboard'));
const EduAdminDashboard = retryLazyLoad(() => import('./EDU/EduAdminDashboard'));
const LabelDashboard = retryLazyLoad(() => import('./labels/LabelDashboard'));
const ContractManager = retryLazyLoad(() => import('./labels/ContractManager'));

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
  // CRITICAL: Call hooks first before using them in state initializers
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function to get tab from pathname (supports nested routes)
  const getTabFromPath = (path) => {
    if (path === '/dashboard' || path === '/') return 'dashboard';
    if (path.startsWith('/feed') || path === '/social') return 'feed';
    if (path.startsWith('/messages') || path.startsWith('/chat')) return 'messages';
    if (path.startsWith('/bookings')) return 'bookings';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/tech')) return 'tech';
    if (path.startsWith('/payments') || path === '/billing') return 'payments';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/business-center')) return 'business-center';
    if (path === '/legal') return 'legal';
    if (path.startsWith('/studio-ops')) return 'studio-ops';
    if (path.startsWith('/labels')) return 'labels';
    if (path.startsWith('/edu-')) return path.substring(1).split('/')[0]; // Handle nested edu routes
    return 'dashboard'; // default
  };

  // Initialize activeTab from current pathname (now location is available)
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subProfiles, setSubProfiles] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [pendingChatTarget, setPendingChatTarget] = useState(null);
  
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
      'dashboard': '/dashboard',
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
    // Only navigate if route exists and pathname doesn't start with the route
    // This allows nested routes to persist (e.g., /bookings/calendar stays as is)
    if (route && !location.pathname.startsWith(route)) {
      isNavigatingRef.current = true; // Mark that we're navigating
      navigate(route, { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  // Load sub-profiles (optional - doesn't block the app if it fails)
  useEffect(() => {
    if (!user?.id) return;

    const loadSubProfiles = async () => {
      try {
        const response = await fetch(`/api/user/sub-profiles/${user.id}`);
        const result = await response.json();

        if (!response.ok) {
          console.warn('Sub-profiles API not available:', result.error);
          setSubProfiles({});
          return;
        }

        const profiles = {};
        result.data?.forEach(profile => {
          profiles[profile.account_type] = profile;
        });
        setSubProfiles(profiles);
      } catch (err) {
        console.warn('Failed to load sub-profiles (non-critical):', err?.message || err);
        setSubProfiles({});
      }
    };

    loadSubProfiles();
  }, [user?.id]);

  // Load token balance (optional - doesn't block the app if it fails)
  useEffect(() => {
    if (!user?.id) return;

    const loadBalance = async () => {
      try {
        const response = await fetch(`/api/user/wallets/${user.id}`);
        const result = await response.json();

        if (!response.ok) {
          console.warn('Wallets API not available:', result.error);
          setTokenBalance(0);
          return;
        }

        if (result.data) {
          setTokenBalance(result.data.balance || 0);
        }
      } catch (err) {
        console.warn('Failed to load token balance (non-critical):', err?.message || err);
        setTokenBalance(0);
      }
    };

    loadBalance();
  }, [user?.id]);

  const handleRoleSwitch = async (newRole) => {
    if (!user?.id) return;

    try {
      // Update active_role in Neon database
      await updateProfile(user.id, {
        active_role: newRole
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        activeProfileRole: newRole
      }));

      console.log(`✅ Role switched to: ${newRole}`);
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
            <Suspense 
              fallback={<LoadingFallback />}
              // Add error boundary inside Suspense to catch initialization errors
            >
              <ErrorBoundary name="Dashboard-Inner">
                <Dashboard
                  user={user}
                  userData={userData}
                  setActiveTab={setActiveTab}
                  bookingCount={0}
                  subProfiles={subProfiles}
                  tokenBalance={tokenBalance}
                />
              </ErrorBoundary>
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
              openPublicProfile={openPublicProfile}
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

      case 'labels':
        // Handle nested routes for labels (dashboard, contracts, campaigns)
        const labelsPath = location.pathname.split('/')[2];
        if (labelsPath === 'contracts') {
          return (
            <Suspense fallback={<LoadingFallback />}>
              <ContractManager
                user={user}
                userData={userData}
              />
            </Suspense>
          );
        }
        // Default to label dashboard
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LabelDashboard
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
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 px-fluid pt-4">
          {renderContent()}
        </main>
      </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

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

