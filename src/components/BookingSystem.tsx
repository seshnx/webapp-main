import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Plus, 
  Zap, 
  Loader2, 
  LucideIcon 
} from 'lucide-react';
import BookingCalendar from './shared/BookingCalendar';
import SessionDetailsModal from './SessionDetailsModal';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  useBookingsByClient, 
  useConfirmBooking, 
  useCancelBooking, 
  useUpdateBooking 
} from '@/hooks/useConvex';
import type { UserData } from '../types';

// Lazy load heavy modules
const TalentSearch = lazy(() => import('./TalentSearch'));
const SessionBuilderModal = lazy(() => import('./SessionBuilderModal'));
const SessionWizard = lazy(() => import('./SessionWizard'));
const BroadcastRequest = lazy(() => import('./BroadcastRequest'));
const BroadcastList = lazy(() => import('./BroadcastList'));
const MyBookingsManagement = lazy(() => import('./booking/MyBookingsManagement'));

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

export interface Booking {
  id: string;
  sender_id: string;
  sender_name?: string;
  target_id: string;
  target_name?: string;
  date?: string;
  time?: string;
  endTime?: string;
  duration?: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Declined' | 'Rejected';
  offer_amount?: number;
  message?: string;
  created_at: string;
  updated_at: string;
}

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

type TabId = 'find-talent' | 'find-bookings' | 'my-bookings' | 'session-builder' | 'broadcast-list';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'Declined';
type FilterType = 'all' | 'sent' | 'received';

// =====================================================
// UTILS
// =====================================================

const calculateDuration = (startTime?: string, endTime?: string): number | undefined => {
  if (!startTime || !endTime || startTime === 'Flexible' || endTime === 'Flexible') return undefined;
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  } catch {
    return undefined;
  }
};

const getTabFromPath = (path: string): TabId => {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'bookings' && parts[1]) {
    return parts[1] as TabId;
  }
  return 'my-bookings'; 
};

// =====================================================
// COMPONENT
// =====================================================

