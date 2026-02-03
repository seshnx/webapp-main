import { createNotification, getUser } from '../config/neonQueries';
import { query as neonQuery } from '../config/neon';
import type { AccountType } from '../types';

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
 * Send notification to user about booking status change
 * This can be extended to send emails, push notifications, etc.
 */
export const notifyBookingStatusChange = async (
  booking: Booking,
  newStatus: string,
  userId?: string
): Promise<void> => {
  try {
    // Create notification record in database using Neon
    const targetUserId = booking.sender_id || booking.client_id;
    const studioUserId = booking.studio_owner_id || booking.target_id;

    if (!targetUserId) {
      console.warn('Cannot send notification: no target user ID');
      return;
    }

    // Map notification schema from old to new format
    const notification = {
      user_id: targetUserId,
      type: 'booking',
      title: `Booking ${newStatus}`,
      message: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`,
      reference_type: 'booking',
      reference_id: booking.id,
      metadata: {
        actor_id: studioUserId,
        actor_name: booking.target_name || booking.studio_name || 'Studio',
        link: `/bookings/${booking.id}`,
        action_taken: newStatus.toLowerCase(),
        booking_status: newStatus
      }
    };

    // Try to insert notification using Neon
    try {
      await createNotification(notification);
    } catch (err: any) {
      // Log but don't throw - notifications are non-critical
      console.log('Notification insert error (non-critical):', err.message);
    }

    // Send email notification
    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
      const emailSubject = `Booking ${newStatus} - ${booking.target_name || 'Studio'}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Booking ${newStatus}</h2>
          <p>Your booking with <strong>${booking.target_name || 'the studio'}</strong> has been ${newStatus.toLowerCase()}.</p>
          ${booking.date && booking.date !== 'Flexible' ? `<p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>` : ''}
          ${booking.offer_amount ? `<p><strong>Amount:</strong> $${booking.offer_amount}</p>` : ''}
          <p><a href="${window.location.origin}/bookings/${booking.id}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking</a></p>
        </div>
      `;

      // Get user email from database using Neon
      const userData = await getUser(targetUserId);
      const userEmail = userData?.email;

      if (userEmail) {
        await fetch(`${apiUrl}/notifications/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: userEmail,
            subject: emailSubject,
            html: emailHtml,
            text: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`
          })
        }).catch((err: any) => console.log('Email send error (non-critical):', err));
      }
    } catch (emailError) {
      console.log('Email notification error (non-critical):', emailError);
    }

    // Send push notification
    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
      await fetch(`${apiUrl}/notifications/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          title: `Booking ${newStatus}`,
          body: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`,
          data: {
            bookingId: booking.id,
            status: newStatus,
            url: `/bookings/${booking.id}`
          }
        })
      }).catch((err: any) => console.log('Push notification error (non-critical):', err));
    } catch (pushError) {
      console.log('Push notification error (non-critical):', pushError);
    }

  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw - notifications are non-critical
  }
};

/**
 * Check for booking conflicts before confirming
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

    // Check for other confirmed bookings at the same time using Neon
    const conflictingBookings = await neonQuery(`
      SELECT id, status, date, time, duration, sender_name
      FROM bookings
      WHERE (studio_owner_id = $1 OR target_id = $1)
      AND status = 'Confirmed'
      AND id != $2
    `, [userId, booking.id]);

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
 */
export const trackBookingHistory = async (
  bookingId: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string,
  notes: string = ''
): Promise<void> => {
  try {
    // Insert into booking_history table using Neon
    const historyEntry = {
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      notes,
      created_at: new Date().toISOString()
    };

    await neonQuery(`
      INSERT INTO booking_history (
        booking_id, old_status, new_status, changed_by, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      historyEntry.booking_id,
      historyEntry.old_status,
      historyEntry.new_status,
      historyEntry.changed_by,
      historyEntry.notes,
      historyEntry.created_at
    ]);

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
