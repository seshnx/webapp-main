import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FloorplanViewer from './FloorplanViewer';
import KioskSchedule from './KioskSchedule';
import KioskHeader from './KioskHeader';
import KioskFooter from './KioskFooter';
import { Loader2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
  };
}

interface StudioData {
  studio: {
    id: string;
    name: string;
    location: {
      city: string;
      state: string;
    };
    description?: string;
    logo?: string;
    contact: {
      email?: string;
      phone?: string;
      website?: string;
    };
    kiosk: {
      eduMode: boolean;
      networkName?: string | null;
    };
  };
  rooms: Room[];
  floorplan: {
    walls: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke?: string;
      strokeWidth?: number;
    }>;
    structures: Array<{
      id: string;
      label?: string;
      layout: {
        x: number;
        y: number;
        width: number;
        height: number;
        color?: string;
      };
    }>;
  };
  bookings: Array<{
    id: string;
    roomId: string;
    roomName?: string;
    startTime?: string;
    endTime?: string;
    status: string;
    serviceType?: string;
    isClassBooking?: boolean;
    className?: string;
    professorName?: string;
    lessonPlan?: string;
  }>;
  timestamp: string;
}

interface StudioKioskProps {
  eduMode?: boolean; // Override for EDU campus mode
}

/**
 * Studio Kiosk - Real-time display system for lobby/room displays
 * Shows live booking status, floor plan with "You Are Here", and schedule
 */
export default function StudioKiosk({ eduMode: propEduMode }: StudioKioskProps) {
  const { studioId } = useParams<{ studioId: string }>();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studioData, setStudioData] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial studio data
  const fetchStudioData = async () => {
    if (!studioId) return;

    try {
      const response = await fetch(`/api/public/kiosk/${studioId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Studio not found');
        } else if (response.status === 403) {
          setError('Kiosk mode is not enabled for this studio');
        } else if (response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to load kiosk data');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setStudioData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching kiosk data:', err);
      setError('Failed to connect to kiosk service');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, [studioId]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchStudioData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [studioId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading kiosk...</p>
        </div>
      </div>
    );
  }

  if (error || !studioData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Kiosk Unavailable
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'Failed to load kiosk data'}
          </p>
          <button
            onClick={fetchStudioData}
            className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate room statuses from bookings
  const roomStatuses: Record<string, 'available' | 'in_use'> =
    studioData.bookings?.reduce((acc, booking) => {
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

  const isEduMode = propEduMode || studioData.studio.kiosk.eduMode;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Floor Plan
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
        <div className="w-96 bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-lg">
          <KioskSchedule
            bookings={studioData.bookings}
            eduMode={isEduMode}
            currentTime={currentTime}
          />
        </div>
      </div>

      {/* Footer - Contact Info */}
      <KioskFooter
        contact={studioData.studio.contact}
        networkName={studioData.studio.kiosk.networkName}
      />
    </div>
  );
}
