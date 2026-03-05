/**
 * Migrate All Social Data from Neon to MongoDB
 *
 * Run once during migration window to migrate:
 * - Posts
 * - Comments
 * - Reactions
 * - Follows
 * - Saved posts
 * - Social notifications
 * - User blocks (if table exists)
 * - Content reports (if table exists)
 *
 * Usage:
 *   node scripts/migrate-social-to-mongodb.js
 *
 * Environment variables required:
 *   - VITE_MONGODB_CONNECTION_STRING
 *   - VITE_NEON_CONNECTION_STRING (or DATABASE_URL)
 */

import { MongoClient } from 'mongodb';
import { neon, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Configure Neon
neonConfig.fetchConnectionCache = true;

// MongoDB connection
let mongoClient = null;
let mongoDb = null;

// Neon connection
let sql = null;

/**
 * Initialize connections
 */
async function initConnections() {
  console.log('🔌 Initializing connections...');

  // MongoDB
  const mongoConnectionString = process.env.VITE_MONGODB_CONNECTION_STRING;
  if (!mongoConnectionString) {
    throw new Error('VITE_MONGODB_CONNECTION_STRING not found in environment variables');
  }

  mongoClient = new MongoClient(mongoConnectionString);
  await mongoClient.connect();
  mongoDb = mongoClient.db(process.env.VITE_MONGODB_DB_NAME || 'seshnx');
  console.log('✅ MongoDB connected');

  // Neon
  const neonConnectionString = process.env.VITE_NEON_CONNECTION_STRING || process.env.DATABASE_URL;
  if (!neonConnectionString) {
    throw new Error('Neon connection string not found in environment variables');
  }

  sql = neon(neonConnectionString);
  console.log('✅ Neon connected');
}

/**
 * Close connections
 */
async function closeConnections() {
  if (mongoClient) {
    await mongoClient.close();
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Migrate posts
 */
async function migratePosts() {
  console.log('\n📝 Migrating posts...');

  try {
    const posts = await sql`
      SELECT
        id,
        user_id as author_id,
        content,
        media_urls,
        hashtags,
        mentions,
        category,
        visibility,
        parent_id,
        repost_of,
        likes_count,
        comments_count,
        reposts_count,
        saves_count,
        equipment,
        software,
        custom_fields,
        created_at,
        updated_at,
        deleted_at
      FROM posts
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    console.log(`   Found ${posts.length} posts to migrate`);

    let inserted = 0;
    let skipped = 0;

    for (const post of posts) {
      try {
        const doc = {
          id: post.id,
          author_id: post.author_id,
          content: post.content,
          media_urls: post.media_urls || [],
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          category: post.category,
          visibility: post.visibility || 'public',
          parent_id: post.parent_id || null,
          repost_of: post.repost_of || null,
          engagement: {
            likes_count: post.likes_count || 0,
            comments_count: post.comments_count || 0,
            reposts_count: post.reposts_count || 0,
            saves_count: post.saves_count || 0,
          },
          metadata: {
            equipment: post.equipment,
            software: post.software,
            custom_fields: post.custom_fields,
          },
          created_at: post.created_at,
          updated_at: post.updated_at,
          deleted_at: post.deleted_at,
        };

        await mongoDb.collection('posts').updateOne(
          { id: post.id },
          { $setOnInsert: doc },
          { upsert: true }
        );

        inserted++;
      } catch (error) {
        console.error(`   ❌ Error migrating post ${post.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Posts: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  } catch (error) {
    console.error('❌ Error migrating posts:', error);
    return { inserted: 0, skipped: 0 };
  }
}

/**
 * Migrate comments
 */
async function migrateComments() {
  console.log('\n💬 Migrating comments...');

  try {
    const comments = await sql`
      SELECT
        id,
        post_id,
        user_id as author_id,
        content,
        parent_id,
        reactions,
        created_at,
        updated_at,
        deleted_at
      FROM comments
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `;

    console.log(`   Found ${comments.length} comments to migrate`);

    let inserted = 0;
    let skipped = 0;

    for (const comment of comments) {
      try {
        const doc = {
          id: comment.id,
          post_id: comment.post_id,
          author_id: comment.author_id,
          content: comment.content,
          parent_id: comment.parent_id || null,
          reactions: comment.reactions || [],
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
        };

        await mongoDb.collection('comments').updateOne(
          { id: comment.id },
          { $setOnInsert: doc },
          { upsert: true }
        );

        inserted++;
      } catch (error) {
        console.error(`   ❌ Error migrating comment ${comment.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Comments: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  } catch (error) {
    console.error('❌ Error migrating comments:', error);
    return { inserted: 0, skipped: 0 };
  }
}

/**
 * Migrate reactions
 */
async function migrateReactions() {
  console.log('\n❤️ Migrating reactions...');

  try {
    const reactions = await sql`
      SELECT
        id,
        post_id,
        target_id,
        target_type,
        emoji,
        user_id,
        created_at
      FROM reactions
      ORDER BY created_at ASC
    `;

    console.log(`   Found ${reactions.length} reactions to migrate`);

    let inserted = 0;
    let skipped = 0;

    for (const reaction of reactions) {
      try {
        const doc = {
          post_id: reaction.post_id,
          target_id: reaction.target_id,
          target_type: reaction.target_type,
          emoji: reaction.emoji,
          user_id: reaction.user_id,
          created_at: reaction.created_at,
        };

        await mongoDb.collection('reactions').updateOne(
          {
            target_id: reaction.target_id,
            target_type: reaction.target_type,
            user_id: reaction.user_id,
          },
          { $setOnInsert: doc },
          { upsert: true }
        );

        inserted++;
      } catch (error) {
        console.error(`   ❌ Error migrating reaction:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Reactions: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  } catch (error) {
    console.error('❌ Error migrating reactions:', error);
    return { inserted: 0, skipped: 0 };
  }
}

/**
 * Migrate follows
 */
async function migrateFollows() {
  console.log('\n👥 Migrating follows...');

  try {
    const follows = await sql`
      SELECT
        follower_id,
        following_id,
        created_at
      FROM follows
      ORDER BY created_at ASC
    `;

    console.log(`   Found ${follows.length} follows to migrate`);

    let inserted = 0;
    let skipped = 0;

    for (const follow of follows) {
      try {
        const doc = {
          follower_id: follow.follower_id,
          following_id: follow.following_id,
          created_at: follow.created_at,
        };

        await mongoDb.collection('follows').updateOne(
          {
            follower_id: follow.follower_id,
            following_id: follow.following_id,
          },
          { $setOnInsert: doc },
          { upsert: true }
        );

        inserted++;
      } catch (error) {
        console.error(`   ❌ Error migrating follow:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Follows: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  } catch (error) {
    console.error('❌ Error migrating follows:', error);
    return { inserted: 0, skipped: 0 };
  }
}

/**
 * Migrate saved posts
 */
async function migrateSavedPosts() {
  console.log('\n🔖 Migrating saved posts...');

  try {
    const savedPosts = await sql`
      SELECT
        id,
        user_id,
        post_id,
        created_at
      FROM saved_posts
      ORDER BY created_at DESC
    `;

    console.log(`   Found ${savedPosts.length} saved posts to migrate`);

    let inserted = 0;
    let skipped = 0;

    for (const saved of savedPosts) {
      try {
        const doc = {
          user_id: saved.user_id,
          post_id: saved.post_id,
          created_at: saved.created_at,
        };

        await mongoDb.collection('saved_posts').updateOne(
          {
            user_id: saved.user_id,
            post_id: saved.post_id,
          },
          { $setOnInsert: doc },
          { upsert: true }
        );

        inserted++;
      } catch (error) {
        console.error(`   ❌ Error migrating saved post:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Saved posts: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  } catch (error) {
    console.error('❌ Error migrating saved posts:', error);
    return { inserted: 0, skipped: 0 };
  }
}

/**
 * Migrate social notifications
 */
async function migrateSocialNotifications() {
  console.log('\n🔔 Migrating social notifications...');

  try {
    const notifications = await sql`
      SELECT
        id,
        user_id,
        type,
        actor_id,
        target_id,
        message,
        read,
        created_at,
        read_at
      FROM social_notifications
      ORDER BY created_at DESC
    `;

    console.log(`   Found ${notifications.length} notifications to migrate`);

    let inserted = 0;
    let skipped = 0;

    for (const notification of notifications) {
      try {
        const doc = {
          id: notification.id,
          user_id: notification.user_id,
          type: notification.type,
          actor_id: notification.actor_id,
          target_id: notification.target_id,
          message: notification.message,
          read: notification.read || false,
          created_at: notification.created_at,
          read_at: notification.read_at,
        };

        await mongoDb.collection('social_notifications').insertOne(doc);
        inserted++;
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - skip
          skipped++;
        } else {
          console.error(`   ❌ Error migrating notification ${notification.id}:`, error.message);
          skipped++;
        }
      }
    }

    console.log(`✅ Notifications: ${inserted} inserted, ${skipped} skipped`);
    return { inserted, skipped };
  } catch (error) {
    console.error('❌ Error migrating notifications:', error);
    return { inserted: 0, skipped: 0 };
  }
}

/**
 * Verify migration by comparing counts
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');

  const results = {};

  // Posts
  const neonPosts = await sql`SELECT COUNT(*) FROM posts WHERE deleted_at IS NULL`;
  const mongoPosts = await mongoDb.collection('posts').countDocuments({ deleted_at: null });
  results.posts = { neon: parseInt(neonPosts[0].count), mongo: mongoPosts };
  console.log(`   Posts: Neon=${results.posts.neon}, MongoDB=${results.posts.mongo} ${results.posts.neon === mongoPosts ? '✅' : '❌'}`);

  // Comments
  const neonComments = await sql`SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL`;
  const mongoComments = await mongoDb.collection('comments').countDocuments({ deleted_at: null });
  results.comments = { neon: parseInt(neonComments[0].count), mongo: mongoComments };
  console.log(`   Comments: Neon=${results.comments.neon}, MongoDB=${results.comments.mongo} ${results.comments.neon === mongoComments ? '✅' : '❌'}`);

  // Reactions
  const neonReactions = await sql`SELECT COUNT(*) FROM reactions`;
  const mongoReactions = await mongoDb.collection('reactions').countDocuments();
  results.reactions = { neon: parseInt(neonReactions[0].count), mongo: mongoReactions };
  console.log(`   Reactions: Neon=${results.reactions.neon}, MongoDB=${results.reactions.mongo} ${results.reactions.neon === mongoReactions ? '✅' : '❌'}`);

  // Follows
  const neonFollows = await sql`SELECT COUNT(*) FROM follows`;
  const mongoFollows = await mongoDb.collection('follows').countDocuments();
  results.follows = { neon: parseInt(neonFollows[0].count), mongo: mongoFollows };
  console.log(`   Follows: Neon=${results.follows.neon}, MongoDB=${results.follows.mongo} ${results.follows.neon === mongoFollows ? '✅' : '❌'}`);

  // Saved posts
  const neonSaved = await sql`SELECT COUNT(*) FROM saved_posts`;
  const mongoSaved = await mongoDb.collection('saved_posts').countDocuments();
  results.savedPosts = { neon: parseInt(neonSaved[0].count), mongo: mongoSaved };
  console.log(`   Saved posts: Neon=${results.savedPosts.neon}, MongoDB=${results.savedPosts.mongo} ${results.savedPosts.neon === mongoSaved ? '✅' : '❌'}`);

  // Notifications
  const neonNotifs = await sql`SELECT COUNT(*) FROM social_notifications`;
  const mongoNotifs = await mongoDb.collection('social_notifications').countDocuments();
  results.notifications = { neon: parseInt(neonNotifs[0].count), mongo: mongoNotifs };
  console.log(`   Notifications: Neon=${results.notifications.neon}, MongoDB=${results.notifications.mongo} ${results.notifications.neon === mongoNotifs ? '✅' : '❌'}`);

  return results;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting MongoDB social migration...\n');

  const startTime = Date.now();

  try {
    // Initialize connections
    await initConnections();

    // Run migrations
    await migratePosts();
    await migrateComments();
    await migrateReactions();
    await migrateFollows();
    await migrateSavedPosts();
    await migrateSocialNotifications();

    // Verify
    await verifyMigration();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Migration completed in ${duration}s`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeConnections();
  }
}

// Run migration
main();
