import { useState, useEffect } from 'react';
import {
    Calendar, User, Check, X, MessageSquare,
    Search, RefreshCw, ChevronLeft, ChevronRight,
    CheckCircle, XCircle, Clock3, Eye, Ban, Trash2,
    Sparkles, Users, CreditCard, Calendar as CalendarIcon,
    Repeat, Home
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBookings, getBlockedDates, updateBookingStatus } from '../../config/neonQueries';
import type { BlockedDate } from '../../config/neonQueries';
import RecurringBookingModal from './RecurringBookingModal';
import MultiRoomBookingModal from './MultiRoomBookingModal';
import UnifiedCalendar from '../shared/UnifiedCalendar';
import BookingTemplates from './bookings/BookingTemplates';
import BookingWaitlist from './bookings/BookingWaitlist';
import BookingPayments from './bookings/BookingPayments';
import CalendarSync from './bookings/CalendarSync';

/**
 * Booking status type
 */
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Status configuration interface
 */
interface StatusConfig {
    label: string;
    color: string;
    icon: LucideIcon;
    bgClass: string;
}

/**
 * Status configuration mapping
 */
const STATUS_CONFIG: Record<string, StatusConfig> = {
    pending: {
        label: 'Pending',
        color: 'amber',
        icon: Clock3,
        bgClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    },
    confirmed: {
        label: 'Confirmed',
        color: 'green',
        icon: CheckCircle,
        bgClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    },
    cancelled: {
        label: 'Cancelled',
        color: 'red',
        icon: XCircle,
        bgClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    },
    completed: {
        label: 'Completed',
        color: 'blue',
        icon: Check,
        bgClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    },
};

/**
 * Booking interface
 */
interface Booking {
    id: string;
    status?: BookingStatus | string;
    date?: Date | null;
    clientName?: string;
    clientEmail?: string;
    clientId?: string;
    roomName?: string;
    startTime?: string;
    duration?: number;
    totalPrice?: number;
    offer_amount?: number;
    notes?: string;
    createdAt?: Date;
    created_at?: string;
    timestamp?: number;
    [key: string]: any;
}

/**
 * Blocked date interface
 */
interface BlockedDate {
    id: string;
    date: string | Date;
    time_slot?: string;
    start_time?: string;
    end_time?: string;
    reason?: string;
    studio_id?: string;
    [key: string]: any;
}

/**
 * StudioBookings component props
 */
export interface StudioBookingsProps {
    user?: any;
    userData?: any;
    onNavigateToChat?: (clientId: string) => void;
}

/**
 * Helper function to get status config
 */
function getStatusConfig(status?: string): StatusConfig {
    if (!status) return STATUS_CONFIG.pending;
    const statusLower = status.toLowerCase();
    return STATUS_CONFIG[statusLower] || STATUS_CONFIG.pending;
}

/**
 * StudioBookings - Manage incoming bookings for the studio
 * Phase 2: Includes templates, waitlist, payments, and calendar sync
 */
