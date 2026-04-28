/**
 * Producer Dashboard View
 *
 * Role-specific dashboard for music producers with beat sales,
 * collaboration opportunities, and studio metrics.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, BarChart3, Music, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useQuery } from 'convex/react';
import type { DashboardProps, RoleMetric, QuickAction, ProducerDashboardData } from '../../../types/dashboard';
import { StatsCard } from '../widgets/StatsCard';
import { RoleMetrics } from '../sections/RoleMetrics';
import { QuickActions } from '../sections/QuickActions';
import { api } from '@convex/api';

interface ProducerDashboardProps extends DashboardProps {
  className?: string;
}

export function ProducerDashboard({ userData, className = '' }: ProducerDashboardProps) {
  // Fetch data from Convex
  const transactions = useQuery(api.marketplace.getTransactionsBySeller,
    userData ? { sellerId: userData.clerkId, status: "completed" } : "skip"
  );
  const posts = useQuery(api.social.getPostsByAuthor,
    userData ? { clerkId: userData.clerkId, limit: 20 } : "skip"
  );

  // Calculate metrics from real data
  const recentSalesCount = transactions?.length || 0;
  const totalRevenue = transactions?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;
  const postsCount = posts?.length || 0;

  const [data, setData] = useState<ProducerDashboardData>({
    recentSales: recentSalesCount,
    streamingRevenue: totalRevenue,
    collaborationInvites: 0, // TODO: Implement collaboration invites tracking
    beatUploads: postsCount
  });

  const [metrics, setMetrics] = useState<RoleMetric[]>([
    {
      id: 'beat-sales',
      label: 'Beat Sales (This Month)',
      value: recentSalesCount,
      previousValue: 0,
      trend: 'up',
      trendPercentage: 12,
      icon: Music,
      color: 'blue'
    },
    {
      id: 'streaming-revenue',
      label: 'Streaming Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
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
      value: postsCount,
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

  // Update metrics when data changes
  useEffect(() => {
    setData({
      recentSales: recentSalesCount,
      streamingRevenue: totalRevenue,
      collaborationInvites: 0, // TODO: Implement collaboration invites tracking
      beatUploads: postsCount
    });

    setMetrics(prev => prev.map(m => {
      if (m.id === 'beat-sales') return { ...m, value: recentSalesCount, previousValue: Math.max(0, recentSalesCount - 5) };
      if (m.id === 'streaming-revenue') return { ...m, value: `$${totalRevenue.toLocaleString()}`, previousValue: '$0' };
      if (m.id === 'collaborations') return { ...m, value: 0 }; // TODO: Track real collaborations
      if (m.id === 'total-plays') return { ...m, value: postsCount, previousValue: Math.max(0, postsCount - 10) };
      return m;
    }));
  }, [recentSalesCount, totalRevenue, postsCount]);

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
