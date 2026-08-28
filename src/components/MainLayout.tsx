import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SchoolProvider } from '../contexts/SchoolContext';
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
  _id?: string;
  clerkId?: string;
  activeRole?: string;
  subProfiles?: Record<string, any>;
  bookingCount?: number;
  tokenBalance?: number;
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
const TalentBookingModal = retryLazyLoad(() => import('./TalentBookingModal'));

// ACTIVE MODULES: Bookings, Settings (in AppRoutes), Profile, Social Feed
const SocialFeed = retryLazyLoad(() => import('./SocialFeed'));
const ProfileManager = retryLazyLoad(() => import('./ProfileManager'));
const BookingSystem = retryLazyLoad(() => import('./BookingSystem'));

// RE-ENABLED MODULES
const ChatInterface = retryLazyLoad(() => import('./ChatInterface'));
const Marketplace = retryLazyLoad(() => import('./Marketplace'));
const TechServices = retryLazyLoad(() => import('./TechServices'));
const PaymentsManager = retryLazyLoad(() => import('./PaymentsManager'));
const BusinessCenter = retryLazyLoad(() => import('./BusinessCenter'));
const LegalDocs = retryLazyLoad(() => import('./LegalDocs'));
const FloatingChatWidget = retryLazyLoad(() => import('./chat/FloatingChatWidget'));
const DeviceFontPrompt = retryLazyLoad(() => import('./shared/DeviceFontPrompt'));
const SharedPostModal = retryLazyLoad(() => import('./social/SharedPostModal'));
const CreatorStudioPage = retryLazyLoad(() => import('./studio/CreatorStudioPage'));
// const LabelDashboard = retryLazyLoad(() => import('./labels/LabelDashboard'));
// const EduStudentDashboard = retryLazyLoad(() => import('./EDU/EduStudentDashboard'));
// const EduInternDashboard = retryLazyLoad(() => import('./EDU/EduInternDashboard'));
// const EduStaffDashboard = retryLazyLoad(() => import('./EDU/EduStaffDashboard'));
// const EduAdminDashboard = retryLazyLoad(() => import('./EDU/EduAdminDashboard'));

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function MainLayout({
  user,
  userData,
  loading,
  darkMode,
  toggleTheme,
  handleLogout
}: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Convex Mutation for switching roles
  const updateRole = useMutation(api.users.updateAccountTypes);

  // Helper to determine active tab from URL
  const getTabFromPath = (path: string): string => {
    if (path.startsWith('/messages') || path.startsWith('/chat')) return 'messages';
    if (path.startsWith('/creator-studio') || path.startsWith('/studio-dashboard') || path.startsWith('/bookings')) return 'creator-studio';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/tech')) return 'tech';
    if (path.startsWith('/payments') || path.startsWith('/billing')) return 'payments';
    if (path.startsWith('/business-center') || path.startsWith('/studio-manager')) return 'business-center';
    if (path.startsWith('/dashboard') || path === '/home') return 'dashboard';
    if (path.startsWith('/legal')) return 'legal';
    if (path.startsWith('/edu-student')) return 'edu-student';
    if (path.startsWith('/edu-intern')) return 'edu-intern';
    if (path.startsWith('/edu-staff')) return 'edu-staff';
    if (path.startsWith('/edu-admin')) return 'edu-admin';
    if (path.startsWith('/edu')) return 'edu-overview';
    if (path.startsWith('/feed') || path === '/social' || path === '/' || path.startsWith('/post/') || path.startsWith('/p/')) return 'feed';
    return 'feed';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [pendingChatTarget, setPendingChatTarget] = useState<any>(null);
  const [talentBooking, setTalentBooking] = useState<{ talentClerkId: string; profile: any } | null>(null);

  // Detect shared post from path (/post/:id or /p/:id) or post-login pending state
  const sharedPostId = useMemo(() => {
    const match = location.pathname.match(/^\/(?:post|p)\/([^/?#]+)/);
    if (match) return match[1];
    const pending = sessionStorage.getItem('seshnx_pending_post_modal');
    return pending || null;
  }, [location.pathname]);

  // Sync tab state with URL
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleRoleSwitch = useCallback(async (newRole: string) => {
    if (!user?.id || !userData?.accountTypes) return;
    try {
      await updateRole({ 
        clerkId: user.id, 
        accountTypes: userData.accountTypes,
        activeRole: newRole 
      });
    } catch (e) {
      console.error("Role switch failed:", e);
    }
  }, [user?.id, userData?.accountTypes, updateRole]);

  const navbarUser = useMemo(() => ({ id: user?.id }), [user?.id]);

  const renderContent = () => {
    // Non-blocking loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-brand-blue" size={32} />
        </div>
      );
    }

    const subProfiles = userData?.subProfiles || {};

    switch (activeTab) {
      case 'feed':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <SocialFeed
              user={user}
              userData={userData}
              subProfiles={subProfiles}
              openPublicProfile={(uid: string) => setViewingProfile({ uid, name: '' })}
            />
          </Suspense>
        );
      case 'dashboard':
        const DashboardComponent = retryLazyLoad(() => import('./Dashboard'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <DashboardComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
              openPublicProfile={(uid: string) => setViewingProfile({ uid, name: '' })}
            />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ProfileManager user={user} userData={userData} />
          </Suspense>
        );
      case 'studio-manager':
        const StudioManagerComponent = retryLazyLoad(() => import('./StudioManager'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <StudioManagerComponent
              user={user}
              userData={userData}
            />
          </Suspense>
        );
      case 'messages':
      case 'chat':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ChatInterface
              user={user}
              userData={userData}
              subProfiles={subProfiles}
              openPublicProfile={(uid: string) => setViewingProfile({ uid, name: '' })}
              pendingChatTarget={pendingChatTarget}
              clearPendingChatTarget={() => setPendingChatTarget(null)}
            />
          </Suspense>
        );
      case 'marketplace':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <Marketplace user={user} userData={userData} />
          </Suspense>
        );
      case 'tech':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <TechServices user={user} userData={userData} openPublicProfile={(uid: string) => setViewingProfile({ uid, name: '' })} />
          </Suspense>
        );
      case 'payments':
      case 'billing':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <PaymentsManager user={user} userData={userData} />
          </Suspense>
        );
      case 'business-center':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <BusinessCenter user={user} userData={userData} />
          </Suspense>
        );
      case 'creator-studio':
      case 'studio-dashboard':
      case 'bookings':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <CreatorStudioPage
              user={user}
              userData={userData}
              openPublicProfile={(uid: string) => setViewingProfile({ uid, name: '' })}
              setPendingChatTarget={setPendingChatTarget}
            />
          </Suspense>
        );
      case 'legal':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <LegalDocs user={user} userData={userData} />
          </Suspense>
        );
      // MODULES ON HOLD
      case 'edu-student':
      case 'edu-intern':
      case 'edu-staff':
      case 'edu-admin':
        return (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">Education Module On Hold</p>
            <p className="text-sm">The education portal is currently on hold. Please use Bookings, Marketplace, Tech Services, or Social Feed.</p>
          </div>
        );
      default:
        // Only show this if they navigate to a URL that truly doesn't exist
        return <div className="p-8 text-center text-gray-500">Module coming soon or not found.</div>;
    }
  };

  return (
    <SchoolProvider user={user} userData={userData as any}>
      <div className={`relative h-screen overflow-hidden ${darkMode ? 'dark bg-[#1a1d21]' : 'bg-gray-50'}`}>
        
        {/* Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar
            user={navbarUser}
            userData={userData as any}
            subProfiles={userData?.subProfiles || {}}
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
        <div className="flex-1 flex flex-col pt-16 h-full xl:pl-64">
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
            onBook={(talentClerkId: string, profile: any) => {
              setTalentBooking({ talentClerkId, profile });
              setViewingProfile(null);
            }}
          />
        )}

        {/* Talent Booking Modal */}
        {talentBooking && user?.id && (
          <Suspense fallback={null}>
            <TalentBookingModal
              talentClerkId={talentBooking.talentClerkId}
              talentProfile={talentBooking.profile}
              clientClerkId={user.id}
              onClose={() => setTalentBooking(null)}
              onSuccess={() => setTalentBooking(null)}
            />
          </Suspense>
        )}
        {/* Floating Chat Widget */}
        <Suspense fallback={null}>
          <FloatingChatWidget user={user} userData={userData} />
        </Suspense>

        {/* Device Large Font Size Alert Prompt */}
        <Suspense fallback={null}>
          <DeviceFontPrompt userId={user?.id} />
        </Suspense>

        {/* Shared Post Modal (Direct URL /post/:id or /p/:id) */}
        {sharedPostId && (
          <Suspense fallback={null}>
            <SharedPostModal
              postId={sharedPostId}
              currentUser={user}
              currentUserData={userData}
              onClose={() => {
                sessionStorage.removeItem('seshnx_pending_post_modal');
                if (location.pathname.startsWith('/post/') || location.pathname.startsWith('/p/')) {
                  navigate('/feed', { replace: true });
                }
              }}
              openPublicProfile={(uid: string) => setViewingProfile({ uid, name: '' })}
            />
          </Suspense>
        )}
      </div>
    </SchoolProvider>
  );
}
