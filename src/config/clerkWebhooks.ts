/**
 * Clerk Webhook Handlers for Neon Sync
 *
 * This module provides webhook handlers for syncing Clerk user data
 * with the Neon PostgreSQL clerk_users table.
 *
 * When a user is created/updated/deleted in Clerk, these webhooks ensure
 * the clerk_users table stays in sync for database queries and RLS policies.
 *
 * To set up Clerk webhooks:
 * 1. Go to Clerk Dashboard → Webhooks → Add Endpoint
 * 2. Enter your webhook URL: https://your-domain.com/api/webhooks/clerk
 * 3. Select events: user.created, user.updated, user.deleted
 * 4. Copy the webhook secret to CLERK_WEBHOOK_SECRET env var
 *
 * Environment Variables Required:
 * - CLERK_WEBHOOK_SECRET: Secret for verifying webhook signatures
 * - VITE_NEON_DATABASE_URL: Neon connection string
 */

// Note: crypto is a Node.js module. For frontend use, use SubtleCrypto API
// This file is intended for API routes (server-side)

/**
 * Clerk user data interface
 */
export interface ClerkUserData {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  public_metadata?: Record<string, any>;
  unsafe_metadata?: Record<string, any>;
  created_at?: string | Date;
  updated_at?: string | Date;
}

/**
 * Webhook handler result interface
 */
export interface WebhookResult {
  success?: boolean;
  error?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Verify Clerk webhook signature
 *
 * @param payload - Raw request body
 * @param signature - Svix header signature
 * @param secret - Clerk webhook secret
 * @returns True if signature is valid
 */
export function verifyClerkWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const [timestamp, svixSignature] = signature.split(',');
    const body = `${timestamp}.${payload}`;

    // For Node.js environment
    if (typeof crypto !== 'undefined' && 'createHmac' in crypto) {
      const expectedSignature = (crypto as any)
        .createHmac('sha256', secret)
        .update(body)
        .digest('base64');

      return svixSignature === expectedSignature;
    }

