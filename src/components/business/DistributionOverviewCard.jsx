import React from 'react';
import { Disc, Play, FileText, ChevronRight } from 'lucide-react';

/**
 * DistributionOverviewCard - Displays distribution metrics in the Business Overview
 *
 * Shows:
 * - Total Releases
 * - Live Releases
 * - Draft Releases
 */
export default function DistributionOverviewCard({ data, onNavigate }) {
  return (
    <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">Distribution Overview</h2>
        <button
          onClick={() => onNavigate && onNavigate('distribution')}
          className="text-brand-blue hover:text-blue-600 text-sm flex items-center gap-1"
        >
          View Details <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 mb-2">
            <Disc className="text-purple-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.total_releases || 0}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-green-50 dark:bg-green-900/20 mb-2">
            <Play className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.live_releases || 0}</div>
          <div className="text-xs text-gray-500">Live</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 mb-2">
            <FileText className="text-gray-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.draft_releases || 0}</div>
          <div className="text-xs text-gray-500">Drafts</div>
        </div>
      </div>
    </div>
  );
}
