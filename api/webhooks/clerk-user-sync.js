/**
 * Clerk User Sync Webhook Handler
 *
 * This endpoint receives webhook events from Clerk and syncs user data
 * to the Neon PostgreSQL database.
 *
 * Clerk Webhook Documentation: https://clerk.com/docs/integrations/webhooks/sync-data
 *
 * Events handled:
 * - user.created: Insert new user into clerk_users table
 * - user.updated: Update existing user in clerk_users table
 * - user.deleted: Soft delete user (set deleted_at timestamp)
 */

import { NeonDbError } from '@neondatabase/serverless';
import { neon } from '@neondatabase/serverless';
import { Webhook } from 'svix';

// Initialize Neon database connection
const databaseUrl = process.env.VITE_NEON_DATABASE_URL || process.env.NEON_DATABASE_URL;
const sql = neon(databaseUrl);

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
 * Inserts a new user into the clerk_users table
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
    public_metadata,
    created_at,
    updated_at,
  } = clerkUser;

  // Get primary email
  const primaryEmail = email_addresses.find(e => e.id === clerkUser.primary_email_address_id)?.email_address;
  // Get primary phone
  const primaryPhone = phone_numbers?.find(p => p.id === clerkUser.primary_phone_number_id)?.phone_number;

  // Extract metadata
  const accountTypes = public_metadata?.account_types || ['Fan'];
  const activeRole = public_metadata?.active_role || 'Fan';
  const bio = public_metadata?.bio || null;
  const zipCode = public_metadata?.zip_code || null;

  try {
    const result = await sql`
      INSERT INTO clerk_users (
        id,
        email,
        phone,
        first_name,
        last_name,
        username,
        profile_photo_url,
        account_types,
        active_role,
        bio,
        zip_code,
        created_at,
        updated_at
      ) VALUES (
        ${id},
        ${primaryEmail},
        ${primaryPhone},
        ${first_name},
        ${last_name},
        ${username},
        ${image_url},
        ${accountTypes},
        ${activeRole},
        ${bio},
        ${zipCode},
        ${created_at ? new Date(created_at) : new Date()},
        ${updated_at ? new Date(updated_at) : new Date()}
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;

    console.log('✅ User created in Neon:', result[0]?.id);
    return { userId: result[0]?.id, action: 'created' };

  } catch (error) {
    if (error instanceof NeonDbError) {
      console.error('❌ Neon DB error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Handle user.updated event
 * Updates an existing user in the clerk_users table
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
    public_metadata,
    updated_at,
  } = clerkUser;

  // Get primary email
  const primaryEmail = email_addresses.find(e => e.id === clerkUser.primary_email_address_id)?.email_address;
  // Get primary phone
  const primaryPhone = phone_numbers?.find(p => p.id === clerkUser.primary_phone_number_id)?.phone_number;

  // Extract metadata
  const accountTypes = public_metadata?.account_types || ['Fan'];
  const activeRole = public_metadata?.active_role || 'Fan';
  const bio = public_metadata?.bio || null;
  const zipCode = public_metadata?.zip_code || null;

  try {
    const result = await sql`
      UPDATE clerk_users
      SET
        email = ${primaryEmail},
        phone = ${primaryPhone},
        first_name = ${first_name},
        last_name = ${last_name},
        username = ${username},
        profile_photo_url = ${image_url},
        account_types = ${accountTypes},
        active_role = ${activeRole},
        bio = ${bio},
        zip_code = ${zipCode},
        updated_at = ${updated_at ? new Date(updated_at) : new Date()}
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      console.warn('⚠️  User not found in Neon, creating instead...');
      return await handleUserCreated(clerkUser);
    }

    console.log('✅ User updated in Neon:', result[0]?.id);
    return { userId: result[0]?.id, action: 'updated' };

  } catch (error) {
    if (error instanceof NeonDbError) {
      console.error('❌ Neon DB error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Handle user.deleted event
 * Soft deletes a user (sets deleted_at timestamp)
 */
async function handleUserDeleted(clerkUser) {
  const { id } = clerkUser;

  try {
    const result = await sql`
      UPDATE clerk_users
      SET
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      console.warn('⚠️  User not found in Neon for deletion:', id);
      return { userId: id, action: 'not_found' };
    }

    console.log('✅ User soft-deleted in Neon:', result[0]?.id);
    return { userId: result[0]?.id, action: 'deleted' };

  } catch (error) {
    if (error instanceof NeonDbError) {
      console.error('❌ Neon DB error:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    throw error;
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
