import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Heart, DollarSign, Share2, Award, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreatorStudioProps {
  user: any;
  userData: any;
}

import { useReceivedTips, usePostsByAuthor } from '../../hooks/useConvex';

interface CreatorStudioProps {
  user: any;
  userData: any;
}

export default function CreatorStudio({ user, userData }: CreatorStudioProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const clerkId = user?.id || user?.uid || '';
  const tips = useReceivedTips(clerkId) || [];
  const authorPosts = usePostsByAuthor(clerkId, 10) || [];

  const totalTipsAmount = tips.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const followerCount = userData?.stats?.followersCount || userData?.followersCount || 0;
  const postsCount = userData?.stats?.postsCount || authorPosts.length || 0;

  // Stats summaries bound to real DB data
  const stats = [
    { title: 'Total Followers', value: `${followerCount}`, change: '+100%', isPositive: true, icon: Users, color: 'text-purple-500' },
    { title: 'Total Posts', value: `${postsCount}`, change: 'Active', isPositive: true, icon: Eye, color: 'text-blue-500' },
    { title: 'Tip Earnings', value: `$${totalTipsAmount.toFixed(2)}`, change: '+Realtime', isPositive: true, icon: DollarSign, color: 'text-emerald-500' },
  ];

  // Top Performing Posts
  const topPosts = [
    {
      id: 'p1',
      title: 'Analog Summing Vocal Stems Tutorial',
      type: 'Audio / Video',
      views: '14.2k',
      likes: '1.2k',
      tips: '$85.00',
      date: 'Aug 22, 2026'
    },
    {
      id: 'p2',
      title: 'Neumann U87 mic test comparison vs Warm Audio WA-87',
      type: 'Audio',
      views: '9.8k',
      likes: '840',
      tips: '$50.00',
      date: 'Aug 18, 2026'
    },
    {
      id: 'p3',
      title: 'Behind the Scenes of Session Room B',
      type: 'Story / Short',
      views: '7.4k',
      likes: '620',
      tips: '$25.00',
      date: 'Aug 12, 2026'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <BarChart3 className="text-brand-blue" size={24} />
            Creator Studio & Analytics
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track your social reach, audience engagement, audio performance, and earnings.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeRange === range
                  ? 'bg-white dark:bg-dark-card text-brand-blue shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Last {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-5 border dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{stat.title}</span>
                <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black dark:text-white">{stat.value}</h3>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Chart & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Trend Chart Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-blue" />
              Engagement Growth Trend
            </h3>
            <span className="text-xs text-gray-400">Updated today</span>
          </div>

          {/* Graphical Bar Visualization */}
          <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2 border-b dark:border-gray-700">
            {[40, 55, 35, 70, 85, 60, 95, 80, 100, 75, 90, 110].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  className="w-full bg-gradient-to-t from-brand-blue to-purple-500 rounded-t-lg group-hover:brightness-125 transition-all"
                  style={{ height: `${h * 0.8}%` }}
                />
                <span className="text-[10px] text-gray-400">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Audience Categories */}
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-sm dark:text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Audience Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Producers & Beatmakers', percent: 45, color: 'bg-brand-blue' },
              { label: 'Vocalists & Songwriters', percent: 28, color: 'bg-purple-500' },
              { label: 'Mixing Engineers', percent: 18, color: 'bg-pink-500' },
              { label: 'Studios & Labels', percent: 9, color: 'bg-amber-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="dark:text-gray-300">{item.label}</span>
                  <span className="text-gray-500">{item.percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
        <h3 className="font-bold text-sm dark:text-white mb-4">Top Performing Posts</h3>
        <div className="divide-y dark:divide-gray-800">
          {topPosts.map(post => (
            <div key={post.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm dark:text-white">{post.title}</h4>
                <span className="text-xs text-gray-500">{post.type} • Published {post.date}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="dark:text-gray-300 flex items-center gap-1">
                  <Eye size={14} className="text-gray-400" /> {post.views}
                </span>
                <span className="dark:text-gray-300 flex items-center gap-1">
                  <Heart size={14} className="text-rose-500" /> {post.likes}
                </span>
                <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  {post.tips}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
