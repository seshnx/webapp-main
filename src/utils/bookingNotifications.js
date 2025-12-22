import { supabase } from '../config/supabase';

/**
 * Send notification to user about booking status change
 * This can be extended to send emails, push notifications, etc.
 */
export const notifyBookingStatusChange = async (booking, newStatus, userId) => {
    if (!supabase) return;

    try {
        // Create notification record in database
        // Uses the notifications table schema from sql/social_feed_module.sql
        const targetUserId = booking.sender_id || booking.client_id;
        const studioUserId = booking.studio_owner_id || booking.target_id;
        
        if (!targetUserId) {
            console.warn('Cannot send notification: no target user ID');
            return;
        }

        const notification = {
            user_id: targetUserId,
            type: 'booking', // Matches schema CHECK constraint
            actor_id: studioUserId,
            actor_name: booking.target_name || booking.studio_name || 'Studio',
            target_type: 'booking',
            target_id: booking.id,
            title: `Booking ${newStatus}`,
            body: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`,
            link: `/bookings/${booking.id}`,
            read: false,
            action_taken: newStatus.toLowerCase(), // 'confirmed', 'cancelled', 'completed'
            created_at: new Date().toISOString()
        };

        // Try to insert notification (will fail gracefully if table doesn't exist)
        try {
            const { error } = await supabase
                .from('notifications')
                .insert(notification);
            
            if (error) {
                // Log but don't throw - notifications are non-critical
                console.log('Notification insert error (non-critical):', error.message);
            }
        } catch (err) {
            // Notifications table may not exist yet - that's okay
            console.log('Notifications table not available:', err.message);
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
            
            // Get user email from database
            const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', targetUserId)
                .single();

            if (userData?.email) {
                await fetch(`${apiUrl}/notifications/send-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: userData.email,
                        subject: emailSubject,
                        html: emailHtml,
                        text: `Your booking with ${booking.target_name || 'the studio'} has been ${newStatus.toLowerCase()}.`
                    })
                }).catch(err => console.log('Email send error (non-critical):', err));
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
            }).catch(err => console.log('Push notification error (non-critical):', err));
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
export const checkBookingConflicts = async (booking, userId) => {
    if (!supabase) return { hasConflict: false, conflicts: [] };

    try {
        // Only check if booking has a valid date
        if (!booking.date || booking.date === 'Flexible') {
            return { hasConflict: false, conflicts: [] };
        }

        const bookingDate = new Date(booking.date);
        if (isNaN(bookingDate.getTime())) {
            return { hasConflict: false, conflicts: [] };
        }

        // Check for other confirmed bookings at the same time
        const { data: conflictingBookings, error } = await supabase
            .from('bookings')
            .select('id, status, date, time, duration, sender_name')
            .or(`studio_owner_id.eq.${userId},target_id.eq.${userId}`)
            .eq('status', 'Confirmed')
            .neq('id', booking.id);

        if (error) {
            console.error('Error checking conflicts:', error);
            return { hasConflict: false, conflicts: [] };
        }

        // Advanced conflict detection: Check for date AND time overlaps
        const conflicts = (conflictingBookings || []).filter(cb => {
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
export const validateStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
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
const parseBookingDate = (dateValue) => {
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
export const trackBookingHistory = async (bookingId, oldStatus, newStatus, changedBy, notes = '') => {
    if (!supabase) return;

    try {
        // Insert into booking_history table (create if doesn't exist)
        const historyEntry = {
            booking_id: bookingId,
            old_status: oldStatus,
            new_status: newStatus,
            changed_by: changedBy,
            notes,
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('booking_history')
            .insert(historyEntry);

        if (error) {
            // Table might not exist - that's okay, log it
            console.log('Booking history table not available:', error.message);
        }
    } catch (error) {
        console.log('Booking history tracking error (non-critical):', error.message);
    }
};

/**
 * Calculate cancellation fee based on policy
 */
export const calculateCancellationFee = (booking, cancellationPolicy) => {
    if (!cancellationPolicy) return { fee: 0, refund: booking.offer_amount || 0 };

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
    const policy = cancellationPolicy || {
        freeCancellationHours: 48,
        feeStructure: {
            '48+': 0,      // Free if cancelled 48+ hours before
            '24-48': 0.25, // 25% fee if 24-48 hours before
            '12-24': 0.5,  // 50% fee if 12-24 hours before
            '0-12': 0.75,  // 75% fee if 0-12 hours before
            'past': 1.0    // 100% fee if past booking time
        }
    };

    if (hoursUntilBooking < 0) {
        feePercentage = policy.feeStructure.past || 1.0;
    } else if (hoursUntilBooking < 12) {
        feePercentage = policy.feeStructure['0-12'] || 0.75;
    } else if (hoursUntilBooking < 24) {
        feePercentage = policy.feeStructure['12-24'] || 0.5;
    } else if (hoursUntilBooking < 48) {
        feePercentage = policy.feeStructure['24-48'] || 0.25;
    } else {
        feePercentage = policy.feeStructure['48+'] || 0;
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
export const canCancelBooking = (booking, cancellationPolicy) => {
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

