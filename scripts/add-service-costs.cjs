/**
 * Add Missing Cost Columns to service_requests
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

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

async function addCostColumns() {
  console.log('\n🔧 Adding Missing Cost Columns...\n');

  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 40)}...\n`);

  const sqlClient = neon(neonUrl);

  const sqlStatements = [
    // Add missing cost columns to service_requests
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10, 2);`,
    `ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS actual_cost NUMERIC(10, 2);`,

    // Create reviews table if it doesn't exist
    `CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reviewer_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create indexes for reviews
    `CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id);`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);`,
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
    }
  }

  console.log(`\n✅ Cost columns added!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount}`);
  }
  console.log();
}

addCostColumns().catch(console.error);
