import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, MapPin, User,
  ChevronLeft, ChevronRight, Filter, CheckCircle, Wrench
} from 'lucide-react';
import { getTechServiceRequests, type ServiceRequest } from '../../config/neonQueries';

/**
 * Props for TechSchedule component
 */
export interface TechScheduleProps {
  userId?: string;
}

/**
 * TechSchedule - Calendar view for technician jobs and appointments
 *
 * Features:
 * - Monthly calendar view
 * - Upcoming jobs list
 * - Filter by status
 * - Job details with client info
 * - Date navigation
 */
export default function TechSchedule({ userId }: TechScheduleProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getTechServiceRequests(userId, { limit: 100 });
        setRequests(data);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  // Filter and sort requests
  const getFilteredRequests = () => {
    let filtered = [...requests];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Only show upcoming or active requests (not cancelled)
    filtered = filtered.filter(req => req.status !== 'Cancelled');

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.preferred_date ? new Date(a.preferred_date).getTime() : 0;
      const dateB = b.preferred_date ? new Date(b.preferred_date).getTime() : 0;
      return dateA - dateB;
    });

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  // Get requests for a specific date
  const getRequestsForDate = (date: Date): ServiceRequest[] => {
    return filteredRequests.filter(req => {
      if (!req.preferred_date) return false;
      const reqDate = new Date(req.preferred_date);
      return reqDate.toDateString() === date.toDateString();
    });
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar generation
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty cells for days before the first day of the month
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(new Date(year, month, 1 - startDayOfWeek + i));
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const today = new Date();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Assigned': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-brand-blue" />
            Schedule & Calendar
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your upcoming jobs and appointments
          </p>
        </div>

        {/* Filter and View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex border dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white dark:bg-[#2c2e36] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white dark:bg-[#2c2e36] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Header */}
          <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <ChevronLeft size={20} className="dark:text-white" />
              </button>
              <div className="text-center">
                <h3 className="text-xl font-bold dark:text-white">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <ChevronRight size={20} className="dark:text-white" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((date, index) => {
                const requestsForDate = getRequestsForDate(date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 rounded-lg border transition cursor-pointer
                      ${isCurrentMonth
                        ? 'bg-white dark:bg-[#1f2128] border-gray-200 dark:border-gray-700 hover:border-brand-blue dark:hover:border-brand-blue'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-50'
                      }
                      ${isToday ? 'ring-2 ring-brand-blue' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-brand-blue' : isCurrentMonth ? 'dark:text-white' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                    {requestsForDate.slice(0, 2).map(req => (
                      <div
                        key={req.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate mb-0.5 ${getStatusBadge(req.status)}`}
                        title={req.title}
                      >
                        {req.title}
                      </div>
                    ))}
                    {requestsForDate.length > 2 && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        +{requestsForDate.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition"
              >
                Today
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredRequests.filter(r => r.status === 'Open').length}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Open Requests</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredRequests.filter(r => ['Assigned', 'In Progress'].includes(r.status)).length}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Active Jobs</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredRequests.filter(r => r.status === 'Completed').length}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">Completed This Month</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {filteredRequests.filter(r => r.preferred_date && new Date(r.preferred_date) >= today).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Upcoming</div>
            </div>
          </div>

          {/* Upcoming Jobs List */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
              <CalendarIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold dark:text-white mb-2">No upcoming jobs</h3>
              <p className="text-gray-500 text-sm">
                Your schedule will appear here once you have upcoming service requests.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold dark:text-white">{request.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {request.description}
                      </p>

                      {/* Request Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Wrench size={14} />
                          <span>{request.service_category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock size={14} />
                          <span>
                            {request.preferred_date
                              ? new Date(request.preferred_date).toLocaleDateString()
                              : 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin size={14} />
                          <span>{request.logistics}</span>
                        </div>
                        {request.budget_cap && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="font-bold text-green-600 dark:text-green-400">
                              ${request.budget_cap}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-center gap-3 ml-4">
                      {request.requester_photo ? (
                        <img
                          src={request.requester_photo}
                          alt={request.requester_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User size={18} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium dark:text-white">{request.requester_name}</div>
                        <div className="text-xs text-gray-500">
                          {request.created_at
                            ? `Posted ${new Date(request.created_at).toLocaleDateString()}`
                            : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Info */}
                  {(request.equipment_brand || request.equipment_model) && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <div className="font-medium dark:text-white mb-1">Equipment:</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {request.equipment_name}
                        {(request.equipment_brand || request.equipment_model) && (
                          <span className="text-gray-400">
                            {' '}({request.equipment_brand} {request.equipment_model})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Issue Description */}
                  {request.issue_description && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm">
                      <div className="font-medium text-orange-700 dark:text-orange-300 mb-1">Issue:</div>
                      <div className="text-orange-600 dark:text-orange-400">{request.issue_description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
