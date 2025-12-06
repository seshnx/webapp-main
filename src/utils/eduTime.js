/**
 * src/utils/eduTime.js
 * Utilities for tracking internship hours, session durations, and academic calendars.
 */

/**
 * Calculates the duration in minutes between two timestamps.
 * Handles native Date objects and Firestore Timestamps.
 * @param {Date|Object} startTime 
 * @param {Date|Object} endTime 
 * @returns {number} Duration in minutes
 */
export const calculateDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const start = startTime.toMillis ? startTime.toMillis() : new Date(startTime).getTime();
    const end = endTime.toMillis ? endTime.toMillis() : new Date(endTime).getTime();

    const diffMs = end - start;
    return Math.max(0, Math.floor(diffMs / 60000));
};

/**
 * Formats minutes into a readable string (e.g., "4h 15m").
 * @param {number} totalMinutes 
 * @returns {string}
 */
export const formatHours = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
};

/**
 * Sums up total hours from an array of log entries.
 * Expects logs to have 'checkIn' and 'checkOut' fields.
 * @param {Array} logs - Array of log objects
 * @returns {Object} { totalMinutes: number, formatted: string, progress: number }
 */
export const calculateInternshipProgress = (logs = [], targetHours = 0) => {
    let totalMinutes = 0;

    logs.forEach(log => {
        if (log.checkIn && log.checkOut) {
            totalMinutes += calculateDurationMinutes(log.checkIn, log.checkOut);
        }
    });

    // Convert target hours to minutes for calculation
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
 * Default Logic: Spring (Jan-May), Summer (Jun-Aug), Fall (Sep-Dec)
 * @param {Date} date 
 * @returns {string} e.g., "Fall 2024"
 */
export const getAcademicTerm = (date = new Date()) => {
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();

    if (month >= 0 && month <= 4) return `Spring ${year}`;
    if (month >= 5 && month <= 7) return `Summer ${year}`;
    return `Fall ${year}`;
};
