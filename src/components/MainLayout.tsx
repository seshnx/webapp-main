import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SchoolProvider } from '../contexts/SchoolContext';
// These queries should eventually be migrated to Convex
import { updateProfile, getSubProfiles, getWalletBalance, getBookingCount } from '../config/neonQueries';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './shared/ErrorBoundary';
import MobileBottomNav from './MobileBottomNav';

// =====================================================
// TYPE DEFINITIONS
// =====================================================
interface User {
  id: string;
  [key: string]: any;
}

interface UserData {
  _id?: string; // Convex ID
  id?: string;  // Legacy ID
  activeProfileRole?: string;
  settings?: {
    ui?: {
      showBreadcrumbs?: boolean;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

interface MainLayoutProps {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  darkMode: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
  onRoleSwitch?: (newRole: string) => void;
}

// =====================================================
// LAZY LOADED COMPONENTS
// =====================================================
const retryLazyLoad = (importFn: () => Promise<any>, retries = 3, delay = 100) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (attemptNumber: number) => {
        try {
          const promise = importFn();
          if (promise && typeof promise.then === 'function') {
            promise
              .then((module) => resolve(module.default ? module : { default: module }))
              .catch((error) => {
                if (attemptNumber < retries) {
                  setTimeout(() => attempt(attemptNumber + 1), delay * (attemptNumber + 1));
                } else {
                  reject(error);
                }
              });
          } else {
            resolve(promise);
          }
        } catch (error) {
          if (attemptNumber < retries) {
            setTimeout(() => attempt(attemptNumber + 1), delay * (attemptNumber + 1));
          } else {
            reject(error);
          }
        }
      };
      attempt(0);
    });
  });
};

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

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function MainLayout({
  user,
  userData,
  loading,
  darkMode,
  toggleTheme,
  handleLogout,
  onRoleSwitch
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active tab from URL
  const getTabFromPath = (path: string): string => {
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
    if (path.startsWith('/edu-')) return path.substring(1).split('/')[0];
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [subProfiles, setSubProfiles] = useState<Record<string, any>>({});
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [pendingChatTarget, setPendingChatTarget] = useState<any>(null);

  // Sync tab state with URL
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Load supplemental data based on Convex or Clerk ID
  const internalUserId = userData?._id || userData?.id || user?.id; //

  const loadSupplementalData = useCallback(async () => {
    if (!internalUserId) return;
    try {
      const [profiles, balance, count] = await Promise.all([
        getSubProfiles(internalUserId),
        getWalletBalance(internalUserId),
        getBookingCount(internalUserId)
      ]);

      const profileMap: Record<string, any> = {};
      profiles?.forEach((p: any) => { profileMap[p.account_type] = p; });
      setSubProfiles(profileMap);
      setTokenBalance(balance || 0);
      setBookingCount(count || 0);
    } catch (err) {
      console.warn('Supplemental data load failed');
    }
  }, [internalUserId]);

  useEffect(() => {
    loadSupplementalData();
  }, [loadSupplementalData]);

  const handleRoleSwitch = async (newRole: string) => {
    if (!internalUserId) return;
    try {
      await updateProfile(internalUserId, { active_role: newRole });
      onRoleSwitch?.(newRole);
    } catch (e) {
      console.error("Role switch failed:", e);
    }
  };

  const renderContent = () => {
    // FIXED GUARD: Don't hang if userData is fetching but we have a loading state
    if (loading && !userData) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary name="Dashboard">
            <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
              <Dashboard
                user={user}
                userData={userData}
                setActiveTab={setActiveTab}
                bookingCount={bookingCount}
                subProfiles={subProfiles}
                tokenBalance={tokenBalance}
              />
            </Suspense>
          </ErrorBoundary>
        );
      case 'feed':
      case 'social':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <SocialFeed user={user} userData={userData} subProfiles={subProfiles} openPublicProfile={(uid: string, name: string) => setViewingProfile({ uid, name })} />
          </Suspense>
        );
      case 'messages':
      case 'chat':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ChatInterface user={user} userData={userData} subProfiles={subProfiles} pendingChatTarget={pendingChatTarget} clearPendingChatTarget={() => setPendingChatTarget(null)} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ProfileManager user={user} userData={userData} subProfiles={subProfiles} handleLogout={handleLogout} onRoleSwitch={handleRoleSwitch} onSubProfileUpdate={loadSupplementalData} />
          </Suspense>
        );
      // ... Add other cases as needed following this pattern
      default:
        return <div className="p-8 text-center text-gray-500">Feature coming soon</div>;
    }
  };

  return (
    <SchoolProvider user={user} userData={userData}>
      {/* Explicit dark class application ensures theme toggle works immediately */}
      <div className={`relative h-screen overflow-hidden ${darkMode ? 'dark bg-[#1a1d21]' : 'bg-gray-50'}`}>
        
        {/* Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar
            user={{ id: user?.id }}
            userData={userData as any}
            subProfiles={subProfiles}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onRoleSwitch={handleRoleSwitch}
            showBreadcrumbs={userData?.settings?.ui?.showBreadcrumbs === true}
          />
        </div>

        {/* Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <Sidebar
            userData={userData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleLogout={handleLogout}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-16 h-full lg:pl-64">
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 px-4 pt-4">
            {renderContent()}
          </main>
        </div>

        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Public Profile Modal */}
        {viewingProfile && (
          <PublicProfileModal
            userId={viewingProfile.uid}
            currentUser={user}
            currentUserData={userData}
            onClose={() => setViewingProfile(null)}
            onMessage={(uid: string, name: string) => {
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
