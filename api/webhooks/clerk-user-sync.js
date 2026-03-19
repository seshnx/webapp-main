/**
 * Clerk User Sync Webhook Handler - Convex Only
 *
 * This endpoint receives webhook events from Clerk and syncs user data
 * to the Convex database (real-time database).
 *
 * Clerk Webhook Documentation: https://clerk.com/docs/integrations/webhooks/sync-data
 *
 * Events handled:
 * - user.created: Insert new user into Convex
 * - user.updated: Update existing user in Convex
 * - user.deleted: Soft delete user in Convex
 */

import { Webhook } from 'svix';
import { fetchAction } from 'convex/server';

// Convex deployment URL
const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

/**
 * Main webhook handler
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Get webhook headers
    const whSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!whSecret) {
      console.error('❌ CLERK_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // 2. Verify webhook signature
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

    // 3. Handle the event
    const eventType = evt.type;
    const data = evt.data;

    console.log(`📥 Received Clerk webhook: ${eventType}`);
    console.log('User ID:', data.id);

    let result;

    switch (eventType) {
      case 'user.created':
        result = await handleUserCreated(data);
        break;

      case 'user.updated':
        result = await handleUserUpdated(data);
        break;

      case 'user.deleted':
        result = await handleUserDeleted(data);
        break;

      default:
        console.log(`⚠️  Unhandled event type: ${eventType}`);
        return res.status(200).json({ message: 'Event type not handled' });
    }

    console.log(`✅ Successfully processed ${eventType}`);
    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('❌ Webhook handler error:', error);

    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Handle user.created event
 * Inserts a new user into Convex using syncUserFromClerk mutation
 */
async function handleUserCreated(clerkUser) {
  const {
    id,
    email_addresses,
    phone_numbers,
    first_name,
    last_name,
    username,
    image_url,
  } = clerkUser;

  // Get primary email - try multiple strategies
  let primaryEmail = null;

  if (email_addresses && Array.isArray(email_addresses) && email_addresses.length > 0) {
    // Strategy 1: Find by primary_email_address_id
    if (clerkUser.primary_email_address_id) {
      primaryEmail = email_addresses.find(e => e.id === clerkUser.primary_email_address_id)?.email_address;
    }

    // Strategy 2: Find first verified email
    if (!primaryEmail) {
      primaryEmail = email_addresses.find(e => e.verified)?.email_address;
    }

    // Strategy 3: Use first email
    if (!primaryEmail) {
      primaryEmail = email_addresses[0]?.email_address;
    }
  }

  // Get primary phone
  const primaryPhone = phone_numbers?.find(p => p.id === clerkUser.primary_phone_number_id)?.phone_number || null;

  // For test users without email, use a placeholder
  const finalEmail = primaryEmail || `${id}@clerk.test`;

  try {
    // Call Convex syncUserFromClerk mutation
    const result = await fetchAction(CONVEX_URL, api.users.syncUserFromClerk, {
      clerkId: id,
      email: finalEmail,
      emailVerified: primaryEmail ? (email_addresses.find(e => e.email_address === primaryEmail)?.verified || false) : false,
      username: username || undefined,
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      imageUrl: image_url || undefined,
    });

    console.log('✅ User synced to Convex:', result);
    return { userId: id, action: 'created', result };

  } catch (error) {
    console.error('❌ Convex sync error:', error);
    throw new Error(`Convex sync error: ${error.message}`);
  }
}

/**
 * Handle user.updated event
 * Updates an existing user in Convex using syncUserFromClerk mutation
 */
async function handleUserUpdated(clerkUser) {
  const {
    id,
    email_addresses,
    phone_numbers,
    first_name,
    last_name,
    username,
    image_url,
  } = clerkUser;

  // Get primary email - try multiple strategies
  let primaryEmail = null;

  if (email_addresses && Array.isArray(email_addresses) && email_addresses.length > 0) {
    // Strategy 1: Find by primary_email_address_id
    if (clerkUser.primary_email_address_id) {
      primaryEmail = email_addresses.find(e => e.id === clerkUser.primary_email_address_id)?.email_address;
    }

    // Strategy 2: Find first verified email
    if (!primaryEmail) {
      primaryEmail = email_addresses.find(e => e.verified)?.email_address;
    }

    // Strategy 3: Use first email
    if (!primaryEmail) {
      primaryEmail = email_addresses[0]?.email_address;
    }
  }

  // Get primary phone
  const primaryPhone = phone_numbers?.find(p => p.id === clerkUser.primary_phone_number_id)?.phone_number || null;

  // For test users without email, use a placeholder
  const finalEmail = primaryEmail || `${id}@clerk.test`;

  try {
    // Call Convex syncUserFromClerk mutation
    const result = await fetchAction(CONVEX_URL, api.users.syncUserFromClerk, {
      clerkId: id,
      email: finalEmail,
      emailVerified: primaryEmail ? (email_addresses.find(e => e.email_address === primaryEmail)?.verified || false) : false,
      username: username || undefined,
      firstName: first_name || undefined,
      lastName: last_name || undefined,
      imageUrl: image_url || undefined,
    });

    console.log('✅ User synced to Convex (updated):', result);
    return { userId: id, action: 'updated', result };

  } catch (error) {
    console.error('❌ Convex sync error:', error);
    throw new Error(`Convex sync error: ${error.message}`);
  }
}

/**
 * Handle user.deleted event
 * Soft deletes a user in Convex (sets deletedAt timestamp)
 */
async function handleUserDeleted(clerkUser) {
  const { id } = clerkUser;

  try {
    // Call Convex mutation to soft delete user
    const result = await fetchAction(CONVEX_URL, api.users.softDeleteUser, {
      clerkId: id,
    });

    console.log('✅ User soft-deleted in Convex:', id);
    return { userId: id, action: 'deleted', result };

  } catch (error) {
    console.error('❌ Convex delete error:', error);
    throw new Error(`Convex delete error: ${error.message}`);
  }
}

/**
 * Vercel serverless function config
 */
export const config = {
  api: {
    bodyParser: true, // Required for Svix webhook verification
  },
};
