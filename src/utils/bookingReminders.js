import { supabase } from '../config/supabase';

/**
 * Schedule automated booking reminders
 */
export const scheduleBookingReminder = async (booking, reminderHours = [24, 2]) => {
    if (!supabase) return;

    try {
        const bookingDate = new Date(booking.date);
        if (isNaN(bookingDate.getTime()) || booking.date === 'Flexible') {
            return; // Can't schedule reminders for flexible dates
        }

        const reminders = reminderHours.map(hours => {
            const reminderTime = new Date(bookingDate.getTime() - (hours * 60 * 60 * 1000));
            return {
                booking_id: booking.id,
                user_id: booking.sender_id,
                reminder_type: hours >= 24 ? 'day_before' : 'hours_before',
                reminder_hours: hours,
                scheduled_for: reminderTime.toISOString(),
                sent: false,
                created_at: new Date().toISOString()
            };
        });

        // Insert reminders into booking_reminders table
        const { error } = await supabase
            .from('booking_reminders')
            .insert(reminders);

        if (error) {
            console.log('Reminder scheduling error (non-critical):', error.message);
        }
    } catch (error) {
        console.log('Reminder scheduling error (non-critical):', error.message);
    }
};

/**
 * Send booking reminder
 */
export const sendBookingReminder = async (reminder) => {
    if (!supabase) return;

    try {
        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', reminder.booking_id)
            .single();

        if (bookingError || !booking) {
            console.log('Booking not found for reminder');
            return;
        }

        // Only send if booking is still confirmed
        if (booking.status !== 'Confirmed') {
            // Mark reminder as cancelled
            await supabase
                .from('booking_reminders')
                .update({ sent: true, cancelled: true })
                .eq('id', reminder.id);
            return;
        }

        // Send notification
        const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';
        
        // Email reminder
        const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', reminder.user_id)
            .single();

        if (userData?.email) {
            const hoursText = reminder.reminder_hours >= 24 
                ? `${Math.floor(reminder.reminder_hours / 24)} day(s)`
                : `${reminder.reminder_hours} hour(s)`;
            
            await fetch(`${apiUrl}/notifications/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userData.email,
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
            }).catch(err => console.log('Reminder email error:', err));
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
        }).catch(err => console.log('Reminder push error:', err));

        // Mark reminder as sent
        await supabase
            .from('booking_reminders')
            .update({ sent: true, sent_at: new Date().toISOString() })
            .eq('id', reminder.id);

    } catch (error) {
        console.error('Send reminder error:', error);
    }
};

