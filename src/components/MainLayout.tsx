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

// ENABLED MODULES - All modules now active
const Dashboard = retryLazyLoad(() => import('./Dashboard'));
const ChatInterface = retryLazyLoad(() => import('./ChatInterface'));
const Marketplace = retryLazyLoad(() => import('./Marketplace'));
const TechServices = retryLazyLoad(() => import('./TechServices'));
const PaymentsManager = retryLazyLoad(() => import('./PaymentsManager'));
const BusinessCenter = retryLazyLoad(() => import('./BusinessCenter'));
const LegalDocs = retryLazyLoad(() => import('./LegalDocs'));
const LabelDashboard = retryLazyLoad(() => import('./labels/LabelDashboard'));
const EduStudentDashboard = retryLazyLoad(() => import('./EDU/EduStudentDashboard'));
const EduInternDashboard = retryLazyLoad(() => import('./EDU/EduInternDashboard'));
const EduStaffDashboard = retryLazyLoad(() => import('./EDU/EduStaffDashboard'));
const EduAdminDashboard = retryLazyLoad(() => import('./EDU/EduAdminDashboard'));

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
    // ALL MODULES NOW ACTIVE
    if (path.startsWith('/feed') || path === '/social' || path === '/') return 'feed';
    if (path.startsWith('/bookings')) return 'bookings';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/messages') || path.startsWith('/chat')) return 'messages';
    if (path === '/home') return 'dashboard';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/studio-manager')) return 'studio-manager';
    if (path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/tech')) return 'tech';
    if (path.startsWith('/payments') || path.startsWith('/billing')) return 'payments';
    if (path.startsWith('/business-center')) return 'business-center';
    if (path.startsWith('/legal')) return 'legal';
    if (path.startsWith('/labels') || path.startsWith('/studio-ops')) return 'labels';
    if (path.startsWith('/edu-student')) return 'edu-student';
    if (path.startsWith('/edu-intern')) return 'edu-intern';
    if (path.startsWith('/edu-staff')) return 'edu-staff';
    if (path.startsWith('/edu-admin')) return 'edu-admin';
    return 'feed';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(location.pathname));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [pendingChatTarget, setPendingChatTarget] = useState<any>(null);
  const [talentBooking, setTalentBooking] = useState<{ talentClerkId: string; profile: any } | null>(null);

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
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
        </div>
      );
    }

    const subProfiles = userData?.subProfiles || {};
    const bookingCount = userData?.bookingCount || 0;
    const tokenBalance = userData?.tokenBalance || 0;

    switch (activeTab) {
      // SOCIAL & PROFILE MODULES
      case 'feed':
      case 'social':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <SocialFeed user={user} userData={userData} subProfiles={subProfiles} openPublicProfile={(uid: string, name: string) => setViewingProfile({ uid, name })} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ProfileManager user={user} userData={userData} subProfiles={subProfiles} handleLogout={handleLogout} onRoleSwitch={handleRoleSwitch} />
          </Suspense>
        );

      // BUSINESS & BOOKING MODULES
      case 'bookings':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <BookingSystem
              user={user}
              userData={userData}
              subProfiles={subProfiles}
              openPublicProfile={(uid: string, name: string) => setViewingProfile({ uid, name })}
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
              setActiveTab={setActiveTab}
              bookingCount={bookingCount}
              tokenBalance={tokenBalance}
            />
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

      // MESSAGING & COMMUNICATION
      case 'messages':
      case 'chat':
        const ChatInterfaceComponent = retryLazyLoad(() => import('./ChatInterface'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ChatInterfaceComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // MARKETPLACE & SERVICES
      case 'marketplace':
        const MarketplaceComponent = retryLazyLoad(() => import('./Marketplace'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <MarketplaceComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'tech':
        const TechServicesComponent = retryLazyLoad(() => import('./TechServices'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <TechServicesComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // PAYMENTS & BILLING
      case 'payments':
      case 'billing':
        const PaymentsManagerComponent = retryLazyLoad(() => import('./PaymentsManager'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <PaymentsManagerComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // BUSINESS & LEGAL
      case 'business-center':
        const BusinessCenterComponent = retryLazyLoad(() => import('./BusinessCenter'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <BusinessCenterComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'legal':
        const LegalDocsComponent = retryLazyLoad(() => import('./LegalDocs'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <LegalDocsComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'labels':
        const LabelDashboardComponent = retryLazyLoad(() => import('./labels/LabelDashboard'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <LabelDashboardComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // EDUCATION MODULES
      case 'edu-student':
        const EduStudentComponent = retryLazyLoad(() => import('./EDU/EduStudentDashboard'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <EduStudentComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'edu-intern':
        const EduInternComponent = retryLazyLoad(() => import('./EDU/EduInternDashboard'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <EduInternComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'edu-staff':
        const EduStaffComponent = retryLazyLoad(() => import('./EDU/EduStaffDashboard'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <EduStaffComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'edu-admin':
        const EduAdminComponent = retryLazyLoad(() => import('./EDU/EduAdminDashboard'));
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <EduAdminComponent
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      default:
        return <div className="p-8 text-center text-gray-500">Module not found or coming soon.</div>;
    }
  };

  return (
    <SchoolProvider user={user} userData={userData}>
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
      </div>
    </SchoolProvider>
  );
}
