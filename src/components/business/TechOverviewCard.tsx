import React from 'react';
import { Inbox, Clock, DollarSign, Star, ChevronRight } from 'lucide-react';
import type { TechMetricsData } from '../../config/neonQueries';

/**
 * Props for TechOverviewCard component
 */
export interface TechOverviewCardProps {
  data?: TechMetricsData | null;
  onNavigate?: (section: string) => void;
}

/**
 * TechOverviewCard - Displays technician metrics in the Business Overview
 *
 * Shows:
 * - Open Requests (new service requests needing assignment)
 * - Active Jobs (assigned but not completed)
 * - Pending Earnings (estimated revenue from active jobs)
 * - Average Rating (client satisfaction score)
 */
export default function TechOverviewCard({ data, onNavigate }: TechOverviewCardProps) {
  const formatCurrency = (value: number | undefined): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatRating = (value: number | string | undefined): string => {
    if (!value) return '0.0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0.0';
    return numValue.toFixed(1);
  };

  return (
    <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">Tech Services Overview</h2>
        <button
          onClick={() => onNavigate && onNavigate('tech')}
          className="text-brand-blue hover:text-blue-600 text-sm flex items-center gap-1"
        >
          View Details <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 mb-2">
            <Inbox className="text-orange-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.open_requests || 0}</div>
          <div className="text-xs text-gray-500">Open Requests</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-2">
            <Clock className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.active_jobs || 0}</div>
          <div className="text-xs text-gray-500">Active Jobs</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-green-50 dark:bg-green-900/20 mb-2">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{formatCurrency(data?.pending_earnings)}</div>
          <div className="text-xs text-gray-500">Pending Earnings</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 mb-2">
            <Star className="text-yellow-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{formatRating(data?.average_rating)}</div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
      </div>
    </div>
  );
}
