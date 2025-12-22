import { useState, useEffect } from 'react';
import { 
    Calendar, User, Check, X, MessageSquare, 
    Search, RefreshCw, ChevronLeft, ChevronRight,
    CheckCircle, XCircle, Clock3, Eye, Ban, Trash2
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import { 
    notifyBookingStatusChange, 
    checkBookingConflicts, 
    validateStatusTransition,
    trackBookingHistory,
    calculateCancellationFee,
    canCancelBooking
} from '../../utils/bookingNotifications';
import { scheduleBookingReminder } from '../../utils/bookingReminders';
import RecurringBookingModal from './RecurringBookingModal';
import MultiRoomBookingModal from './MultiRoomBookingModal';

const STATUS_CONFIG = {
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
 * StudioBookings - Manage incoming bookings for the studio
 */
export default function StudioBookings({ user, onNavigateToChat }) {
    const [bookings, setBookings] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const [blockTimeSlot, setBlockTimeSlot] = useState('full'); // 'full', 'morning', 'afternoon', 'evening', 'custom'
    const [customStartTime, setCustomStartTime] = useState('09:00');
    const [customEndTime, setCustomEndTime] = useState('17:00');
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [showMultiRoomModal, setShowMultiRoomModal] = useState(false);
    const [selectedBookingForRecurring, setSelectedBookingForRecurring] = useState(null);
    const [selectedBookingForRooms, setSelectedBookingForRooms] = useState(null);

    // Fetch bookings from Supabase
    useEffect(() => {
        if (!user?.id && !user?.uid || !supabase) return;
        const userId = user?.id || user?.uid;

        const channel = supabase
            .channel('studio-bookings')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bookings',
                filter: `studio_owner_id=eq.${userId}`
            }, () => {
                loadBookings();
            })
            .subscribe();

        loadBookings();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.uid]);

    // Helper function to safely parse booking dates
    const parseBookingDate = (dateValue) => {
        if (!dateValue || dateValue === 'Flexible') return null;
        try {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? null : parsed;
        } catch {
            return null;
        }
    };

    const loadBookings = async () => {
        if (!supabase) return;
        const userId = user?.id || user?.uid;
        setLoading(true);
        try {
            // Fix: Check both studio_owner_id AND target_id to catch all studio bookings
            const { data: bookingsData, error } = await supabase
                .from('bookings')
                .select('*')
                .or(`studio_owner_id.eq.${userId},target_id.eq.${userId}`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const bookingsList = (bookingsData || []).map(b => {
                const parsedDate = parseBookingDate(b.date);
                return {
                    id: b.id,
                    ...b,
                    studioOwnerId: b.studio_owner_id,
                    clientId: b.sender_id || b.client_id, // Fix: Use sender_id as fallback
                    clientName: b.sender_name || b.client_name, // Fix: Use sender_name as fallback
                    date: parsedDate || new Date(),
                    createdAt: b.created_at ? new Date(b.created_at) : new Date(),
                    // Ensure status is properly formatted
                    status: b.status || 'Pending'
                };
            });
            setBookings(bookingsList);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    // Fetch blocked dates
    useEffect(() => {
        if (!user?.id && !user?.uid || !supabase) return;
        const userId = user?.id || user?.uid;

        const channel = supabase
            .channel('blocked-dates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'blocked_dates',
                filter: `studio_owner_id=eq.${userId}`
            }, () => {
                loadBlockedDates();
            })
            .subscribe();

        loadBlockedDates();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.uid]);

    const loadBlockedDates = async () => {
        if (!supabase) return;
        const userId = user?.id || user?.uid;
        try {
            const { data: blockedData, error } = await supabase
                .from('blocked_dates')
                .select('*')
                .eq('studio_owner_id', userId);
            
            if (error) throw error;
            
            const blockedList = (blockedData || []).map(b => ({
                id: b.id,
                ...b,
                studioOwnerId: b.studio_owner_id,
                date: b.date ? new Date(b.date) : new Date()
            }));
            // Sort client-side
            blockedList.sort((a, b) => new Date(a.date) - new Date(b.date));
            setBlockedDates(blockedList);
        } catch (error) {
            console.error('Error fetching blocked dates:', error);
            toast.error('Failed to load blocked dates');
            setBlockedDates([]);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        if (!supabase) return;
        setUpdating(bookingId);
        const toastId = toast.loading(`Updating booking...`);
        
        try {
            // Get current booking to validate transition
            const { data: currentBooking, error: fetchError } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single();

            if (fetchError) throw fetchError;
            if (!currentBooking) throw new Error('Booking not found');

            const currentStatus = currentBooking.status || 'Pending';
            
            // Validate status transition using utility function
            const validation = validateStatusTransition(currentStatus, newStatus);
            if (!validation.isValid) {
                throw new Error(
                    `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
                    `Allowed transitions: ${validation.allowedStatuses.join(', ') || 'none'}`
                );
            }
            
            // Check for booking conflicts before confirming
            if (newStatus === 'Confirmed') {
                const userId = user?.id || user?.uid;
                const conflictCheck = await checkBookingConflicts({ ...currentBooking, id: bookingId }, userId);
                
                if (conflictCheck.hasConflict) {
                    const conflictNames = conflictCheck.conflicts.map(c => c.sender_name || 'Unknown').join(', ');
                    throw new Error(
                        `Time slot conflict detected. Conflicting bookings: ${conflictNames}. ` +
                        `Please check calendar before confirming.`
                    );
                }
            }

            const now = new Date().toISOString();
            
            // Fix: Use validated status timestamp fields instead of dynamic property
            const statusTimestampFields = {
                Confirmed: 'confirmed_at',
                Cancelled: 'cancelled_at',
                Completed: 'completed_at',
                Pending: 'pending_at'
            };

            const updateData = {
                status: newStatus,
                updated_at: now
            };

            // Only add timestamp field if it exists in our mapping
            const timestampField = statusTimestampFields[newStatus];
            if (timestampField) {
                updateData[timestampField] = now;
            }

            // Handle payment processing for confirmed bookings
            if (newStatus === 'Confirmed' && currentBooking.payment_intent_id) {
                try {
                    const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
                    const captureResponse = await fetch(`${apiUrl}/stripe/capture-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentIntentId: currentBooking.payment_intent_id
                        })
                    });

                    if (!captureResponse.ok) {
                        const errorData = await captureResponse.json().catch(() => ({}));
                        console.warn('Payment capture failed:', errorData);
                        // Continue with booking confirmation even if payment capture fails
                        // Payment may have already been captured or will be handled by webhook
                    }
                } catch (paymentError) {
                    console.error('Payment capture error:', paymentError);
                    // Continue with booking confirmation
                }
            }

            // Handle refunds for cancelled confirmed bookings with cancellation policy
            if ((newStatus === 'Cancelled' || newStatus === 'cancelled') && (currentStatus === 'Confirmed' || currentStatus === 'confirmed') && currentBooking.payment_intent_id) {
                try {
                    // Get cancellation policy (from studio settings or default)
                    const { data: policyData } = await supabase
                        .from('cancellation_policies')
                        .select('*')
                        .eq('studio_id', user?.id || user?.uid)
                        .eq('is_default', true)
                        .single();

                    const cancellationPolicy = policyData || null;
                    const feeCalculation = calculateCancellationFee(currentBooking, cancellationPolicy);

                    const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
                    
                    // Refund amount (after fee deduction)
                    const refundAmount = feeCalculation.refund;
                    
                    const refundResponse = await fetch(`${apiUrl}/stripe/refund-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paymentIntentId: currentBooking.payment_intent_id,
                            amount: refundAmount, // Partial refund if fee applies
                            reason: 'requested_by_customer'
                        })
                    });

                    if (!refundResponse.ok) {
                        const errorData = await refundResponse.json().catch(() => ({}));
                        console.warn('Refund failed:', errorData);
                        toast.error(
                            feeCalculation.fee > 0 
                                ? `Booking cancelled. Cancellation fee: $${feeCalculation.fee.toFixed(2)}. Refund failed - please contact support.`
                                : 'Booking cancelled but refund failed. Please contact support.',
                            { id: toastId }
                        );
                    } else {
                        const message = feeCalculation.fee > 0
                            ? `Booking cancelled. Cancellation fee: $${feeCalculation.fee.toFixed(2)}. Refunded: $${refundAmount.toFixed(2)}`
                            : `Booking cancelled and refund processed`;
                        toast.success(message, { id: toastId });
                    }
                } catch (refundError) {
                    console.error('Refund error:', refundError);
                    toast.error('Booking cancelled but refund failed. Please contact support.', { id: toastId });
                }
            }

            // Track booking history before update
            await trackBookingHistory(
                bookingId,
                currentStatus,
                newStatus,
                user?.id || user?.uid,
                `Status changed from ${currentStatus} to ${newStatus}`
            );

            // Update booking status
            const { error } = await supabase
                .from('bookings')
                .update(updateData)
                .eq('id', bookingId);
            
            if (error) throw error;

            // Send notification to client
            await notifyBookingStatusChange(currentBooking, newStatus, user?.id || user?.uid);

            // Schedule reminders for confirmed bookings
            if (newStatus === 'Confirmed' || newStatus === 'confirmed') {
                await scheduleBookingReminder({ ...currentBooking, status: newStatus }, [24, 2]);
            }

            // Only show success if we haven't already shown an error
            if (newStatus !== 'Cancelled' || currentStatus !== 'Confirmed') {
                toast.success(`Booking ${newStatus}!`, { id: toastId });
            }

            // Reload bookings to reflect changes
            await loadBookings();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.message || 'Failed to update booking', { id: toastId });
        } finally {
            setUpdating(null);
        }
    };

    // Handle blocking a date (off-platform booking)
    const handleBlockDate = async () => {
        if (!selectedDate || (!user?.id && !user?.uid) || !supabase) return;
        const userId = user?.id || user?.uid;
        
        const toastId = toast.loading('Blocking time slot...');
        
        try {
            const { error } = await supabase
                .from('blocked_dates')
                .insert({
                    studio_owner_id: userId,
                    date: selectedDate.toISOString(),
                    reason: blockReason || 'Off-platform booking',
                    time_slot: blockTimeSlot,
                    start_time: blockTimeSlot === 'custom' ? customStartTime : null,
                    end_time: blockTimeSlot === 'custom' ? customEndTime : null,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
            toast.success('Time slot blocked!', { id: toastId });
            setShowBlockModal(false);
            setBlockReason('');
            setBlockTimeSlot('full');
            setSelectedDate(null);
            // Reload blocked dates to reflect changes
            await loadBlockedDates();
        } catch (error) {
            console.error('Error blocking date:', error);
            toast.error(error.message || 'Failed to block time slot. Please try again.', { id: toastId });
        }
    };

    // Handle unblocking a date
    const handleUnblockDate = async (blockedId) => {
        if (!supabase) return;
        const toastId = toast.loading('Removing block...');
        
        try {
            await supabase
                .from('blocked_dates')
                .delete()
                .eq('id', blockedId);
            
            toast.success('Block removed!', { id: toastId });
        } catch (error) {
            console.error('Error unblocking date:', error);
            toast.error('Failed to remove block', { id: toastId });
        }
    };

    // Open block modal for a specific date
    const openBlockModal = (date) => {
        setSelectedDate(date);
        setShowBlockModal(true);
    };

    // Filter and search bookings
    const filteredBookings = bookings.filter(booking => {
        const bookingStatus = (booking.status || '').toLowerCase();
        const filterStatus = filter.toLowerCase();
        const matchesFilter = filter === 'all' || bookingStatus === filterStatus;
        const matchesSearch = !searchTerm || 
            booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Group bookings by date
    const groupedBookings = filteredBookings.reduce((groups, booking) => {
        if (!booking.date) return groups; // Skip bookings without valid dates
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
                        <Calendar className="text-brand-blue" size={24} />
                        Booking Management
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {bookings.length} total bookings • {blockedDates.length} blocked slots
                    </p>
                </div>
                
                {/* View Mode Toggle */}
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
            </div>

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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] flex justify-between items-center">
                        <button 
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                        >
                            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h3 className="font-bold dark:text-white text-lg">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button 
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                        >
                            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="p-4">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-sm font-bold text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                            {(() => {
                                const year = currentMonth.getFullYear();
                                const month = currentMonth.getMonth();
                                const firstDay = new Date(year, month, 1).getDay();
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const today = new Date();
                                
                                const days = [];
                                for (let i = 0; i < firstDay; i++) {
                                    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                                }
                                
                                for (let day = 1; day <= daysInMonth; day++) {
                                    const date = new Date(year, month, day);
                                    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                    const isToday = date.toDateString() === today.toDateString();
                                    
                                    // Get bookings for this day
                                    const dayBookings = bookings.filter(b => {
                                        if (!b.date) return false;
                                        const bookingDate = b.date instanceof Date ? b.date : new Date(b.date);
                                        if (isNaN(bookingDate.getTime())) return false;
                                        return bookingDate.toDateString() === date.toDateString();
                                    });
                                    
                                    // Get blocks for this day
                                    const dayBlocks = blockedDates.filter(b => {
                                        if (!b.date) return false;
                                        const blockDate = b.date instanceof Date ? b.date : new Date(b.date);
                                        if (isNaN(blockDate.getTime())) return false;
                                        return blockDate.toDateString() === date.toDateString();
                                    });
                                    
                                    const hasConfirmed = dayBookings.some(b => (b.status || '').toLowerCase() === 'confirmed');
                                    const hasPending = dayBookings.some(b => (b.status || '').toLowerCase() === 'pending');
                                    const isBlocked = dayBlocks.length > 0;
                                    
                                    days.push(
                                        <button
                                            key={day}
                                            onClick={() => !isPast && openBlockModal(date)}
                                            disabled={isPast}
                                            className={`aspect-square p-1 rounded-xl flex flex-col items-center justify-center relative transition ${
                                                isPast ? 'opacity-40 cursor-not-allowed' :
                                                isBlocked ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/40' :
                                                isToday ? 'bg-brand-blue text-white' :
                                                hasConfirmed || hasPending ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' :
                                                'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <span className={`text-sm font-medium ${
                                                isToday ? 'text-white' : 
                                                isBlocked ? 'text-red-700 dark:text-red-400' :
                                                'dark:text-white'
                                            }`}>
                                                {day}
                                            </span>
                                            
                                            {/* Indicators */}
                                            <div className="flex gap-0.5 mt-0.5">
                                                {hasConfirmed && <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                                                {hasPending && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
                                                {isBlocked && <Ban size={10} className="text-red-600 dark:text-red-400" />}
                                            </div>
                                            
                                            {/* Booking count badge */}
                                            {dayBookings.length > 0 && !isToday && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-blue text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                                    {dayBookings.length}
                                                </span>
                                            )}
                                        </button>
                                    );
                                }
                                
                                return days;
                            })()}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t dark:border-gray-700 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Confirmed
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                Pending
                            </div>
                            <div className="flex items-center gap-1">
                                <Ban size={12} className="text-red-500" />
                                Blocked
                            </div>
                            <div className="ml-auto text-gray-400">
                                Click a date to block off-platform bookings
                            </div>
                        </div>
                    </div>
                    
                    {/* Blocked Dates List */}
                    {blockedDates.length > 0 && (
                        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                            <h4 className="font-bold text-sm dark:text-white mb-3 flex items-center gap-2">
                                <Ban size={14} className="text-red-500" />
                                Blocked Time Slots
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {blockedDates.map(block => (
                                    <div 
                                        key={block.id}
                                        className="flex items-center justify-between p-3 bg-white dark:bg-[#2c2e36] rounded-lg border dark:border-gray-700"
                                    >
                                        <div>
                                            <div className="font-medium dark:text-white text-sm">
                                                {new Date(block.date).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                                {block.timeSlot !== 'full' && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({block.timeSlot === 'custom' 
                                                            ? `${block.startTime} - ${block.endTime}` 
                                                            : block.timeSlot})
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
                                                onChange={(e) => setCustomStartTime(e.target.value)}
                                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">End</label>
                                            <input
                                                type="time"
                                                value={customEndTime}
                                                onChange={(e) => setCustomEndTime(e.target.value)}
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
                                    onChange={(e) => setBlockReason(e.target.value)}
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
                                        {selectedBooking.date.toLocaleDateString('en-US', { 
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
        </div>
    );
}
