import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, DollarSign, MessageSquare, CheckCircle, XCircle, AlertCircle, Loader2, Filter, Search, Plus, Zap, ChevronDown, MoreHorizontal } from 'lucide-react';
import { supabase } from '../config/supabase';
import BookingCalendar from './shared/BookingCalendar';
import SessionDetailsModal from './SessionDetailsModal';
import UserAvatar from './shared/UserAvatar';

// Lazy load the missing modules
const TalentSearch = lazy(() => import('./TalentSearch'));
const SessionBuilderModal = lazy(() => import('./SessionBuilderModal'));
const SessionWizard = lazy(() => import('./SessionWizard'));
const BroadcastRequest = lazy(() => import('./BroadcastRequest'));
const BroadcastList = lazy(() => import('./BroadcastList'));

export default function BookingSystem({ user, userData, subProfiles, openPublicProfile }) {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get tab from URL path (e.g., /bookings/calendar -> 'calendar')
    const getTabFromPath = (path) => {
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'bookings' && parts[1]) {
            return parts[1]; // Return the nested route (calendar, find-talent, etc.)
        }
        return 'my-bookings'; // Default tab
    };
    
    const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
    const [filterType, setFilterType] = useState('all'); // 'all', 'sent', 'received'
    const [showSessionBuilder, setShowSessionBuilder] = useState(false);
    const [sessionCart, setSessionCart] = useState([]);
    const [sessionParams, setSessionParams] = useState(null);
    const [showSessionWizard, setShowSessionWizard] = useState(false);
    const [showBroadcastRequest, setShowBroadcastRequest] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const moreMenuRef = useRef(null);
    
    const isStudioManager = userData?.accountTypes?.includes('Studio');
    
    // Sync activeTab with URL
    useEffect(() => {
        const tabFromUrl = getTabFromPath(location.pathname);
        if (tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [location.pathname]);
    
    // Update URL when tab changes
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/bookings/${tabId}`, { replace: true });
    };
    
    // Close more menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Primary tabs (always visible)
    const primaryTabs = [
        { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];
    
    // Secondary tabs (in dropdown menu)
    const secondaryTabs = [
        { id: 'find-talent', label: 'Find Talent', icon: Search },
        { id: 'broadcast-list', label: 'Broadcasts', icon: Zap },
    ];
    
    // Fetch all bookings for the user
    useEffect(() => {
        if (!user?.id && !user?.uid) return;
        
        const loadBookings = async () => {
            setLoading(true);
            try {
                const userId = user?.id || user?.uid;
                
                // Fetch bookings where user is sender OR target
                const { data: sentBookings, error: sentError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('sender_id', userId)
                    .order('date', { ascending: false });
                
                const { data: receivedBookings, error: receivedError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('target_id', userId)
                    .order('date', { ascending: false });
                
                if (sentError) throw sentError;
                if (receivedError) throw receivedError;
                
                // Combine and deduplicate (in case of edge cases)
                const allBookings = [...(sentBookings || []), ...(receivedBookings || [])];
                const uniqueBookings = Array.from(
                    new Map(allBookings.map(b => [b.id, b])).values()
                );
                
                setBookings(uniqueBookings);
            } catch (error) {
                console.error('Error loading bookings:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadBookings();
        
        // Set up real-time subscription
        const subscription = supabase
            .channel('bookings-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'bookings' },
                () => {
                    loadBookings();
                }
            )
            .subscribe();
        
        return () => {
            subscription.unsubscribe();
        };
    }, [user?.id, user?.uid]);
    
    // Filter bookings based on status and type
    const filteredBookings = bookings.filter(booking => {
        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'pending' && booking.status !== 'Pending') return false;
            if (filterStatus === 'confirmed' && booking.status !== 'Confirmed') return false;
            if (filterStatus === 'completed' && booking.status !== 'Completed') return false;
            if (filterStatus === 'cancelled' && booking.status !== 'Cancelled') return false;
        }
        
        // Type filter (sent vs received)
        if (filterType !== 'all') {
            const userId = user?.id || user?.uid;
            if (filterType === 'sent' && booking.sender_id !== userId) return false;
            if (filterType === 'received' && booking.target_id !== userId) return false;
        }
        
        return true;
    });
    
    // For studio managers: get bookings involving their studio
    const studioBookings = isStudioManager 
        ? bookings.filter(b => {
            const userId = user?.id || user?.uid;
            // Bookings where studio is target (booked me) or sender (we booked)
            return b.target_id === userId || b.sender_id === userId;
        })
        : [];
    
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'Flexible') return 'Flexible';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return dateStr;
        }
    };
    
    const formatTime = (timeStr) => {
        if (!timeStr || timeStr === 'Flexible') return 'Flexible';
        try {
            const [hours, minutes] = timeStr.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return timeStr;
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'Confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'Declined': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };
    
    const handleBookingAction = async (bookingId, action) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ 
                    status: action === 'accept' ? 'Confirmed' : action === 'decline' ? 'Declined' : booking.status,
                    responded_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId);
            
            if (error) throw error;
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Failed to update booking');
        }
    };
    
    // Prepare calendar events
    const calendarEvents = filteredBookings.map(booking => ({
        id: booking.id,
        title: booking.target_name || booking.sender_name || 'Session',
        start: booking.date && booking.date !== 'Flexible' 
            ? new Date(`${booking.date}T${booking.time || '12:00'}`) 
            : new Date(),
        end: booking.date && booking.date !== 'Flexible' && booking.duration
            ? new Date(new Date(`${booking.date}T${booking.time || '12:00'}`).getTime() + (booking.duration * 60 * 60 * 1000))
            : new Date(),
        resource: booking
    }));
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col p-fluid gap-fluid">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Bookings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your sessions and bookings
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowSessionWizard(true);
                        handleTabChange('session-builder');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus size={18} />
                    New Session
                </button>
            </div>
            
            {/* Tabs - Primary tabs visible, secondary in dropdown */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 items-end">
                {/* Primary Tabs */}
                {primaryTabs.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'border-b-2 border-brand-blue text-brand-blue'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <TabIcon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
                
                {/* More Menu Dropdown */}
                <div className="relative ml-auto" ref={moreMenuRef}>
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                            secondaryTabs.some(tab => activeTab === tab.id)
                                ? 'border-b-2 border-brand-blue text-brand-blue'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        <MoreHorizontal size={16} />
                        More
                        <ChevronDown size={14} className={`transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showMoreMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1f2128] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
                            {secondaryTabs.map(tab => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            handleTabChange(tab.id);
                                            setShowMoreMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <TabIcon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Studio Manager View */}
            {isStudioManager && activeTab === 'my-bookings' && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                    <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-3">
                        Studio Bookings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 mb-2">
                                Booked Me ({studioBookings.filter(b => b.target_id === (user?.id || user?.uid)).length})
                            </h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                Bookings where clients booked your studio
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 mb-2">
                                We Booked ({studioBookings.filter(b => b.sender_id === (user?.id || user?.uid)).length})
                            </h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                Bookings your studio made for other services
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* My Bookings Tab */}
            {activeTab === 'my-bookings' && (
                <div className="flex-1 overflow-y-auto">
                    {/* Filters */}
                    <div className="flex gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-500" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="all">All Bookings</option>
                            <option value="sent">I Booked</option>
                            <option value="received">Booked Me</option>
                        </select>
                    </div>
                    
                    {/* Bookings List */}
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredBookings.map(booking => {
                                const userId = user?.id || user?.uid;
                                const isSender = booking.sender_id === userId;
                                const isReceived = booking.target_id === userId;
                                
                                return (
                                    <div
                                        key={booking.id}
                                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedBooking(booking)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <UserAvatar
                                                        src={isSender ? null : null} // Could fetch profile pics
                                                        name={isSender ? booking.target_name : booking.sender_name}
                                                        size="sm"
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold dark:text-white">
                                                            {isSender ? booking.target_name : booking.sender_name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {isSender ? 'You booked' : 'Booked you'} • {booking.service_type}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(booking.date)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {formatTime(booking.time)} ({booking.duration}h)
                                                    </div>
                                                    {booking.offer_amount && (
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign size={14} />
                                                            ${booking.offer_amount}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {booking.message && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                                        {booking.message}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                
                                                {isReceived && booking.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBookingAction(booking.id, 'accept');
                                                            }}
                                                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleBookingAction(booking.id, 'decline');
                                                            }}
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
                <div className="flex-1">
                    <BookingCalendar
                        events={calendarEvents}
                        onSelectEvent={(event) => setSelectedBooking(event.resource)}
                        onSelectSlot={(slotInfo) => {
                            // Could open booking modal for new booking
                            console.log('New booking slot:', slotInfo);
                        }}
                    />
                </div>
            )}
            
            {/* Find Talent Tab */}
            {activeTab === 'find-talent' && (
                <div className="flex-1 overflow-y-auto">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-brand-blue" size={32} />
                        </div>
                    }>
                        <TalentSearch
                            user={user}
                            userData={userData}
                            openPublicProfile={openPublicProfile || (() => {})}
                        />
                    </Suspense>
                </div>
            )}
            
            {/* Session Builder Tab */}
            {activeTab === 'session-builder' && showSessionWizard && (
                <div className="flex-1 overflow-y-auto">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-brand-blue" size={32} />
                        </div>
                    }>
                        <SessionWizard
                            userData={userData}
                            sessionParams={sessionParams}
                            setSessionParams={setSessionParams}
                            onNext={() => {
                                setShowSessionWizard(false);
                                setShowSessionBuilder(true);
                            }}
                        />
                    </Suspense>
                </div>
            )}
            
            {/* Booking Details Modal */}
            {selectedBooking && (
                <SessionDetailsModal
                    booking={{
                        ...selectedBooking,
                        targetId: selectedBooking.target_id,
                        senderId: selectedBooking.sender_id,
                        targetName: selectedBooking.target_name,
                        senderName: selectedBooking.sender_name
                    }}
                    user={{
                        ...user,
                        uid: user?.id || user?.uid
                    }}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
            
            {/* Broadcast List Tab */}
            {activeTab === 'broadcast-list' && !showBroadcastRequest && (
                <div className="flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold dark:text-white">Active Broadcasts</h2>
                        <button
                            onClick={() => setShowBroadcastRequest(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Plus size={18} />
                            Create Broadcast
                        </button>
                    </div>
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-brand-blue" size={32} />
                        </div>
                    }>
                        <BroadcastList
                            user={user}
                            userData={userData}
                            onBid={(broadcast) => {
                                // Handle bid action - could open a modal or navigate
                                console.log('Bid on broadcast:', broadcast);
                            }}
                        />
                    </Suspense>
                </div>
            )}
            
            {/* Broadcast Request Tab */}
            {activeTab === 'broadcast-list' && showBroadcastRequest && (
                <div className="flex-1 overflow-y-auto">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-brand-blue" size={32} />
                        </div>
                    }>
                        <BroadcastRequest
                            user={user}
                            userData={userData}
                            onBack={() => {
                                setShowBroadcastRequest(false);
                            }}
                            onSuccess={() => {
                                setShowBroadcastRequest(false);
                                // Reload broadcasts
                                window.location.reload();
                            }}
                        />
                    </Suspense>
                </div>
            )}
            
            {/* Session Builder Modal */}
            {showSessionBuilder && (
                <Suspense fallback={null}>
                    <SessionBuilderModal
                        user={user}
                        userData={userData}
                        cart={sessionCart}
                        onRemoveFromCart={(index) => {
                            setSessionCart(prev => prev.filter((_, i) => i !== index));
                        }}
                        onClose={() => {
                            setShowSessionBuilder(false);
                            handleTabChange('my-bookings');
                        }}
                        onComplete={() => {
                            setShowSessionBuilder(false);
                            setSessionCart([]);
                            handleTabChange('my-bookings');
                            // Reload bookings
                            window.location.reload();
                        }}
                    />
                </Suspense>
            )}
        </div>
    );
}

