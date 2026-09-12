/**
 * Cron job endpoint to process booking reminders
 * Should be called periodically (e.g., every hour) via Vercel Cron or similar
 */
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { query as neonQuery } from '../../_config/neon.js';

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;
const sql = neon(databaseUrl);

export default async function handler(req, res) {
  // Verify cron secret (timing-safe, strictly requiring non-empty secret)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || typeof cronSecret !== 'string' || cronSecret.trim() === '') {
    console.error('CRON_SECRET is not configured on server');
    return res.status(500).json({ error: 'Server misconfiguration: CRON_SECRET not configured' });
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }

  const expectedHeader = `Bearer ${cronSecret}`;
  const authBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  if (authBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(authBuffer, expectedBuffer)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
  }

  try {
    const now = new Date().toISOString();

    // Get reminders that are due and not yet sent
    const dueReminders = await sql`
      SELECT * FROM booking_reminders
      WHERE sent = false
      AND scheduled_for <= ${now}
      LIMIT 100
    `;

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
        // Get booking details
        const bookings = await sql`
          SELECT * FROM bookings
          WHERE id = ${reminder.booking_id}
        `;

        const booking = bookings[0];

        if (!booking || booking.status !== 'Confirmed') {
          // Mark as cancelled
          await sql`
            UPDATE booking_reminders
            SET sent = true, cancelled = true
            WHERE id = ${reminder.id}
          `;
          return { id: reminder.id, status: 'cancelled' };
        }

        // Send reminder (simplified - would call actual send functions)
        // Mark as sent
        await sql`
          UPDATE booking_reminders
          SET sent = true, sent_at = ${now}
          WHERE id = ${reminder.id}
        `;

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

