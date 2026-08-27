import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar, User, MessageCircle, MessageSquare, Search, Edit2, Zap, Sliders,
    ArrowRight, Bell, Music, TrendingUp, Clock, AlertTriangle,
    CheckCircle, XCircle, ShoppingBag, ChevronRight, Sparkles,
    Headphones, Radio, Mic2, Play, Heart, Star, ArrowUpRight,
    Wallet, Users, Eye, Activity, BarChart3, Crown, Flame, Target, Compass
} from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';
import { useNotifications } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from './shared/AnimatedNumber';
import { useLanguage } from '../contexts/LanguageContext';

import type {
    DashboardProps,
    DashboardConfig,
    ActivityItem
} from '../types/dashboard';

import { ActivityFeedSection } from './dashboard/sections/ActivityFeedSection';
import { NotificationsPanel, type NotificationItem as ModularNotificationItem } from './dashboard/sections/NotificationsPanel';
import { WidgetGrid } from './dashboard/sections/WidgetGrid';
import { QuickActions } from './dashboard/sections/QuickActions';

import { ProducerDashboard } from './dashboard/role-views/ProducerDashboard';
import { StudioDashboard } from './dashboard/role-views/StudioDashboard';
import { TechnicianDashboard } from './dashboard/role-views/TechnicianDashboard';
import { TalentDashboard } from './dashboard/role-views/TalentDashboard';
import { EDUDashboard } from './dashboard/role-views/EDUDashboard';

import { getCompleteUser, updateUserProfile } from '../services/unifiedUserData';
import { useActivityFeed } from '../services/activityFeed';

// Internal Types
export interface Conversation {
    uid: string;
    name: string;
    lastMessage: string;
    timestamp: number;
    isMe: boolean;
    photo?: string;
}

export interface ProfileSchema {
    key: string;
    type: string;
    isToggle?: boolean;
    isSubRole?: boolean;
}

export interface Greeting {
    text: string;
    emoji: string;
}

const getGreetingKey = (): 'goodMorning' | 'goodAfternoon' | 'goodEvening' | 'goodNight' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'goodMorning';
    if (hour < 17) return 'goodAfternoon';
    if (hour < 21) return 'goodEvening';
    return 'goodNight';
};

interface GlassStatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
    onClick?: () => void;
}

const GlassStatCard: React.FC<GlassStatCardProps> = ({ title, value, icon, gradient, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onClick}
        className={`relative p-4 sm:p-5 rounded-[1.25rem] cursor-pointer overflow-hidden group render-crisp transform-gpu-crisp ${gradient}`}
    >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full blur-xl sm:blur-2xl transform translate-x-12 -translate-y-12 sm:translate-x-16 sm:-translate-y-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-lg sm:blur-xl transform -translate-x-8 translate-y-8" />
        </div>

        <div className="relative z-10 min-w-0">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-inner flex-shrink-0">
                    {icon}
                </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-0.5 tracking-tight truncate">
                <AnimatedNumber value={value} />
            </div>
            <div className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide truncate">{title}</div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </motion.div>
);

