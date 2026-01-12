import React from 'react';
import { Home, Calendar, CheckCircle, ChevronRight } from 'lucide-react';

/**
 * StudioOverviewCard - Displays studio metrics in the Business Overview
 *
 * Shows:
 * - Total Rooms
 * - Pending Bookings
 * - Completed Bookings
 */
export default function StudioOverviewCard({ data, onNavigate }) {
  return (
    <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">Studio Overview</h2>
        <button
          onClick={() => onNavigate && onNavigate('studio')}
          className="text-brand-blue hover:text-blue-600 text-sm flex items-center gap-1"
        >
          View Details <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-2">
            <Home className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.total_rooms || 0}</div>
          <div className="text-xs text-gray-500">Rooms</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 mb-2">
            <Calendar className="text-yellow-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.pending_bookings || 0}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>

        <div className="text-center">
          <div className="inline-flex p-3 rounded-xl bg-green-50 dark:bg-green-900/20 mb-2">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold dark:text-white">{data?.completed_bookings || 0}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>
    </div>
  );
}