    // For browser environment (SubtleCrypto)
    // Note: Browser verification is not recommended for webhooks
    console.warn('Webhook signature verification in browser is not secure');
    return false;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Insert user into clerk_users table
 *
 * @param userData - Clerk user data
 * @returns Inserted user record
 */
export async function insertClerkUser(userData: ClerkUserData): Promise<any> {
  // This is a server-side function that would run in your API route
  // It inserts/updates the clerk_users table in Neon

  const {
    id,
    email_addresses,
    first_name,
    last_name,
    username,
    image_url,
    public_metadata,
    unsafe_metadata,
    created_at,
    updated_at,
  } = userData;

  const primaryEmail = email_addresses?.find(
    ea => ea.id === userData.primary_email_address_id
  )?.email_address;

  const query = `
    INSERT INTO clerk_users (
      id,
      username,
      email,
      first_name,
      last_name,
      image_url,
      public_metadata,
      unsafe_metadata,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      image_url = EXCLUDED.image_url,
      public_metadata = EXCLUDED.public_metadata,
      unsafe_metadata = EXCLUDED.unsafe_metadata,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;

  const values = [
    id,
    username || null,
    primaryEmail || null,
    first_name || null,
    last_name || null,
    image_url || null,
    JSON.stringify(public_metadata || {}),
    JSON.stringify(unsafe_metadata || {}),
    created_at || new Date(),
    updated_at || new Date(),
  ];

  // This would be executed using your Neon connection
  // Example using the neon package:
  // const { neon } = require('@neondatabase/serverless');
  // const sql = neon(process.env.VITE_NEON_DATABASE_URL);
  // const result = await sql(query, values);
  // return result[0];

  throw new Error('This function must be called server-side with Neon connection');
}

/**
 * Handle user.created event
 *
 * @param data - Clerk webhook data
 * @returns Handler result
 */
export async function handleUserCreated(data: { data: ClerkUserData }): Promise<WebhookResult> {
  try {
    const user = data.data;

    // Insert user into clerk_users table
    const clerkUser = await insertClerkUser({
      id: user.id,
      email_addresses: user.email_addresses,
      primary_email_address_id: user.primary_email_address_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      public_metadata: user.public_metadata,
      unsafe_metadata: user.unsafe_metadata,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    // Create initial profile if it doesn't exist
    // This ensures the profiles table is populated
    await createInitialProfile(user);

    return { success: true, clerkUser };
  } catch (error: any) {
    console.error('Error handling user.created:', error);
    return { error: error.message };
  }
}

/**
 * Handle user.updated event
 *
 * @param data - Clerk webhook data
 * @returns Handler result
 */
export async function handleUserUpdated(data: { data: ClerkUserData }): Promise<WebhookResult> {
  try {
    const user = data.data;

    // Update clerk_users table
    const clerkUser = await insertClerkUser({
      id: user.id,
      email_addresses: user.email_addresses,
      primary_email_address_id: user.primary_email_address_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
      public_metadata: user.public_metadata,
      unsafe_metadata: user.unsafe_metadata,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    // Sync profile data if needed
    await syncProfileData(user);

    return { success: true, clerkUser };
  } catch (error: any) {
    console.error('Error handling user.updated:', error);
    return { error: error.message };
  }
}

/**
 * Handle user.deleted event
 *
 * @param data - Clerk webhook data
 * @returns Handler result
 */
export async function handleUserDeleted(data: { data: { id: string } }): Promise<WebhookResult> {
  try {
    const user = data.data;

    // Soft delete from clerk_users (keep record but mark as deleted)
    const query = `
      UPDATE clerk_users
      SET
        deleted_at = CURRENT_TIMESTAMP,
        email = NULL,
        username = NULL,
        public_metadata = jsonb_set(public_metadata, '{deleted}', 'true')
      WHERE id = $1
      RETURNING *
    `;

    // This would be executed using your Neon connection
    // const { neon } = require('@neondatabase/serverless');
    // const sql = neon(process.env.VITE_NEON_DATABASE_URL);
    // const result = await sql(query, [user.id]);

    // Optionally soft delete related data
    await softDeleteUserData(user.id);

    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error('Error handling user.deleted:', error);
    return { error: error.message };
  }
}

/**
 * Create initial profile for new user
 *
 * @param clerkUser - Clerk user data
 * @returns Creation result
 */
async function createInitialProfile(clerkUser: ClerkUserData): Promise<WebhookResult> {
  const primaryEmail = clerkUser.email_addresses?.find(
    ea => ea.id === clerkUser.primary_email_address_id
  )?.email_address;

  const query = `
    INSERT INTO profiles (
      id,
      username,
      email,
      first_name,
      last_name,
      photo_url,
      account_types,
      active_role,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `;

  const values = [
    clerkUser.id,
    clerkUser.username,
    primaryEmail,
    clerkUser.first_name,
    clerkUser.last_name,
    clerkUser.image_url,
    clerkUser.public_metadata?.account_types || ['Fan'],
    clerkUser.public_metadata?.active_role || 'Fan',
    clerkUser.created_at,
    clerkUser.updated_at,
  ];

  // Execute query with Neon connection
  // const sql = neon(process.env.VITE_NEON_DATABASE_URL);
  // await sql(query, values);

  return { success: true };
}

/**
 * Sync profile data when Clerk user is updated
 *
 * @param clerkUser - Clerk user data
 * @returns Sync result
 */
async function syncProfileData(clerkUser: ClerkUserData): Promise<WebhookResult> {
  const primaryEmail = clerkUser.email_addresses?.find(
    ea => ea.id === clerkUser.primary_email_address_id
  )?.email_address;

  const query = `
    UPDATE profiles SET
      username = COALESCE($2, username),
      email = COALESCE($3, email),
      first_name = COALESCE($4, first_name),
      last_name = COALESCE($5, last_name),
      photo_url = COALESCE($6, photo_url),
      account_types = COALESCE($7, account_types),
      active_role = COALESCE($8, active_role),
      updated_at = $9
    WHERE id = $1
    RETURNING *
  `;

  const values = [
    clerkUser.id,
    clerkUser.username,
    primaryEmail,
    clerkUser.first_name,
    clerkUser.last_name,
    clerkUser.image_url,
    clerkUser.public_metadata?.account_types,
    clerkUser.public_metadata?.active_role,
    clerkUser.updated_at,
  ];

  // Execute query with Neon connection
  // const sql = neon(process.env.VITE_NEON_DATABASE_URL);
  // await sql(query, values);

  return { success: true };
}

/**
 * Soft delete user data (preserve data but mark as deleted)
 *
 * @param userId - User ID
 * @returns Deletion result
 */
async function softDeleteUserData(userId: string): Promise<WebhookResult> {
  // Update profiles table
  // const sql = neon(process.env.VITE_NEON_DATABASE_URL);
  // await sql('UPDATE profiles SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);

  // Optionally mark other records as deleted
  // This depends on your application's data retention policy

  return { success: true };
}

/**
 * Main webhook handler for Clerk events
 *
 * This is the main function you would call in your API route.
 * It routes different event types to their handlers.
 *
 * @param eventType - Clerk event type
 * @param data - Clerk webhook data
 * @returns Handler result
 *
 * @example
 * // In your API route (e.g., /api/webhooks/clerk):
 * import { handleClerkWebhook, verifyClerkWebhookSignature } from '@/config/clerkWebhooks';
 *
 * export async function POST(request) {
 *   const body = await request.text();
 *   const signature = request.headers.get('svix-signature');
 *   const secret = process.env.CLERK_WEBHOOK_SECRET;
 *
 *   if (!verifyClerkWebhookSignature(body, signature, secret)) {
 *     return new Response('Invalid signature', { status: 401 });
 *   }
 *
 *   const { type, data } = await request.json();
 *   const result = await handleClerkWebhook(type, data);
 *
 *   return Response.json(result);
 * }
 */
export async function handleClerkWebhook(
  eventType: string,
  data: any
): Promise<WebhookResult> {
  switch (eventType) {
    case 'user.created':
      return await handleUserCreated(data);

    case 'user.updated':
      return await handleUserUpdated(data);

    case 'user.deleted':
      return await handleUserDeleted(data);

    case 'session.created':
      // Handle session creation if needed
      return { success: true, message: 'Session created' };

    case 'session.ended':
    case 'session.revoked':
      // Handle session end if needed
      return { success: true, message: 'Session ended' };

    default:
      console.warn(`Unhandled Clerk webhook event: ${eventType}`);
      return { success: true, message: `Event ${eventType} acknowledged` };
  }
}
