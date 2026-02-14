import React, { useState, useEffect } from 'react';
import { Calendar, Clock, History, Filter, Loader2 } from 'lucide-react';
import { getBookings } from '../../config/neonQueries';
import UserAvatar from '../shared/UserAvatar';

interface MyBookingsManagementProps {
  user: any;
  userData: any;
  openPublicProfile: (uid: string, name: string) => void;
}

type SubTab = 'current' | 'upcoming' | 'past' | 'history';

export default function MyBookingsManagement({ user, userData, openPublicProfile }: MyBookingsManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('current');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-tab configuration
  const subTabs = [
    { id: 'current' as SubTab, label: 'Current', icon: Calendar, description: 'Active & pending bookings' },
    { id: 'upcoming' as SubTab, label: 'Upcoming', icon: Clock, description: 'Scheduled future sessions' },
    { id: 'past' as SubTab, label: 'Past', icon: History, description: 'Completed sessions' },
    { id: 'history' as SubTab, label: 'All History', icon: Filter, description: 'Full booking history' }
  ];

  // Fetch bookings
  useEffect(() => {
    const loadBookings = async () => {
      if (!userData?.id && !user?.id) return;
      setLoading(true);
      try {
        const userId = userData?.id || user?.id;
        const data = await getBookings(userId, { limit: 100 });
        setBookings(data || []);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [userData?.id, user?.id]);

  // Filter bookings based on sub-tab
  const getFilteredBookings = () => {
    const now = new Date();

    switch (activeSubTab) {
      case 'current':
        return bookings.filter(b =>
          ['Pending', 'Confirmed', 'In Progress'].includes(b.status)
        );

      case 'upcoming':
        return bookings.filter(b => {
          const bookingDate = b.date ? new Date(b.date) : new Date(b.created_at);
          return bookingDate > now && b.status === 'Confirmed';
        });

      case 'past':
        return bookings.filter(b =>
          ['Completed', 'Cancelled', 'Declined'].includes(b.status)
        );

      case 'history':
        return bookings; // All bookings

      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  // Get count for a specific sub-tab (without mutating state)
  const getCount = (tabId: SubTab) => {
    const now = new Date();

    switch (tabId) {
      case 'current':
        return bookings.filter(b =>
          ['Pending', 'Confirmed', 'In Progress'].includes(b.status)
        ).length;

      case 'upcoming':
        return bookings.filter(b => {
          const bookingDate = b.date ? new Date(b.date) : new Date(b.created_at);
          return bookingDate > now && b.status === 'Confirmed';
        }).length;

      case 'past':
        return bookings.filter(b =>
          ['Completed', 'Cancelled', 'Declined'].includes(b.status)
        ).length;

      case 'history':
        return bookings.length;

      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto">
          {subTabs.map(tab => {
            const TabIcon = tab.icon;
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'border-b-2 border-brand-blue text-brand-blue bg-blue-50 dark:bg-blue-900/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeSubTab === tab.id
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {subTabs.find(t => t.id === activeSubTab)?.description}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-brand-blue" size={32} />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            No {activeSubTab} bookings found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              openPublicProfile={openPublicProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Booking card component
interface BookingCardProps {
  booking: any;
  openPublicProfile: (uid: string, name: string) => void;
}

function BookingCard({ booking, openPublicProfile }: BookingCardProps) {
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
      case 'In Progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Declined': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <UserAvatar userId={booking.sender_id || booking.target_id} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold dark:text-white">{booking.sender_name || booking.target_name || 'Unknown'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service_type || booking.type || 'Session'}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="mt-3 space-y-1">
            {booking.date && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={14} className="inline mr-1" />
                {formatDate(booking.date)}
              </p>
            )}
            {booking.start_time && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Clock size={14} className="inline mr-1" />
                {formatTime(booking.start_time)}
                {booking.duration_hours && ` (${booking.duration_hours}h)`}
              </p>
            )}
            {booking.offer_amount && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${booking.offer_amount}
              </p>
            )}
          </div>

          {booking.message && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              "{booking.message}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