export default function StudioBookings({ user, userData, onNavigateToChat }: StudioBookingsProps) {
    const [activeTab, setActiveTab] = useState<string>('bookings'); // 'bookings', 'templates', 'waitlist', 'payments', 'calendar-sync'
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [blockReason, setBlockReason] = useState<string>('');
    const [blockTimeSlot, setBlockTimeSlot] = useState<string>('full'); // 'full', 'morning', 'afternoon', 'evening', 'custom'
    const [customStartTime, setCustomStartTime] = useState<string>('09:00');
    const [customEndTime, setCustomEndTime] = useState<string>('17:00');
    const [showRecurringModal, setShowRecurringModal] = useState<boolean>(false);
    const [showMultiRoomModal, setShowMultiRoomModal] = useState<boolean>(false);
    const [selectedBookingForRecurring, setSelectedBookingForRecurring] = useState<Booking | null>(null);
    const [selectedBookingForRooms, setSelectedBookingForRooms] = useState<Booking | null>(null);

    // Fetch bookings from Neon API
    useEffect(() => {
        if (!userData?.id) return;

        loadBookings();

        // Poll for updates every 30 seconds (replace with Convex real-time later)
        const interval = setInterval(() => {
            loadBookings();
        }, 30000);

        return () => clearInterval(interval);
    }, [userData?.id]);

    // Helper function to safely parse booking dates
    const parseBookingDate = (dateValue: any): Date | null => {
        if (!dateValue || dateValue === 'Flexible') return null;
        try {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? null : parsed;
        } catch {
            return null;
        }
    };

    const loadBookings = async (): Promise<void> => {
        if (!userData?.id) return;
        setLoading(true);
        try {
            // Use direct database call instead of API
            const bookingsData = await getBookings(userData.id, { limit: 100 });

            // Parse dates for all bookings
            const bookingsWithDates = bookingsData.map((b: Booking) => ({
                ...b,
                date: parseBookingDate(b.date)
            }));
            setBookings(bookingsWithDates);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch blocked dates
    useEffect(() => {
        if (!userData?.id) return;

        loadBlockedDates();

        // Poll for updates every 30 seconds
        const interval = setInterval(() => {
            loadBlockedDates();
        }, 30000);

        return () => clearInterval(interval);
    }, [userData?.id]);

    const loadBlockedDates = async (): Promise<void> => {
        if (!userData?.id) return;
        try {
            // Use direct database call instead of API
            const blockedDatesData = await getBlockedDates(userData.id);
            setBlockedDates(blockedDatesData);
        } catch (error) {
            console.error('Error fetching blocked dates:', error);
            toast.error('Failed to load blocked dates');
            setBlockedDates([]);
        }
    };

    const handleUpdateStatus = async (bookingId: string, newStatus: string): Promise<void> => {
        setUpdating(bookingId);
        const toastId = toast.loading(`Updating booking...`);

        try {
            const response = await fetch(`/api/studio-ops/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to update booking');
            }

            toast.success(`Booking ${newStatus}!`, { id: toastId });

            // Reload bookings to reflect changes
            await loadBookings();
        } catch (error: any) {
            console.error('Update failed:', error);
            toast.error(error.message || 'Failed to update booking', { id: toastId });
        } finally {
            setUpdating(null);
        }
    };

    // Handle blocking a date (off-platform booking)
    const handleBlockDate = async (): Promise<void> => {
        if (!selectedDate || !userData?.id) return;

        const toastId = toast.loading('Blocking time slot...');

        try {
            const response = await fetch('/api/studio-ops/blocked-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioId: userData?.id,
                    date: selectedDate.toISOString(),
                    reason: blockReason || 'Off-platform booking',
                    timeSlot: blockTimeSlot,
                    startTime: blockTimeSlot === 'custom' ? customStartTime : null,
                    endTime: blockTimeSlot === 'custom' ? customEndTime : null
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to block time slot');
            }

            toast.success('Time slot blocked!', { id: toastId });
            setShowBlockModal(false);
            setBlockReason('');
            setBlockTimeSlot('full');
            setSelectedDate(null);
            await loadBlockedDates();
        } catch (error: any) {
            console.error('Error blocking date:', error);
            toast.error(error.message || 'Failed to block time slot. Please try again.', { id: toastId });
        }
    };

    // Handle unblocking a date
    const handleUnblockDate = async (blockedId: string): Promise<void> => {
        const toastId = toast.loading('Removing block...');

        try {
            const response = await fetch(`/api/studio-ops/blocked-dates/${blockedId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to remove block');
            }

            toast.success('Block removed!', { id: toastId });
            await loadBlockedDates();
        } catch (error) {
            console.error('Error unblocking date:', error);
            toast.error('Failed to remove block', { id: toastId });
        }
    };

    // Open block modal for a specific date
    const openBlockModal = (date: Date): void => {
        setSelectedDate(date);
        setShowBlockModal(true);
    };

    // Filter and search bookings
    const filteredBookings: Booking[] = bookings.filter(booking => {
        const bookingStatus = (booking.status || '').toLowerCase();
        const filterStatus = filter.toLowerCase();
        const matchesFilter = filter === 'all' || bookingStatus === filterStatus;
        const matchesSearch = !searchTerm ||
            booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Group bookings by date
    const groupedBookings = filteredBookings.reduce<Record<string, Booking[]>>((groups, booking) => {
        if (!booking.date) return groups;
        const dateKey = booking.date.toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(booking);
        return groups;
    }, {});

    // Stats
    const pendingCount = bookings.filter(b => (b.status || '').toLowerCase() === 'pending').length;
    const todayBookings = bookings.filter(b => {
        if (!b.date) return false;
        const today = new Date().toDateString();
        return b.date.toDateString() === today && (b.status || '').toLowerCase() === 'confirmed';
    }).length;
    const upcomingRevenue = bookings
        .filter(b => {
            if (!b.date) return false;
            return (b.status || '').toLowerCase() === 'confirmed' && b.date >= new Date();
        })
        .reduce((sum, b) => sum + (b.totalPrice || b.offer_amount || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-brand-blue" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <CalendarIcon className="text-brand-blue" size={24} />
                        Booking Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {bookings.length} total bookings • {blockedDates.length} blocked slots
                    </p>
                </div>

                {/* View Mode Toggle - Only show on bookings tab */}
                {activeTab === 'bookings' && (
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm'
                                        : 'text-gray-500'
                                }`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                                    viewMode === 'calendar'
                                        ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm'
                                        : 'text-gray-500'
                                }`}
                            >
                                Calendar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Phase 2 Feature Tabs */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-2 flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'bookings'
                            ? 'bg-brand-blue text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <CalendarIcon size={16} />
                    Bookings
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'templates'
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Sparkles size={16} />
                    Templates
                </button>
                <button
                    onClick={() => setActiveTab('waitlist')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'waitlist'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Users size={16} />
                    Waitlist
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'payments'
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <CreditCard size={16} />
                    Payments
                </button>
                <button
                    onClick={() => setActiveTab('calendar-sync')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'calendar-sync'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <CalendarIcon size={16} />
                    Calendar Sync
                </button>
            </div>

            {/* Render Active Tab Content */}
            {activeTab === 'bookings' && (
                <>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">Pending Approval</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todayBookings}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Today&apos;s Sessions</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${upcomingRevenue.toLocaleString()}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Upcoming Revenue</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        placeholder="Search by client or room..."
                        className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                filter === status
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status === 'pending' && pendingCount > 0 && (
                                <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="space-y-4">
                    <UnifiedCalendar
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        view={calendarView}
                        onViewChange={setCalendarView}
                        bookings={bookings}
                        blockedDates={blockedDates}
                        onDateClick={(date: Date) => {
                            const today = new Date();
                            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            if (!isPast) {
                                openBlockModal(date);
                            }
                        }}
                        onBookingClick={(booking: Booking, date: Date) => {
                            setSelectedBooking(booking);
                        }}
                        showControls={true}
                    />

                    {/* Blocked Dates List */}
                    {blockedDates.length > 0 && (
                        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4">
                            <h4 className="font-bold text-sm dark:text-white mb-3 flex items-center gap-2">
                                <Ban size={14} className="text-red-500" />
                                Blocked Time Slots
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {blockedDates.map(block => (
                                    <div
                                        key={block.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1f2128] rounded-lg border dark:border-gray-700"
                                    >
                                        <div>
                                            <div className="font-medium dark:text-white text-sm">
                                                {new Date(block.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                                {block.time_slot && block.time_slot !== 'full' && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({block.time_slot === 'custom'
                                                            ? `${block.start_time || ''} - ${block.end_time || ''}`
                                                            : block.time_slot})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{block.reason}</div>
                                        </div>
                                        <button
                                            onClick={() => handleUnblockDate(block.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                                            title="Remove block"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bookings List */}
            {viewMode === 'list' && (
                <>
                {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-bold dark:text-white mb-2">No Bookings Found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {filter !== 'all' ? `No ${filter} bookings` : 'Bookings will appear here when clients book your studio'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedBookings).map(([dateKey, dateBookings]) => (
                        <div key={dateKey}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(dateKey).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                <span className="text-gray-400">({dateBookings.length})</span>
                            </h3>
                            <div className="space-y-3">
                                {dateBookings.map(booking => {
                                    const statusConfig = getStatusConfig(booking.status);

                                    return (
                                        <div
                                            key={booking.id}
                                            className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden"
                                        >
                                            <div className="p-4 flex items-center gap-4">
                                                {/* Time */}
                                                <div className="text-center min-w-[70px]">
                                                    <div className="text-lg font-bold dark:text-white">
                                                        {booking.startTime}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {booking.duration}h
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold dark:text-white truncate">
                                                            {booking.clientName || 'Unknown Client'}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgClass}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {booking.roomName || 'Main Room'} • ${booking.totalPrice || 0}
                                                    </div>
                                                    {booking.notes && (
                                                        <div className="text-xs text-gray-400 mt-1 truncate">
                                                            Note: {booking.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {(booking.status || '').toLowerCase() === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                                                                disabled={updating === booking.id}
                                                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                                                                title="Approve"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                                                                disabled={updating === booking.id}
                                                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                                                                title="Decline"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(booking.status || '').toLowerCase() === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                                                            disabled={updating === booking.id}
                                                            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                    {booking.clientId && onNavigateToChat && (
                                                        <button
                                                            onClick={() => onNavigateToChat(booking.clientId)}
                                                            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                            title="Message Client"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
                </>
            )}

            {/* Block Date Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl max-w-md w-full">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white flex items-center gap-2">
                                <Ban size={18} className="text-red-500" />
                                Block Time Slot
                            </h3>
                            <button onClick={() => {
                                setShowBlockModal(false);
                                setSelectedDate(null);
                                setBlockReason('');
                            }}>
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Selected Date */}
                            <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg text-center">
                                <div className="text-sm text-gray-500 uppercase font-bold mb-1">Selected Date</div>
                                <div className="text-lg font-bold dark:text-white">
                                    {selectedDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>

                            {/* Time Slot Selection */}
                            <div>
                                <label className="text-sm font-bold dark:text-white mb-2 block">Time Slot</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'full', label: 'Full Day' },
                                        { id: 'morning', label: 'Morning (6AM-12PM)' },
                                        { id: 'afternoon', label: 'Afternoon (12PM-6PM)' },
                                        { id: 'evening', label: 'Evening (6PM-12AM)' },
                                    ].map(slot => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setBlockTimeSlot(slot.id)}
                                            className={`p-2 text-sm rounded-lg border transition ${
                                                blockTimeSlot === slot.id
                                                    ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                                                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setBlockTimeSlot('custom')}
                                    className={`w-full mt-2 p-2 text-sm rounded-lg border transition ${
                                        blockTimeSlot === 'custom'
                                            ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Custom Time Range
                                </button>

                                {blockTimeSlot === 'custom' && (
                                    <div className="flex gap-2 mt-2">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">Start</label>
                                            <input
                                                type="time"
                                                value={customStartTime}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomStartTime(e.target.value)}
                                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">End</label>
                                            <input
                                                type="time"
                                                value={customEndTime}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEndTime(e.target.value)}
                                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="text-sm font-bold dark:text-white mb-2 block">Reason (optional)</label>
                                <input
                                    type="text"
                                    value={blockReason}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlockReason(e.target.value)}
                                    placeholder="e.g., Private session, Maintenance, Personal..."
                                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowBlockModal(false);
                                        setSelectedDate(null);
                                        setBlockReason('');
                                    }}
                                    className="flex-1 py-2.5 border dark:border-gray-600 rounded-lg font-bold dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBlockDate}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    <Ban size={16} />
                                    Block Time
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white">Booking Details</h3>
                            <button onClick={() => setSelectedBooking(null)}>
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                                    <User className="text-brand-blue" size={24} />
                                </div>
                                <div>
                                    <div className="font-bold dark:text-white">{selectedBooking.clientName}</div>
                                    <div className="text-sm text-gray-500">{selectedBooking.clientEmail}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Date</div>
                                    <div className="dark:text-white">
                                        {selectedBooking.date?.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Time</div>
                                    <div className="dark:text-white">
                                        {selectedBooking.startTime} ({selectedBooking.duration}h)
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Room</div>
                                    <div className="dark:text-white">{selectedBooking.roomName}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total</div>
                                    <div className="dark:text-white font-bold text-green-600">
                                        ${selectedBooking.totalPrice || selectedBooking.offer_amount || 0}
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                                    <div className="text-xs text-amber-600 uppercase font-bold mb-1">Client Notes</div>
                                    <div className="text-amber-800 dark:text-amber-300 text-sm">{selectedBooking.notes}</div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                                {((selectedBooking.status || '').toLowerCase() === 'confirmed') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedBookingForRecurring(selectedBooking);
                                                setShowRecurringModal(true);
                                            }}
                                            className="flex-1 py-2 px-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <Repeat size={14} />
                                            Make Recurring
                                        </button>
                                        {userData?.rooms && userData.rooms.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBookingForRooms(selectedBooking);
                                                    setShowMultiRoomModal(true);
                                                }}
                                                className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <Home size={14} />
                                                Assign Rooms
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="text-xs text-gray-400 pt-2">
                                Booked {selectedBooking.createdAt && selectedBooking.createdAt instanceof Date
                                    ? selectedBooking.createdAt.toLocaleDateString()
                                    : new Date(selectedBooking.created_at || selectedBooking.timestamp || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recurring Booking Modal */}
            {showRecurringModal && selectedBookingForRecurring && (
                <RecurringBookingModal
                    booking={selectedBookingForRecurring}
                    onClose={() => {
                        setShowRecurringModal(false);
                        setSelectedBookingForRecurring(null);
                    }}
                    onSuccess={() => {
                        loadBookings();
                    }}
                />
            )}

            {/* Multi-Room Booking Modal */}
            {showMultiRoomModal && selectedBookingForRooms && (
                <MultiRoomBookingModal
                    booking={selectedBookingForRooms}
                    rooms={userData?.rooms || []}
                    onClose={() => {
                        setShowMultiRoomModal(false);
                        setSelectedBookingForRooms(null);
                    }}
                    onSuccess={() => {
                        loadBookings();
                    }}
                />
            )}
                </>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <BookingTemplates user={user} userData={userData} />
            )}

            {/* Waitlist Tab */}
            {activeTab === 'waitlist' && (
                <BookingWaitlist user={user} userData={userData} />
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <BookingPayments user={user} userData={userData} />
            )}

            {/* Calendar Sync Tab */}
            {activeTab === 'calendar-sync' && (
                <CalendarSync user={user} userData={userData} />
            )}
        </div>
    );
}
