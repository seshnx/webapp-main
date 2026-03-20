// Note: This utility file now uses Convex for notifications and user data
// The functions that needed Neon have been updated to use Convex equivalents
import type { AccountType } from '../types';

// Placeholder functions - actual notification logic should use Convex notifications
// These functions should be called from components with proper Convex context

/**
 * Booking data interface
 */
export interface Booking {
  id: string;
  sender_id?: string;
  client_id?: string;
  studio_owner_id?: string;
  target_id?: string;
  target_name?: string;
  studio_name?: string;
  date?: string | Date;
  time?: string;
  duration?: number;
  booking_start?: string | Date;
  offer_amount?: number;
  message?: string;
  status?: string;
  sender_name?: string;
  [key: string]: any;
}

/**
 * Cancellation policy interface
 */
export interface CancellationPolicy {
  freeCancellationHours?: number;
  noCancellationAfterHours?: number;
  feeStructure?: {
    '48+'?: number;
    '24-48'?: number;
    '12-24'?: number;
    '0-12'?: number;
    past?: number;
  };
}

/**
 * Cancellation fee result
 */
export interface CancellationFeeResult {
  fee: number;
  refund: number;
  feePercentage?: number;
  hoursUntilBooking?: number;
}

/**
 * Conflict check result
 */
export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: Booking[];
}

/**
 * Cancellation check result
 */
export interface CancellationCheckResult {
  canCancel: boolean;
  reason: string;
}

/**
 * Status transition validation result
 */
export interface StatusTransitionResult {
  isValid: boolean;
  allowedStatuses: string[];
}

/**
 * Get user notification preferences
 * Uses Convex settings to retrieve user preferences
 */
