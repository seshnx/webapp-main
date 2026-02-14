/**
 * Fix UUID Column Type Mismatches
 * Converts UUID columns to TEXT for Clerk compatibility
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

async function fixUuidColumns() {
  console.log('\n🔧 Fixing UUID Column Type Mismatches...\n');

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
    // Fix service_requests table - change UUID columns to TEXT
    // First, if the table already exists with wrong types, we need to recreate it
    `DROP TABLE IF EXISTS service_requests CASCADE;`,

    // Recreate service_requests with TEXT types
    `CREATE TABLE IF NOT EXISTS service_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tech_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      assigned_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    );`,

    // Recreate indexes
    `CREATE INDEX IF NOT EXISTS idx_service_requests_tech_id ON service_requests(tech_id);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);`,

    // Fix tech_public_profiles - ensure user_id is TEXT
    `DROP TABLE IF EXISTS tech_public_profiles CASCADE;`,

    `CREATE TABLE IF NOT EXISTS tech_public_profiles (
      user_id TEXT PRIMARY KEY,
      display_name TEXT,
      bio TEXT,
      specialties TEXT[] DEFAULT '{}',
      certifications TEXT[] DEFAULT '{}',
      years_experience INTEGER,
      hourly_rate NUMERIC(10, 2),
      location JSONB,
      service_radius INTEGER,
      availability_status TEXT,
      rating_average NUMERIC(3, 2),
      review_count INTEGER DEFAULT 0,
      completed_jobs INTEGER DEFAULT 0,
      profile_photo TEXT,
      is_verified_tech BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Recreate indexes
    `CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_specialties ON tech_public_profiles USING GIN(specialties);`,
    `CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_location ON tech_public_profiles USING GIN(location);`,
    `CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_rating ON tech_public_profiles(rating_average DESC);`,

    // Fix studio_rooms table - ensure TEXT types
    `DROP TABLE IF EXISTS studio_rooms CASCADE;`,

    `CREATE TABLE IF NOT EXISTS studio_rooms (
      id TEXT PRIMARY KEY,
      studio_id TEXT NOT NULL,
      room_name TEXT,
      capacity INTEGER,
      hourly_rate NUMERIC(10, 2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    `CREATE INDEX IF NOT EXISTS idx_studio_rooms_studio_id ON studio_rooms(studio_id);`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    try {
      await sqlClient(sql);
      successCount++;
      console.log(`   ✅ Statement ${i + 1}/${sqlStatements.length} executed`);
    } catch (err) {
      errorCount++;
      console.error(`   ⚠️  Statement ${i + 1} failed: ${err.message}`);
      console.error(`      SQL: ${sql.substring(0, 150)}...`);
    }
  }

  console.log(`\n✅ UUID column fixes complete!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount}`);
  }
  console.log();
}

fixUuidColumns().catch(console.error);
