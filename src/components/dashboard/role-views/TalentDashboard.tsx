/**
 * Talent Dashboard View
 *
 * Role-specific dashboard for talent/artists with upcoming gigs,
 * new followers, profile views, and collaboration requests.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Calendar, Users, Eye, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import type { DashboardProps, RoleMetric, QuickAction, TalentDashboardData } from '../../../types/dashboard';
import { StatsCard } from '../widgets/StatsCard';
import { RoleMetrics } from '../sections/RoleMetrics';
import { QuickActions } from '../sections/QuickActions';

interface TalentDashboardProps extends DashboardProps {
  className?: string;
}

export function TalentDashboard({ userData, className = '' }: TalentDashboardProps) {
  const [data, setData] = useState<TalentDashboardData>({
    upcomingGigs: 0,
    newFollowers: 0,
    profileViews: 0,
    collaborationRequests: 0
  });

  const [metrics, setMetrics] = useState<RoleMetric[]>([
    {
      id: 'upcoming-gigs',
      label: 'Upcoming Gigs',
      value: 0,
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'new-followers',
      label: 'New Followers (Week)',
      value: 0,
      trend: 'up',
      trendPercentage: 15,
      icon: Users,
      color: 'green'
    },
    {
      id: 'profile-views',
      label: 'Profile Views (Week)',
      value: 0,
      trend: 'up',
      trendPercentage: 22,
      icon: Eye,
      color: 'purple'
    },
    {
      id: 'collaboration-requests',
      label: 'Collaboration Requests',
      value: 0,
      icon: MessageSquare,
      color: 'amber'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: 'new-post',
      label: 'New Post',
      icon: Plus,
      action: () => console.log('Navigate to create post'),
      variant: 'primary',
      roles: ['Talent', '*']
    },
    {
      id: 'my-gigs',
      label: 'My Gigs',
      icon: Calendar,
      action: () => console.log('Navigate to gigs'),
      variant: 'secondary',
      roles: ['Talent', '*']
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      action: () => console.log('Navigate to messages'),
      variant: 'secondary',
      roles: ['Talent', '*'],
      badge: 3
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      action: () => console.log('Navigate to analytics'),
      variant: 'secondary',
      roles: ['Talent', '*']
    }
  ];

  // TODO: Fetch actual data from Neon/MongoDB
  useEffect(() => {
    // This will be replaced with actual data fetching
    // For now, using mock data
    setData({
      upcomingGigs: 3,
      newFollowers: 47,
      profileViews: 1234,
      collaborationRequests: 2
    });

    setMetrics(prev => prev.map(m => {
      if (m.id === 'upcoming-gigs') return { ...m, value: 3 };
      if (m.id === 'new-followers') return { ...m, value: 47, previousValue: 41 };
      if (m.id === 'profile-views') return { ...m, value: 1234, previousValue: 1011 };
      if (m.id === 'collaboration-requests') return { ...m, value: 2 };
      return m;
    }));
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Upcoming Gigs"
          value={data.upcomingGigs}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="New Followers (Week)"
          value={data.newFollowers}
          previousValue={41}
          trend="up"
          trendPercentage={15}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Profile Views (Week)"
          value={data.profileViews}
          previousValue={1011}
          trend="up"
          trendPercentage={22}
          icon={Eye}
          color="purple"
        />
        <StatsCard
          title="Collaboration Requests"
          value={data.collaborationRequests}
          icon={MessageSquare}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <QuickActions actions={quickActions} role="Talent" />
      </div>

      {/* Detailed Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Overview
        </h3>
        <RoleMetrics metrics={metrics} />
      </div>

      {/* Upcoming Gigs Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Upcoming Performances
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-base">
                The Blue Note
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                March 15, 2026 • 8:00 PM
              </p>
            </div>
            <span className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              Confirmed
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-base">
                Jazz Festival
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                March 22, 2026 • 6:00 PM
              </p>
            </div>
            <span className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
              Confirmed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Collaboration Requests */}
      {data.collaborationRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            New Collaboration Requests
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-base">
                  Producer X
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Interested in collaborating on a new track
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
