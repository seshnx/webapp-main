const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function runMigration() {
  console.log('Running migration: Fix get_trend_percentage functions...');

  try {
    // Drop existing functions first (note the different param names in old version)
    console.log('Dropping existing functions...');
    await sql`DROP FUNCTION IF EXISTS get_trend_percentage(text, text, integer);`;
    await sql`DROP FUNCTION IF EXISTS get_trend_direction(text, text, integer);`;
    await sql`DROP FUNCTION IF EXISTS get_token_balance_trend(TEXT, INTEGER);`;
    await sql`DROP FUNCTION IF EXISTS get_profile_views_trend(TEXT, INTEGER);`;
    await sql`DROP FUNCTION IF EXISTS get_revenue_trend(TEXT, INTEGER);`;

    // Re-create get_trend_percentage function (simpler version that calls trend functions)
    await sql`
      CREATE OR REPLACE FUNCTION get_token_balance_trend(p_user_id TEXT, p_days INTEGER DEFAULT 30)
      RETURNS TABLE (
          current_value NUMERIC,
          previous_value NUMERIC,
          change_amount NUMERIC,
          change_percent NUMERIC,
          trend_direction TEXT
      ) AS $$
      BEGIN
          RETURN QUERY
          WITH current_metrics AS (
              SELECT token_balance
              FROM metrics_history
              WHERE user_id = p_user_id
              ORDER BY recorded_at DESC
              LIMIT 1
          ),
          previous_metrics AS (
              SELECT token_balance
              FROM metrics_history
              WHERE user_id = p_user_id
              AND recorded_at < NOW() - CONCAT(p_days, ' days')::INTERVAL
              ORDER BY recorded_at DESC
              LIMIT 1
          )
          SELECT
              COALESCE(c.token_balance, 0),
              COALESCE(p.token_balance, 0),
              COALESCE(c.token_balance, 0) - COALESCE(p.token_balance, 0),
              CASE
                  WHEN COALESCE(p.token_balance, 0) = 0 THEN 0
                  ELSE ROUND(((COALESCE(c.token_balance, 0) - COALESCE(p.token_balance, 0)) / NULLIF(p.token_balance, 0)) * 100, 2)
              END,
              CASE
                  WHEN COALESCE(c.token_balance, 0) > COALESCE(p.token_balance, 0) THEN 'up'
                  WHEN COALESCE(c.token_balance, 0) < COALESCE(p.token_balance, 0) THEN 'down'
                  ELSE 'stable'
              END
          FROM current_metrics c
          CROSS JOIN previous_metrics p;
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✓ get_token_balance_trend updated');

    await sql`
      CREATE OR REPLACE FUNCTION get_profile_views_trend(p_user_id TEXT, p_days INTEGER DEFAULT 30)
      RETURNS TABLE (
          current_value INTEGER,
          previous_value INTEGER,
          change_amount INTEGER,
          change_percent NUMERIC,
          trend_direction TEXT
      ) AS $$
      BEGIN
          RETURN QUERY
          WITH current_metrics AS (
              SELECT profile_views
              FROM metrics_history
              WHERE user_id = p_user_id
              ORDER BY recorded_at DESC
              LIMIT 1
          ),
          previous_metrics AS (
              SELECT profile_views
              FROM metrics_history
              WHERE user_id = p_user_id
              AND recorded_at < NOW() - CONCAT(p_days, ' days')::INTERVAL
              ORDER BY recorded_at DESC
              LIMIT 1
          )
          SELECT
              COALESCE(c.profile_views, 0)::INTEGER,
              COALESCE(p.profile_views, 0)::INTEGER,
              COALESCE(c.profile_views, 0)::INTEGER - COALESCE(p.profile_views, 0)::INTEGER,
              CASE
                  WHEN COALESCE(p.profile_views, 0) = 0 THEN 0
                  ELSE ROUND(((COALESCE(c.profile_views, 0)::NUMERIC - COALESCE(p.profile_views, 0)::NUMERIC) / NULLIF(p.profile_views, 0)::NUMERIC) * 100, 2)
              END,
              CASE
                  WHEN COALESCE(c.profile_views, 0) > COALESCE(p.profile_views, 0) THEN 'up'
                  WHEN COALESCE(c.profile_views, 0) < COALESCE(p.profile_views, 0) THEN 'down'
                  ELSE 'stable'
              END
          FROM current_metrics c
          CROSS JOIN previous_metrics p;
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✓ get_profile_views_trend updated');

    await sql`
      CREATE OR REPLACE FUNCTION get_revenue_trend(p_user_id TEXT, p_days INTEGER DEFAULT 30)
      RETURNS TABLE (
          current_value NUMERIC,
          previous_value NUMERIC,
          change_amount NUMERIC,
          change_percent NUMERIC,
          trend_direction TEXT
      ) AS $$
      BEGIN
          RETURN QUERY
          WITH current_revenue AS (
              SELECT COALESCE(SUM(lifetime_earnings), 0) as revenue
              FROM distribution_stats
              WHERE user_id = p_user_id
          ),
          previous_revenue AS (
              SELECT COALESCE(lifetime_earnings, 0) as revenue
              FROM metrics_history
              WHERE user_id = p_user_id
              AND recorded_at < NOW() - CONCAT(p_days, ' days')::INTERVAL
              ORDER BY recorded_at DESC
              LIMIT 1
          )
          SELECT
              COALESCE(c.revenue, 0),
              COALESCE(p.revenue, 0),
              COALESCE(c.revenue, 0) - COALESCE(p.revenue, 0),
              CASE
                  WHEN COALESCE(p.revenue, 0) = 0 THEN 0
                  ELSE ROUND(((COALESCE(c.revenue, 0) - COALESCE(p.revenue, 0)) / NULLIF(p.revenue, 0)) * 100, 2)
              END,
              CASE
                  WHEN COALESCE(c.revenue, 0) > COALESCE(p.revenue, 0) THEN 'up'
                  WHEN COALESCE(c.revenue, 0) < COALESCE(p.revenue, 0) THEN 'down'
                  ELSE 'stable'
              END
          FROM current_revenue c
          CROSS JOIN previous_revenue p;
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✓ get_revenue_trend updated');

    // Create get_trend_percentage helper function
    await sql`
      CREATE OR REPLACE FUNCTION get_trend_percentage(p_user_id TEXT, p_metric TEXT, p_days INTEGER DEFAULT 30)
      RETURNS NUMERIC AS $$
      DECLARE
          v_result NUMERIC;
      BEGIN
          CASE p_metric
              WHEN 'token_balance' THEN
                  SELECT change_percent INTO v_result
                  FROM get_token_balance_trend(p_user_id, p_days)
                  LIMIT 1;
              WHEN 'profile_views' THEN
                  SELECT change_percent INTO v_result
                  FROM get_profile_views_trend(p_user_id, p_days)
                  LIMIT 1;
              WHEN 'revenue' THEN
                  SELECT change_percent INTO v_result
                  FROM get_revenue_trend(p_user_id, p_days)
                  LIMIT 1;
              ELSE
                  v_result := 0;
          END CASE;

          RETURN COALESCE(v_result, 0);
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✓ get_trend_percentage updated');

    // Create get_trend_direction helper function
    await sql`
      CREATE OR REPLACE FUNCTION get_trend_direction(p_user_id TEXT, p_metric TEXT, p_days INTEGER DEFAULT 30)
      RETURNS TEXT AS $$
      DECLARE
          v_result TEXT;
      BEGIN
          CASE p_metric
              WHEN 'token_balance' THEN
                  SELECT trend_direction INTO v_result
                  FROM get_token_balance_trend(p_user_id, p_days)
                  LIMIT 1;
              WHEN 'profile_views' THEN
                  SELECT trend_direction INTO v_result
                  FROM get_profile_views_trend(p_user_id, p_days)
                  LIMIT 1;
              WHEN 'revenue' THEN
                  SELECT trend_direction INTO v_result
                  FROM get_revenue_trend(p_user_id, p_days)
                  LIMIT 1;
              ELSE
                  v_result := 'stable';
          END CASE;

          RETURN COALESCE(v_result, 'stable');
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✓ get_trend_direction updated');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
