/**
 * src/utils/eduTime.ts
 * Utilities for tracking internship hours, session durations, and academic calendars.
 */

interface TimestampLike {
  toMillis(): number;
}

interface LogEntry {
  checkIn: Date | TimestampLike;
  checkOut: Date | TimestampLike;
}

/**
 * Calculates the duration in minutes between two timestamps.
 */
export const calculateDurationMinutes = (
  startTime: Date | TimestampLike,
  endTime: Date | TimestampLike
): number => {
  if (!startTime || !endTime) return 0;

  const start = typeof startTime === 'object' && 'toMillis' in startTime
    ? startTime.toMillis()
    : new Date(startTime as Date).getTime();
  const end = typeof endTime === 'object' && 'toMillis' in endTime
    ? endTime.toMillis()
    : new Date(endTime as Date).getTime();

  const diffMs = end - start;
  return Math.max(0, Math.floor(diffMs / 60000));
};

/**
 * Formats minutes into a readable string (e.g., "4h 15m").
 */
export const formatHours = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
};

/**
 * Sums up total hours from an array of log entries.
 */
export const calculateInternshipProgress = (
  logs: LogEntry[] = [],
  targetHours: number = 0
): { totalMinutes: number; formatted: string; progress: number } => {
  let totalMinutes = 0;

  logs.forEach(log => {
    if (log.checkIn && log.checkOut) {
      totalMinutes += calculateDurationMinutes(log.checkIn, log.checkOut);
    }
  });

  const targetMinutes = targetHours * 60;
  const progress = targetMinutes > 0 ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100)) : 0;

  return {
    totalMinutes,
    formatted: formatHours(totalMinutes),
    progress
  };
};

/**
 * Determines the current Academic Term based on a date.
 */
export const getAcademicTerm = (date: Date = new Date()): string => {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month >= 0 && month <= 4) return `Spring ${year}`;
  if (month >= 5 && month <= 7) return `Summer ${year}`;
  return `Fall ${year}`;
};
