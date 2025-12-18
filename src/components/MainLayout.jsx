import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subProfiles, setSubProfiles] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [pendingChatTarget, setPendingChatTarget] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync activeTab with route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('dashboard');
    } else if (path === '/feed' || path === '/social') {
      setActiveTab('feed');
    } else if (path === '/messages' || path === '/chat') {
      setActiveTab('messages');
    } else if (path === '/bookings') {
      setActiveTab('bookings');
    } else if (path === '/marketplace') {
      setActiveTab('marketplace');
    } else if (path === '/tech') {
      setActiveTab('tech');
    } else if (path === '/payments' || path === '/billing') {
      setActiveTab('payments');
    } else if (path === '/profile') {
      setActiveTab('profile');
    } else if (path === '/business-center') {
      setActiveTab('business-center');
    } else if (path === '/legal') {
      setActiveTab('legal');
    } else if (path === '/studio-ops') {
      setActiveTab('studio-ops');
    } else if (path.startsWith('/edu-')) {
      setActiveTab(path.substring(1)); // Remove leading /, e.g., /edu-student -> edu-student
    }
  }, [location.pathname]);

  // Update URL when tab changes
  useEffect(() => {
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
    if (route && location.pathname !== route) {
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

  // Determine which content to render based on activeTab
  const renderContent = () => {
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
  };

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
          {renderContent()}
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

