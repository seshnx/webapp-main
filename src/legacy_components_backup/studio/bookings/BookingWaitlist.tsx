import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, Bell, Check, X, XCircle, AlertCircle, Star, Trash2, LucideIcon } from 'lucide-react';

/**
 * Waitlist entry status type
 */
type WaitlistStatus = 'pending' | 'notified' | 'accepted' | 'cancelled' | 'expired';

/**
 * Waitlist entry interface
 */
interface WaitlistEntry {
    id: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    preferredDate: string;
    roomId?: string;
    roomName?: string;
    status: WaitlistStatus;
    priority: number;
    notes?: string;
    notifiedAt?: string;
    expiresAt?: string;
    createdAt: string;
    [key: string]: any;
}

/**
 * Status configuration
 */
interface StatusConfig {
    label: string;
    color: string;
    icon: LucideIcon;
}

/**
 * Stats interface
 */
interface WaitlistStats {
    total: number;
    pending: number;
    notified: number;
    expired: number;
}

/**
 * BookingWaitlist component props
 */
export interface BookingWaitlistProps {
    user?: any;
    userData?: any;
}

/**
 * BookingWaitlist - Manage waitlist entries and notify clients
 * Phase 2: Advanced booking features
 */
export default function BookingWaitlist({ user, userData }: BookingWaitlistProps) {
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterStatus, setFilterStatus] = useState<WaitlistStatus | 'all'>('all');

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const fetchWaitlist = async (): Promise<void> => {
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

    const handleNotifyClient = async (entryId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/studio-ops/waitlist/${entryId}/notify`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                // Update entry status
                setWaitlistEntries(waitlistEntries.map(entry =>
                    entry.id === entryId ? { ...entry, status: 'notified' as WaitlistStatus } : entry
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

    const handleRemoveEntry = async (entryId: string): Promise<void> => {
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

    const getStatusBadge = (entry: WaitlistEntry): React.ReactNode => {
        const statusConfig: Record<WaitlistStatus, StatusConfig> = {
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

    const getPriorityBadge = (priority: number): React.ReactNode => {
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

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredEntries: WaitlistEntry[] = filterStatus === 'all'
        ? waitlistEntries
        : waitlistEntries.filter(entry => entry.status === filterStatus);

    const stats: WaitlistStats = {
        total: waitlistEntries.length,
        pending: waitlistEntries.filter(e => e.status === 'pending').length,
        notified: waitlistEntries.filter(e => e.status === 'notified').length,
        expired: waitlistEntries.filter(e => e.status === 'expired').length
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
                <p>Loading waitlist...</p>
            </div>
        );
    }

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
                <div className="mt-4 flex gap-2 flex-wrap">
                    {(['all', 'pending', 'notified', 'accepted', 'cancelled', 'expired'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                                filterStatus === status
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Waitlist Entries */}
            {filteredEntries.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center text-gray-600 dark:text-gray-400">
                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No waitlist entries found</p>
                    <p className="text-sm">Entries will appear when clients join the waitlist</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredEntries.map((entry: WaitlistEntry) => (
                        <div
                            key={entry.id}
                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(entry)}
                                        {getPriorityBadge(entry.priority)}
                                    </div>
                                    <h3 className="text-lg font-bold dark:text-white">{entry.clientName}</h3>
                                    <p className="text-sm text-gray-500">{entry.clientEmail}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Added</div>
                                    <div className="text-sm font-medium dark:text-white">{formatDate(entry.createdAt)}</div>
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Preferred Date:</span>
                                    <span className="ml-2 font-medium dark:text-white">{formatDate(entry.preferredDate)}</span>
                                </div>
                                {entry.roomName && (
                                    <div>
                                        <span className="text-gray-500">Room:</span>
                                        <span className="ml-2 font-medium dark:text-white">{entry.roomName}</span>
                                    </div>
                                )}
                            </div>

                            {entry.notes && (
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{entry.notes}</span>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end gap-2">
                                {entry.status === 'pending' && (
                                    <button
                                        onClick={() => handleNotifyClient(entry.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                                    >
                                        <Bell size={16} />
                                        Notify Client
                                    </button>
                                )}
                                <button
                                    onClick={() => handleRemoveEntry(entry.id)}
                                    className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
