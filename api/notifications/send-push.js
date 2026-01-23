/**
 * Push notification API endpoint
 * Supports Firebase Cloud Messaging (FCM) or Web Push API
 */
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.VITE_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL;
const sql = neon(databaseUrl);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, title, body, data, icon, badge } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields: userId, title, body' });
    }

    // Get user's push subscription tokens from database
    const subscriptions = await sql`
      SELECT endpoint, keys
      FROM push_subscriptions
      WHERE user_id = ${userId}
      AND active = true
    `;

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active push subscriptions found',
        sent: 0
      });
    }

    // Send push notifications using Web Push API
    const webpush = require('web-push');

    // Set VAPID keys (should be in environment variables)
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:notifications@seshnx.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const results = await Promise.allSettled(
      subscriptions.map(sub => {
        const payload = JSON.stringify({
          title,
          body,
          icon: icon || '/icon-192x192.png',
          badge: badge || '/badge-72x72.png',
          data: data || {},
        });

        return webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send push notification' });
  }
}

