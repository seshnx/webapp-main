import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Inbox, Calendar, DollarSign, History, UserCog,
  Briefcase, Wrench, Clock, CheckCircle2, AlertCircle, ArrowUpRight,
  MapPin, Star, Shield, Filter, Search, Plus, Sparkles
} from 'lucide-react';
import TechServiceBoard from '../tech/TechServiceBoard';
import TechBusinessProfile from './TechBusinessProfile';
import TechSchedule from './TechSchedule';
import TechEarnings from './TechEarnings';
import TechHistory from './TechHistory';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

type TechTabId = 'overview' | 'board' | 'orders' | 'schedule' | 'earnings' | 'history' | 'profile';

interface TechTab {
  id: TechTabId;
  label: string;
  icon: any;
  badge?: number;
}

export interface TechManagementProps {
  user?: any;
  userData?: any;
}

export default function TechManagement({ user, userData }: TechManagementProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const clerkId = user?.id || user?.uid || userData?.clerkId || '';

  const getTechTabFromPath = (path: string): TechTabId => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'business-center' && parts[1] === 'tech' && parts[2]) {
      const sub = parts[2] as TechTabId;
      if (['overview', 'board', 'orders', 'schedule', 'earnings', 'history', 'profile'].includes(sub)) return sub;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TechTabId>(() => getTechTabFromPath(location.pathname));
  const isUpdatingFromLocation = useRef(false);

  useEffect(() => {
    if (isUpdatingFromLocation.current) {
      isUpdatingFromLocation.current = false;
      return;
    }

    const currentPath = activeTab === 'overview' ? '/business-center/tech' : `/business-center/tech/${activeTab}`;
    if (location.pathname !== currentPath) {
      navigate(currentPath, { replace: true });
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    const tabFromPath = getTechTabFromPath(location.pathname);
    if (tabFromPath !== activeTab) {
      isUpdatingFromLocation.current = true;
      setActiveTab(tabFromPath);
    }
  }, [location.pathname]);

  // Query live metrics and assigned jobs
  const metrics = useQuery(api.techServices.getTechMetrics, { techId: clerkId }) || {
    openMarketTickets: 0,
    activeJobsCount: 0,
    completedJobsCount: 0,
    totalEarned: 0,
    rating: null,
    responseRate: null,
  };

  const assignedJobs = useQuery(api.techServices.getMyAssignedJobs, { techId: clerkId }) || [];

  const tabs: TechTab[] = [
    { id: 'overview', label: 'Operations Overview', icon: BarChart3 },
    { id: 'board', label: 'Open Market Job Board', icon: Briefcase, badge: metrics.openMarketTickets },
    { id: 'orders', label: 'Active Work Orders', icon: Wrench, badge: assignedJobs.length },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'history', label: 'Work History', icon: History },
    { id: 'profile', label: 'Technician Profile & Rates', icon: UserCog },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Strip */}
      <div className="bg-white dark:bg-[#1f2128] rounded-2xl border border-gray-200 dark:border-gray-800 p-2 flex flex-wrap gap-2 shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Views */}
      {activeTab === 'overview' && (
        <TechOverviewTab
          metrics={metrics}
          assignedJobs={assignedJobs}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'board' && (
        <TechServiceBoard user={user} userData={userData} />
      )}

      {activeTab === 'orders' && (
        <TechWorkOrdersTab assignedJobs={assignedJobs} clerkId={clerkId} />
      )}

      {activeTab === 'schedule' && (
        <TechSchedule userId={clerkId} />
      )}

      {activeTab === 'earnings' && (
        <TechEarnings userId={clerkId} />
      )}

      {activeTab === 'history' && (
        <TechHistory userId={clerkId} />
      )}

      {activeTab === 'profile' && (
        <TechBusinessProfile user={user} userData={userData} />
      )}
    </div>
  );
}

// =============================================================================
// SUB-TAB: TECH OVERVIEW & METRICS
// =============================================================================

