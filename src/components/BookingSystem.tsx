import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, DollarSign, MessageSquare, CheckCircle, XCircle, AlertCircle, Loader2, Filter, Search, Plus, Zap, LucideIcon } from 'lucide-react';
import BookingCalendar from './shared/BookingCalendar';
import SessionDetailsModal from './SessionDetailsModal';
import UserAvatar from './shared/UserAvatar';
import { useLanguage } from '../contexts/LanguageContext';
import { useStudioBookingsByClient, useConfirmStudioBooking, useCancelStudioBooking, useUpdateStudioBooking } from '@/hooks/useConvex';
import type { UserData } from '../types';

// Lazy load the missing modules
const TalentSearch = lazy(() => import('./TalentSearch'));
const SessionBuilderModal = lazy(() => import('./SessionBuilderModal'));
const SessionWizard = lazy(() => import('./SessionWizard'));
const BroadcastRequest = lazy(() => import('./BroadcastRequest'));
const BroadcastList = lazy(() => import('./BroadcastList'));
const MyBookingsManagement = lazy(() => import('./booking/MyBookingsManagement'));
const TalentBookingModal = lazy(() => import('./TalentBookingModal'));

// =====================================================
// TYPES
// =====================================================

interface BookingSystemProps {
  user: {
    id?: string;
    uid?: string;
    [key: string]: any;
  };
  userData: UserData | null;
  subProfiles?: any[];
  openPublicProfile?: (userId: string) => void;
}

interface Booking {
  id: string;
  sender_id: string;
  sender_name?: string;
  target_id: string;
  target_name?: string;
  date?: string;
  time?: string;
  duration?: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Declined';
  offer_amount?: number;
  message?: string;
  created_at: string;
  updated_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

type TabId = 'find-talent' | 'find-bookings' | 'my-bookings' | 'session-builder' | 'broadcast-list';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'Declined';
type FilterType = 'all' | 'sent' | 'received';

// =====================================================
// COMPONENT
// =====================================================

export default function BookingSystem({ user, userData, subProfiles, openPublicProfile }: BookingSystemProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Convex hooks for bookings
  const clerkId = userData?.clerkId || user?.id || user?.uid;
  const clientBookings = useStudioBookingsByClient(clerkId || '');
  const confirmBooking = useConfirmStudioBooking();
  const cancelBooking = useCancelStudioBooking();
  const updateBooking = useUpdateStudioBooking();

  // Get tab from URL path (e.g., /bookings/calendar -> 'calendar')
  const getTabFromPath = (path: string): TabId => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'bookings' && parts[1]) {
      return parts[1] as TabId; // Return the nested route
    }
    return 'my-bookings'; // Default tab
  };

  const [activeTab, setActiveTab] = useState<TabId>(() => getTabFromPath(location.pathname));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showSessionBuilder, setShowSessionBuilder] = useState<boolean>(false);
  const [sessionCart, setSessionCart] = useState<any[]>([]);
  const [sessionParams, setSessionParams] = useState<any>(null);
  const [showSessionWizard, setShowSessionWizard] = useState<boolean>(false);
  const [showBroadcastRequest, setShowBroadcastRequest] = useState<boolean>(false);
  const [talentBooking, setTalentBooking] = useState<{ talentClerkId: string; profile: any } | null>(null);

  const isStudioManager = userData?.accountTypes?.includes('Studio');

  // Sync activeTab with URL
  useEffect(() => {
    const tabFromUrl = getTabFromPath(location.pathname);
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tabId: TabId): void => {
    setActiveTab(tabId);
    navigate(`/bookings/${tabId}`);
  };

  // All tabs visible (no dropdown)
  const tabs: Tab[] = [
    { id: 'find-talent', label: t('findTalent') || 'Find Talent', icon: Search },
    { id: 'find-bookings', label: t('findBookings') || 'Find Bookings', icon: Zap },
    { id: 'my-bookings', label: t('myBookings') || 'My Bookings', icon: Calendar },
  ];

  // Map Convex bookings to expected format
  const bookings = clientBookings?.map((b: any): Booking => ({
    id: b._id,
    sender_id: b.clientId,
    sender_name: b.clientName,
    target_id: b.studioId,
    target_name: b.studioName,
    date: b.date,
    time: b.startTime,
    duration: undefined, // Calculate from startTime and endTime
    status: b.status,
    offer_amount: b.totalAmount,
    message: b.notes,
    created_at: b.createdAt,
    updated_at: b.updatedAt
  })) || [];

  // Filter bookings based on status and type
  const filteredBookings = bookings.filter((booking: Booking): boolean => {
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
  const studioBookings: Booking[] = isStudioManager
    ? bookings.filter(b => {
        const userId = user?.id || user?.uid;
        return b.target_id === userId || b.sender_id === userId;
      })
    : [];

  const formatDate = (dateStr?: string): string => {
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

  const formatTime = (timeStr?: string): string => {
    if (!timeStr || timeStr === 'Flexible') return 'Flexible';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr || '';
    }
  };

  const getStatusColor = (status: Booking['status']): string => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Declined': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'decline'): Promise<void> => {
    try {
      if (action === 'accept') {
        // Use Convex confirm booking mutation
        await confirmBooking({ bookingId });
      } else {
        // Use Convex update booking mutation to set status to Declined
        await updateBooking({
          bookingId,
          status: 'Declined'
        });
      }

      // Convex automatically updates the bookings, no need to manually reload
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  // Prepare calendar events
  const calendarEvents: CalendarEvent[] = filteredBookings.map((booking): CalendarEvent => ({
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

  if (clientBookings === undefined) {
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
          <h1 className="text-2xl font-bold dark:text-white">{t('bookings')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('manageSessions')}
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
          {t('newSession')}
        </button>
      </div>

      {/* Tabs - All visible, no dropdown */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab: Tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand-blue text-brand-blue bg-blue-50 dark:bg-blue-900/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
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
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
          </div>
        }>
          <MyBookingsManagement
            user={user}
            userData={userData}
            openPublicProfile={openPublicProfile}
          />
        </Suspense>
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
              key="find-talent-tab"
              user={user}
              userData={userData}
              openPublicProfile={openPublicProfile || (() => ({}))}
              mode="direct"
              onBook={(profile: any) => {
                const clerkId = profile.id || profile.clerkId;
                setTalentBooking({ talentClerkId: clerkId, profile });
              }}
            />
          </Suspense>
        </div>
      )}

      {/* Find Bookings Tab */}
      {activeTab === 'find-bookings' && (
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          }>
            <BroadcastList
              user={user}
              userData={userData}
              onBid={(broadcast) => {
                console.log('Bid on broadcast:', broadcast);
              }}
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

      {/* Talent Booking Modal (from Find Talent) */}
      {talentBooking && (user?.id || user?.uid) && (
        <Suspense fallback={null}>
          <TalentBookingModal
            talentClerkId={talentBooking.talentClerkId}
            talentProfile={talentBooking.profile}
            clientClerkId={user.id || user.uid}
            onClose={() => setTalentBooking(null)}
            onSuccess={() => setTalentBooking(null)}
          />
        </Suspense>
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
              {t('createBroadcast')}
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
            onRemoveFromCart={(index: number) => {
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
              window.location.reload();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
