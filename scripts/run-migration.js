/**
 * Migration Runner Script
 * Executes SQL migration files on the Neon database
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

async function runMigration(sqlFile) {
  console.log(`\n📝 Running migration: ${sqlFile}`);

  // Load environment variables
  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 30)}...`);

  // Read SQL file
  const sqlPath = path.join(__dirname, '..', 'sql', sqlFile);
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Error: SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Create Neon client
  const sqlClient = neon(neonUrl);

  console.log('🔄 Executing migration...');

  try {
    // Split by semicolon and execute each statement
    // Note: This is a simple split - may not work for complex SQL with functions
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt || stmt.startsWith('--') || stmt.startsWith('/*')) continue;

      try {
        await sqlClient(stmt);
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`   Progress: ${successCount} statements executed...`);
        }
      } catch (err) {
        errorCount++;
        console.error(`   ⚠️  Statement ${i + 1} failed:`, err.message);
        // Continue with next statement
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`   - Errors: ${errorCount} statements (some may be expected)`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
const sqlFile = process.argv[2] || '29_fix_clerk_user_ids.sql';
runMigration(sqlFile).catch(console.error);
