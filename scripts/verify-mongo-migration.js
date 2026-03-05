/**
 * Verify MongoDB Migration by Comparing Counts
 *
 * Run after migration to verify data integrity
 *
 * Usage:
 *   node scripts/verify-mongo-migration.js
 */

import { MongoClient } from 'mongodb';
import { neon, neonConfig } from '@neondatabase/serverless';
import { dotenv } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Configure Neon
neonConfig.fetchConnectionCache = true;

/**
 * Verify migration by comparing counts between Neon and MongoDB
 */
async function verifyMigration() {
  console.log('🔍 Verifying MongoDB migration...\n');

  let mongoClient = null;
  let mongoDb = null;
  let sql = null;

  try {
    // Connect to MongoDB
    const mongoConnectionString = process.env.VITE_MONGODB_CONNECTION_STRING;
    if (!mongoConnectionString) {
      throw new Error('VITE_MONGODB_CONNECTION_STRING not found');
    }

    mongoClient = new MongoClient(mongoConnectionString);
    await mongoClient.connect();
    mongoDb = mongoClient.db(process.env.VITE_MONGODB_DB_NAME || 'seshnx');
    console.log('✅ MongoDB connected');

    // Connect to Neon
    const neonConnectionString = process.env.VITE_NEON_CONNECTION_STRING || process.env.DATABASE_URL;
    if (!neonConnectionString) {
      throw new Error('Neon connection string not found');
    }

    sql = neon(neonConnectionString);
    console.log('✅ Neon connected\n');

    const results = {
      passed: 0,
      failed: 0,
      details: {},
    };

    // Verify posts
    console.log('📝 Verifying posts...');
    const neonPosts = await sql`SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL`;
    const mongoPosts = await mongoDb.collection('posts').countDocuments({ deleted_at: null });
    const postsMatch = parseInt(neonPosts[0].count) === mongoPosts;
    results.details.posts = { neon: parseInt(neonPosts[0].count), mongo: mongoPosts, match: postsMatch };
    console.log(`   Neon: ${neonPosts[0].count}, MongoDB: ${mongoPosts} ${postsMatch ? '✅' : '❌'}`);
    if (postsMatch) results.passed++; else results.failed++;

    // Verify comments
    console.log('\n💬 Verifying comments...');
    const neonComments = await sql`SELECT COUNT(*) as count FROM comments WHERE deleted_at IS NULL`;
    const mongoComments = await mongoDb.collection('comments').countDocuments({ deleted_at: null });
    const commentsMatch = parseInt(neonComments[0].count) === mongoComments;
    results.details.comments = { neon: parseInt(neonComments[0].count), mongo: mongoComments, match: commentsMatch };
    console.log(`   Neon: ${neonComments[0].count}, MongoDB: ${mongoComments} ${commentsMatch ? '✅' : '❌'}`);
    if (commentsMatch) results.passed++; else results.failed++;

    // Verify reactions
    console.log('\n❤️ Verifying reactions...');
    const neonReactions = await sql`SELECT COUNT(*) as count FROM reactions`;
    const mongoReactions = await mongoDb.collection('reactions').countDocuments();
    const reactionsMatch = parseInt(neonReactions[0].count) === mongoReactions;
    results.details.reactions = { neon: parseInt(neonReactions[0].count), mongo: mongoReactions, match: reactionsMatch };
    console.log(`   Neon: ${neonReactions[0].count}, MongoDB: ${mongoReactions} ${reactionsMatch ? '✅' : '❌'}`);
    if (reactionsMatch) results.passed++; else results.failed++;

    // Verify follows
    console.log('\n👥 Verifying follows...');
    const neonFollows = await sql`SELECT COUNT(*) as count FROM follows`;
    const mongoFollows = await mongoDb.collection('follows').countDocuments();
    const followsMatch = parseInt(neonFollows[0].count) === mongoFollows;
    results.details.follows = { neon: parseInt(neonFollows[0].count), mongo: mongoFollows, match: followsMatch };
    console.log(`   Neon: ${neonFollows[0].count}, MongoDB: ${mongoFollows} ${followsMatch ? '✅' : '❌'}`);
    if (followsMatch) results.passed++; else results.failed++;

    // Verify saved posts
    console.log('\n🔖 Verifying saved posts...');
    const neonSaved = await sql`SELECT COUNT(*) as count FROM saved_posts`;
    const mongoSaved = await mongoDb.collection('saved_posts').countDocuments();
    const savedMatch = parseInt(neonSaved[0].count) === mongoSaved;
    results.details.savedPosts = { neon: parseInt(neonSaved[0].count), mongo: mongoSaved, match: savedMatch };
    console.log(`   Neon: ${neonSaved[0].count}, MongoDB: ${mongoSaved} ${savedMatch ? '✅' : '❌'}`);
    if (savedMatch) results.passed++; else results.failed++;

    // Verify notifications
    console.log('\n🔔 Verifying social notifications...');
    const neonNotifs = await sql`SELECT COUNT(*) as count FROM social_notifications`;
    const mongoNotifs = await mongoDb.collection('social_notifications').countDocuments();
    const notifsMatch = parseInt(neonNotifs[0].count) === mongoNotifs;
    results.details.notifications = { neon: parseInt(neonNotifs[0].count), mongo: mongoNotifs, match: notifsMatch };
    console.log(`   Neon: ${neonNotifs[0].count}, MongoDB: ${mongoNotifs} ${notifsMatch ? '✅' : '❌'}`);
    if (notifsMatch) results.passed++; else results.failed++;

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}/6`);
    console.log(`❌ Failed: ${results.failed}/6`);
    console.log('='.repeat(50));

    if (results.failed === 0) {
      console.log('\n🎉 All verifications passed! Migration successful.');
    } else {
      console.log('\n⚠️ Some verifications failed. Please review the details above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

// Run verification
verifyMigration();
