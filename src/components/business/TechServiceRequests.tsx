import React, { useState, useEffect } from 'react';
import {
  Inbox, Clock, DollarSign, MessageSquare,
  CheckCircle, XCircle, Filter, Calendar,
  MapPin, Wrench, ChevronRight
} from 'lucide-react';
import { getTechServiceRequests, updateServiceRequestStatus, type ServiceRequest } from '../../config/neonQueries';

/**
 * Props for TechServiceRequests component
 */
export interface TechServiceRequestsProps {
  userId?: string;
}

/**
 * TechServiceRequests - Manage incoming service requests
 *
 * Features:
 * - View all incoming service requests
 * - Filter by status (All, Open, Assigned, In Progress, Completed)
 * - Accept or reject requests
 * - View client details
 * - Navigate to chat with client
 */
export default function TechServiceRequests({ userId }: TechServiceRequestsProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getTechServiceRequests(userId);
        setRequests(data);
      } catch (error) {
        console.error('Error fetching service requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  // Handle accept/reject
  const handleStatusUpdate = async (requestId: string, status: string) => {
    setProcessing(prev => new Set(prev).add(requestId));

    try {
      await updateServiceRequestStatus(requestId, status, userId);
      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status } : req
      ));
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status.toLowerCase() === filter.toLowerCase();
  });

  // Status badge styles
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Assigned': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
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
            <Inbox className="text-brand-blue" />
            Service Requests
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage incoming service requests from clients
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm border dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white"
          >
            <option value="all">All Requests</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {requests.filter(r => r.status === 'Open').length}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Open</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {requests.filter(r => r.status === 'Assigned' || r.status === 'In Progress').length}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Active</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {requests.filter(r => r.status === 'Completed').length}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Completed</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {requests.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</div>
        </div>
      </div>

      {/* Requests list */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <Inbox size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold dark:text-white mb-2">No requests found</h3>
          <p className="text-gray-500 text-sm">
            {filter === 'all'
              ? "You don't have any service requests yet."
              : `No requests with status "${filter}".`}
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

                  {/* Request details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Wrench size={14} />
                      <span>{request.service_category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin size={14} />
                      <span>{request.logistics}</span>
                    </div>
                    {request.preferred_date && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>{new Date(request.preferred_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {request.budget_cap && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign size={14} />
                        <span>Up to ${request.budget_cap}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client info */}
                <div className="flex items-center gap-3 ml-4">
                  {request.requester_photo ? (
                    <img
                      src={request.requester_photo}
                      alt={request.requester_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-bold">
                        {request.requester_name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium dark:text-white">{request.requester_name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {request.status === 'Open' && (
                <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'Assigned')}
                    disabled={processing.has(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition"
                  >
                    {processing.has(request.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Accept Request
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'Cancelled')}
                    disabled={processing.has(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:opacity-80 disabled:opacity-50 text-sm font-medium transition"
                  >
                    {processing.has(request.id) ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Decline
                      </>
                    )}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm font-medium transition"
                  >
                    <MessageSquare size={16} />
                    Message Client
                  </button>
                </div>
              )}

              {/* Equipment details */}
              {(request.equipment_brand || request.equipment_model) && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <div className="font-medium dark:text-white mb-1">Equipment:</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {request.equipment_brand && <span>{request.equipment_brand}</span>}
                    {request.equipment_brand && request.equipment_model && <span> </span>}
                    {request.equipment_model && <span>{request.equipment_model}</span>}
                  </div>
                </div>
              )}

              {/* Issue description */}
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
    </div>
  );
}
