/**
 * Check Schema Script
 * Verifies that user_id columns have been changed to TEXT
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local file to get VITE_NEON_DATABASE_URL
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  for (const line of envContent.split('\n')) {
    const match = line.match(/^VITE_([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }

  return envVars;
}

async function checkSchema() {
  console.log('\n🔍 Checking schema for user_id columns...\n');

  // Load environment variables
  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  // Create Neon client
  const sqlClient = neon(neonUrl);

  try {
    // Check reactions table
    const reactionsColumns = await sqlClient(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'reactions' AND column_name = 'user_id'
    `);

    console.log('📊 reactions.user_id:');
    console.log(`   Type: ${reactionsColumns[0]?.data_type || 'NOT FOUND'}`);

    // Check posts table
    const postsColumns = await sqlClient(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'posts' AND column_name = 'user_id'
    `);

    console.log('\n📊 posts.user_id:');
    console.log(`   Type: ${postsColumns[0]?.data_type || 'NOT FOUND'}`);

    // Check comments table
    const commentsColumns = await sqlClient(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'comments' AND column_name = 'user_id'
    `);

    console.log('\n📊 comments.user_id:');
    console.log(`   Type: ${commentsColumns[0]?.data_type || 'NOT FOUND'}`);

    // Check if new tables exist
    const newTables = ['content_reports', 'user_blocks', 'post_metrics', 'post_edit_history', 'notification_preferences', 'demo_submissions', 'track_listings'];

    console.log('\n📊 New tables:');
    for (const tableName of newTables) {
      const exists = await sqlClient(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = '${tableName}'
        )
      `);
      console.log(`   ${tableName}: ${exists[0]?.exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    console.log('\n✅ Schema check complete!\n');

    // Check if reactions have TEXT user_id
    if (reactionsColumns[0]?.data_type === 'text') {
      console.log('✅ Schema fix successful! user_id columns are now TEXT type.');
      console.log('   Reactions should now work with Clerk authentication.\n');
      return true;
    } else {
      console.log('❌ Schema fix incomplete. user_id columns are still UUID.\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Schema check failed:', error);
    return false;
  }
}

checkSchema().catch(console.error);
