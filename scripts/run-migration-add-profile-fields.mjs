import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local file
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        // Remove quotes from value if present
        let value = valueParts.join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key.trim()] = value;
      }
    }
  });
}

// Read SQL migration file
const migrationPath = path.join(__dirname, '../sql/35_add_profile_fields.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

// Get database URL from environment (try multiple env var names)
const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ VITE_NEON_DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔄 Running migration: 35_add_profile_fields.sql');
console.log('📊 Database:', databaseUrl.split('@')[1]?.split('/')[0] || 'unknown');

async function runMigration() {
  const sqlClient = neon(databaseUrl);

  try {
    // Split SQL into individual statements and run them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('📝 Executing:', statement.substring(0, 50) + '...');
        await sqlClient(statement);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Added columns:');
    console.log('  • clerk_users.use_legal_name_only');
    console.log('  • clerk_users.use_user_name_only');
    console.log('  • clerk_users.effective_display_name');
    console.log('  • profiles.hourly_rate');
    console.log('  • profiles.search_terms');
    console.log('');
    console.log('Added indexes:');
    console.log('  • idx_clerk_users_effective_display_name');
    console.log('  • idx_profiles_hourly_rate');
    console.log('  • idx_profiles_search_terms');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