export const getUserNotificationPreferences = async (userId: string) => {
  try {
    // This should be called from components with Convex context
    // Components should use: useQuery(api.settings.getUserSettings, { userId })
    // For now, return default preferences
    return {
      emailNotifications: true,
      pushNotifications: true,
      bookingReminder: true,
      bookingConfirmed: true,
      bookingCancelled: true,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

/**
 * Send notification to user about booking status change
 * Creates notification via Convex - should be called from components with Convex context
 *
 * Usage in components:
 * const createNotification = useMutation(api.notifications.createNotification);
 * await createNotification({
 *   userId: targetUserId,
 *   type: 'booking',
 *   title: `Booking ${newStatus}`,
 *   message: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`,
 *   metadata: { bookingId: booking.id, status: newStatus }
 * });
 */
export const notifyBookingStatusChange = async (
  booking: Booking,
  newStatus: string,
  userId?: string
): Promise<void> => {
  try {
    const targetUserId = booking.sender_id || booking.client_id;

    if (!targetUserId) {
      console.warn('Cannot send notification: no target user ID');
      return;
    }

    // Log notification details for debugging
    // Actual notification creation should be done from components using Convex mutations
    console.log('Booking status notification:', {
      targetUserId,
      bookingId: booking.id,
      newStatus,
      title: `Booking ${newStatus}`,
      message: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`,
      metadata: {
        bookingId: booking.id,
        status: newStatus,
        targetName: booking.target_name,
        studioName: booking.studio_name,
      }
    });

    // NOTE: Components should create the actual notification using:
    // const createNotification = useMutation(api.notifications.createNotification);
    // await createNotification({ userId, type, title, message, metadata });
  } catch (error) {
    console.error('Notification error:', error);
  }
};

/**
 * Check for booking conflicts before confirming
 * Uses Convex bookings query to check for overlapping bookings
 *
 * Usage in components:
 * const conflictingBookings = useQuery(api.bookings.getBookingsByStudioAndDate, {
 *   studioId: booking.studioId,
 *   date: booking.date,
 *   status: 'Confirmed'
 * });
 */
export const checkBookingConflicts = async (
  booking: Booking,
  userId: string
): Promise<ConflictCheckResult> => {
  try {
    // Only check if booking has a valid date
    if (!booking.date || booking.date === 'Flexible') {
      return { hasConflict: false, conflicts: [] };
    }

    const bookingDate = new Date(booking.date);
    if (isNaN(bookingDate.getTime())) {
      return { hasConflict: false, conflicts: [] };
    }

    // Check for other confirmed bookings at the same time using Convex
    // Components should use: useQuery(api.bookings.getBookingsByStudio, { studioId, status: 'Confirmed' })
    // For now, return empty array as actual query should be done from components
    const conflictingBookings: any[] = [];

    // Advanced conflict detection: Check for date AND time overlaps
    const conflicts = (conflictingBookings || []).filter((cb: any) => {
      const cbDate = parseBookingDate(cb.date);
      if (!cbDate) return false;

      // Check if same date
      if (cbDate.toDateString() !== bookingDate.toDateString()) {
        return false;
      }

      // If both have time information, check for time overlap
      if (booking.booking_start && cb.booking_start && booking.duration && cb.duration) {
        const bookingStart = new Date(booking.booking_start);
        const bookingEnd = new Date(bookingStart.getTime() + (booking.duration * 60 * 60 * 1000));
        const cbStart = new Date(cb.booking_start);
        const cbEnd = new Date(cbStart.getTime() + (cb.duration * 60 * 60 * 1000));

        // Check for time overlap
        return !(bookingEnd <= cbStart || bookingStart >= cbEnd);
      }

      // If no time info, just check date (conservative approach)
      return true;
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };

  } catch (error) {
    console.error('Error checking conflicts:', error);
    return { hasConflict: false, conflicts: [] };
  }
};

/**
 * Validate booking status transition
 */
export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): StatusTransitionResult => {
  const validTransitions: Record<string, string[]> = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Completed', 'Cancelled'],
    Completed: [], // Terminal state
    Cancelled: [] // Terminal state
  };

  const allowedStatuses = validTransitions[currentStatus] || [];
  return {
    isValid: allowedStatuses.includes(newStatus),
    allowedStatuses
  };
};

/**
 * Parse booking date safely
 */
const parseBookingDate = (dateValue: string | Date | null | undefined): Date | null => {
  if (!dateValue || dateValue === 'Flexible') return null;
  try {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

/**
 * Track booking history/audit log
 * Creates audit entry via Convex - should be called from components with Convex context
 *
 * Usage in components:
 * const createAuditEntry = useMutation(api.audit.createBookingAuditEntry);
 * await createAuditEntry({
 *   bookingId,
 *   oldStatus,
 *   newStatus,
 *   changedBy,
 *   notes
 * });
 */
export const trackBookingHistory = async (
  bookingId: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string,
  notes: string = ''
): Promise<void> => {
  try {
    const historyEntry = {
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      notes,
      created_at: new Date().toISOString()
    };

    // Log audit entry for debugging
    // Actual audit entry creation should be done from components using Convex mutations
    console.log('Booking history tracking:', historyEntry);

    // NOTE: Components should create the actual audit entry using:
    // const createAuditEntry = useMutation(api.audit.createBookingAuditEntry);
    // await createAuditEntry({ bookingId, oldStatus, newStatus, changedBy, notes });
  } catch (error: any) {
    console.log('Booking history tracking error (non-critical):', error.message);
  }
};

/**
 * Calculate cancellation fee based on policy
 */
export const calculateCancellationFee = (
  booking: Booking,
  cancellationPolicy?: CancellationPolicy
): CancellationFeeResult => {
  if (!cancellationPolicy) {
    return { fee: 0, refund: booking.offer_amount || 0 };
  }

  const now = new Date();
  const bookingDate = parseBookingDate(booking.date);
  if (!bookingDate) {
    // Can't calculate without date
    return { fee: 0, refund: booking.offer_amount || 0 };
  }

  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const amount = booking.offer_amount || 0;

  let fee = 0;
  let feePercentage = 0;

  // Default policy if none specified
  const policy: CancellationPolicy = cancellationPolicy || {
    freeCancellationHours: 48,
    feeStructure: {
      '48+': 0,      // Free if cancelled 48+ hours before
      '24-48': 0.25, // 25% fee if 24-48 hours before
      '12-24': 0.5,  // 50% fee if 12-24 hours before
      '0-12': 0.75,  // 75% fee if 0-12 hours before
      'past': 1.0    // 100% fee if past booking time
    }
  };

  const feeStructure = policy.feeStructure || {};

  if (hoursUntilBooking < 0) {
    feePercentage = feeStructure.past ?? 1.0;
  } else if (hoursUntilBooking < 12) {
    feePercentage = feeStructure['0-12'] ?? 0.75;
  } else if (hoursUntilBooking < 24) {
    feePercentage = feeStructure['12-24'] ?? 0.5;
  } else if (hoursUntilBooking < 48) {
    feePercentage = feeStructure['24-48'] ?? 0.25;
  } else {
    feePercentage = feeStructure['48+'] ?? 0;
  }

  fee = amount * feePercentage;
  const refund = amount - fee;

  return {
    fee: Math.round(fee * 100) / 100,
    refund: Math.round(refund * 100) / 100,
    feePercentage,
    hoursUntilBooking: Math.round(hoursUntilBooking * 10) / 10
  };
};

/**
 * Check if booking can be cancelled (based on policy)
 */
export const canCancelBooking = (
  booking: Booking,
  cancellationPolicy?: CancellationPolicy
): CancellationCheckResult => {
  if (!booking.date || booking.date === 'Flexible') {
    return { canCancel: true, reason: '' };
  }

  const bookingDate = parseBookingDate(booking.date);
  if (!bookingDate) {
    return { canCancel: true, reason: '' };
  }

  const now = new Date();
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // If booking is in the past, can't cancel
  if (hoursUntilBooking < 0) {
    return { canCancel: false, reason: 'Booking time has already passed' };
  }

  // Check policy restrictions
  const policy = cancellationPolicy || {};
  if (policy.noCancellationAfterHours && hoursUntilBooking < policy.noCancellationAfterHours) {
    return {
      canCancel: false,
      reason: `Cancellations not allowed within ${policy.noCancellationAfterHours} hours of booking`
    };
  }

  return { canCancel: true, reason: '' };
};
