/**
 * Dashboard Component - Hybrid Architecture
 *
 * Main orchestrator for the new dashboard system with:
 * - Activity feed (aggregated from Neon + MongoDB)
 * - Role-specific content
 * - Customizable widget layout
 * - Responsive design
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { Compass, MessageSquare } from 'lucide-react';
import type {
  DashboardProps,
  DashboardConfig,
  ActivityItem,
  NotificationItem
} from '../../types/dashboard';

// Dashboard Sections
import { GreetingSection } from './dashboard/sections/GreetingSection';
import { ActivityFeedSection } from './dashboard/sections/ActivityFeedSection';
import { RoleMetrics } from './dashboard/sections/RoleMetrics';
import { QuickActions } from './dashboard/sections/QuickActions';
import { NotificationsPanel } from './dashboard/sections/NotificationsPanel';
import { WidgetGrid } from './dashboard/sections/WidgetGrid';

// Role-Specific Dashboards
import { ProducerDashboard } from './dashboard/role-views/ProducerDashboard';
import { StudioDashboard } from './dashboard/role-views/StudioDashboard';
import { TechnicianDashboard } from './dashboard/role-views/TechnicianDashboard';
import { TalentDashboard } from './dashboard/role-views/TalentDashboard';
import { EDUDashboard } from './dashboard/role-views/EDUDashboard';

// Services
import { getCompleteUser, updateUserProfile } from '../services/unifiedUserData';
import { fetchActivityFeed } from '../services/activityFeed';

// =====================================================
// MAIN DASHBOARD COMPONENT
// =====================================================

export default function Dashboard({
  user,
  userData,
  subProfiles = {},
  setActiveTab,
  bookingCount,
  tokenBalance
}: DashboardProps) {
  // State
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Get notifications from existing hook
  const { notifications: hookNotifications, unreadCount } = useNotifications();

  // Determine active role
  const activeRole = useMemo(() => {
    return userData?.activeProfileRole ||
           userData?.accountTypes?.[0] ||
           'Fan';
  }, [userData]);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  useEffect(() => {
    loadDashboardData();
  }, [activeRole, user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load dashboard config from user settings
      const savedConfig = userData?.settings?.dashboard;
      if (savedConfig) {
        setDashboardConfig(savedConfig);
      } else {
        // Set default config for role
        setDashboardConfig({
          layout: 'default',
          widgets: getDefaultWidgetsForRole(activeRole),
          role: activeRole,
          lastUpdated: new Date()
        });
      }

      // Load activity feed
      if (activeRole !== 'Fan') {
        const feed = await fetchActivityFeed(user.id, { limit: 10 });
        setActivityFeed(feed);
      }

      // Convert hook notifications to panel format
      setNotifications(hookNotifications.map(n => ({
        id: n.id,
        type: n.type || 'info',
        title: n.title,
        message: n.message || n.description,
        timestamp: new Date(n.timestamp || Date.now()),
        read: n.read,
        actionUrl: n.actionUrl
      } as NotificationItem)));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // CUSTOMIZATION HANDLERS
  // =====================================================

  const handleSaveLayout = async (widgets: DashboardConfig['widgets']) => {
    if (!user?.id) return;

    const newConfig: DashboardConfig = {
      layout: 'custom',
      widgets,
      role: activeRole,
      lastUpdated: new Date()
    };

    setDashboardConfig(newConfig);

    // Save to MongoDB via unifiedUserData
    try {
      await updateUserProfile(user.id, {
        settings: {
          ...userData?.settings,
          dashboard: newConfig
        }
      });
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
    }
  };

  const handleResetLayout = async () => {
    if (!user?.id) return;

    const defaultConfig: DashboardConfig = {
      layout: 'default',
      widgets: getDefaultWidgetsForRole(activeRole),
      role: activeRole,
      lastUpdated: new Date()
    };

    setDashboardConfig(defaultConfig);

    try {
      await updateUserProfile(user.id, {
        settings: {
          ...userData?.settings,
          dashboard: defaultConfig
        }
      });
    } catch (error) {
      console.error('Error resetting dashboard layout:', error);
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.actionUrl) {
      // Navigate to action URL
      console.log('Navigate to:', activity.actionUrl);
      // Or use: navigate(activity.actionUrl);
    }
  };

  const handleNotificationDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Greeting */}
      <GreetingSection userData={userData} />

      {/* Widget Grid */}
      <WidgetGrid
        config={dashboardConfig}
        role={activeRole}
        onResetLayout={handleResetLayout}
      >
        {/* Left Column */}
        <div className="space-y-6">
          <ActivityFeedSection
            feed={activityFeed}
            onActivityClick={handleActivityClick}
          />
        </div>

        {/* Middle Column - Role-specific content */}
        <div className="space-y-6">
          <RoleSpecificView
            user={user}
            userData={userData}
            subProfiles={subProfiles}
            activeRole={activeRole}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <NotificationsPanel
            notifications={notifications}
            onDismiss={handleNotificationDismiss}
            onMarkAsRead={handleNotificationMarkAsRead}
          />
        </div>
      </WidgetGrid>
    </div>
  );
}

