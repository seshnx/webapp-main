import React, { useState, useEffect } from 'react';
import {
  Briefcase, Clock, MapPin, DollarSign, Calendar,
  Filter, Wrench, User, ChevronDown, Building2
} from 'lucide-react';
import { SERVICE_CATALOGUE } from '../../config/constants';
import { getOpenServiceRequests, updateServiceRequestStatus, type ServiceRequest } from '../../config/neonQueries';
import type { UserData } from '../../types';

/**
 * Props for TechServiceBoard component
 */
export interface TechServiceBoardProps {
  user?: any;
  userData?: UserData | null;
}

/**
 * TechServiceBoard - Enhanced job board for open service requests
 *
 * Features:
 * - Public view of all open service requests
 * - Filter by category, location, budget
 * - Show request age (posted X hours ago)
 * - "I'm interested" button for technicians
 * - Real-time status updates
 */
export default function TechServiceBoard({ user, userData }: TechServiceBoardProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'budget_high' | 'budget_low'>('newest');
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const isTechnician = userData?.accountTypes?.includes('Technician');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getOpenServiceRequests({
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          limit: 50
        });
        setRequests(data);
      } catch (error) {
        console.error('Error fetching service requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [categoryFilter]);

  // Sort requests
  const getSortedRequests = () => {
    const sorted = [...requests];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'budget_high':
        return sorted.filter(r => r.budget_cap).sort((a, b) => (b.budget_cap || 0) - (a.budget_cap || 0));
      case 'budget_low':
        return sorted.filter(r => r.budget_cap).sort((a, b) => (a.budget_cap || 0) - (b.budget_cap || 0));
      default:
        return sorted;
    }
  };

  const sortedRequests = getSortedRequests();

  const handleInterest = async (requestId: string) => {
    const userId = user?.id || user?.uid;
    if (!userId || !isTechnician) {
      alert('Only technicians can express interest in service requests.');
      return;
    }

    setProcessing(prev => new Set(prev).add(requestId));

    try {
      // Update status to Assigned - technician has claimed this job
      await updateServiceRequestStatus(requestId, 'Assigned', userId);

      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error expressing interest:', error);
      alert('Failed to express interest. Please try again.');
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const getRequestAge = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      'Urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Normal': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return badges[priority] || badges['Normal'];
  };

  const getLogisticsIcon = (logistics: string) => {
    if (logistics.toLowerCase().includes('drop-off') || logistics.toLowerCase().includes('drop off')) {
      return <Building2 size={14} />;
    }
    if (logistics.toLowerCase().includes('pickup') || logistics.toLowerCase().includes('pick up')) {
      return <Wrench size={14} />;
    }
    if (logistics.toLowerCase().includes('on-site') || logistics.toLowerCase().includes('on site')) {
      return <MapPin size={14} />;
    }
    return <Calendar size={14} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <Briefcase className="text-orange-500" />
          Service Request Board
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Browse open service requests and find jobs that match your expertise
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
            <select
              className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {SERVICE_CATALOGUE.map(cat => (
                <option key={cat.id} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Location</label>
            <input
              type="text"
              className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            />
          </div>

          {/* Budget Filter */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min Budget</label>
            <select
              className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
              value={budgetFilter}
              onChange={e => setBudgetFilter(e.target.value)}
            >
              <option value="all">Any Budget</option>
              <option value="0">$0+</option>
              <option value="50">$50+</option>
              <option value="100">$100+</option>
              <option value="200">$200+</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Sort By</label>
            <select
              className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white text-sm"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        {loading ? 'Loading...' : `${sortedRequests.length} open request${sortedRequests.length !== 1 ? 's' : ''}`}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedRequests.length === 0 && (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold dark:text-white mb-2">No open requests</h3>
          <p className="text-gray-500 text-sm">
            {categoryFilter !== 'all' || locationFilter || budgetFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No service requests are currently available. Check back soon!'}
          </p>
        </div>
      )}

      {/* Requests Grid */}
      {!loading && sortedRequests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                      {request.service_category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg dark:text-white">{request.title}</h3>
                </div>
                <div className="text-right">
                  {request.budget_cap && (
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      ${request.budget_cap}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                    <Clock size={12} />
                    {getRequestAge(request.created_at)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {request.description}
              </p>

              {/* Issue Details */}
              {request.issue_description && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 mb-3 text-sm">
                  <div className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">Issue:</div>
                  <div className="text-orange-600 dark:text-orange-400 line-clamp-2">
                    {request.issue_description}
                  </div>
                </div>
              )}

              {/* Equipment Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="font-medium">{request.equipment_name}</span>
                {(request.equipment_brand || request.equipment_model) && (
                  <span className="text-gray-400">
                    ({request.equipment_brand} {request.equipment_model})
                  </span>
                )}
              </div>

              {/* Logistics & Location */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  {getLogisticsIcon(request.logistics)}
                  <span>{request.logistics}</span>
                </div>
                {request.logistics && request.location && (
                  <span>•</span>
                )}
                {request.logistics && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {request.logistics}
                  </span>
                )}
                {request.preferred_date && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(request.preferred_date).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              {/* Client Info & Actions */}
              <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {request.requester_photo ? (
                    <img
                      src={request.requester_photo}
                      alt={request.requester_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium dark:text-white">{request.requester_name}</div>
                    <div className="text-xs text-gray-500">Client</div>
                  </div>
                </div>

                {isTechnician && (
                  <button
                    onClick={() => handleInterest(request.id)}
                    disabled={processing.has(request.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    {processing.has(request.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wrench size={14} />
                        I'm Interested
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
