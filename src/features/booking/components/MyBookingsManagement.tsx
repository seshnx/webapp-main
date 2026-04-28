import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, History, Filter, Loader2,
    Search, LayoutGrid, List, RefreshCw, ChevronRight
} from 'lucide-react';
import { useBookingsByClient, useTalentBookings, useTalentBookingMutations } from '@/services/bookingService';
import UserAvatar from '@/components/shared/UserAvatar';
import UnifiedCalendar from '@/components/shared/UnifiedCalendar';
import toast from 'react-hot-toast';

interface MyBookingsManagementProps {
  user: any;
  userData: any;
  openPublicProfile: (uid: string, name: string) => void;
}

type SubTab = 'current' | 'upcoming' | 'past' | 'history';

/**
 * MyBookingsManagement - Complete booking management with List and Calendar views
 */
export default function MyBookingsManagement({ user, userData, openPublicProfile }: MyBookingsManagementProps) {
  // View & Navigation State
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('current');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [bookingRole, setBookingRole] = useState<'client' | 'talent'>('client');

  // Data State - use Convex real-time bookings
  const userId = userData?.cllerkId || userData?.id || user?.id;
  const clientBookingsQuery = useBookingsByClient(userId || null);
  const talentBookingsQuery = useTalentBookings(userId || null);
  
  const { acceptBooking, rejectBooking } = useTalentBookingMutations();

  const rawBookings = bookingRole === 'client' ? clientBookingsQuery?.data : talentBookingsQuery?.data;
  const loading = (bookingRole === 'client' ? clientBookingsQuery?.isLoading : talentBookingsQuery?.isLoading) || 
                  (bookingRole === 'client' ? clientBookingsQuery?.isPending : talentBookingsQuery?.isPending);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Sub-tab configuration for List View
  const subTabs = [
    { id: 'current' as SubTab, label: 'Current', icon: Calendar, description: 'Active & pending bookings' },
    { id: 'upcoming' as SubTab, label: 'Upcoming', icon: Clock, description: 'Scheduled future sessions' },
    { id: 'past' as SubTab, label: 'Past', icon: History, description: 'Completed sessions' },
    { id: 'history' as SubTab, label: 'All History', icon: Filter, description: 'Full booking history' }
  ];

  // Parse bookings data from Convex
  const bookings = React.useMemo(() => {
    return (rawBookings || []).map(booking => ({
      ...booking,
      date: booking.date && booking.date !== 'Flexible' ? new Date(booking.date) : null,
      clientName: bookingRole === 'client' 
          ? (booking.target_name || booking.talentName || 'Talent/Studio')
          : (booking.sender_name || booking.clientName || 'Client')
    }));
  }, [rawBookings]);

  // Filtering Logic
  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = [...bookings];

    // Status filtering based on active sub-tab (Only applied in List View)
    if (viewMode === 'list') {
      switch (activeSubTab) {
        case 'current':
          filtered = filtered.filter(b => ['Pending', 'Confirmed', 'In Progress'].includes(b.status));
          break;
        case 'upcoming':
          filtered = filtered.filter(b => b.date && b.date > now && b.status === 'Confirmed');
          break;
        case 'past':
          filtered = filtered.filter(b => ['Completed', 'Cancelled', 'Declined'].includes(b.status));
          break;
      }
    }

    // Search filtering (Applies to both views)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        (b.clientName || '').toLowerCase().includes(term) ||
        (b.service_type || b.type || '').toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  // Helper for tab counts
  const getCount = (tabId: SubTab) => {
    const now = new Date();
    switch (tabId) {
      case 'current': return bookings.filter(b => ['Pending', 'Confirmed', 'In Progress'].includes(b.status)).length;
      case 'upcoming': return bookings.filter(b => b.date && b.date > now && b.status === 'Confirmed').length;
      case 'past': return bookings.filter(b => ['Completed', 'Cancelled', 'Declined'].includes(b.status)).length;
      default: return bookings.length;
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      await acceptBooking({ bookingId: bookingId as any, talentClerkId: userId });
      toast.success('Booking accepted!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      await rejectBooking({ bookingId: bookingId as any, talentClerkId: userId, reason: 'Declined by talent' });
      toast.success('Booking declined');
    } catch (e: any) {
      toast.error(e.message || 'Failed to decline booking');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Enhanced Header with View Toggle & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Calendar className="text-brand-blue" size={24} />
            My Bookings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your scheduled sessions and studio time.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' : 'text-gray-500'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' : 'text-gray-500'}`}
              title="Calendar View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          </div>
        </div>

      {/* Role Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setBookingRole('client')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            bookingRole === 'client' 
              ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          My Sessions
        </button>
        <button
          onClick={() => setBookingRole('talent')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
            bookingRole === 'talent' 
              ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Incoming Requests
          {talentBookingsQuery?.data?.filter((b: any) => b.status === 'Pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue mb-4" size={40} />
          <p className="text-gray-500">Loading your schedule...</p>
        </div>
      ) : viewMode === 'calendar' ? (
        /* --- CALENDAR VIEW (Studio Manager Style) --- */
        <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-4 shadow-sm animate-in zoom-in-95 duration-300">
          <UnifiedCalendar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            view={calendarView}
            onViewChange={setCalendarView}
            bookings={filteredBookings}
            onBookingClick={(booking) => {
              const targetId = booking.sender_id || booking.target_id;
              if (targetId) openPublicProfile(targetId, booking.clientName);
            }}
            showControls={true}
          />
        </div>
      ) : (
        /* --- LIST VIEW --- */
        <div className="space-y-6">
          {/* Sub-tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {subTabs.map(tab => {
                const isActive = activeSubTab === tab.id;
                const count = getCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                      isActive
                        ? 'border-brand-blue text-brand-blue bg-blue-50/50 dark:bg-blue-900/10'
                        : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List Content */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed dark:border-gray-700">
              <Calendar className="mx-auto text-gray-400 mb-4 opacity-20" size={64} />
              <h3 className="text-lg font-semibold dark:text-white">No bookings found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                {searchTerm ? `No results match "${searchTerm}"` : `You don't have any ${activeSubTab} bookings at the moment.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id || booking._id}
                  booking={booking}
                  openPublicProfile={openPublicProfile}
                  isTalentView={bookingRole === 'talent'}
                  onAccept={() => handleAccept(booking.id || booking._id)}
                  onDecline={() => handleDecline(booking.id || booking._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Booking Card
 */
function BookingCard({ 
  booking, 
  openPublicProfile,
  isTalentView,
  onAccept,
  onDecline
}: { 
  booking: any; 
  openPublicProfile: any;
  isTalentView?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const statusColors: any = {
    'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Confirmed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Accepted': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Completed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Declined': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  };

  const formatDate = (date: any) => {
    if (!date) return 'Flexible';
    return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  return (
    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 hover:shadow-lg transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <UserAvatar userId={booking.sender_id || booking.target_id} size={50} />
          <div className="min-w-0">
            <h3 className="font-bold dark:text-white truncate group-hover:text-brand-blue transition-colors">
              {booking.clientName}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {booking.service_type || booking.type || 'Session'}
              </span>
              •
              <span>{booking.roomName || 'Main Studio'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="text-left sm:text-right hidden sm:block mr-2">
            <div className="text-sm font-bold dark:text-white flex items-center justify-end gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {formatDate(booking.date)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {booking.start_time} ({booking.duration_hours || booking.duration}h)
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
            {booking.status}
          </span>

          <button 
            onClick={() => openPublicProfile(booking.sender_id || booking.target_id || booking.clientId || booking.talentId, booking.clientName)}
            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {booking.message && (
        <div className="mt-4 pt-3 border-t dark:border-gray-700">
           <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            "{booking.message}"
           </p>
        </div>
      )}

      {isTalentView && booking.status === 'Pending' && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-end gap-3">
          <button
            onClick={onDecline}
            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2 text-sm font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all shadow-md shadow-green-500/20"
          >
            Accept Request
          </button>
        </div>
      )}
    </div>
  );
}
