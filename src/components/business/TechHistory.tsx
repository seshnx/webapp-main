import React, { useState, useEffect } from 'react';
import {
  History, CheckCircle, Star, Calendar, TrendingUp,
  Award, Users, Filter, ChevronDown, Briefcase, Wrench
} from 'lucide-react';
import { getTechEarnings, type ServiceRequest } from '../../config/neonQueries';

/**
 * Props for TechHistory component
 */
export interface TechHistoryProps {
  userId?: string;
}

/**
 * TechHistory - Job history and portfolio for technicians
 *
 * Features:
 * - Completed jobs log
 * - Client relationship tracking
 * - Repeat client identification
 * - Work history portfolio
 * - Performance statistics
 */
export default function TechHistory({ userId }: TechHistoryProps) {
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    const fetchJobs = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getTechEarnings(userId, { limit: 200 });
        setJobs(data);
      } catch (error) {
        console.error('Error fetching job history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId]);

  // Calculate statistics
  const calculateStats = () => {
    const completedJobs = jobs.filter(job => job.status === 'Completed' && job.completed_at);
    const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.actual_cost || 0), 0);

    // Find repeat clients
    const clientJobs: Record<string, ServiceRequest[]> = {};
    completedJobs.forEach(job => {
      if (job.requester_id) {
        if (!clientJobs[job.requester_id]) {
          clientJobs[job.requester_id] = [];
        }
        clientJobs[job.requester_id].push(job);
      }
    });

    const repeatClients = Object.values(clientJobs).filter(clientJobs => clientJobs.length > 1);
    const totalRepeatClients = repeatClients.length;
    const totalRepeatJobs = repeatClients.reduce((sum, jobs) => sum + jobs.length, 0);

    // Average job value
    const avgJobValue = completedJobs.length > 0 ? totalEarnings / completedJobs.length : 0;

    // Average rating
    const ratings = completedJobs.map(job => job.actual_cost ? 5 : 0); // Placeholder - would need actual rating field
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    return {
      totalJobs: completedJobs.length,
      totalEarnings,
      avgJobValue,
      avgRating,
      repeatClients: totalRepeatClients,
      repeatJobs: totalRepeatJobs,
      completionRate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 100
    };
  };

  const stats = calculateStats();

  // Filter and sort jobs
  const getFilteredJobs = () => {
    let filtered = jobs.filter(job => job.status === 'Completed' && job.completed_at);

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

      filtered = filtered.filter(job => {
        const completedDate = new Date(job.completed_at!);
        return completedDate >= cutoffDate;
      });
    }

    // Sort
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) =>
          new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
        );
        break;
      case 'amount':
        filtered.sort((a, b) => (b.actual_cost || 0) - (a.actual_cost || 0));
        break;
      case 'client':
        filtered.sort((a, b) => (a.requester_name || '').localeCompare(b.requester_name || ''));
        break;
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  // Find repeat clients
  const getRepeatClientData = () => {
    const clientMap: Record<string, {
      name: string;
      photo?: string;
      jobs: ServiceRequest[];
      totalSpent: number;
      jobCount: number;
    }> = {};

    filteredJobs.forEach(job => {
      if (job.requester_id) {
        if (!clientMap[job.requester_id]) {
          clientMap[job.requester_id] = {
            name: job.requester_name || 'Unknown',
            photo: job.requester_photo,
            jobs: [],
            totalSpent: 0,
            jobCount: 0
          };
        }
        clientMap[job.requester_id].jobs.push(job);
        clientMap[job.requester_id].totalSpent += job.actual_cost || 0;
        clientMap[job.requester_id].jobCount += 1;
      }
    });

    return Object.values(clientMap)
      .filter(client => client.jobCount > 1)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const repeatClients = getRepeatClientData();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <History className="text-brand-blue" />
          Job History & Portfolio
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Track your completed work and client relationships
        </p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">Total Jobs</span>
            <Briefcase size={20} className="text-green-200" />
          </div>
          <div className="text-3xl font-bold">{stats.totalJobs}</div>
          <div className="text-green-100 text-sm mt-1">Completed successfully</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Total Earnings</span>
            <TrendingUp size={20} className="text-blue-200" />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
          <div className="text-blue-100 text-sm mt-1">Lifetime revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 text-sm font-medium">Avg Job Value</span>
            <Award size={20} className="text-purple-200" />
          </div>
          <div className="text-3xl font-bold">{formatCurrency(stats.avgJobValue)}</div>
          <div className="text-purple-100 text-sm mt-1">Per completed job</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100 text-sm font-medium">Repeat Clients</span>
            <Users size={20} className="text-orange-200" />
          </div>
          <div className="text-3xl font-bold">{stats.repeatClients}</div>
          <div className="text-orange-100 text-sm mt-1">
            {stats.repeatJobs > 0 ? `${stats.repeatJobs} repeat jobs` : 'No repeats yet'}
          </div>
        </div>
      </div>

      {/* Repeat Clients Section */}
      {repeatClients.length > 0 && (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-purple-500" />
            Top Repeat Clients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repeatClients.slice(0, 6).map((client, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  {client.photo ? (
                    <img
                      src={client.photo}
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users size={18} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold dark:text-white truncate">{client.name}</div>
                    <div className="text-xs text-gray-500">
                      {client.jobCount} job{client.jobCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(client.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-500">total spent</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <option value="client">Sort by client</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filteredJobs.length} completed job{filteredJobs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Job History List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <History size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold dark:text-white mb-2">No job history yet</h3>
          <p className="text-gray-500 text-sm">
            Your completed jobs and portfolio will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold dark:text-white">{job.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Completed
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Wrench size={14} />
                      <span>{job.service_category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={14} />
                      <span>
                        {job.completed_at
                          ? new Date(job.completed_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Equipment:</span>
                      <span>{job.equipment_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(job.actual_cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-3 ml-4">
                  {job.requester_photo ? (
                    <img
                      src={job.requester_photo}
                      alt={job.requester_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Users size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium dark:text-white">{job.requester_name}</div>
                    <div className="text-xs text-gray-500">Client</div>
                  </div>
                </div>
              </div>

              {/* Equipment & Issue Details */}
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                {(job.equipment_brand || job.equipment_model) && (
                  <div className="mb-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Equipment: </span>
                    <span className="dark:text-gray-300">
                      {job.equipment_brand && <span className="font-medium">{job.equipment_brand}</span>}
                      {job.equipment_brand && job.equipment_model && <span> </span>}
                      {job.equipment_model && <span className="font-medium">{job.equipment_model}</span>}
                    </span>
                  </div>
                )}
                {job.issue_description && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-sm">
                    <div className="font-medium text-orange-700 dark:text-orange-300 mb-1">Issue Resolved:</div>
                    <div className="text-orange-600 dark:text-orange-400">{job.issue_description}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
