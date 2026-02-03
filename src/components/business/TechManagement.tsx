import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Inbox, Calendar, DollarSign,
  History, UserCog, LucideIcon
} from 'lucide-react';
import TechServiceRequests from './TechServiceRequests';
import TechEarnings from './TechEarnings';
import TechSchedule from './TechSchedule';
import TechHistory from './TechHistory';
import TechBusinessProfile from './TechBusinessProfile';
import { getTechMetrics, type TechMetricsData } from '../../config/neonQueries';

/**
 * Tech tab IDs
 */
type TechTabId = 'overview' | 'requests' | 'schedule' | 'earnings' | 'history' | 'profile';

/**
 * Tech tab configuration
 */
interface TechTab {
  id: TechTabId;
  label: string;
  icon: LucideIcon;
}

/**
 * Props for TechManagement component
 */
export interface TechManagementProps {
  user?: any;
  userData?: any;
}

/**
 * TechManagement - Main technician dashboard
 *
 * Provides access to:
 * - Overview metrics
 * - Service requests management
 * - Schedule calendar
 * - Earnings dashboard
 * - Job history
 * - Business profile settings
 */
export default function TechManagement({ user, userData }: TechManagementProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get active tab from URL path
  const getTechTabFromPath = (path: string): TechTabId => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'business' && parts[1] === 'tech' && parts[2]) {
      return parts[2] as TechTabId;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TechTabId>(() => getTechTabFromPath(location.pathname));

  // Sync URL with active tab
  useEffect(() => {
    const currentPath = activeTab === 'overview' ? '/business/tech' : `/business/tech/${activeTab}`;
    if (location.pathname !== currentPath) {
      navigate(currentPath, { replace: true });
    }
  }, [activeTab, navigate]);

  // Update tab when URL changes
  useEffect(() => {
    const tabFromPath = getTechTabFromPath(location.pathname);
    if (tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
    }
  }, [location.pathname, activeTab]);

  // Tech tabs configuration
  const tabs: TechTab[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'requests', label: 'Service Requests', icon: Inbox },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Business Profile', icon: UserCog },
  ];

  // Render content based on active tab
  const renderContent = () => {
    const userId = user?.id || user?.uid;

    switch (activeTab) {
      case 'requests':
        return <TechServiceRequests userId={userId} />;
      case 'schedule':
        return <TechSchedule userId={userId} />;
      case 'earnings':
        return <TechEarnings userId={userId} />;
      case 'history':
        return <TechHistory userId={userId} />;
      case 'profile':
        return <TechBusinessProfile user={user} userData={userData} />;
      case 'overview':
      default:
        return <TechOverview userId={userId} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-1.5 flex flex-wrap gap-1 shadow-sm">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <IconComponent size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}

/**
 * TechOverview - Dashboard with metrics
 */
interface TechOverviewProps {
  userId?: string;
  setActiveTab: (tab: TechTabId) => void;
}

function TechOverview({ userId, setActiveTab }: TechOverviewProps) {
  const [metrics, setMetrics] = useState<TechMetricsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getTechMetrics(userId);
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching tech metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [userId]);

  const formatCurrency = (value: number | undefined): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Tech Management Dashboard</h1>
          <p className="text-orange-100 max-w-xl">
            Manage your service requests, track earnings, and grow your technical services business.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 text-center">
          <div className="inline-flex p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 mb-3">
            <Inbox className="text-orange-600" size={28} />
          </div>
          <div className="text-3xl font-bold dark:text-white">{metrics?.open_requests || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Open Requests</div>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 text-center">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-3">
            <Calendar className="text-blue-600" size={28} />
          </div>
          <div className="text-3xl font-bold dark:text-white">{metrics?.active_jobs || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Active Jobs</div>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 text-center">
          <div className="inline-flex p-3 rounded-xl bg-green-50 dark:bg-green-900/20 mb-3">
            <DollarSign className="text-green-600" size={28} />
          </div>
          <div className="text-3xl font-bold dark:text-white">{formatCurrency(metrics?.pending_earnings)}</div>
          <div className="text-sm text-gray-500 mt-1">Pending Earnings</div>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 text-center">
          <div className="inline-flex p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 mb-3">
            <BarChart3 className="text-yellow-600" size={28} />
          </div>
          <div className="text-3xl font-bold dark:text-white">
            {metrics?.average_rating ? metrics.average_rating.toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Average Rating</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4">Earnings Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Earned</span>
              <span className="font-bold dark:text-white">{formatCurrency(metrics?.total_earnings)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-bold dark:text-white">{formatCurrency(metrics?.pending_earnings)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</span>
              <span className="font-bold dark:text-white">{metrics?.completed_jobs || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
              <span className="font-bold dark:text-white">
                {metrics?.average_rating ? `${metrics.average_rating.toFixed(1)} / 5.0` : 'Not rated'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</span>
              <span className="font-bold dark:text-white">{metrics?.completed_jobs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="font-bold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-bold dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('schedule')}
            className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-left group hover:border-brand-blue dark:hover:border-brand-blue"
          >
            <Calendar className="text-blue-500 mb-3" size={24} />
            <h4 className="font-bold dark:text-white mb-1">View Schedule</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">See your upcoming jobs and calendar</p>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-left group hover:border-brand-blue dark:hover:border-brand-blue"
          >
            <History className="text-purple-500 mb-3" size={24} />
            <h4 className="font-bold dark:text-white mb-1">Job History</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review completed work and client relationships</p>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-left group hover:border-brand-blue dark:hover:border-brand-blue"
          >
            <UserCog className="text-orange-500 mb-3" size={24} />
            <h4 className="font-bold dark:text-white mb-1">Edit Profile</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your business information and settings</p>
          </button>
        </div>
      </div>
    </div>
  );
}
