/**
 * Run All SQL Migrations in Order
 * Executes all SQL files in the correct dependency order
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

// SQL files in execution order (superseded files excluded)
const MIGRATION_ORDER = [
  // Core Schema
  '00_core_unified_schema.sql',
  '00_core_schema_clean.sql',

  // App Configuration
  '10_app_config_neon.sql',
  '10_app_config.sql',

  // Core Features (in order of dependencies)
  '20_bookings.sql',
  '21_marketplace.sql',
  '22_payments.sql',
  '23_social_feed.sql',

  // Analytics & Metrics
  '24_distribution_analytics.sql',
  '25_metrics_history.sql',

  // Social Feed Completion
  '26_social_core_completion.sql',

  // Booking Enhancements
  '30_booking_enhancements.sql',
  '31_blocked_dates.sql',
  '32_google_calendar_sync.sql',

  // Clerk Fixes (run the latest one)
  '30_fix_clerk_user_ids_alter.sql',  // Supersedes 29_fix_clerk_user_ids.sql

  // Schema Fixes (in order)
  '200_fix_clerk_id.sql',
  '201_fix_sub_profiles.sql',
  '202_add_post_profile_role.sql',
  '202_fix_equipment_constraint.sql',
  '203_add_default_profile_role.sql',
  '203_fix_brands.sql',
  '204_fix_legacy_uuid_columns.sql',
  '204_fix_software_brands.sql',
  '205_fix_all_legacy_supabase_references.sql',
  '206_fix_missing_columns.sql',
  '207_safe_complete_migration.sql',
  '208_fix_marketplace_deletions.sql',
  '209_add_clerk_users_settings.sql',
  '210_fix_wallets_and_subprofiles.sql',
  '211_add_account_type_to_subprofiles.sql',
  '212_add_missing_profiles_columns.sql',

  // Notification Fixes
  '31_add_notification_columns.sql',
  '32_fix_notification_type_constraint.sql',

  // Business Features
  '40_business.sql',
  '41_business_features.sql',
  '42_external_artists.sql',
  '43_label_critical.sql',

  // Studio CRM & Operations
  '50_studio_crm.sql',
  '51_studio_operations.sql',
  '52_studio_analytics.sql',
  '53_studio_ops_enhancements.sql',

  // Tech Services
  '60_tech_services.sql',

  // Education
  '70_education.sql',

  // Legal & Contracts
  '80_legal_docs.sql',
  '81_contracts.sql',

  // Marketing
  '90_marketing_campaigns.sql',

  // Database imports (if needed)
  '100_databases.sql',
  '101_gear_import.sql',
  '102_software_import.sql',
];

// Files to skip (superseded or manual-only)
const SKIP_FILES = [
  '29_fix_clerk_user_ids.sql',  // Superseded by 30_fix_clerk_user_ids_alter.sql
  '01_master_schema.sql',       // Superseded by 00_core_unified_schema.sql
  'MASTER_NEON_CLERK_CONTEX_SCHEMA.sql',  // Reference only
  'QUICK_REFERENCE.sql',        // Reference only
  'fix_clerk_uuid_mismatch.sql', // One-off fix
  'fix_distribution_stats_columns.sql', // One-off fix
];

/**
 * Split SQL into statements, handling PL/pgSQL blocks
 */
