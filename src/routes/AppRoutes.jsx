import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSchool } from '../contexts/SchoolContext';

// Import components directly (no lazy loading) to avoid hook count issues
import Dashboard from '../components/Dashboard';
import SocialFeed from '../components/SocialFeed';
import BookingSystem from '../components/BookingSystem';
import Marketplace from '../components/Marketplace';
import ChatInterface from '../components/ChatInterface';
import StudioManager from '../components/StudioManager';
import ProfileManager from '../components/ProfileManager';
import SettingsTab from '../components/SettingsTab';
import TechServices from '../components/TechServices';
import LegalDocs from '../components/LegalDocs';
import PaymentsManager from '../components/PaymentsManager';
import LabelManager from '../components/LabelManager';

// EDU Components
import EduStudentDashboard from '../components/EDU/EduStudentDashboard';
import EduStaffDashboard from '../components/EDU/EduStaffDashboard';
import EduAdminDashboard from '../components/EDU/EduAdminDashboard';
import EduInternDashboard from '../components/EDU/EduInternDashboard';
import StudentEnrollment from '../components/EDU/StudentEnrollment';

/**
 * EDU Dashboard Wrapper
 * Uses SchoolContext to resolve effective edu role and route accordingly.
 */
function EduDashboardWrapper({ user, userData }) {
  const { eduRole } = useSchool();
  const normalizedRole = (eduRole || userData?.accountTypes?.find(role => ['Admin', 'Instructor', 'Intern'].includes(role)) || 'Student').toUpperCase();

  if (!userData?.schoolId || normalizedRole === 'UNVERIFIED') {
    return <StudentEnrollment user={user} userData={userData} />;
  }

  switch (normalizedRole) {
    case 'ADMIN':
      return <EduAdminDashboard key={`admin-${user?.uid}`} user={user} userData={userData} />;
    case 'INSTRUCTOR':
      return <EduStaffDashboard key={`staff-${user?.uid}`} user={user} userData={userData} />;
    case 'INTERN':
      return <EduInternDashboard key={`intern-${user?.uid}`} user={user} userData={userData} />;
    default:
      return <EduStudentDashboard key={`student-${user?.uid}`} user={user} userData={userData} />;
  }
}

function ProtectedRoute({ user, requireAuth, label, children }) {
  const location = useLocation();

  useEffect(() => {
    if (!user && requireAuth) {
      requireAuth(`route:${label || 'protected'}`, { route: location.pathname });
    }
  }, [user, requireAuth, label, location.pathname]);

  if (user) return children;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-dark-card border dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4 text-center">
        <h2 className="text-xl font-bold dark:text-white">Sign in required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {label || 'This area'} is available after you log in. You can continue browsing public sections.
        </p>
        <div className="flex justify-center gap-3">
          <button 
            className="px-4 py-2 bg-brand-blue text-white rounded-lg font-bold hover:bg-blue-600 transition"
            onClick={() => requireAuth?.(`route:${label || 'protected'}`, { route: location.pathname })}
          >
            Launch Login
          </button>
          <button 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AppRoutes - Main routing component using React Router
 */
export default function AppRoutes({ user, userData, subProfiles, notifications, tokenBalance, setActiveTab, handleLogout, openPublicProfile, requireAuth }) {

  return (
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
          element={<SocialFeed user={user} userData={userData} openPublicProfile={openPublicProfile} requireAuth={requireAuth} />} 
        />
        <Route path="/social" element={<Navigate to="/feed" replace />} />
        
        <Route 
          path="/bookings" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Bookings">
              <BookingSystem user={user} userData={userData} openPublicProfile={openPublicProfile} />
            </ProtectedRoute>
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
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Messages">
              <ChatInterface user={user} userData={userData} openPublicProfile={openPublicProfile} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tech" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Tech Services">
              <TechServices user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/studio-ops" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Studio Ops">
              <StudioManager user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />
        <Route path="/studio-manager" element={<Navigate to="/studio-ops" replace />} />
        
        <Route 
          path="/label-manager" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Label Manager">
              <LabelManager user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Payments">
              <PaymentsManager user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Profile">
              <ProfileManager user={user} userData={userData} subProfiles={subProfiles} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="Settings">
              <SettingsTab user={user} userData={userData} handleLogout={handleLogout} />
            </ProtectedRoute>
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
            <ProtectedRoute user={user} requireAuth={requireAuth} label="EDU">
              <EduDashboardWrapper user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edu/enroll" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="EDU Enrollment">
              <StudentEnrollment user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edu/:view" 
          element={
            <ProtectedRoute user={user} requireAuth={requireAuth} label="EDU">
              <EduDashboardWrapper user={user} userData={userData} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

