/**
 * Migrate Social Feed Data from Neon to MongoDB
 * 
 * This script migrates all social feed data from Neon PostgreSQL to MongoDB:
 * - Posts, Comments, Reactions, Follows, Saved posts, Notifications
 * 
 * Usage: node scripts/migrate-social-to-mongodb.js
 */

import { neon } from '@neondatabase/serverless';
import { MongoClient } from 'mongodb';

const NEON_URL = process.env.VITE_NEON_DATABASE_URL;
const MONGO_URL = process.env.MONGODB_URI;
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || 'seshnx';

if (!NEON_URL) {
  console.error('❌ VITE_NEON_DATABASE_URL environment variable is required');
  process.exit(1);
}

if (!MONGO_URL) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

const neonSql = neon(NEON_URL);
let mongoClient, mongoDb;

const stats = {
  posts: { migrated: 0, failed: 0 },
  comments: { migrated: 0, failed: 0 },
  reactions: { migrated: 0, failed: 0 },
  follows: { migrated: 0, failed: 0 },
  saved_posts: { migrated: 0, failed: 0 },
};

async function initMongo() {
  mongoClient = new MongoClient(MONGO_URL);
  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGO_DB_NAME);
  console.log('✅ Connected to MongoDB');
}

async function closeConnections() {
  if (mongoClient) await mongoClient.close();
}

function convertPost(row) {
  return {
    id: row.id,
    author_id: row.user_id,
    content: row.content || row.text || '',
    media_urls: row.media_urls || [],
    hashtags: row.hashtags || [],
    mentions: row.mentions || [],
    category: row.post_category,
    visibility: row.visibility || 'public',
    parent_id: row.parent_post_id || null,
    engagement: {
      likes_count: row.reaction_count || 0,
      comments_count: row.comment_count || 0,
      reposts_count: row.repost_count || 0,
      saves_count: row.save_count || 0,
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at,
  };
}

async function migrateCollection(name, sqlQuery, converter) {
  console.log(`\n📝 Migrating ${name}...`);
  try {
    const rows = await neonSql.unsafe(sqlQuery);
    console.log(`Found ${rows.length} ${name} to migrate`);
    
    for (const row of rows) {
      try {
        const doc = converter(row);
        await mongoDb.collection(name).insertOne(doc);
        stats[name].migrated++;
      } catch (error) {
        if (error.code !== 11000) {
          stats[name].failed++;
        }
      }
    }
    console.log(`✅ ${name}: ${stats[name].migrated} migrated, ${stats[name].failed} failed`);
  } catch (error) {
    console.error(`Error migrating ${name}:`, error);
  }
}

async function migrate() {
  console.log('🚀 Starting Social Feed Migration...\n');
  try {
    await initMongo();
    
    await migrateCollection('posts', 'SELECT * FROM posts WHERE deleted_at IS NULL', convertPost);
    await migrateCollection('comments', 'SELECT * FROM comments WHERE deleted_at IS NULL', (r) => ({
      id: r.id, post_id: r.post_id, author_id: r.user_id, content: r.content,
      parent_id: r.parent_comment_id || null, reactions: [], created_at: r.created_at, updated_at: r.updated_at
    }));
    await migrateCollection('reactions', 'SELECT * FROM reactions', (r) => ({
      post_id: r.target_id, target_id: r.target_id, target_type: r.target_type,
      emoji: r.emoji, user_id: r.user_id, created_at: r.created_at
    }));
    await migrateCollection('follows', 'SELECT * FROM follows', (r) => ({
      follower_id: r.follower_id, following_id: r.following_id, created_at: r.created_at
    }));
    await migrateCollection('saved_posts', 'SELECT * FROM saved_posts', (r) => ({
      user_id: r.user_id, post_id: r.post_id, created_at: r.created_at
    }));
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    Object.entries(stats).forEach(([name, stat]) => {
      console.log(`${name}: ${stat.migrated} migrated, ${stat.failed} failed`);
    });
    console.log('='.repeat(50));
    
  } finally {
    await closeConnections();
  }
}

migrate().catch(console.error);
