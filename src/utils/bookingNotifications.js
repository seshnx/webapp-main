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

        // TODO: Send email notification
        // TODO: Send push notification
        // TODO: Update real-time subscription for client

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

        // Check for date overlaps
        const conflicts = (conflictingBookings || []).filter(cb => {
            const cbDate = new Date(cb.date);
            if (isNaN(cbDate.getTime())) return false;
            return cbDate.toDateString() === bookingDate.toDateString();
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

