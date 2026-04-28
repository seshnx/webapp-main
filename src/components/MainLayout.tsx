import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from "convex/react";
import { api } from "@convex/api";
import { SchoolProvider } from '@/contexts/SchoolContext';
import { Loader2 } from 'lucide-react';
import { detectContextFromPath } from '@/utils/contextDetection';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
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
  children?: React.ReactNode;
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

import {
  Dashboard,
  StudioManager,
  ProfileManager,
  SettingsTab,
  ClientPortal,
  PublicLegalPage,
  StudioKiosk,
  StudioPublicProfile,
  StudioNotFound,
  PlansPage,
  StudioPricingPage,
  SocialFeed,
  BookingSystem,
  ChatInterface,
  Marketplace,
  TechServices,
  PaymentsManager,
  LegalDocs,
  LabelDashboard,
  EduStudentDashboard,
  EduInternDashboard,
  EduStaffDashboard,
  EduAdminDashboard,
  EduSetupWizard
} from '@/routes/lazyComponents';

// Layout & Core components
const Sidebar = retryLazyLoad(() => import('./Sidebar'));
const EDUSidebar = retryLazyLoad(() => import('@/features/edu/components/EDUSidebar'));
const Navbar = retryLazyLoad(() => import('./Navbar'));
const PublicProfileModal = retryLazyLoad(() => import('@/features/profiles/components/PublicProfileModal'));
const TalentBookingModal = retryLazyLoad(() => import('@/features/booking/components/TalentBookingModal'));

// EDU Module components
const EduOverview = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduOverview'));
const EduCourses = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduCourses'));
const EduCourseBuilder = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduCourseBuilder'));
const EduRoster = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduRoster'));
const EduCohorts = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduCohorts'));
const EduAnnouncements = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduAnnouncements'));
const EduLearningPaths = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduLearningPaths'));
const EduResources = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduResources'));
const EduStaff = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduStaff'));
const EduRoles = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduRoles'));
const EduPartners = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduPartners'));
const EduAudit = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduAudit'));
const EduHours = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduHours'));
const EduEvaluations = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduEvaluations'));
const EduSettings = retryLazyLoad(() => import('@/features/edu/components/EDU/modules/EduSettings'));

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
  children
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
    if (path.startsWith('/edu-')) {
      return path.split('/')[1];
    }
    if (path.startsWith('/edu')) return 'edu-overview';
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
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <Dashboard
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
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <StudioManager
              user={user}
              userData={userData}
            />
          </Suspense>
        );

      // MESSAGING & COMMUNICATION
      case 'messages':
      case 'chat':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <ChatInterface
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // MARKETPLACE & SERVICES
      case 'marketplace':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <Marketplace
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'tech':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <TechServices
              user={user}
              userData={userData}
              subProfiles={subProfiles}
              openPublicProfile={(uid: string) => setViewingProfile({ uid, name: 'Technician' })}
            />
          </Suspense>
        );

      // PAYMENTS & BILLING
      case 'payments':
      case 'billing':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <PaymentsManager
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // BUSINESS & LEGAL
      case 'business-center':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <BusinessCenter
              user={user}
              userData={userData}
            />
          </Suspense>
        );
      case 'legal':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <LegalDocs
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );
      case 'labels':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <LabelDashboard
              user={user}
              userData={userData}
              subProfiles={subProfiles}
            />
          </Suspense>
        );

      // EDUCATION MODULES
      case 'edu-student':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <EduStudentDashboard user={user} userData={userData} />
          </Suspense>
        );
      case 'edu-intern':
        return (
          <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
            <EduInternDashboard user={user} userData={userData} />
          </Suspense>
        );
      default:
        // Handle all other edu- routes using the Staff Dashboard as a container
        if (activeTab.startsWith('edu-')) {
          return (
            <Suspense fallback={<Loader2 className="animate-spin m-auto" size={32} />}>
              <EduStaffDashboard
                user={user}
                userData={userData}
                currentView={activeTab}
              />
            </Suspense>
          );
        }
        return null;
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
          {detectContextFromPath(location.pathname) === 'edu' ? (
            <EDUSidebar
              userData={userData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              handleLogout={handleLogout}
            />
          ) : (
            <Sidebar
              userData={userData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              handleLogout={handleLogout}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-16 h-full xl:pl-64">
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 px-4 pt-4">
            <ErrorBoundary>
              {renderContent()}
              {children}
            </ErrorBoundary>
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
