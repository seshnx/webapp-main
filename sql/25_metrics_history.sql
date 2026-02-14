-- =====================================================
-- METRICS HISTORY & TREND TRACKING
-- =====================================================
-- This script creates a metrics history system to track
-- changes over time and calculate real trends instead of
-- hardcoded percentages.
--
-- Run this in Neon SQL Editor AFTER running 24_distribution_analytics.sql
-- =====================================================

-- =====================================================
-- CREATE METRICS_HISTORY TABLE
-- =====================================================
-- Stores daily snapshots of key metrics for trend calculation
CREATE TABLE IF NOT EXISTS metrics_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,

    -- Token balance metrics
    token_balance NUMERIC(12, 2) DEFAULT 0,

    -- Profile metrics
    profile_views INTEGER DEFAULT 0,

    -- Booking metrics
    pending_bookings INTEGER DEFAULT 0,
    active_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,

    -- Distribution metrics
    lifetime_streams BIGINT DEFAULT 0,
    lifetime_earnings NUMERIC(10, 2) DEFAULT 0,
    monthly_streams BIGINT DEFAULT 0,
    monthly_listeners INTEGER DEFAULT 0,

    -- Social metrics
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,

    -- Timestamps
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add recorded_date column if table was created from previous version
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'metrics_history' AND column_name = 'recorded_date'
    ) THEN
        ALTER TABLE metrics_history ADD COLUMN recorded_date DATE DEFAULT CURRENT_DATE;

        -- Create unique constraint after adding the column
        ALTER TABLE metrics_history ADD CONSTRAINT metrics_history_user_date_unique UNIQUE(user_id, recorded_date);
    END IF;
END $$;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_metrics_history_user_id ON metrics_history(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded_at ON metrics_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_history_user_date ON metrics_history(user_id, recorded_date DESC);

-- =====================================================
-- CREATE AUTO-RECORD METRICS FUNCTION
-- =====================================================
-- Function to record current metrics for a user
CREATE OR REPLACE FUNCTION record_user_metrics(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO metrics_history (
        user_id,
        token_balance,
        profile_views,
        pending_bookings,
        lifetime_streams,
        lifetime_earnings,
        monthly_streams,
        monthly_listeners,
        followers_count,
        following_count,
        posts_count
    )
    SELECT
        p_user_id,
        COALESCE((SELECT balance FROM wallets WHERE user_id = p_user_id), 0),
        COALESCE((SELECT profile_views FROM profiles WHERE user_id = p_user_id), 0),
        COALESCE((
            SELECT COUNT(*)
            FROM bookings
            WHERE (sender_id::TEXT = p_user_id OR target_id::TEXT = p_user_id OR studio_owner_id::TEXT = p_user_id)
            AND status = 'Pending'
        ), 0),
        COALESCE((SELECT SUM(lifetime_streams) FROM distribution_stats WHERE user_id = p_user_id), 0),
        COALESCE((SELECT SUM(lifetime_earnings) FROM distribution_stats WHERE user_id = p_user_id), 0),
        COALESCE((SELECT SUM(monthly_streams) FROM distribution_stats WHERE user_id = p_user_id), 0),
        COALESCE((SELECT AVG(monthly_listeners) FROM distribution_stats WHERE user_id = p_user_id), 0),
        COALESCE((SELECT followers_count FROM profiles WHERE user_id = p_user_id), 0),
        COALESCE((SELECT following_count FROM profiles WHERE user_id = p_user_id), 0),
        COALESCE((SELECT posts_count FROM profiles WHERE user_id = p_user_id), 0)
    ON CONFLICT (user_id, recorded_date)
    DO UPDATE SET
        token_balance = EXCLUDED.token_balance,
        profile_views = EXCLUDED.profile_views,
        pending_bookings = EXCLUDED.pending_bookings,
        lifetime_streams = EXCLUDED.lifetime_streams,
        lifetime_earnings = EXCLUDED.lifetime_earnings,
        monthly_streams = EXCLUDED.monthly_streams,
        monthly_listeners = EXCLUDED.monthly_listeners,
        followers_count = EXCLUDED.followers_count,
        following_count = EXCLUDED.following_count,
        posts_count = EXCLUDED.posts_count,
        recorded_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TREND CALCULATION FUNCTIONS
-- =====================================================

-- Function to calculate token balance trend (vs last period)
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

-- Function to calculate profile views trend
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

-- Function to calculate revenue trend for labels
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

-- =====================================================
-- GET TREND PERCENTAGE HELPER FUNCTION
-- =====================================================
-- Simplified function that just returns the percentage for UI display
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

-- =====================================================
-- GET TREND DIRECTION HELPER FUNCTION
-- =====================================================
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

-- =====================================================
-- SCHEDULED TASK: RECORD METRICS DAILY
-- =====================================================
-- Note: Neon doesn't have pg_cron like standard PostgreSQL.
-- You'll need to call record_user_metrics() from your application
-- or use an external scheduler (like Vercel Cron Jobs)
--
-- Example application-level implementation:
-- - Call record_user_metrics(userId) when user logs in
-- - Create a daily cron job endpoint: POST /api/cron/record-metrics
-- - Use Vercel Cron Jobs to hit the endpoint daily

-- =====================================================
-- BACKFILL HISTORICAL DATA (OPTIONAL)
-- =====================================================
-- Uncomment to backfill data from existing records

/*
INSERT INTO metrics_history (user_id, token_balance, profile_views, pending_bookings, recorded_at)
SELECT
    cu.id as user_id,
    COALESCE(w.balance, 0) as token_balance,
    COALESCE(p.profile_views, 0) as profile_views,
    COALESCE((
        SELECT COUNT(*)
        FROM bookings b
        WHERE (b.sender_id::TEXT = cu.id OR b.target_id::TEXT = cu.id OR b.studio_owner_id::TEXT = cu.id)
        AND b.status = 'Pending'
    ), 0) as pending_bookings,
    NOW() - INTERVAL '1 day' -- Start with yesterday's data
FROM clerk_users cu
LEFT JOIN wallets w ON w.user_id = cu.id
LEFT JOIN profiles p ON p.user_id = cu.id
ON CONFLICT (user_id, CURRENT_DATE - INTERVAL '1 day') DO NOTHING;
*/

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Test the functions with a user ID (replace with actual user_id)
-- SELECT record_user_metrics('user_123');
-- SELECT * FROM get_token_balance_trend('user_123', 30);
-- SELECT * FROM get_profile_views_trend('user_123', 30);
-- SELECT get_trend_percentage('user_123', 'token_balance', 30);
