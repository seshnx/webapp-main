import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import FloorplanViewer from './FloorplanViewer';
import KioskSchedule from './KioskSchedule';
import KioskHeader from './KioskHeader';
import KioskFooter from './KioskFooter';
import KioskQuickBookModal from './KioskQuickBookModal';
import { Loader2, AlertCircle } from 'lucide-react';

interface StudioKioskProps {
  eduMode?: boolean; // Override for EDU campus mode
}

/**
 * Studio Kiosk - Real-time display system for lobby/room displays
 * Shows live booking status, floor plan with "You Are Here", and schedule
 * Backed by real-time Convex subscriptions
 */
export default function StudioKiosk({ eduMode: propEduMode }: StudioKioskProps) {
  const { studioId } = useParams<{ studioId: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

  // Real-time Convex query for complete Kiosk bundle
  const kioskData = useQuery(
    api.studios.getKioskData,
    studioId ? { studioSlugOrId: studioId } : 'skip'
  );

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading state
  if (kioskData === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading kiosk display...</p>
        </div>
      </div>
    );
  }

  // Error / Not Found state
  if (!kioskData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Kiosk Unavailable
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Studio &ldquo;{studioId}&rdquo; was not found or has not enabled Kiosk Display mode in Studio Settings.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-500/20"
          >
            Return to SeshNx
          </a>
        </div>
      </div>
    );
  }

  // Calculate real-time room statuses from live Convex bookings
  const roomStatuses: Record<string, 'available' | 'in_use'> =
    kioskData.bookings?.reduce((acc, booking) => {
      if (!booking.roomId) return acc;

      const now = currentTime;
      const start = booking.startTime ? new Date(booking.startTime) : null;
      const end = booking.endTime ? new Date(booking.endTime) : null;

      if (
        start &&
        end &&
        now >= start &&
        now <= end &&
        (booking.status === 'confirmed' || booking.status === 'in_progress')
      ) {
        acc[booking.roomId] = 'in_use';
      }
      return acc;
    }, {} as Record<string, 'available' | 'in_use'>) || {};

  const isEduMode = propEduMode ?? kioskData.studio.kiosk.eduMode;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 select-none overflow-hidden">
      {/* Header */}
      <KioskHeader
        studioName={kioskData.studio.name}
        currentTime={currentTime}
        eduMode={isEduMode}
        location={kioskData.studio.location}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Floor Plan Viewer */}
        <div className="flex-1 p-6 flex flex-col min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isEduMode ? 'Audio Facility & Lab Map' : 'Studio Floor Plan'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Green = Available • Red = Class / Session In Progress
                </p>
              </div>

              <button
                onClick={() => setIsQuickBookOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                {isEduMode ? '+ Book Lab Space' : '+ Quick Reserve'}
              </button>
            </div>

            <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <FloorplanViewer
                walls={kioskData.floorplan.walls}
                structures={kioskData.floorplan.structures}
                rooms={kioskData.rooms}
                roomStatuses={roomStatuses}
              />
            </div>
          </div>
        </div>

        {/* Schedule Sidebar */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-xl flex flex-col">
          <KioskSchedule
            bookings={kioskData.bookings}
            eduMode={isEduMode}
            currentTime={currentTime}
            onQuickBook={() => setIsQuickBookOpen(true)}
          />
        </div>
      </div>

      {/* Footer - Contact Info & Network */}
      <KioskFooter
        contact={kioskData.studio.contact}
        networkName={kioskData.studio.kiosk.networkName}
      />

      {/* Quick Booking Modal for Tablets */}
      <KioskQuickBookModal
        isOpen={isQuickBookOpen}
        onClose={() => setIsQuickBookOpen(false)}
        studioId={kioskData.studio.id}
        rooms={kioskData.rooms}
        eduMode={isEduMode}
      />
    </div>
  );
}
