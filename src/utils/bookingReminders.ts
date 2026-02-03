import { getUser } from '../config/neonQueries';
import { query as neonQuery } from '../config/neon';

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

    // Insert reminders into booking_reminders table using Neon
    await Promise.all(
      reminders.map(reminder =>
        neonQuery(`
          INSERT INTO booking_reminders (
            booking_id, user_id, reminder_type, reminder_hours,
            scheduled_for, sent, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          reminder.booking_id,
          reminder.user_id,
          reminder.reminder_type,
          reminder.reminder_hours,
          reminder.scheduled_for,
          reminder.sent,
          reminder.created_at
        ])
      )
    ).catch((err: any) => console.log('Reminder scheduling error (non-critical):', err.message));

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
      // Mark reminder as cancelled
      await neonQuery(`
        UPDATE booking_reminders
        SET sent = true, cancelled = true
        WHERE id = $1
      `, [reminder.id]);
      return;
    }

    // Send notification
    const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

    // Get user email from database using Neon
    const userData = await getUser(reminder.user_id);
    const userEmail = userData?.email;

    if (userEmail) {
      const hoursText = reminder.reminder_hours >= 24
        ? `${Math.floor(reminder.reminder_hours / 24)} day(s)`
        : `${reminder.reminder_hours} hour(s)`;

      await fetch(`${apiUrl}/notifications/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: `Reminder: Booking in ${hoursText}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Booking Reminder</h2>
              <p>This is a reminder that you have a booking with <strong>${booking.target_name || 'the studio'}</strong> in ${hoursText}.</p>
              <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
              ${booking.time ? `<p><strong>Time:</strong> ${booking.time}</p>` : ''}
              <p><a href="${window.location.origin}/bookings/${booking.id}">View Booking Details</a></p>
            </div>
          `
        })
      }).catch((err: any) => console.log('Reminder email error:', err));
    }

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

    // Mark reminder as sent
    await neonQuery(`
      UPDATE booking_reminders
      SET sent = true, sent_at = NOW()
      WHERE id = $1
    `, [reminder.id]);

  } catch (error) {
    console.error('Send reminder error:', error);
  }
};
