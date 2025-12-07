import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy load route-based components for code splitting
const Dashboard = lazy(() => import('../components/Dashboard'));
const SocialFeed = lazy(() => import('../components/SocialFeed'));
const BookingSystem = lazy(() => import('../components/BookingSystem'));
const Marketplace = lazy(() => import('../components/Marketplace'));
const ChatInterface = lazy(() => import('../components/ChatInterface'));
const StudioManager = lazy(() => import('../components/StudioManager'));
const ProfileManager = lazy(() => import('../components/ProfileManager'));
const SettingsTab = lazy(() => import('../components/SettingsTab'));
const TechServices = lazy(() => import('../components/TechServices'));
const LegalDocs = lazy(() => import('../components/LegalDocs'));
const PaymentsManager = lazy(() => import('../components/PaymentsManager'));
const LabelManager = lazy(() => import('../components/LabelManager'));

// EDU Components (lazy loaded)
const EduStudentDashboard = lazy(() => import('../components/EDU/EduStudentDashboard'));
const EduStaffDashboard = lazy(() => import('../components/EDU/EduStaffDashboard'));
const EduAdminDashboard = lazy(() => import('../components/EDU/EduAdminDashboard'));
const EduInternDashboard = lazy(() => import('../components/EDU/EduInternDashboard'));
const StudentEnrollment = lazy(() => import('../components/EDU/StudentEnrollment'));

// Loading component for lazy-loaded routes
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="animate-spin text-brand-blue" size={32} />
  </div>
);

// Component wrapper for EDU dashboard - ensures consistent hook calls
// This component must always render the same structure to maintain hook count
// IMPORTANT: This component must NOT call any hooks itself to avoid hook count issues
function EduDashboardWrapper({ user, userData }) {
  // Determine which dashboard to show - but always render a component
  // Use key prop to force remount when role changes, ensuring clean hook state
  const role = userData?.accountTypes?.find(role => 
    ['Admin', 'Instructor', 'Intern'].includes(role)
  ) || 'Student';
  
  // Always render a component - React Router will handle mounting/unmounting
  // NO HOOKS in this wrapper - only conditional rendering
  switch (role) {
    case 'Admin':
      return <EduAdminDashboard key={`admin-${user?.uid}`} user={user} userData={userData} />;
    case 'Instructor':
      return <EduStaffDashboard key={`staff-${user?.uid}`} user={user} userData={userData} />;
    case 'Intern':
      return <EduInternDashboard key={`intern-${user?.uid}`} user={user} userData={userData} />;
    default:
      return <EduStudentDashboard key={`student-${user?.uid}`} user={user} userData={userData} />;
  }
}

/**
 * AppRoutes - Handles all routing with React Router
 * This ensures proper component lifecycle and eliminates hook count issues
 * 
 * IMPORTANT: This component must NOT call any hooks to ensure consistent hook counts
 */
export default function AppRoutes({ user, userData, subProfiles, notifications, tokenBalance, setActiveTab, handleLogout, openPublicProfile }) {
  // NO HOOKS HERE - All hooks must be in child components
  // This ensures consistent hook counts across route changes
  // React Router handles component mounting/unmounting automatically

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Main App Routes */}
        <Route 
          path="/" 
          element={
            <Dashboard 
              user={user} 
              userData={userData} 
              subProfiles={subProfiles} 
              notifications={notifications} 
              setActiveTab={setActiveTab} 
              tokenBalance={tokenBalance}
            />
          } 
        />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        <Route 
          path="/feed" 
          element={<SocialFeed user={user} userData={userData} openPublicProfile={openPublicProfile} />} 
        />
        <Route path="/social" element={<Navigate to="/feed" replace />} />
        
        <Route 
          path="/bookings" 
          element={
            <BookingSystem user={user} userData={userData} openPublicProfile={openPublicProfile} />
          } 
        />
        <Route path="/find-talent" element={<Navigate to="/bookings" replace />} />
        
        <Route 
          path="/marketplace" 
          element={
            <Marketplace user={user} userData={userData} tokenBalance={tokenBalance} />
          } 
        />
        
        <Route 
          path="/messages" 
          element={
            <ChatInterface user={user} userData={userData} openPublicProfile={openPublicProfile} />
          } 
        />
        
        <Route 
          path="/tech" 
          element={
            <TechServices user={user} userData={userData} />
          } 
        />
        
        <Route 
          path="/studio-ops" 
          element={
            <StudioManager user={user} userData={userData} />
          } 
        />
        <Route path="/studio-manager" element={<Navigate to="/studio-ops" replace />} />
        
        <Route 
          path="/label-manager" 
          element={
            <LabelManager user={user} userData={userData} />
          } 
        />
        
        <Route 
          path="/payments" 
          element={
            <PaymentsManager user={user} userData={userData} />
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProfileManager user={user} userData={userData} subProfiles={subProfiles} handleLogout={handleLogout} />
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <SettingsTab user={user} userData={userData} handleLogout={handleLogout} />
          } 
        />
        
        <Route 
          path="/legal" 
          element={
            <LegalDocs />
          } 
        />

        {/* EDU Routes */}
        <Route 
          path="/edu" 
          element={
            <EduDashboardWrapper user={user} userData={userData} />
          } 
        />
        <Route 
          path="/edu/enroll" 
          element={
            <StudentEnrollment user={user} userData={userData} />
          } 
        />
        <Route 
          path="/edu/:view" 
          element={
            <EduDashboardWrapper user={user} userData={userData} />
          } 
        />

        {/* Fallback - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

