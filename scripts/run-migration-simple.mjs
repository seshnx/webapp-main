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

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔄 Running migration: Add missing profile fields');
console.log('📊 Database:', databaseUrl.split('@')[1]?.split('/')[0] || 'unknown');

const sqlClient = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('\n📝 Adding columns to clerk_users table...');

    // Add clerk_users columns
    const clerkColumns = [
      { name: 'use_legal_name_only', type: 'BOOLEAN DEFAULT false' },
      { name: 'use_user_name_only', type: 'BOOLEAN DEFAULT false' },
      { name: 'effective_display_name', type: 'TEXT' }
    ];

    for (const col of clerkColumns) {
      try {
        await sqlClient(`ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        console.log(`  ✅ Added clerk_users.${col.name}`);
      } catch (err) {
        console.log(`  ⚠️  clerk_users.${col.name}: ${err.message}`);
      }
    }

    console.log('\n📝 Adding columns to profiles table...');

    // Add profiles columns
    const profileColumns = [
      { name: 'hourly_rate', type: 'NUMERIC(10, 2)' },
      { name: 'search_terms', type: 'TEXT[]' }
    ];

    for (const col of profileColumns) {
      try {
        await sqlClient(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        console.log(`  ✅ Added profiles.${col.name}`);
      } catch (err) {
        console.log(`  ⚠️  profiles.${col.name}: ${err.message}`);
      }
    }

    console.log('\n📝 Creating indexes...');

    // Create indexes
    const indexes = [
      { name: 'idx_clerk_users_effective_display_name', table: 'clerk_users', column: 'effective_display_name' },
      { name: 'idx_profiles_hourly_rate', table: 'profiles', column: 'hourly_rate' },
      { name: 'idx_profiles_search_terms', table: 'profiles', column: 'search_terms', using: 'GIN' }
    ];

    for (const idx of indexes) {
      try {
        const usingClause = idx.using ? `USING ${idx.using}` : '';
        await sqlClient(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table} ${usingClause}(${idx.column});`);
        console.log(`  ✅ Created ${idx.name}`);
      } catch (err) {
        console.log(`  ⚠️  ${idx.name}: ${err.message}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  • clerk_users: use_legal_name_only, use_user_name_only, effective_display_name');
    console.log('  • profiles: hourly_rate, search_terms');
    console.log('  • indexes: idx_clerk_users_effective_display_name, idx_profiles_hourly_rate, idx_profiles_search_terms');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
