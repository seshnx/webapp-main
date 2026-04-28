import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import FloorplanViewer from './FloorplanViewer';
import KioskSchedule from './KioskSchedule';
import KioskHeader from './KioskHeader';
import KioskFooter from './KioskFooter';
import { Loader2, MonitorPlay } from 'lucide-react';
import type { StudioData, Room } from '@/types/kiosk';
import { DEMO_DATA } from '@/config/kioskDemoData';

// =====================================================
// PROPS
// =====================================================
interface StudioKioskProps {
  eduMode?: boolean; // Override for EDU campus mode
}

/**
 * Studio Kiosk - Real-time display system for lobby/room displays
 * Shows live booking status, floor plan with "You Are Here", and schedule.
 *
 * Navigation:
 *   /kiosk/demo        → Demo mode with mock data (no auth required)
 *   /kiosk/:studioId   → Live mode via Convex queries
 */
export default function StudioKiosk({ eduMode: propEduMode }: StudioKioskProps) {
  const { studioId } = useParams<{ studioId: string }>();
  // isDemo when: explicitly passed 'demo' as studioId, or when studioId is missing
  // (static /kiosk/demo route has no :studioId param, so useParams returns undefined)
  const isDemo = !studioId || studioId === 'demo';
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Live Convex queries (skipped in demo mode) ──
  const liveStudioInfo = useQuery(
    api.kiosk.getStudioInfo,
    !isDemo && studioId ? { studioId } : 'skip'
  );
  const liveBookings = useQuery(
    api.kiosk.getLiveBookings,
    !isDemo && studioId ? { studioId } : 'skip'
  );

  // ── Resolve the data source ──
  const studioData: StudioData | null = useMemo(() => {
    if (isDemo) return DEMO_DATA;
    if (!liveStudioInfo) return null;

    // Shape the Convex response into StudioData
    return {
      studio: {
        id: liveStudioInfo.id,
        name: liveStudioInfo.name,
        location: { city: '', state: '' },
        contact: {},
        kiosk: { eduMode: false, networkName: null },
      },
      rooms: liveStudioInfo.rooms || [],
      floorplan: liveStudioInfo.floorplan || { walls: [], structures: [] },
      bookings: (liveBookings || []).map((b: any) => ({
        id: b.id,
        roomId: b.roomId || '',
        roomName: b.roomName,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        serviceType: b.serviceType,
        isClassBooking: b.isClassBooking,
        className: b.className,
        professorName: b.professorName,
        lessonPlan: b.lessonPlan,
      })),
      timestamp: new Date().toISOString(),
    };
  }, [isDemo, liveStudioInfo, liveBookings]);

  const loading = !isDemo && (liveStudioInfo === undefined || liveBookings === undefined);

  // ── Loading ──
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">Loading kiosk…</p>
        </div>
      </div>
    );
  }

  // ── Error / Not Found ──
  if (!studioData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center max-w-md p-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Kiosk Unavailable</h1>
          <p className="text-gray-400 mb-6">Studio not found or kiosk mode is not enabled.</p>
          <Link
            to="/kiosk/demo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
          >
            <MonitorPlay size={18} />
            View Demo Kiosk
          </Link>
        </div>
      </div>
    );
  }

  // ── Calculate room statuses ──
  const roomStatuses: Record<string, 'available' | 'in_use'> =
    studioData.bookings?.reduce((acc, booking) => {
      if (!booking.roomId) return acc;
      const start = booking.startTime ? new Date(booking.startTime) : null;
      const end = booking.endTime ? new Date(booking.endTime) : null;
      if (
        start && end &&
        currentTime >= start && currentTime <= end &&
        (booking.status === 'confirmed' || booking.status === 'in_progress')
      ) {
        acc[booking.roomId] = 'in_use';
      }
      return acc;
    }, {} as Record<string, 'available' | 'in_use'>) || {};

  const isEduMode = propEduMode || studioData.studio.kiosk.eduMode;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1.5 flex items-center justify-center gap-2 text-sm font-medium">
          <MonitorPlay size={15} />
          <span>Demo Mode — <Link to="/studio-manager" className="underline underline-offset-2 hover:text-white/80">Go to Studio Manager</Link> to launch your real kiosk</span>
        </div>
      )}

      {/* Header */}
      <KioskHeader
        studioName={studioData.studio.name}
        currentTime={currentTime}
        eduMode={isEduMode}
        location={studioData.studio.location}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Floor Plan Viewer */}
        <div className="flex-1 p-6">
          <div className="bg-gray-900 rounded-xl shadow-xl h-full p-4 border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Floor Plan — Live Status
            </h2>
            <FloorplanViewer
              walls={studioData.floorplan.walls}
              structures={studioData.floorplan.structures}
              rooms={studioData.rooms}
              roomStatuses={roomStatuses}
            />
          </div>
        </div>

        {/* Schedule Sidebar */}
        <div className="w-96 bg-gray-900 border-l border-gray-800 shadow-xl flex-shrink-0">
          <KioskSchedule
            bookings={studioData.bookings}
            eduMode={isEduMode}
            currentTime={currentTime}
          />
        </div>
      </div>

      {/* Footer */}
      <KioskFooter
        contact={studioData.studio.contact}
        networkName={studioData.studio.kiosk.networkName}
      />
    </div>
  );
}
