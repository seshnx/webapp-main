/**
 * Fix Missing Columns Round 2
 * Adds engineer_info, assigned_at, and other missing columns
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
      envVars[match[1]] = match[2].replace(/^[\"']|[\"']$/g, '');
    }
  }

  return envVars;
}

async function fixMissingColumns() {
  console.log('\n🔧 Fixing Missing Columns Round 2...\n');

  // Load environment variables
  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 40)}...\n`);

  // Create Neon client
  const sqlClient = neon(neonUrl);

  const sqlStatements = [
    // Add all role-specific info columns to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engineer_info JSONB DEFAULT '{}'::jsonb;`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS producer_info JSONB DEFAULT '{}'::jsonb;`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS studio_info JSONB DEFAULT '{}'::jsonb;`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_info JSONB DEFAULT '{}'::jsonb;`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS label_info JSONB DEFAULT '{}'::jsonb;`,

    // Add assigned_at to service_requests table
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_id TEXT;`,

    // Add missing columns to clerk_users table
    `ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS phone TEXT;`,
    `ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS username TEXT;`,

    // Add missing columns to posts table for social feed
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS text TEXT;`,
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS role TEXT;`,
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';`,
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;`,
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;`,
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS saves_count INTEGER DEFAULT 0;`,
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`,

    // Add missing columns to bookings table
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sender_name TEXT;`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sender_photo TEXT;`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS target_name TEXT;`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS target_photo TEXT;`,

    // Add is_verified_tech column to clerk_users (for technicians)
    `ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS is_verified_tech BOOLEAN DEFAULT false;`,

    // Add missing columns to studios table
    `ALTER TABLE studios ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    try {
      await sqlClient(sql);
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(`   ⚠️  Statement ${i + 1} failed: ${err.message}`);
      console.error(`      SQL: ${sql.substring(0, 100)}...`);
    }
  }

  console.log(`\n✅ Column fixes complete!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount} (some may be expected)`);
  }
  console.log();
}

fixMissingColumns().catch(console.error);
