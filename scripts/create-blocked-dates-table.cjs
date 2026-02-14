/**
 * Create blocked_dates Table
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

async function createBlockedDatesTable() {
  console.log('\n🔧 Creating blocked_dates Table...\n');

  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 40)}...\n`);

  const sqlClient = neon(neonUrl);

  const sqlStatements = [
    // Create blocked_dates table
    `CREATE TABLE IF NOT EXISTS blocked_dates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      studio_id TEXT NOT NULL,
      date DATE NOT NULL,
      reason TEXT,
      recurring_type TEXT DEFAULT 'none',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(studio_id, date)
    );`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_blocked_dates_studio_id ON blocked_dates(studio_id);`,
    `CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);`,
    `CREATE INDEX IF NOT EXISTS idx_blocked_dates_studio_date ON blocked_dates(studio_id, date);`,
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

  console.log(`\n✅ blocked_dates table created!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount}`);
  }
  console.log();
}

createBlockedDatesTable().catch(console.error);
