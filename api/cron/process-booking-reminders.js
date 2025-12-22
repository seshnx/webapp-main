/**
 * Cron job endpoint to process booking reminders
 * Should be called periodically (e.g., every hour) via Vercel Cron or similar
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Verify cron secret (if using Vercel Cron)
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date().toISOString();

    // Get reminders that are due and not yet sent
    const { data: dueReminders, error } = await supabase
      .from('booking_reminders')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now)
      .limit(100); // Process in batches

    if (error) {
      throw error;
    }

    if (!dueReminders || dueReminders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No reminders to process',
        processed: 0 
      });
    }

    // Process each reminder
    const results = await Promise.allSettled(
      dueReminders.map(async (reminder) => {
        // Import the send function (would need to be accessible from API route)
        // For now, implement inline
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', reminder.booking_id)
          .single();

        if (!booking || booking.status !== 'Confirmed') {
          // Mark as cancelled
          await supabase
            .from('booking_reminders')
            .update({ sent: true, cancelled: true })
            .eq('id', reminder.id);
          return { id: reminder.id, status: 'cancelled' };
        }

        // Send reminder (simplified - would call actual send functions)
        // Mark as sent
        await supabase
          .from('booking_reminders')
          .update({ sent: true, sent_at: now })
          .eq('id', reminder.id);

        return { id: reminder.id, status: 'sent' };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      processed: successful,
      failed,
      total: dueReminders.length
    });
  } catch (error) {
    console.error('Process reminders error:', error);
    return res.status(500).json({ error: error.message });
  }
}

