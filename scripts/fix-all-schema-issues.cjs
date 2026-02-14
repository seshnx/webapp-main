/**
 * Fix All Schema Issues
 * Adds missing columns and creates database functions
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

async function fixAllSchemaIssues() {
  console.log('\n🔧 Fixing All Schema Issues...\n');

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
    // ========================================
    // ADD MISSING COLUMNS TO TABLES
    // ========================================

    // Add venue_id to bookings table
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS venue_id TEXT;`,

    // Add talent_info to profiles table (as JSONB)
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS talent_info JSONB DEFAULT '{}'::jsonb;`,

    // Add settings to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;`,

    // Add profile_views to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;`,

    // Add hourly_rate to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2);`,

    // Add profile_location to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_location JSONB;`,

    // Add reputation_score to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;`,

    // Add followers_count to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;`,

    // Add following_count to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;`,

    // Add posts_count to profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;`,

    // ========================================
    // CREATE METRICS HISTORY TABLE
    // ========================================

    `CREATE TABLE IF NOT EXISTS metrics_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      metric_value NUMERIC(10, 2),
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Indexes for metrics_history
    `CREATE INDEX IF NOT EXISTS idx_metrics_history_user_id ON metrics_history(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_metrics_history_metric_type ON metrics_history(metric_type);`,
    `CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded_at ON metrics_history(recorded_at DESC);`,

    // ========================================
    // CREATE DATABASE FUNCTIONS
    // ========================================

    // Drop functions if they exist
    `DROP FUNCTION IF EXISTS get_profile_views_trend(TEXT, INTEGER);`,
    `DROP FUNCTION IF EXISTS get_token_balance_trend(TEXT, INTEGER);`,
    `DROP FUNCTION IF EXISTS get_revenue_trend(TEXT, INTEGER);`,
    `DROP FUNCTION IF EXISTS get_trend_percentage(TEXT, TEXT, INTEGER);`,
    `DROP FUNCTION IF EXISTS get_trend_direction(TEXT, TEXT, INTEGER);`,

    // Function: get_profile_views_trend
    `CREATE OR REPLACE FUNCTION get_profile_views_trend(
      user_id_param TEXT,
      days_param INTEGER DEFAULT 30
    ) RETURNS TABLE (
      current_value NUMERIC,
      previous_value NUMERIC,
      change NUMERIC,
      change_percentage NUMERIC
    ) AS $$
    DECLARE
      start_date TIMESTAMPTZ;
    BEGIN
      start_date := NOW() - (days_param || 30) * INTERVAL '1 day';

      RETURN QUERY
      WITH current_metrics AS (
        SELECT COALESCE(metric_value, 0) as val
        FROM metrics_history
        WHERE user_id = user_id_param
          AND metric_type = 'profile_views'
          AND recorded_at >= start_date
        ORDER BY recorded_at DESC
        LIMIT 1
      ),
      previous_metrics AS (
        SELECT COALESCE(metric_value, 0) as val
        FROM metrics_history
        WHERE user_id = user_id_param
          AND metric_type = 'profile_views'
          AND recorded_at < start_date
        ORDER BY recorded_at DESC
        LIMIT 1
      )
      SELECT
        COALESCE((SELECT val FROM current_metrics), 0)::NUMERIC as current_value,
        COALESCE((SELECT val FROM previous_metrics), 0)::NUMERIC as previous_value,
        COALESCE((SELECT val FROM current_metrics), 0) - COALESCE((SELECT val FROM previous_metrics), 0)::NUMERIC as change,
        CASE
          WHEN (SELECT val FROM previous_metrics) > 0 THEN
            ROUND(((COALESCE((SELECT val FROM current_metrics), 0) - COALESCE((SELECT val FROM previous_metrics), 0)) * 100.0 /
                 NULLIF((SELECT val FROM previous_metrics), 0))::NUMERIC, 2)
          ELSE 0
        END as change_percentage;
    END;
    $$ LANGUAGE plpgsql;`,

    // Function: get_token_balance_trend
    `CREATE OR REPLACE FUNCTION get_token_balance_trend(
      user_id_param TEXT,
      days_param INTEGER DEFAULT 30
    ) RETURNS TABLE (
      current_value NUMERIC,
      previous_value NUMERIC,
      change NUMERIC,
      change_percentage NUMERIC
    ) AS $$
    DECLARE
      start_date TIMESTAMPTZ;
      current_bal NUMERIC;
      previous_bal NUMERIC;
    BEGIN
      start_date := NOW() - (days_param || 30) * INTERVAL '1 day';

      -- Get current balance from wallets table
      SELECT COALESCE(balance, 0) INTO current_bal
      FROM wallets
      WHERE user_id = user_id_param
      LIMIT 1;

      -- Get previous balance from metrics
      SELECT COALESCE(metric_value, 0) INTO previous_bal
      FROM metrics_history
      WHERE user_id = user_id_param
        AND metric_type = 'token_balance'
        AND recorded_at < start_date
      ORDER BY recorded_at DESC
      LIMIT 1;

      RETURN QUERY
      SELECT
        current_bal::NUMERIC,
        COALESCE(previous_bal, 0)::NUMERIC,
        current_bal - COALESCE(previous_bal, 0)::NUMERIC,
        CASE
          WHEN previous_bal > 0 THEN
            ROUND(((current_bal - previous_bal) * 100.0 / NULLIF(previous_bal, 0))::NUMERIC, 2)
          ELSE 0
        END;
    END;
    $$ LANGUAGE plpgsql;`,

    // Function: get_revenue_trend
    `CREATE OR REPLACE FUNCTION get_revenue_trend(
      user_id_param TEXT,
      days_param INTEGER DEFAULT 30
    ) RETURNS TABLE (
      current_value NUMERIC,
      previous_value NUMERIC,
      change NUMERIC,
      change_percentage NUMERIC
    ) AS $$
    DECLARE
      start_date TIMESTAMPTZ;
    BEGIN
      start_date := NOW() - (days_param || 30) * INTERVAL '1 day';

      RETURN QUERY
      WITH current_period AS (
        SELECT COALESCE(SUM(amount), 0) as val
        FROM wallet_transactions
        WHERE user_id IN (SELECT user_id FROM wallets WHERE user_id = user_id_param)
          AND type = 'credit'
          AND created_at >= start_date
      ),
      previous_period AS (
        SELECT COALESCE(SUM(amount), 0) as val
        FROM wallet_transactions
        WHERE user_id IN (SELECT user_id FROM wallets WHERE user_id = user_id_param)
          AND type = 'credit'
          AND created_at < start_date
          AND created_at >= start_date - INTERVAL '1 day' * (days_param || 30)
      )
      SELECT
        (SELECT val FROM current_period)::NUMERIC,
        (SELECT val FROM previous_period)::NUMERIC,
        (SELECT val FROM current_period) - (SELECT val FROM previous_period)::NUMERIC,
        CASE
          WHEN (SELECT val FROM previous_period) > 0 THEN
            ROUND((((SELECT val FROM current_period) - (SELECT val FROM previous_period)) * 100.0 /
                 NULLIF((SELECT val FROM previous_period), 0))::NUMERIC, 2)
          ELSE 0
        END;
    END;
    $$ LANGUAGE plpgsql;`,

    // Function: get_trend_percentage
    `CREATE OR REPLACE FUNCTION get_trend_percentage(
      user_id_param TEXT,
      metric_type_param TEXT,
      days_param INTEGER DEFAULT 30
    ) RETURNS NUMERIC AS $$
    DECLARE
      start_date TIMESTAMPTZ;
      current_val NUMERIC;
      previous_val NUMERIC;
    BEGIN
      start_date := NOW() - (days_param || 30) * INTERVAL '1 day';

      IF metric_type_param = 'profile_views' THEN
        SELECT * INTO current_val, previous_val
        FROM get_profile_views_trend(user_id_param, days_param)
        LIMIT 1;
      ELSIF metric_type_param = 'token_balance' THEN
        SELECT * INTO current_val, previous_val
        FROM get_token_balance_trend(user_id_param, days_param)
        LIMIT 1;
      ELSIF metric_type_param = 'revenue' THEN
        SELECT * INTO current_val, previous_val
        FROM get_revenue_trend(user_id_param, days_param)
        LIMIT 1;
      ELSE
        RETURN 0;
      END IF;

      RETURN COALESCE(current_val - previous_val, 0);
    END;
    $$ LANGUAGE plpgsql;`,

    // Function: get_trend_direction
    `CREATE OR REPLACE FUNCTION get_trend_direction(
      user_id_param TEXT,
      metric_type_param TEXT,
      days_param INTEGER DEFAULT 30
    ) RETURNS TEXT AS $$
    DECLARE
      percentage NUMERIC;
    BEGIN
      percentage := get_trend_percentage(user_id_param, metric_type_param, days_param);

      IF percentage > 5 THEN
        RETURN 'up';
      ELSIF percentage < -5 THEN
        RETURN 'down';
      ELSE
        RETURN 'stable';
      END IF;
    END;
    $$ LANGUAGE plpgsql;`,

    // ========================================
    // CREATE TECH PUBLIC PROFILES TABLE
    // ========================================

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

    // Indexes for tech_public_profiles
    `CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_specialties ON tech_public_profiles USING GIN(specialties);`,
    `CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_location ON tech_public_profiles USING GIN(location);`,
    `CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_rating ON tech_public_profiles(rating_average DESC);`,

    // ========================================
    // CREATE SERVICE REQUESTS TABLE
    // ========================================

    `CREATE TABLE IF NOT EXISTS service_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tech_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      assigned_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    );`,

    // Indexes for service_requests
    `CREATE INDEX IF NOT EXISTS idx_service_requests_tech_id ON service_requests(tech_id);`,
    `CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);`,

    // ========================================
    // CREATE STUDIO ROOMS TABLE
    // ========================================

    `CREATE TABLE IF NOT EXISTS studio_rooms (
      id TEXT PRIMARY KEY,
      studio_id TEXT NOT NULL,
      room_name TEXT,
      capacity INTEGER,
      hourly_rate NUMERIC(10, 2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Index for studio_rooms
    `CREATE INDEX IF NOT EXISTS idx_studio_rooms_studio_id ON studio_rooms(studio_id);`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    try {
      await sqlClient(sql);
      successCount++;
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${sqlStatements.length} statements executed...`);
      }
    } catch (err) {
      errorCount++;
      if (errorCount <= 10) {
        console.error(`   ⚠️  Statement ${i + 1} failed: ${err.message}`);
        console.error(`      SQL: ${sql.substring(0, 100)}...`);
      }
    }
  }

  console.log(`\n✅ Schema fixes complete!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount} (some may be expected)`);
  }
  console.log();
}

fixAllSchemaIssues().catch(console.error);
