/**
 * Fix service_requests Table Schema
 * Recreates the table with all required columns for tech services
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

async function fixServiceRequestsTable() {
  console.log('\n🔧 Fixing service_requests Table Schema...\n');

  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 40)}...\n`);

  const sqlClient = neon(neonUrl);

  const sqlStatements = [
    // Drop and recreate service_requests with proper schema
    `DROP TABLE IF EXISTS service_requests CASCADE;`,

    `CREATE TABLE IF NOT EXISTS service_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requester_id TEXT NOT NULL,
      tech_id TEXT,
      customer_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      service_category TEXT NOT NULL,
      equipment_name TEXT NOT NULL,
      equipment_brand TEXT,
      equipment_model TEXT,
      issue_description TEXT,
      logistics TEXT DEFAULT 'Drop-off',
      location JSONB,
      preferred_date DATE,
      budget_min NUMERIC(10, 2),
      budget_max NUMERIC(10, 2),
      budget_cap NUMERIC(10, 2),
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'Open',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      assigned_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    );`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_service_requests_requester_id ON service_requests(requester_id);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_tech_id ON service_requests(tech_id);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(service_category);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_location ON service_requests USING GIN(location);`,
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

  console.log(`\n✅ service_requests table fixed!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount}`);
  }
  console.log();
}

fixServiceRequestsTable().catch(console.error);
