/**
 * Clerk Organization Sync Webhook Handler
 *
 * Receives webhook events from Clerk for organization-related events and
 * syncs membership data to the Convex studioStaff table.
 *
 * Events handled:
 * - organizationMembership.created  -> upsert to studioStaff
 * - organizationMembership.deleted   -> mark staff as inactive
 * - organization.updated             -> sync name/slug to studio record
 */

import { Webhook } from 'svix';
import { fetchAction } from 'convex/server';

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const whSecret = process.env.CLERK_ORG_WEBHOOK_SECRET || process.env.CLERK_WEBHOOK_SECRET;

    if (!whSecret) {
      console.error('❌ CLERK_ORG_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const headers = req.headers;
    const payload = JSON.stringify(req.body);

    const wh = new Webhook(whSecret);
    let evt;

    try {
      evt = wh.verify(payload, {
        'svix-id': headers['svix-id'],
        'svix-timestamp': headers['svix-timestamp'],
        'svix-signature': headers['svix-signature'],
      });
    } catch (err) {
      console.error('❌ Webhook verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const eventType = evt.type;
    const data = evt.data;

    console.log(`📥 Received Clerk org webhook: ${eventType}`);

    let result;

    switch (eventType) {
      case 'organizationMembership.created':
        result = await handleMemberAdded(data);
        break;

      case 'organizationMembership.deleted':
        result = await handleMemberRemoved(data);
        break;

      case 'organization.updated':
        result = await handleOrgUpdated(data);
        break;

      default:
        console.log(`⚠️  Unhandled org event type: ${eventType}`);
        return res.status(200).json({ message: 'Event type not handled' });
    }

    console.log(`✅ Successfully processed ${eventType}`);
    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('❌ Org webhook handler error:', error);
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message,
    });
  }
}

/**
 * Handle organizationMembership.created
 * Adds or reactivates a staff member in the studioStaff table.
 */
async function handleMemberAdded(data) {
  const { organization, public_user_data } = data;

  if (!organization || !public_user_data) {
    console.warn('⚠️  Missing org or user data in membership event');
    return { skipped: true };
  }

  const clerkOrgId = organization.id;
  const clerkUserId = public_user_data.user_id;
  const role = public_user_data.role || 'org:member';

  // Map Clerk org roles to studio staff roles
  let staffRole = 'Assistant';
  if (role === 'org:admin') staffRole = 'Manager';

  try {
    const { api } = await import('../../convex/_generated/api.js');
    const result = await fetchAction(CONVEX_URL, api.studios.syncOrgMemberToStaff, {
      clerkOrgId,
      clerkUserId,
      role: staffRole,
    });
    console.log(`✅ Synced member ${clerkUserId} to studio staff`);
    return result;
  } catch (error) {
    console.error('❌ Staff sync error:', error);
    throw new Error(`Staff sync error: ${error.message}`);
  }
}

/**
 * Handle organizationMembership.deleted
 * Marks staff member as inactive.
 */
async function handleMemberRemoved(data) {
  const { organization, public_user_data } = data;

  if (!organization || !public_user_data) {
    return { skipped: true };
  }

  const clerkOrgId = organization.id;
  const clerkUserId = public_user_data.user_id;

  try {
    const { api } = await import('../../convex/_generated/api.js');
    const result = await fetchAction(CONVEX_URL, api.studios.removeOrgMemberFromStaff, {
      clerkOrgId,
      clerkUserId,
    });
    console.log(`✅ Removed member ${clerkUserId} from studio staff`);
    return result;
  } catch (error) {
    console.error('❌ Staff removal error:', error);
    throw new Error(`Staff removal error: ${error.message}`);
  }
}

/**
 * Handle organization.updated
 * Syncs name changes back to the studio record.
 */
async function handleOrgUpdated(data) {
  const { id, name, slug } = data;

  if (!id) {
    return { skipped: true };
  }

  try {
    const { api } = await import('../../convex/_generated/api.js');
    const result = await fetchAction(CONVEX_URL, api.studios.syncOrgUpdates, {
      clerkOrgId: id,
      name: name || undefined,
      slug: slug || undefined,
    });
    console.log(`✅ Synced org updates for ${id}`);
    return result;
  } catch (error) {
    console.error('❌ Org update sync error:', error);
    throw new Error(`Org update sync error: ${error.message}`);
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
