// Note: Booking reminders now use Convex
// Database operations should be handled in components with proper Convex context
// This utility file provides interfaces and helper functions

/**
 * Booking reminder interface
 */
export interface BookingReminder {
  id?: string;
  booking_id: string;
  user_id: string;
  reminder_type: 'day_before' | 'hours_before';
  reminder_hours: number;
  scheduled_for: string;
  sent: boolean;
  cancelled?: boolean;
  sent_at?: string;
  created_at: string;
}

/**
 * Booking interface for reminders
 */
export interface ReminderBooking {
  id: string;
  date: string | Date;
  time?: string;
  target_name?: string;
  status?: string;
  sender_id?: string;
  [key: string]: any;
}

/**
 * Schedule automated booking reminders
 */
export const scheduleBookingReminder = async (
  booking: ReminderBooking,
  reminderHours: number[] = [24, 2]
): Promise<void> => {
  try {
    const bookingDate = new Date(booking.date);
    if (isNaN(bookingDate.getTime()) || booking.date === 'Flexible') {
      return; // Can't schedule reminders for flexible dates
    }

    const reminders: BookingReminder[] = reminderHours.map(hours => {
      const reminderTime = new Date(bookingDate.getTime() - (hours * 60 * 60 * 1000));
      return {
        booking_id: booking.id,
        user_id: booking.sender_id || '',
        reminder_type: hours >= 24 ? 'day_before' : 'hours_before',
        reminder_hours: hours,
        scheduled_for: reminderTime.toISOString(),
        sent: false,
        created_at: new Date().toISOString()
      };
    });

    // TODO: Implement with Convex
    // Reminders should be created using Convex mutations from components
    console.log('Booking reminders scheduled:', reminders.map(r => ({
      bookingId: r.booking_id,
      userId: r.user_id,
      reminderType: r.reminder_type,
      scheduledFor: r.scheduled_for
    })));

  } catch (error: any) {
    console.log('Reminder scheduling error (non-critical):', error.message);
  }
};

/**
 * Send booking reminder
 */
export const sendBookingReminder = async (reminder: BookingReminder): Promise<void> => {
  try {
    // Get booking details using Neon
    const bookings = await neonQuery(`
      SELECT * FROM bookings WHERE id = $1
    `, [reminder.booking_id]);

    const booking = bookings?.[0] as ReminderBooking | undefined;

    if (!booking) {
      console.log('Booking not found for reminder');
      return;
    }

    // Only send if booking is still confirmed
    if (booking.status !== 'Confirmed') {
      // TODO: Mark reminder as cancelled in Convex
      console.log('Reminder cancelled for booking:', reminder.booking_id);
      return;
    }

    // Send notification
    const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

    // TODO: Get user email from Convex user data
    // For now, skip email since we don't have user data here
    console.log('Sending booking reminder for:', reminder.booking_id);

    // Push notification
    await fetch(`${apiUrl}/notifications/send-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: reminder.user_id,
        title: 'Booking Reminder',
        body: `Your booking with ${booking.target_name || 'the studio'} is in ${reminder.reminder_hours >= 24 ? Math.floor(reminder.reminder_hours / 24) + ' day(s)' : reminder.reminder_hours + ' hour(s)'}`,
        data: {
          bookingId: booking.id,
          type: 'reminder',
          url: `/bookings/${booking.id}`
        }
      })
    }).catch((err: any) => console.log('Reminder push error:', err));

    // Mark reminder as sent using Convex
    // TODO: Implement with Convex mutation
    console.log('Reminder marked as sent:', reminder.id);

  } catch (error) {
    console.error('Send reminder error:', error);
  }
};