export default function BookingSystem({ user, userData, subProfiles, openPublicProfile }: BookingSystemProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const userId = userData?.id || user?.id || user?.uid || '';
  const isStudioManager = userData?.accountTypes?.includes('Studio');

  // Convex Hooks (Failsafed by ensuring userId is a string)
  const clientBookingsRaw = useBookingsByClient(userId);
  const confirmBooking = useConfirmBooking();
  const updateBooking = useUpdateBooking();

  // State
  const [activeTab, setActiveTab] = useState<TabId>(() => getTabFromPath(location.pathname));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  const [showSessionBuilder, setShowSessionBuilder] = useState<boolean>(false);
  const [sessionCart, setSessionCart] = useState<any[]>([]);
  const [sessionParams, setSessionParams] = useState<any>(null);
  const [showSessionWizard, setShowSessionWizard] = useState<boolean>(false);
  const [showBroadcastRequest, setShowBroadcastRequest] = useState<boolean>(false);

  // Sync activeTab with URL changes
  useEffect(() => {
    const tabFromUrl = getTabFromPath(location.pathname);
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname, activeTab]);

  const handleTabChange = (tabId: TabId): void => {
    setActiveTab(tabId);
    navigate(`/bookings/${tabId}`);
  };

  // Memoized Data Processing
  const bookings: Booking[] = useMemo(() => {
    if (!clientBookingsRaw) return [];
    return clientBookingsRaw.map((b: any) => ({
      id: b._id,
      sender_id: b.clientId,
      sender_name: b.clientName,
      target_id: b.studioId,
      target_name: b.studioName,
      date: b.date,
      time: b.startTime,
      endTime: b.endTime,
      duration: calculateDuration(b.startTime, b.endTime),
      status: b.status,
      offer_amount: b.totalAmount,
      message: b.notes,
      created_at: b.createdAt,
      updated_at: b.updatedAt
    }));
  }, [clientBookingsRaw]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (filterStatus !== 'all' && booking.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterType !== 'all') {
        if (filterType === 'sent' && booking.sender_id !== userId) return false;
        if (filterType === 'received' && booking.target_id !== userId) return false;
      }
      return true;
    });
  }, [bookings, filterStatus, filterType, userId]);

  const studioBookings = useMemo(() => {
    if (!isStudioManager) return [];
    return bookings.filter(b => b.target_id === userId || b.sender_id === userId);
  }, [bookings, isStudioManager, userId]);

  // Tab Definitions
  const tabs: Tab[] = [
    { id: 'find-talent', label: t('findTalent') || 'Find Talent', icon: Search },
    { id: 'find-bookings', label: t('findBookings') || 'Find Bookings', icon: Zap },
    { id: 'my-bookings', label: t('myBookings') || 'My Bookings', icon: Calendar },
  ];

  // Loading State for Convex Query
  if (clientBookingsRaw === undefined) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <span className="ml-3 text-gray-500">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-fluid gap-fluid relative">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto font-medium"
        >
          <Plus size={18} />
          {t('newSession')}
        </button>
      </header>

      {/* Tabs Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2 rounded-t-lg ${
                activeTab === id
                  ? 'border-brand-blue text-brand-blue bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <TabIcon size={16} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Studio Manager Overview (Only shown on 'My Bookings') */}
        {isStudioManager && activeTab === 'my-bookings' && (
          <section className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4">
              Studio Operations Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 mb-1">
                  Bookings Received
                </h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {studioBookings.filter(b => b.target_id === userId).length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Clients booking your studio</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 mb-1">
                  Bookings Made
                </h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {studioBookings.filter(b => b.sender_id === userId).length}
                </div>
                <p className="text-xs text-gray-500 mt-1">Services booked by your studio</p>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Tab Rendering */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
          </div>
        }>
          {activeTab === 'my-bookings' && (
            <MyBookingsManagement
              user={user}
              userData={userData}
              openPublicProfile={openPublicProfile}
            />
          )}

          {activeTab === 'find-talent' && (
            <TalentSearch
              user={user}
              userData={userData}
              openPublicProfile={openPublicProfile || (() => {})}
            />
          )}

          {activeTab === 'find-bookings' && (
            <BroadcastList
              user={user}
              userData={userData}
              onBid={(broadcast) => console.log('Bid on broadcast:', broadcast)}
            />
          )}

          {activeTab === 'broadcast-list' && !showBroadcastRequest && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white">Active Broadcasts</h2>
                <button
                  onClick={() => setShowBroadcastRequest(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={18} />
                  {t('createBroadcast')}
                </button>
              </div>
              <BroadcastList
                user={user}
                userData={userData}
                onBid={(broadcast) => console.log('Bid on broadcast:', broadcast)}
              />
            </div>
          )}

          {activeTab === 'broadcast-list' && showBroadcastRequest && (
            <BroadcastRequest
              user={user}
              userData={userData}
              onBack={() => setShowBroadcastRequest(false)}
              onSuccess={() => {
                setShowBroadcastRequest(false);
                window.location.reload();
              }}
            />
          )}

          {activeTab === 'session-builder' && showSessionWizard && (
            <SessionWizard
              userData={userData}
              sessionParams={sessionParams}
              setSessionParams={setSessionParams}
              onNext={() => {
                setShowSessionWizard(false);
                setShowSessionBuilder(true);
              }}
            />
          )}
        </Suspense>
      </main>

      {/* Modals */}
      {selectedBooking && (
        <SessionDetailsModal
          booking={{
            ...selectedBooking,
            targetId: selectedBooking.target_id,
            senderId: selectedBooking.sender_id,
            targetName: selectedBooking.target_name,
            senderName: selectedBooking.sender_name
          }}
          user={{ ...user, uid: userId }}
          onClose={() => setSelectedBooking(null)}
        />
      )}

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
