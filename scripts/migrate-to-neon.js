#!/usr/bin/env node

/**
 * Supabase to Neon Migration Script
 *
 * This script migrates data from Supabase PostgreSQL to Neon PostgreSQL.
 * It handles the schema differences and ensures data integrity.
 *
 * Usage:
 *   node scripts/migrate-to-neon.js
 *
 * Prerequisites:
 *   - Set SUPABASE_DB_URL in .env.local (Supabase connection string)
 *   - Set NEON_DATABASE_URL in .env.local (Neon connection string)
 *   - Run npm install pg dotenv
 *
 * Environment Variables:
 *   SUPABASE_DB_URL - Supabase PostgreSQL connection string
 *   NEON_DATABASE_URL - Neon PostgreSQL connection string
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const { Client } = pg;

// =====================================================
// CONFIGURATION
// =====================================================

const SUPABASE_URL = process.env.SUPABASE_DB_URL || process.env.VITE_SUPABASE_URL?.replace('postgresql://', 'postgres://');
const NEON_URL = process.env.NEON_DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_DB_URL not set in environment variables');
  process.exit(1);
}

if (!NEON_URL) {
  console.error('❌ NEON_DATABASE_URL not set in environment variables');
  process.exit(1);
}

// =====================================================
// MIGRATION TABLES
// =====================================================

const MIGRATION_PLAN = [
  {
    name: 'Users (from auth.users)',
    fromTable: 'auth.users',
    toTable: 'clerk_users',
    transform: (row) => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      first_name: row.raw_user_meta_data?.first_name || row.raw_user_meta_data?.full_name?.split(' ')[0] || null,
      last_name: row.raw_user_meta_data?.last_name || row.raw_user_meta_data?.full_name?.split(' ').slice(1).join(' ') || null,
      username: row.raw_user_meta_data?.username || null,
      profile_photo_url: row.raw_user_meta_data?.avatar_url || null,
      account_types: row.raw_user_meta_data?.account_types || ['Fan'],
      active_role: row.raw_user_meta_data?.active_role || 'Fan',
      bio: row.raw_user_meta_data?.bio || null,
      zip_code: row.raw_user_meta_data?.zip_code || null,
      profile_completed: row.raw_user_meta_data?.profile_completed || false,
      onboarding_completed: row.raw_user_meta_data?.onboarding_completed || false,
      last_login_at: row.last_sign_in_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'Profiles',
    fromTable: 'profiles',
    toTable: 'profiles',
    transform: (row) => ({
      id: row.id,
      user_id: row.id,
      display_name: row.display_name || row.username,
      bio: row.bio,
      location: row.location,
      website: row.website,
      social_links: row.social_links || {},
      photo_url: row.photo_url,
      cover_photo_url: row.cover_photo_url,
      talent_info: row.talent_info || {},
      engineer_info: row.engineer_info || {},
      producer_info: row.producer_info || {},
      studio_info: row.studio_info || {},
      education_info: row.education_info || {},
      label_info: row.label_info || {},
      followers_count: row.followers_count || 0,
      following_count: row.following_count || 0,
      posts_count: row.posts_count || 0,
      reputation_score: row.reputation_score || 0,
      profile_visibility: row.profile_visibility || 'public',
      messaging_permission: row.messaging_permission || 'everyone',
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'Posts',
    fromTable: 'posts',
    toTable: 'posts',
    transform: (row) => ({
      id: row.id,
      user_id: row.user_id,
      display_name: row.display_name,
      author_photo: row.author_photo,
      content: row.content || row.text,
      media: row.media || [],
      hashtags: row.hashtags || [],
      mentions: row.mentions || [],
      location: row.location,
      visibility: row.visibility || 'public',
      comment_count: row.comment_count || 0,
      reaction_count: row.reaction_count || 0,
      save_count: row.save_count || 0,
      view_count: row.view_count || 0,
      is_pinned: row.is_pinned || false,
      parent_post_id: row.parent_post_id,
      seshfx_integration: row.seshfx_integration,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    }),
  },
  {
    name: 'Comments',
    fromTable: 'comments',
    toTable: 'comments',
    transform: (row) => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      display_name: row.display_name || row.user_name,
      author_photo: row.author_photo || row.user_photo,
      content: row.content || row.text,
      media: row.media || [],
      parent_comment_id: row.parent_comment_id,
      reaction_count: row.reaction_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    }),
  },
  {
    name: 'Reactions',
    fromTable: 'reactions',
    toTable: 'reactions',
    transform: (row) => ({
      id: row.id,
      user_id: row.user_id,
      target_type: row.target_type || 'post',
      target_id: row.target_id || row.post_id,
      emoji: row.emoji || '👍',
      created_at: row.created_at,
    }),
  },
  {
    name: 'Follows',
    fromTable: 'follows',
    toTable: 'follows',
    transform: (row) => ({
      id: row.id,
      follower_id: row.follower_id,
      following_id: row.following_id,
      created_at: row.created_at,
    }),
  },
  {
    name: 'Saved Posts',
    fromTable: 'saved_posts',
    toTable: 'saved_posts',
    transform: (row) => ({
      id: row.id,
      user_id: row.user_id,
      post_id: row.post_id,
      created_at: row.created_at,
    }),
  },
  {
    name: 'Notifications',
    fromTable: 'notifications',
    toTable: 'notifications',
    transform: (row) => ({
      id: row.id,
      user_id: row.user_id,
      type: row.type || 'system',
      actor_id: row.actor_id,
      actor_name: row.actor_name,
      actor_photo: row.actor_photo,
      target_type: row.target_type,
      target_id: row.target_id,
      title: row.title,
      body: row.body || row.message,
      link: row.link || row.action_url,
      read: row.read || false,
      action_taken: row.action_taken,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'Bookings',
    fromTable: 'bookings',
    toTable: 'bookings',
    transform: (row) => ({
      id: row.id,
      sender_id: row.sender_id,
      sender_name: row.sender_name,
      target_id: row.target_id,
      target_name: row.target_name,
      type: row.type,
      service_type: row.service_type,
      status: row.status || 'Pending',
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      duration_hours: row.duration_hours,
      location: row.location,
      venue_id: row.venue_id,
      equipment: row.equipment || [],
      description: row.description,
      message: row.message,
      budget_cap: row.budget_cap,
      agreed_price: row.agreed_price,
      logistics: row.logistics,
      attachments: row.attachments || [],
      responded_at: row.responded_at,
      confirmed_at: row.confirmed_at,
      completed_at: row.completed_at,
      cancelled_at: row.cancelled_at,
      cancellation_reason: row.cancellation_reason,
      rating: row.rating,
      review: row.review,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
  },
  {
    name: 'Market Items',
    fromTable: 'market_items',
    toTable: 'market_items',
    transform: (row) => ({
      id: row.id,
      seller_id: row.seller_id,
      title: row.title,
      description: row.description,
      category: row.category || 'other',
      subcategory: row.subcategory,
      price: row.price,
      currency: row.currency || 'USD',
      condition: row.condition,
      images: row.images || [],
      location: row.location,
      shipping_available: row.shipping_available ?? true,
      local_pickup_available: row.local_pickup_available ?? true,
      status: row.status || 'active',
      views: row.views || 0,
      favorites_count: row.favorites_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sold_at: row.sold_at,
    }),
  },
];

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function migrateTable(supabaseClient, neonClient, tableConfig) {
  const { name, fromTable, toTable, transform } = tableConfig;

  console.log(`\n📦 Migrating ${name}...`);

  try {
    // Fetch data from Supabase
    console.log(`   Fetching from ${fromTable}...`);
    const supabaseResult = await supabaseClient.query(`SELECT * FROM ${fromTable}`);

    if (supabaseResult.rows.length === 0) {
      console.log(`   ✅ No data to migrate (${fromTable} is empty)`);
      return { migrated: 0, errors: 0 };
    }

    console.log(`   Found ${supabaseResult.rows.length} rows`);

    // Transform and prepare for Neon
    const rowsToInsert = supabaseResult.rows.map(transform);

    // Insert into Neon in batches
    const batchSize = 100;
    let migrated = 0;
    let errors = 0;

    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
      const batch = rowsToInsert.slice(i, i + batchSize);

      for (const row of batch) {
        try {
          // Build INSERT query with column names
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');

          const query = `
            INSERT INTO ${toTable} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT (id) DO NOTHING
          `;

          await neonClient.query(query, values);
          migrated++;
        } catch (error) {
          errors++;
          if (errors <= 5) { // Only log first 5 errors per table
            console.error(`   ❌ Error inserting row:`, error.message);
          }
        }
      }

      process.stdout.write(`\r   Progress: ${Math.min(i + batchSize, rowsToInsert.length)}/${rowsToInsert.length} rows`);
    }

    console.log(`\n   ✅ Migrated ${migrated} rows (${errors} errors)`);
    return { migrated, errors };

  } catch (error) {
    console.error(`   ❌ Migration failed for ${name}:`, error.message);
    return { migrated: 0, errors: 1 };
  }
}

async function verifyMigration(supabaseClient, neonClient, tableConfig) {
  const { name, fromTable, toTable } = tableConfig;

  try {
    const [supabaseCount, neonCount] = await Promise.all([
      supabaseClient.query(`SELECT COUNT(*) FROM ${fromTable}`),
      neonClient.query(`SELECT COUNT(*) FROM ${toTable}`),
    ]);

    const supabaseTotal = parseInt(supabaseCount.rows[0].count);
    const neonTotal = parseInt(neonCount.rows[0].count);

    const match = supabaseTotal === neonTotal;
    const status = match ? '✅' : '⚠️';

    console.log(`   ${status} ${name}: ${neonTotal}/${supabaseTotal} rows`);

    return { match, supabaseTotal, neonTotal };
  } catch (error) {
    console.error(`   ❌ Verification failed for ${name}:`, error.message);
    return { match: false, supabaseTotal: 0, neonTotal: 0 };
  }
}

// =====================================================
// MAIN MIGRATION
// =====================================================

async function main() {
  console.log('==========================================');
  console.log('🚀 Supabase to Neon Migration');
  console.log('==========================================');

  // Connect to databases
  console.log('\n📡 Connecting to databases...');
  const supabaseClient = new Client({ connectionString: SUPABASE_URL });
  const neonClient = new Client({ connectionString: NEON_URL });

  try {
    await supabaseClient.connect();
    console.log('   ✅ Connected to Supabase');
  } catch (error) {
    console.error('   ❌ Failed to connect to Supabase:', error.message);
    process.exit(1);
  }

  try {
    await neonClient.connect();
    console.log('   ✅ Connected to Neon');
  } catch (error) {
    console.error('   ❌ Failed to connect to Neon:', error.message);
    process.exit(1);
  }

  // Run migrations
  console.log('\n📋 Starting migration...\n');
  const results = [];

  for (const tableConfig of MIGRATION_PLAN) {
    const result = await migrateTable(supabaseClient, neonClient, tableConfig);
    results.push({ ...tableConfig, result });
  }

  // Verify migrations
  console.log('\n🔍 Verifying migrations...\n');
  const verifications = [];

  for (const tableConfig of MIGRATION_PLAN) {
    const verification = await verifyMigration(supabaseClient, neonClient, tableConfig);
    verifications.push({ ...tableConfig, verification });
  }

  // Summary
  console.log('\n==========================================');
  console.log('📊 Migration Summary');
  console.log('==========================================\n');

  let totalMigrated = 0;
  let totalErrors = 0;

  for (const result of results) {
    totalMigrated += result.result.migrated;
    totalErrors += result.result.errors;
  }

  console.log(`Total rows migrated: ${totalMigrated}`);
  console.log(`Total errors: ${totalErrors}`);

  console.log('\nTable breakdown:');
  for (const result of results) {
    console.log(`  • ${result.name}: ${result.result.migrated} migrated, ${result.result.errors} errors`);
  }

  console.log('\nVerification:');
  for (const v of verifications) {
    const status = v.verification.match ? '✅' : '⚠️';
    console.log(`  ${status} ${v.name}: ${v.verification.neonTotal}/${v.verification.supabaseTotal}`);
  }

  // Cleanup
  await supabaseClient.end();
  await neonClient.end();

  console.log('\n==========================================');
  console.log('✨ Migration complete!');
  console.log('==========================================\n');

  console.log('Next steps:');
  console.log('  1. Verify data in Neon SQL Editor');
  console.log('  2. Test application with new database');
  console.log('  3. Set up Clerk webhooks for user sync');
  console.log('  4. Deploy updated Convex schema');
  console.log('  5. Update file uploads to use Vercel Blob');
  console.log('\n');
}

// Run migration
main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
