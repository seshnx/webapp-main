import React from 'react';
import { Clock, MapPin, GraduationCap } from 'lucide-react';

interface KioskHeaderProps {
  studioName: string;
  currentTime: Date;
  eduMode?: boolean;
  location?: {
    city: string;
    state: string;
  };
}

/**
 * Header component for kiosk display
 * Shows studio name, current time, and location
 */
export default function KioskHeader({
  studioName,
  currentTime,
  eduMode = false,
  location,
}: KioskHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {eduMode ? (
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="bg-brand-blue p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {studioName}
            </h1>
            {location && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin size={14} />
                <span>
                  {location.city}, {location.state}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
