import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, Bell, Check, X, XCircle, AlertCircle, Star, Trash2 } from 'lucide-react';

/**
 * BookingWaitlist - Manage waitlist entries and notify clients
 * Phase 2: Advanced booking features
 */
export default function BookingWaitlist({ user, userData }) {
    const [waitlistEntries, setWaitlistEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const fetchWaitlist = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/studio-ops/waitlist?studioId=${userData?.id}`);
            const data = await response.json();

            if (data.success) {
                setWaitlistEntries(data.data);
            }
        } catch (error) {
            console.error('Error fetching waitlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotifyClient = async (entryId) => {
        try {
            const response = await fetch(`/api/studio-ops/waitlist/${entryId}/notify`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                // Update entry status
                setWaitlistEntries(waitlistEntries.map(entry =>
                    entry.id === entryId ? { ...entry, status: 'notified' } : entry
                ));
                alert('Client notified successfully! They have 24 hours to respond.');
            } else {
                alert(`Error: ${data.error || 'Failed to notify client'}`);
            }
        } catch (error) {
            console.error('Error notifying client:', error);
            alert('Failed to notify client. Please try again.');
        }
    };

    const handleRemoveEntry = async (entryId) => {
        if (!confirm('Remove this entry from the waitlist?')) return;

        try {
            const response = await fetch(`/api/studio-ops/waitlist/${entryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setWaitlistEntries(waitlistEntries.filter(entry => entry.id !== entryId));
            } else {
                alert(`Error: ${data.error || 'Failed to remove entry'}`);
            }
        } catch (error) {
            console.error('Error removing entry:', error);
            alert('Failed to remove entry. Please try again.');
        }
    };

    const getStatusBadge = (entry) => {
        const statusConfig = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: Clock
            },
            notified: {
                label: 'Awaiting Response',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: Bell
            },
            accepted: {
                label: 'Accepted',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: Check
            },
            cancelled: {
                label: 'Cancelled',
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                icon: XCircle
            },
            expired: {
                label: 'Expired',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: XCircle
            }
        };

        const config = statusConfig[entry.status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        if (priority >= 80) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <Star size={10} className="fill-current" />
                    High Priority
                </span>
            );
        } else if (priority >= 50) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    Medium
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                Normal
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredEntries = filterStatus === 'all'
        ? waitlistEntries
        : waitlistEntries.filter(entry => entry.status === filterStatus);

    const stats = {
        total: waitlistEntries.length,
        pending: waitlistEntries.filter(e => e.status === 'pending').length,
        notified: waitlistEntries.filter(e => e.status === 'notified').length,
        expired: waitlistEntries.filter(e => e.status === 'expired').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <Users size={20} />
                            </div>
                            Booking Waitlist
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage waitlist entries and notify clients of availability
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold dark:text-white">{stats.total}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.notified}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Awaiting Response</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
                    </div>
                </div>

                {/* Filter */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            filterStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        onClick={() => setFilterStatus('notified')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            filterStatus === 'notified'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Notified ({stats.notified})
                    </button>
                </div>
            </div>

            {/* Waitlist Entries */}
            {loading ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                    Loading waitlist entries...
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold mb-2">No waitlist entries found</p>
                    <p className="text-sm">
                        {filterStatus !== 'all' ? 'Try a different filter' : 'Waitlist is currently empty'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Client Info */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-semibold dark:text-white">
                                            {entry.client_name || 'Unknown Client'}
                                        </h3>
                                        {getPriorityBadge(entry.priority)}
                                        {getStatusBadge(entry)}
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {entry.client_email && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Email:</span> {entry.client_email}
                                            </div>
                                        )}
                                        {entry.client_phone && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Phone:</span> {entry.client_phone}
                                            </div>
                                        )}
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Requested:</span> {formatDate(entry.requested_date)}
                                        </div>
                                        {entry.room_name && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Room:</span> {entry.room_name}
                                            </div>
                                        )}
                                        {entry.booking_type && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Type:</span> {entry.booking_type}
                                            </div>
                                        )}
                                        {entry.expires_at && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Expires:</span> {formatDate(entry.expires_at)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    {entry.status === 'pending' && (
                                        <button
                                            onClick={() => handleNotifyClient(entry.id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            <Bell size={16} />
                                            Notify
                                        </button>
                                    )}
                                    {entry.status === 'notified' && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                            Awaiting response
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRemoveEntry(entry.id)}
                                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                        title="Remove from waitlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Booking Info (if exists) */}
                            {entry.booking_date && (
                                <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                                        Originally requested booking:
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {entry.booking_date} at {entry.booking_start_time}
                                        {entry.booking_end_time && ` - ${entry.booking_end_time}`}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
