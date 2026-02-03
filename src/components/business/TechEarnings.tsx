import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Calendar, Download,
  Filter, CheckCircle, ChevronDown
} from 'lucide-react';
import { getTechEarnings, type ServiceRequest } from '../../config/neonQueries';

/**
 * Props for TechEarnings component
 */
export interface TechEarningsProps {
  userId?: string;
}

/**
 * TechEarnings - Display technician earnings history and analytics
 *
 * Features:
 * - Total earnings summary
 * - Earnings history table
 * - Filter by date range
 * - Export earnings data
 */
export default function TechEarnings({ userId }: TechEarningsProps) {
  const [earnings, setEarnings] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Fetch earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getTechEarnings(userId, { limit: 100 });
        setEarnings(data);
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [userId]);

  // Calculate totals
  const totalEarnings = earnings.reduce((sum, req) => sum + (req.actual_cost || 0), 0);
  const totalJobs = earnings.length;
  const averageJobValue = totalJobs > 0 ? totalEarnings / totalJobs : 0;

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter and sort earnings
  const getFilteredEarnings = () => {
    let filtered = [...earnings];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateFilter) {
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(req => {
        const completedDate = new Date(req.completed_at || '');
        return completedDate >= cutoffDate;
      });
    }

    // Sort
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) =>
          new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime()
        );
        break;
      case 'amount':
        filtered.sort((a, b) => (b.actual_cost || 0) - (a.actual_cost || 0));
        break;
    }

    return filtered;
  };

  const filteredEarnings = getFilteredEarnings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <DollarSign className="text-green-600" />
          Earnings Dashboard
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track your service revenue and payment history
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">Total Earnings</span>
            <DollarSign size={20} className="text-green-200" />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalEarnings)}</div>
          <div className="text-green-100 text-sm mt-1">
            From {totalJobs} completed job{totalJobs !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-2xl p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">Average Job Value</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold dark:text-white">{formatCurrency(averageJobValue)}</div>
          <div className="text-gray-400 text-sm mt-1">Per completed job</div>
        </div>

        <div className="bg-white dark:bg-[#2c2e36] rounded-2xl p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">Completion Rate</span>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold dark:text-white">100%</div>
          <div className="text-gray-400 text-sm mt-1">All jobs completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
            >
              <option value="all">All time</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">Last year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
            >
              <option value="date">Sort by date</option>
              <option value="amount">Sort by amount</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            const csv = [
              ['Date', 'Client', 'Service', 'Equipment', 'Amount'],
              ...filteredEarnings.map(e => [
                e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '',
                e.requester_name || '',
                e.service_category,
                e.equipment_name,
                formatCurrency(e.actual_cost || 0)
              ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium transition"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Earnings table */}
      {filteredEarnings.length === 0 ? (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <DollarSign size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold dark:text-white mb-2">No earnings yet</h3>
          <p className="text-gray-500 text-sm">
            Your completed jobs and earnings will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {earning.completed_at
                        ? new Date(earning.completed_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {earning.requester_photo ? (
                          <img
                            src={earning.requester_photo}
                            alt={earning.requester_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : null}
                        <div className="text-sm font-medium dark:text-white">
                          {earning.requester_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {earning.service_category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {earning.equipment_name}
                      {(earning.equipment_brand || earning.equipment_model) && (
                        <span className="text-gray-400">
                          {' '}({earning.equipment_brand} {earning.equipment_model})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(earning.actual_cost || 0)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