export default function Dashboard({
    user,
    userData,
    setActiveTab,
    bookingCount = 0,
    subProfiles = {},
    tokenBalance = 0
}: DashboardProps) {
    const { t } = useLanguage();
    
    // Convex hooks
    const convexAvailable = isConvexAvailable();
    const conversationsQuery = useMemo(() => {
        return (user?.id || user?.uid) && convexAvailable ? { userId: user?.id || user?.uid } : "skip";
    }, [user?.uid, convexAvailable]);

    const conversationsData = useQuery(
        api.conversations.getConversations,
        conversationsQuery
    );

    // State
    const [recentConvos, setRecentConvos] = useState<Conversation[]>([]);
    const [profileSchemas, setProfileSchemas] = useState<Record<string, ProfileSchema[]> | null>(null);
    
    // Modular State
    const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [modularNotifications, setModularNotifications] = useState<ModularNotificationItem[]>([]);

    const { notifications, unreadCount } = useNotifications(user?.id || user?.uid);

    const activeRole = useMemo(() => {
        return userData?.activeProfileRole ||
               userData?.accountTypes?.[0] ||
               'Fan';
    }, [userData]);

    const { data: liveActivityFeed, isLoading: isActivityLoading } = useActivityFeed(
        activeRole !== 'Fan' ? (user?.id || user?.uid) : undefined,
        { limit: 10 }
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            import('../config/constants').then(mod => {
                if (mod.PROFILE_SCHEMAS) setProfileSchemas(mod.PROFILE_SCHEMAS);
            }).catch(err => {
                console.warn('Failed to load constants:', err);
                setProfileSchemas({});
            });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!conversationsData) {
            setRecentConvos([]);
            return;
        }
        const convos: Conversation[] = conversationsData
            .map(conv => ({
                uid: conv.otherUserId || conv.chatId,
                name: conv.chatName || 'Unknown',
                lastMessage: conv.lastMessage || '',
                timestamp: conv.lastMessageTime || 0,
                isMe: conv.lastSenderId === (user?.id || user?.uid),
                photo: conv.chatPhoto
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 4);
        setRecentConvos(convos);
    }, [conversationsData, user?.id, user?.uid]);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user?.id) return;
            setIsConfigLoading(true);
            try {
                // Load config for the CURRENT role
                const savedConfig = userData?.settings?.dashboard;
                // Ensure we only load the saved layout if it belongs to the currently active role!
                if (savedConfig && savedConfig.role === activeRole) {
                    setDashboardConfig(savedConfig);
                } else {
                    setDashboardConfig({
                        layout: 'default',
                        widgets: getDefaultWidgetsForRole(activeRole),
                        role: activeRole,
                        lastUpdated: new Date()
                    });
                }

                // Notifications map
                if (notifications) {
                    setModularNotifications(notifications.map(n => ({
                        id: n.id,
                        type: (n as any).type || 'info',
                        title: n.title,
                        message: (n as any).message || (n as any).description || '',
                        timestamp: new Date((n as any).timestamp || Date.now()),
                        read: n.read,
                        actionUrl: (n as any).actionUrl
                    } as ModularNotificationItem)));
                }
            } catch (error) {
                console.error('Error loading modular dashboard data:', error);
            } finally {
                setIsConfigLoading(false);
            }
        };
        loadDashboardData();
    }, [activeRole, user?.id, notifications, userData?.settings?.dashboard]);

    // Handlers
    const handleSaveLayout = async (widgets: DashboardConfig['widgets']) => {
        if (!user?.id) return;
        const newConfig: DashboardConfig = {
            layout: 'custom',
            widgets,
            role: activeRole,
            lastUpdated: new Date()
        };
        setDashboardConfig(newConfig);
        try {
            await updateUserProfile(user.id, { settings: { ...userData?.settings, dashboard: newConfig } as any });
        } catch (error) {}
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
            await updateUserProfile(user.id, { settings: { ...userData?.settings, dashboard: defaultConfig } as any });
        } catch (error) {}
    };

    const handleActivityClick = (activity: ActivityItem) => {
        if (activity.actionUrl) console.log('Navigate to:', activity.actionUrl);
    };

    const handleNotificationDismiss = (id: string) => setModularNotifications(prev => prev.filter(n => n.id !== id));
    const handleNotificationMarkAsRead = (id: string) => setModularNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    // Derived vars
    const greetingKey = getGreetingKey();
    const greetingEmoji = greetingKey === 'goodMorning' ? '☀️' :
                         greetingKey === 'goodAfternoon' ? '🌤️' :
                         greetingKey === 'goodEvening' ? '🌅' : '🌙';
    const greeting: Greeting = { text: t(greetingKey), emoji: greetingEmoji };
    
    const profileViews = userData?.profileViews || 0;
    const roles = userData?.accountTypes || [];

    const { avgCompletion, showCompletionWarning } = useMemo(() => {
        if (!profileSchemas) return { avgCompletion: 100, showCompletionWarning: false };
        let totalPct = 0; let roleCount = 0;
        roles.forEach(role => {
            const data = subProfiles?.[role] || {};
            const talentData = role === 'Talent' ? { ...data, talentSubRole: userData?.talentSubRole } : data;
            const schema = profileSchemas[role] || [];
            if (schema.length === 0) return;
            const relevantFields = schema.filter(f => !f.isToggle && f.type !== 'list');
            const totalFields = relevantFields.length || 1;
            const filledFields = relevantFields.filter(f => {
                const value = f.isSubRole ? talentData[f.key] : data[f.key];
                if (value === null || value === undefined) return false;
                if (Array.isArray(value)) return value.length > 0;
                if (typeof value === 'string') return value.trim().length > 0;
                if (typeof value === 'number') return true;
                return !!value;
            }).length;
            totalPct += (filledFields / totalFields);
            roleCount++;
        });
        const completion = roleCount > 0 ? Math.round((totalPct / roleCount) * 100) : 100;
        return { avgCompletion: completion, showCompletionWarning: completion < 60 };
    }, [profileSchemas, roles, subProfiles, userData?.talentSubRole]);

    return (
        <div className="min-h-screen pb-24 px-fluid pt-fluid">
            {/* Hero Section with Gradient Background */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] shadow-2xl max-w-7xl mx-auto mb-6 md:mb-8">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-purple-600 to-pink-500 opacity-90" />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute top-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 md:w-96 md:h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl md:blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 md:py-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 md:gap-6 mb-6 md:mb-8"
                    >
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl sm:text-2xl">{greeting.emoji}</span>
                                <span className="text-white/80 text-base sm:text-lg font-medium">{greeting.text}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight text-sharp truncate">
                                {userData?.effectiveDisplayName ||
                                 userData?.displayName ||
                                 (userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : userData?.firstName || userData?.lastName) ||
                                 userData?.email?.split('@')[0] ||
                                 'Creator'}
                            </h1>
                            <p className="text-white/70 mt-1 text-sm sm:text-base md:text-lg truncate">Your creative command center</p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-2 text-white render-crisp"
                            >
                                <Clock size={16} className="text-white/70 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium">
                                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('feed')}
                                className="relative bg-white text-gray-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all render-crisp"
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4"
                    >
                        <GlassStatCard
                            title="SeshFx Balance"
                            value={tokenBalance}
                            icon={<Zap size={20} className="text-white" fill="currentColor" />}
                            gradient="bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('payments')}
                        />
                        <GlassStatCard
                            title="Pending Bookings"
                            value={bookingCount}
                            icon={<Calendar size={20} className="text-white" />}
                            gradient="bg-gradient-to-br from-blue-500/90 to-indigo-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('bookings')}
                        />
                        <GlassStatCard
                            title="Active Chats"
                            value={recentConvos.length}
                            icon={<MessageCircle size={20} className="text-white" />}
                            gradient="bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('messages')}
                        />
                        <GlassStatCard
                            title="Profile Views"
                            value={profileViews}
                            icon={<Eye size={20} className="text-white" />}
                            gradient="bg-gradient-to-br from-pink-500/90 to-rose-600/90 backdrop-blur-sm"
                            onClick={() => setActiveTab('profile')}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto relative z-20">
                {/* Completion Warning Banner */}
                <AnimatePresence>
                    {showCompletionWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-[1.25rem] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl text-white shadow-lg">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                        Complete Your Profile
                                        <span className="text-sm font-normal bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full">
                                            {avgCompletion}%
                                        </span>
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-400">
                                        A complete profile increases your visibility and booking chances
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors"
                            >
                                Update Profile
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modular Widget Grid */}
                <WidgetGrid
                    config={dashboardConfig}
                    role={activeRole}
                    onResetLayout={handleResetLayout}
                >
                    {/* Column 1: Activity Feed (+ Notifications on 2-column md viewports) */}
                    <div className="space-y-6">
                        <ActivityFeedSection
                            feed={liveActivityFeed || []}
                            onActivityClick={handleActivityClick}
                        />
                        <div className="block xl:hidden">
                            <NotificationsPanel
                                notifications={modularNotifications}
                                onDismiss={handleNotificationDismiss}
                                onMarkAsRead={handleNotificationMarkAsRead}
                            />
                        </div>
                    </div>

                    {/* Column 2: Role Specific Main View */}
                    <RoleSpecificView
                        user={user}
                        userData={userData}
                        subProfiles={subProfiles}
                        activeRole={activeRole}
                        setActiveTab={setActiveTab}
                    />

                    {/* Column 3: Notifications Panel (Dedicated column on 3-column xl viewports) */}
                    <div className="hidden xl:block">
                        <NotificationsPanel
                            notifications={modularNotifications}
                            onDismiss={handleNotificationDismiss}
                            onMarkAsRead={handleNotificationMarkAsRead}
                        />
                    </div>
                </WidgetGrid>
            </div>
        </div>
    );
}

