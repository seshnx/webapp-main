import { lazy } from 'react';

// Retry logic for lazy loading
const retryLazyLoad = (fn: () => Promise<any>, retriesLeft = 5, interval = 1500): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }
          retryLazyLoad(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// Define all lazy-loaded components
export const Dashboard = lazy(() => retryLazyLoad(() => import('@/features/dashboard/components/Dashboard')));
export const SocialFeed = lazy(() => retryLazyLoad(() => import('@/features/social/components/SocialFeed')));
export const ChatInterface = lazy(() => retryLazyLoad(() => import('@/features/messages/components/ChatInterface')));
export const ProfileManager = lazy(() => retryLazyLoad(() => import('@/features/profiles/components/ProfileManager')));
export const BookingSystem = lazy(() => retryLazyLoad(() => import('@/features/booking/components/BookingSystem')));
export const Marketplace = lazy(() => retryLazyLoad(() => import('@/features/marketplace/components/Marketplace')));
export const TechServices = lazy(() => retryLazyLoad(() => import('@/features/marketplace/components/TechServices')));
export const StudioManager = lazy(() => retryLazyLoad(() => import('@/features/studio/components/StudioManager')));
export const SettingsTab = lazy(() => retryLazyLoad(() => import('@/features/settings/components/SettingsTab')));
export const LabelDashboard = lazy(() => retryLazyLoad(() => import('@/features/business/components/labels/LabelDashboard')));
export const PaymentsManager = lazy(() => retryLazyLoad(() => import('@/features/business/components/PaymentsManager')));
export const LegalDocs = lazy(() => retryLazyLoad(() => import('@/features/business/components/LegalDocs')));
export const PublicLegalPage = lazy(() => retryLazyLoad(() => import('@/features/business/components/PublicLegalPage')));
export const PlansPage = lazy(() => retryLazyLoad(() => import('@/features/business/components/PlansPage')));
export const BusinessCenter = lazy(() => retryLazyLoad(() => import('@/features/business/components/BusinessCenter')));

// Studio Public & Shared Components
export const StudioPublicProfile = lazy(() => retryLazyLoad(() => import('@/features/studio/components/StudioPublicProfile')));
export const StudioKiosk = lazy(() => retryLazyLoad(() => import('@/features/studio/components/kiosk/StudioKiosk')));
export const ClientPortal = lazy(() => retryLazyLoad(() => import('@/features/studio/components/portal/ClientPortal')));
export const StudioNotFound = lazy(() => retryLazyLoad(() => import('@/features/studio/components/StudioNotFound')));
export const StudioPricingPage = lazy(() => retryLazyLoad(() => import('@/features/studio/components/StudioPricingPage')));

// EDU Components
export const EduStudentDashboard = lazy(() => retryLazyLoad(() => import('@/features/edu/components/EDU/EduStudentDashboard')));
export const EduInternDashboard = lazy(() => retryLazyLoad(() => import('@/features/edu/components/EDU/EduInternDashboard')));
export const EduStaffDashboard = lazy(() => retryLazyLoad(() => import('@/features/edu/components/EDU/EduStaffDashboard')));
export const EduAdminDashboard = lazy(() => retryLazyLoad(() => import('@/features/edu/components/EDU/EduAdminDashboard')));
export const EduSetupWizard = lazy(() => retryLazyLoad(() => import('@/features/edu/components/EduSetupWizard')));

// Export the prefetch function
export const prefetchFeature = (featureName: string) => {
  switch (featureName) {
    case 'dashboard': import('@/features/dashboard/components/Dashboard'); break;
    case 'feed': import('@/features/social/components/SocialFeed'); break;
    case 'messages': import('@/features/messages/components/ChatInterface'); break;
    case 'profile': import('@/features/profiles/components/ProfileManager'); break;
    case 'bookings': import('@/features/booking/components/BookingSystem'); break;
    case 'marketplace': import('@/features/marketplace/components/Marketplace'); break;
    case 'tech': import('@/features/marketplace/components/TechServices'); break;
    case 'studio-manager': import('@/features/studio/components/StudioManager'); break;
    case 'settings': import('@/features/settings/components/SettingsTab'); break;
    case 'labels': import('@/features/business/components/labels/LabelDashboard'); break;
    case 'payments': import('@/features/business/components/PaymentsManager'); break;
    case 'legal': import('@/features/business/components/PublicLegalPage'); break;
    case 'plans': import('@/features/business/components/PlansPage'); break;
    case 'business-center': import('@/features/business/components/BusinessCenter'); break;
    case 'edu-student': import('@/features/edu/components/EDU/EduStudentDashboard'); break;
    case 'edu-intern': import('@/features/edu/components/EDU/EduInternDashboard'); break;
    case 'edu-overview': import('@/features/edu/components/EDU/EduStaffDashboard'); break;
  }
};