// =====================================================
// ROLE-SPECIFIC VIEW COMPONENT
// =====================================================

interface RoleSpecificViewProps extends DashboardProps {
  activeRole: string;
}

function RoleSpecificView({ user, userData, subProfiles, activeRole }: RoleSpecificViewProps) {
  // EDU Roles - use dedicated EDU dashboard
  if (activeRole.startsWith('EDU') || activeRole === 'Student' || activeRole === 'Intern') {
    return <EDUDashboard userData={userData} eduRole={activeRole as any} />;
  }

  // Role-specific dashboards
  switch (activeRole) {
    case 'Producer':
      return <ProducerDashboard userData={userData} />;

    case 'Studio':
      return <StudioDashboard userData={userData} subProfiles={subProfiles} />;

    case 'Technician':
      return <TechnicianDashboard userData={userData} />;

    case 'Talent':
      return <TalentDashboard userData={userData} />;

    case 'Label':
      // TODO: Integrate existing LabelDashboard
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Label dashboard coming soon
          </p>
        </div>
      );

    default:
      return (
        <DefaultDashboard
          user={user}
          userData={userData}
          activeRole={activeRole}
        />
      );
  }
}

// =====================================================
// DEFAULT DASHBOARD (for Fan and other roles)
// =====================================================

function DefaultDashboard({ user, userData, activeRole }: RoleSpecificViewProps) {
  const quickActions = [
    {
      id: 'explore',
      label: 'Explore',
      icon: Compass,
      action: () => console.log('Navigate to explore'),
      variant: 'primary' as const,
      roles: ['*']
    },
    {
      id: 'feed',
      label: 'Social Feed',
      icon: MessageSquare,
      action: () => console.log('Navigate to feed'),
      variant: 'secondary' as const,
      roles: ['*']
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to SeshNx
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get started by exploring the platform or updating your profile.
        </p>
        <QuickActions actions={quickActions} role={activeRole} />
      </motion.div>
    </div>
  );
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get default widgets for a role
 */
function getDefaultWidgetsForRole(role: string): DashboardConfig['widgets'] {
  const baseWidgets = [
    {
      id: 'activity-feed',
      type: 'feed' as const,
      title: 'Activity Feed',
      size: 'medium' as const,
      position: { row: 1, col: 1 },
      visible: true
    },
    {
      id: 'notifications',
      type: 'notifications' as const,
      title: 'Notifications',
      size: 'small' as const,
      position: { row: 1, col: 2 },
      visible: true
    }
  ];

  const roleSpecificWidgets: Record<string, DashboardConfig['widgets']> = {
    Producer: [
      {
        id: 'beat-sales',
        type: 'stats' as const,
        title: 'Beat Sales',
        size: 'small' as const,
        position: { row: 2, col: 1 },
        visible: true
      },
      {
        id: 'quick-actions-producer',
        type: 'quick-actions' as const,
        title: 'Quick Actions',
        size: 'medium' as const,
        position: { row: 2, col: 2 },
        visible: true
      }
    ],
    Studio: [
      {
        id: 'today-bookings',
        type: 'stats' as const,
        title: "Today's Bookings",
        size: 'small' as const,
        position: { row: 2, col: 1 },
        visible: true
      },
      {
        id: 'room-utilization',
        type: 'stats' as const,
        title: 'Room Utilization',
        size: 'small' as const,
        position: { row: 2, col: 2 },
        visible: true
      }
    ],
    Technician: [
      {
        id: 'service-requests',
        type: 'stats' as const,
        title: 'Service Requests',
        size: 'small' as const,
        position: { row: 2, col: 1 },
        visible: true
      }
    ],
    Talent: [
      {
        id: 'upcoming-gigs',
        type: 'stats' as const,
        title: 'Upcoming Gigs',
        size: 'small' as const,
        position: { row: 2, col: 1 },
        visible: true
      },
      {
        id: 'quick-actions-talent',
        type: 'quick-actions' as const,
        title: 'Quick Actions',
        size: 'medium' as const,
        position: { row: 2, col: 2 },
        visible: true
      }
    ]
  };

  return [
    ...baseWidgets,
    ...(roleSpecificWidgets[role] || [])
  ];
}