// =====================================================
// ROLE-SPECIFIC VIEW COMPONENT
// =====================================================

interface RoleSpecificViewProps extends DashboardProps {
  user?: any;
  userData?: any;
  subProfiles?: any;
  activeRole: string;
}

function RoleSpecificView({ user, userData, subProfiles, activeRole, setActiveTab }: RoleSpecificViewProps) {
  // EDU Roles - use dedicated EDU dashboard
  if (activeRole.startsWith('EDU') || activeRole === 'Student' || activeRole === 'Intern') {
    return <EDUDashboard userData={userData} eduRole={activeRole as any} setActiveTab={setActiveTab} />;
  }

  // Role-specific dashboards
  switch (activeRole) {
    case 'Producer':
      return <ProducerDashboard userData={userData} setActiveTab={setActiveTab} />;

    case 'Studio':
      return <StudioDashboard userData={userData} subProfiles={subProfiles} setActiveTab={setActiveTab} />;

    case 'Technician':
      return <TechnicianDashboard userData={userData} setActiveTab={setActiveTab} />;

    case 'Talent':
      return <TalentDashboard userData={userData} setActiveTab={setActiveTab} />;

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
          setActiveTab={setActiveTab}
        />
      );
  }
}

// =====================================================
// DEFAULT DASHBOARD (for Fan and other roles)
// =====================================================

function DefaultDashboard({ user, userData, activeRole, setActiveTab }: RoleSpecificViewProps) {
  const quickActions = [
    {
      id: 'book-sesh',
      label: 'Book Studio Sesh',
      description: 'Discover studios & reserve session time',
      icon: Calendar,
      action: () => setActiveTab?.('bookings'),
      variant: 'primary' as const,
      featured: true,
      roles: ['*']
    },
    {
      id: 'feed',
      label: 'Social Feed',
      description: 'See what artists & producers are creating',
      icon: MessageSquare,
      action: () => setActiveTab?.('feed'),
      variant: 'secondary' as const,
      roles: ['*']
    },
    {
      id: 'profile',
      label: 'My Profile',
      description: 'Update account & profile settings',
      icon: Compass,
      action: () => setActiveTab?.('profile'),
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
        <QuickActions actions={quickActions as any} role={activeRole} />
      </motion.div>
    </div>
  );
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

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

  return [...baseWidgets, ...(roleSpecificWidgets[role] || [])];
}