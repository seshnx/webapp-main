import React from 'react';

import { PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface Booking {
  id: string;
  roomId: string;
  roomName?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  serviceType?: string;
  // EDU fields
  isClassBooking?: boolean;
  className?: string;
  professorName?: string;
  lessonPlan?: string;
}

interface KioskScheduleProps {
  bookings: Booking[];
  eduMode: boolean;
  currentTime: Date;
  onQuickBook?: () => void;
}

/**
 * Schedule sidebar for kiosk display
 * Shows upcoming bookings with real-time status
 */
export default function KioskSchedule({
  bookings,
  eduMode,
  currentTime,
  onQuickBook,
}: KioskScheduleProps) {
  const getRemainingTime = (endTime: string) => {
    if (!endTime) return 'Time TBD';

    const end = new Date(endTime);
    const diff = end.getTime() - currentTime.getTime();

    if (diff <= 0) return 'Ending soon';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s remaining`;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m remaining`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m remaining`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentBooking = () => {
    return bookings.find((b) => {
      if (b.status !== 'confirmed' && b.status !== 'in_progress') {
        return false;
      }
      if (!b.startTime || !b.endTime) return false;

      const now = currentTime;
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);

      return now >= start && now <= end;
    });
  };

  const currentBooking = getCurrentBooking();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {eduMode ? "Today's Classes" : "Today's Schedule"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        {onQuickBook && (
          <button
            onClick={onQuickBook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <PlusCircle size={14} />
            <span>{eduMode ? 'Book Lab' : 'Book Room'}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Room Available Prompt when no current session */}
        {!currentBooking && onQuickBook && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Room Available Now
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  {eduMode ? 'Open for student lab reservation' : 'Available for immediate walk-up booking'}
                </div>
              </div>
            </div>
            <button
              onClick={onQuickBook}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow"
            >
              Reserve
            </button>
          </div>
        )}
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {eduMode
                ? 'No classes scheduled for today'
                : 'No bookings scheduled for today'}
            </p>
          </div>
        ) : (
          <>
            {/* Current Booking (Highlighted) */}
            {currentBooking && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    IN PROGRESS
                  </span>
                </div>

                {eduMode && currentBooking.isClassBooking ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentBooking.className || 'Class'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentBooking.professorName
                        ? `Prof. ${currentBooking.professorName}`
                        : 'Instructor TBD'}
                    </p>
                    {currentBooking.lessonPlan && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {currentBooking.lessonPlan}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentBooking.roomName || 'Studio Session'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentBooking.serviceType || 'Session'}
                    </p>
                  </>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(currentBooking.startTime || '')} -{' '}
                    {formatTime(currentBooking.endTime || '')}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {getRemainingTime(currentBooking.endTime || '')}
                  </p>
                </div>
              </div>
            )}

            {/* Upcoming Bookings */}
            {bookings
              .filter((b) => b.id !== currentBooking?.id)
              .map((booking) => {
                const isPast =
                  booking.endTime && new Date(booking.endTime) < currentTime;

                return (
                  <div
                    key={booking.id}
                    className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 ${
                      isPast ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {eduMode && booking.isClassBooking ? (
                          <>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {booking.className || 'Class'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {booking.professorName
                                ? `Prof. ${booking.professorName}`
                                : 'Instructor TBD'}
                            </p>
                          </>
                        ) : (
                          <p className="font-medium text-gray-900 dark:text-white">
                            {booking.roomName || 'Studio Session'}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatTime(booking.startTime || '')}
                          {' - '}
                          {formatTime(booking.endTime || '')}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : booking.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}
                      >
                        {booking.status === 'confirmed'
                          ? 'Upcoming'
                          : booking.status === 'in_progress'
                          ? 'In Progress'
                          : booking.status}
                      </span>
                    </div>

                    {eduMode && booking.isClassBooking && booking.lessonPlan && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {booking.lessonPlan}
                      </p>
                    )}
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
}
