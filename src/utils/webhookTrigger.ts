/**
 * Webhook Trigger Utility
 * 
 * Triggers Convex sync webhooks when data changes in Neon/MongoDB
 * Call these functions after database operations to sync to Convex
 */

const WEBHOOK_URL = '/api/webhooks/convex';
const WEBHOOK_SECRET = import.meta.env.WEBHOOK_SECRET;

/**
 * Trigger webhook to sync booking change to Convex
 */
export async function triggerBookingWebhook(
  event: 'booking.created' | 'booking.updated' | 'booking.deleted' | 'booking.status_changed',
  data: any
): Promise<void> {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ event, data }),
    });
    console.log(`[Webhook] Triggered: ${event}`);
  } catch (error) {
    console.error(`[Webhook] Failed to trigger ${event}:`, error);
  }
}

/**
 * Trigger webhook to sync notification change to Convex
 */
export async function triggerNotificationWebhook(
  event: 'notification.created' | 'notification.updated' | 'notification.read' | 'notification.all_read' | 'notification.deleted',
  data: any
): Promise<void> {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ event, data }),
    });
    console.log(`[Webhook] Triggered: ${event}`);
  } catch (error) {
    console.error(`[Webhook] Failed to trigger ${event}:`, error);
  }
}

/**
 * Trigger webhook to sync comment change to Convex
 */
export async function triggerCommentWebhook(
  event: 'comment.created' | 'comment.updated' | 'comment.deleted' | 'comment.reaction_updated',
  data: any
): Promise<void> {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ event, data }),
    });
    console.log(`[Webhook] Triggered: ${event}`);
  } catch (error) {
    console.error(`[Webhook] Failed to trigger ${event}:`, error);
  }
}

/**
 * Batch trigger multiple webhooks
 */
export async function triggerWebhooksBatch(events: Array<{ event: string; data: any }>): Promise<void> {
  await Promise.all(
    events.map(({ event, data }) => {
      const category = event.split('.')[0];
      
      if (category === 'booking') {
        return triggerBookingWebhook(event as any, data);
      } else if (category === 'notification') {
        return triggerNotificationWebhook(event as any, data);
      } else if (category === 'comment') {
        return triggerCommentWebhook(event as any, data);
      }
      return Promise.resolve();
    })
  );
}