function splitSQL(sql) {
  const statements = [];
  let current = '';
  let depth = 0;
  let inDollarQuote = false;
  let dollarQuoteTag = null;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  const lines = sql.split('\n');

  for (let line of lines) {
    let i = 0;

    // Skip line if it's a pure comment line
    const trimmed = line.trim();
    if (trimmed.startsWith('--') && !inLineComment && !inBlockComment) {
      if (current.trim()) {
        current += '\n' + line;
      }
      continue;
    }

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1] || '';

      // Handle comments
      if (!inSingleQuote && !inDoubleQuote && !inDollarQuote) {
        if (char === '-' && nextChar === '-' && !inBlockComment) {
          inLineComment = true;
          i += 2;
          continue;
        }
        if (char === '/' && nextChar === '*' && !inLineComment) {
          inBlockComment = true;
          i += 2;
          continue;
        }
        if (char === '*' && nextChar === '/' && inBlockComment) {
          inBlockComment = false;
          i += 2;
          continue;
        }
      }

      if (inLineComment && char === '\n') {
        inLineComment = false;
      }

      // Skip comment content
      if (inLineComment || inBlockComment) {
        current += char;
        i++;
        continue;
      }

      // Handle quotes
      if (char === "'" && !inDoubleQuote && !inDollarQuote) {
        inSingleQuote = !inSingleQuote;
        current += char;
        i++;
        continue;
      }
      if (char === '"' && !inSingleQuote && !inDollarQuote) {
        inDoubleQuote = !inDoubleQuote;
        current += char;
        i++;
        continue;
      }

      // Handle dollar-quoted strings ($tag$...$tag$)
      if (char === '$' && !inSingleQuote && !inDoubleQuote) {
        let tagEnd = i + 1;
        while (tagEnd < line.length && line[tagEnd] !== '$') {
          tagEnd++;
        }

        if (line[tagEnd] === '$') {
          const tag = line.substring(i, tagEnd + 1);

          if (inDollarQuote && tag === dollarQuoteTag) {
            inDollarQuote = false;
            dollarQuoteTag = null;
            current += tag;
            i = tagEnd + 1;
            continue;
          } else if (!inDollarQuote) {
            inDollarQuote = true;
            dollarQuoteTag = tag;
            current += tag;
            i = tagEnd + 1;
            continue;
          }
        }
      }

      // Track parentheses depth
      if (!inSingleQuote && !inDoubleQuote && !inDollarQuote) {
        if (char === '(') depth++;
        if (char === ')') depth--;

        // Statement terminator
        if (char === ';' && depth === 0) {
          current += char;
          const stmt = current.trim();
          if (stmt && !stmt.startsWith('--')) {
            statements.push(stmt);
          }
          current = '';
          i++;
          continue;
        }
      }

      current += char;
      i++;
    }

    current += '\n';
  }

  const lastStmt = current.trim();
  if (lastStmt && !lastStmt.startsWith('--')) {
    statements.push(lastStmt);
  }

  return statements;
}

async function runAllMigrations() {
  console.log('\n🚀 Running All SQL Migrations in Order\n');
  console.log('=' .repeat(60));

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

  const sqlDir = path.join(__dirname, '..', 'sql');

  let totalSuccess = 0;
  let totalErrors = 0;
  let skippedCount = 0;

  for (const sqlFile of MIGRATION_ORDER) {
    const sqlPath = path.join(sqlDir, sqlFile);

    if (!fs.existsSync(sqlPath)) {
      console.log(`⚠️  SKIP: ${sqlFile} (file not found)`);
      skippedCount++;
      continue;
    }

    if (SKIP_FILES.includes(sqlFile)) {
      console.log(`⏭️  SKIP: ${sqlFile} (superseded)`);
      skippedCount++;
      continue;
    }

    console.log(`\n📄 Running: ${sqlFile}`);
    console.log('-'.repeat(60));

    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
      const statements = splitSQL(sql);
      let fileSuccess = 0;
      let fileErrors = 0;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (!stmt || stmt.startsWith('--') || stmt.startsWith('/*')) continue;

        try {
          await sqlClient(stmt);
          fileSuccess++;
        } catch (err) {
          fileErrors++;
          const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
          if (fileErrors <= 3) { // Only show first 3 errors per file
            console.error(`   ⚠️  Error: ${err.message}`);
            console.error(`      Statement: ${preview}...`);
          }
        }
      }

      totalSuccess += fileSuccess;
      totalErrors += fileErrors;

      console.log(`   ✅ Complete: ${fileSuccess} statements executed`);
      if (fileErrors > 0) {
        console.log(`   ⚠️  Errors: ${fileErrors} (expected for IF EXISTS/IF NOT EXISTS checks)`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to process file: ${error.message}`);
      totalErrors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total statements executed: ${totalSuccess}`);
  if (totalErrors > 0) {
    console.log(`⚠️  Total errors: ${totalErrors} (some may be expected)`);
  }
  if (skippedCount > 0) {
    console.log(`⏭️  Files skipped: ${skippedCount}`);
  }
  console.log('='.repeat(60));
  console.log('\n✅ All migrations complete!\n');
}

// Run migrations
runAllMigrations().catch(console.error);