function TechOverviewTab({ metrics, assignedJobs, setActiveTab }: { metrics: any; assignedJobs: any[]; setActiveTab: (tab: TechTabId) => void }) {
  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Open Market Tickets</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black dark:text-white text-orange-500">{metrics.openMarketTickets}</span>
            <button
              onClick={() => setActiveTab('board')}
              className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-0.5"
            >
              Browse <ArrowUpRight size={13} />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Available studio repair jobs</p>
        </div>

        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Work Orders</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black dark:text-white text-brand-blue">{metrics.activeJobsCount}</span>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-brand-blue font-bold hover:underline flex items-center gap-0.5"
            >
              View <ArrowUpRight size={13} />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">In diagnostic / repair bench</p>
        </div>

        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Repairs</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-black dark:text-white text-emerald-500">{metrics.completedJobsCount}</span>
            <span className="text-xs text-gray-400">Lifetime</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Total verified completions</p>
        </div>

        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Rating</span>
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <Star size={20} className="text-amber-500 fill-amber-500" />
              <span className="text-2xl font-black dark:text-white">{metrics.rating != null ? metrics.rating : '—'}</span>
            </div>
            {metrics.responseRate && <span className="text-xs font-bold text-emerald-500">{metrics.responseRate} resp.</span>}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Verified client feedback</p>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600">
            <Briefcase size={24} />
          </div>
          <div>
            <h4 className="font-bold text-base dark:text-white">Looking for new studio contracts?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Browse open equipment repair requests across Texas and remote diagnostics.</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('board')}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition shrink-0"
        >
          View Job Board
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-TAB: ACTIVE WORK ORDERS
// =============================================================================

function TechWorkOrdersTab({ assignedJobs, clerkId }: { assignedJobs: any[]; clerkId: string }) {
  const updateStatus = useMutation(api.techServices.updateServiceRequestStatus);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleMarkComplete = async (jobId: any) => {
    try {
      await updateStatus({
        requestId: jobId,
        status: 'completed',
        actorId: clerkId,
      });
      toast.success('Work order marked as completed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update work order');
    }
  };

  const openCount = assignedJobs.filter(j => j.status === 'Open' || j.status === 'open' || j.status === 'assigned').length;
  const inProgressCount = assignedJobs.filter(j => j.status === 'In Progress' || j.status === 'in_progress').length;
  const completedCount = assignedJobs.filter(j => j.status === 'Completed' || j.status === 'completed').length;
  const totalCount = assignedJobs.length;

  const filteredJobs = assignedJobs.filter(job => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'open') return job.status === 'Open' || job.status === 'open' || job.status === 'assigned';
    if (statusFilter === 'in_progress') return job.status === 'In Progress' || job.status === 'in_progress';
    if (statusFilter === 'completed') return job.status === 'Completed' || job.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 4 Status Metric Cards extracted from TechServiceRequests */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{openCount}</div>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Assigned / Open</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40">
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">In Progress</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Completed</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-black text-gray-700 dark:text-gray-200">{totalCount}</div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Total Assigned</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold dark:text-white">Active Work Orders ({filteredJobs.length})</h3>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-[#1f2128] dark:text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Assigned / Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto">
            <Wrench size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white">No work orders found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              {statusFilter === 'all'
                ? "You currently have no repair tickets claimed or in progress. Check the Job Board to claim new contracts."
                : `No work orders currently match status "${statusFilter}".`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{job.category}</span>
                  </div>
                  <h4 className="font-bold text-base dark:text-white">{job.title}</h4>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-orange-500">${job.budget}</span>
                  <p className="text-[10px] text-gray-400">Agreed Payout</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#252830] p-3 rounded-2xl">
                {job.issueDescription}
              </p>

              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserAvatar src={job.requesterAvatar} name={job.requesterName} size="xs" />
                  <span>Studio: {job.requesterName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {job.status !== 'completed' && (
                    <button
                      onClick={() => handleMarkComplete(job._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Work Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
