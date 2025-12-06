/**
 * RTDB Helper Utilities
 * Provides safe wrappers for Realtime Database operations
 */

import { rtdb } from '../config/firebase';

/**
 * Check if RTDB is available
 */
export const isRTDBAvailable = () => {
  return rtdb !== null && rtdb !== undefined;
};

/**
 * Get RTDB instance or throw descriptive error
 */
export const getRTDB = () => {
  if (!isRTDBAvailable()) {
    throw new Error('Realtime Database is not available. Please enable RTDB in Firebase Console.');
  }
  return rtdb;
};

/**
 * Safe RTDB operation wrapper
 * Executes callback only if RTDB is available
 */
export const withRTDB = (callback, fallback = null) => {
  if (!isRTDBAvailable()) {
    console.warn('RTDB operation skipped: Realtime Database is not available');
    return fallback;
  }
  
  try {
    return callback(rtdb);
  } catch (error) {
    console.error('RTDB operation failed:', error);
    return fallback;
  }
};

/**
 * Log RTDB status for debugging
 */
export const logRTDBStatus = () => {
  console.log('RTDB Status:', {
    available: isRTDBAvailable(),
    instance: rtdb ? 'initialized' : 'null',
    config: rtdb ? 'configured' : 'not configured'
  });
};

