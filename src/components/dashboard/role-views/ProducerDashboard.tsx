/**
 * Producer Dashboard View
 *
 * Role-specific dashboard for music producers with beat sales,
 * collaboration opportunities, and studio metrics.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, BarChart3, Music, DollarSign, Users, TrendingUp } from 'lucide-react';
import type { DashboardProps, RoleMetric, QuickAction, ProducerDashboardData } from '../../../types/dashboard';
import { StatsCard } from '../widgets/StatsCard';
import { RoleMetrics } from '../sections/RoleMetrics';
import { QuickActions } from '../sections/QuickActions';

interface ProducerDashboardProps extends DashboardProps {
  className?: string;
}

export function ProducerDashboard({ userData, className = '' }: ProducerDashboardProps) {
  const [data, setData] = useState<ProducerDashboardData>({
    recentSales: 0,
    streamingRevenue: 0,
    collaborationInvites: 0,
    beatUploads: 0
  });

  const [metrics, setMetrics] = useState<RoleMetric[]>([
    {
      id: 'beat-sales',
      label: 'Beat Sales (This Month)',
      value: 0,
      previousValue: 0,
      trend: 'up',
      trendPercentage: 12,
      icon: Music,
      color: 'blue'
    },
    {
      id: 'streaming-revenue',
      label: 'Streaming Revenue',
      value: '$0',
      previousValue: '$0',
      trend: 'up',
      trendPercentage: 8,
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'collaborations',
      label: 'Active Collaborations',
      value: 0,
      trend: 'neutral',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'total-plays',
      label: 'Total Plays',
      value: 0,
      trend: 'up',
      trendPercentage: 24,
      icon: TrendingUp,
      color: 'amber'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: 'new-beat',
      label: 'New Beat',
      icon: Plus,
      action: () => console.log('Navigate to studio'),
      variant: 'primary',
      roles: ['Producer', '*']
    },
    {
      id: 'post-feed',
      label: 'Post to Feed',
      icon: MessageSquare,
      action: () => console.log('Navigate to feed'),
      variant: 'secondary',
      roles: ['Producer', '*']
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: BarChart3,
      action: () => console.log('Navigate to analytics'),
      variant: 'secondary',
      roles: ['Producer', '*']
    }
  ];

  // TODO: Fetch actual data from Neon/MongoDB
  useEffect(() => {
    // This will be replaced with actual data fetching
    // For now, using mock data
    setData({
      recentSales: 47,
      streamingRevenue: 1234,
      collaborationInvites: 3,
      beatUploads: 156
    });

    setMetrics(prev => prev.map(m => {
      if (m.id === 'beat-sales') return { ...m, value: 47, previousValue: 42 };
      if (m.id === 'streaming-revenue') return { ...m, value: '$1,234', previousValue: '$1,142' };
      if (m.id === 'collaborations') return { ...m, value: 8 };
      if (m.id === 'total-plays') return { ...m, value: 45678, previousValue: 36845 };
      return m;
    }));
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Beat Sales (Month)"
          value={data.recentSales}
          previousValue={42}
          trend="up"
          trendPercentage={12}
          icon={Music}
          color="blue"
        />
        <StatsCard
          title="Streaming Revenue"
          value={`$${data.streamingRevenue.toLocaleString()}`}
          previousValue="$1,142"
          trend="up"
          trendPercentage={8}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Collaboration Invites"
          value={data.collaborationInvites}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="Total Beats"
          value={data.beatUploads}
          icon={Music}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <QuickActions actions={quickActions} role="Producer" />
      </div>

      {/* Detailed Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Overview
        </h3>
        <RoleMetrics metrics={metrics} />
      </div>

      {/* Collaboration Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Collaboration Opportunities
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No new collaboration requests</p>
          <p className="text-sm mt-2">Check back later for new opportunities</p>
        </div>
      </motion.div>
    </div>
  );
}
