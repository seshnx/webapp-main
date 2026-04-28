// Note: Booking reminders now use Convex
// Database operations should be handled in components with proper Convex context
// This utility file provides interfaces and helper functions
//
// Usage in components:
// import { useMutation, useQuery } from 'convex/react';
// import { api } from '@convex/api';
//
// const scheduleReminders = useMutation(api.bookingReminders.scheduleReminders);
// await scheduleReminders({
//   bookingId,
//   userId: currentUserId,
//   reminderHours: [24, 2],
//   bookingDate: new Date(booking.date).getTime()
// });

/**
 * Booking reminder interface
 */
export interface BookingReminder {
  _id: string;
  bookingId: string;
  userId: string;
  reminderType: 'day_before' | 'hours_before';
  reminderHours: number;
  scheduledFor: number;
  sent: boolean;
  cancelled?: boolean;
  sentAt?: number;
  createdAt: number;
}

/**
 * Booking interface for reminders
 */
export interface ReminderBooking {
  _id: string;
  date: string | Date;
  time?: string;
  targetName?: string;
  status?: string;
  senderId?: string;
  [key: string]: any;
}

/**
 * Schedule automated booking reminders
 * Now uses Convex - should be called from components with Convex context
 *
 * Usage in components:
 * const scheduleReminders = useMutation(api.bookingReminders.scheduleReminders);
 * await scheduleReminders({
 *   bookingId: booking._id,
 *   userId: currentUserId,
 *   reminderHours: [24, 2],
 *   bookingDate: new Date(booking.date).getTime()
 * });
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

    // Log reminder details for debugging
    // Actual scheduling should be done from components using Convex mutation
    console.log('Booking reminders to be scheduled:', {
      bookingId: booking._id,
      userId: booking.senderId,
      reminderHours,
      bookingDate: bookingDate.getTime(),
      reminders: reminderHours.map(hours => {
        const reminderTime = new Date(bookingDate.getTime() - (hours * 60 * 60 * 1000));
        return {
          bookingId: booking._id,
          userId: booking.senderId,
          reminderType: hours >= 24 ? 'day_before' : 'hours_before',
          reminderHours: hours,
          scheduledFor: reminderTime.getTime(),
        };
      })
    });

    // NOTE: Components should create the actual reminders using:
    // const scheduleReminders = useMutation(api.bookingReminders.scheduleReminders);
    // await scheduleReminders({ bookingId, userId, reminderHours, bookingDate });

  } catch (error: any) {
    console.log('Reminder scheduling error (non-critical):', error.message);
  }
};

/**
 * Send booking reminder
 * Now uses Convex - should be called from components with Convex context
 *
 * Usage in components:
 * const createNotification = useMutation(api.notifications.createNotification);
 * const markSent = useMutation(api.bookingReminders.markReminderSent);
 *
 * // Create notification
 * await createNotification({
 *   userId: reminderUserId,
 *   type: 'booking_reminder',
 *   title: 'Booking Reminder',
 *   message: `Your booking is in ${hours} hour(s)`,
 *   metadata: { bookingId, reminderType }
 * });
 *
 * // Mark as sent
 * await markSent({ reminderId: reminder._id });
 */
export const sendBookingReminder = async (reminder: BookingReminder): Promise<void> => {
  try {
    // Log reminder details for debugging
    // Actual notification sending should be done from components using Convex mutations
    console.log('Sending booking reminder:', {
      reminderId: reminder._id,
      bookingId: reminder.bookingId,
      userId: reminder.userId,
      reminderType: reminder.reminderType,
      reminderHours: reminder.reminderHours,
    });

    // NOTE: Components should:
    // 1. Create a notification using api.notifications.createNotification
    // 2. Mark the reminder as sent using api.bookingReminders.markReminderSent
    //
    // Example:
    // const createNotification = useMutation(api.notifications.createNotification);
    // await createNotification({
    //   userId: reminder.userId,
    //   type: 'booking_reminder',
    //   title: 'Booking Reminder',
    //   message: `Your booking is in ${hours}`,
    //   metadata: { bookingId: reminder.bookingId }
    // });
    //
    // const markSent = useMutation(api.bookingReminders.markReminderSent);
    // await markSent({ reminderId: reminder._id });

  } catch (error) {
    console.error('Send reminder error:', error);
  }
};
