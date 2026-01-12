import React from 'react';
import { Users, Disc, DollarSign, Activity, ChevronRight } from 'lucide-react';

/**
 * LabelOverviewCard - Displays label metrics in the Business Overview
 *
 * Shows:
 * - Total Artists
 * - Active Releases
 * - Total Revenue
 * - Total Streams
 */
export default function LabelOverviewCard({ data, onNavigate }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value || 0);
  };

  return (
    <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">Label Overview</h2>
        <button
          onClick={() => onNavigate && onNavigate('roster')}
          className="text-brand-blue hover:text-blue-600 text-sm flex items-center gap-1"
        >
          View Details <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-2">
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.total_artists || 0}</div>
          <div className="text-xs text-gray-500">Artists</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 mb-2">
            <Disc className="text-purple-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.active_releases || 0}</div>
          <div className="text-xs text-gray-500">Releases</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-green-50 dark:bg-green-900/20 mb-2">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{formatCurrency(data?.total_revenue)}</div>
          <div className="text-xs text-gray-500">Revenue</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 mb-2">
            <Activity className="text-orange-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{formatNumber(data?.total_streams)}</div>
          <div className="text-xs text-gray-500">Streams</div>
        </div>
      </div>
    </div>
  );
}
