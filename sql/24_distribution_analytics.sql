-- =====================================================
-- DISTRIBUTION ANALYTICS ENHANCEMENT
-- =====================================================
-- This script adds territory/geography tracking to distribution_stats
-- and creates aggregate views for dashboard analytics
--
-- Run this in Neon SQL Editor AFTER running 43_label_critical.sql
-- =====================================================

-- =====================================================
-- ADD MISSING COLUMNS TO DISTRIBUTION_STATS
-- =====================================================
-- First, ensure all required columns exist
ALTER TABLE distribution_stats
ADD COLUMN IF NOT EXISTS territory TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS country_code CHAR(2) DEFAULT 'US',
ADD COLUMN IF NOT EXISTS monthly_listeners INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_streams BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earnings NUMERIC(10, 2) DEFAULT 0;

-- Add index for territory queries
CREATE INDEX IF NOT EXISTS idx_distribution_stats_territory ON distribution_stats(territory);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_country_code ON distribution_stats(country_code);

-- =====================================================
-- CREATE AGGREGATED VIEWS FOR DASHBOARD
-- =====================================================

-- View: Store performance by platform (for store split chart)
CREATE OR REPLACE VIEW distribution_store_performance AS
SELECT
    user_id,
    platform,
    SUM(streams) as total_streams,
    SUM(revenue) as total_revenue,
    SUM(lifetime_streams) as lifetime_streams,
    SUM(lifetime_earnings) as lifetime_earnings,
    COUNT(DISTINCT release_id) as release_count
FROM distribution_stats
GROUP BY user_id, platform;

-- View: Territory performance (for geography map)
CREATE OR REPLACE VIEW distribution_territory_performance AS
SELECT
    user_id,
    territory,
    country_code,
    SUM(streams) as total_streams,
    SUM(revenue) as total_revenue,
    SUM(monthly_listeners) as total_monthly_listeners,
    COUNT(DISTINCT platform) as platform_count
FROM distribution_stats
GROUP BY user_id, territory, country_code;

-- View: User distribution summary (for KPI cards)
CREATE OR REPLACE VIEW distribution_user_summary AS
SELECT
    user_id,
    SUM(lifetime_streams) as lifetime_streams,
    SUM(lifetime_earnings) as lifetime_earnings,
    SUM(monthly_streams) as monthly_streams,
    AVG(monthly_listeners) as monthly_listeners,
    COUNT(DISTINCT release_id) as total_releases,
    COUNT(DISTINCT platform) as platform_count,
    COUNT(DISTINCT territory) as territory_count
FROM distribution_stats
GROUP BY user_id;

-- =====================================================
-- CREATE STORE PERFORMANCE PERCENTAGE FUNCTION
-- =====================================================
-- Function to get store performance as percentages for dashboard
CREATE OR REPLACE FUNCTION get_store_performance_percentages(p_user_id TEXT)
RETURNS TABLE (
    platform TEXT,
    percentage NUMERIC,
    streams BIGINT,
    revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH total_streams AS (
        SELECT COALESCE(SUM(streams), 0) as total
        FROM distribution_stats
        WHERE user_id = p_user_id
    )
    SELECT
        ds.platform,
        ROUND((ds.streams::NUMERIC / NULLIF(ts.total, 0)) * 100, 2) as percentage,
        ds.streams,
        ds.revenue
    FROM distribution_stats ds
    CROSS JOIN total_streams ts
    WHERE ds.user_id = p_user_id
    AND ds.streams > 0
    ORDER BY ds.streams DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TERRITORY PERFORMANCE FUNCTION
-- =====================================================
-- Function to get top territories for dashboard
CREATE OR REPLACE FUNCTION get_top_territories(p_user_id TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    territory TEXT,
    country_code TEXT,
    streams BIGINT,
    revenue NUMERIC,
    percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH total_streams AS (
        SELECT COALESCE(SUM(streams), 0) as total
        FROM distribution_stats
        WHERE user_id = p_user_id
    )
    SELECT
        ds.territory,
        ds.country_code,
        SUM(ds.streams) as streams,
        SUM(ds.revenue) as revenue,
        ROUND((SUM(ds.streams)::NUMERIC / NULLIF((SELECT total FROM total_streams), 0)) * 100, 2) as percentage
    FROM distribution_stats ds
    WHERE ds.user_id = p_user_id
    AND ds.streams > 0
    GROUP BY ds.territory, ds.country_code
    ORDER BY streams DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PENDING BOOKINGS COUNT FUNCTION
-- =====================================================
-- Function to get count of pending bookings for a user
CREATE OR REPLACE FUNCTION get_pending_bookings_count(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM bookings
        WHERE (sender_id::TEXT = p_user_id OR target_id::TEXT = p_user_id OR studio_owner_id::TEXT = p_user_id)
        AND status = 'Pending'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA INSERTION (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment to insert sample data for testing the dashboard

/*
-- Insert sample distribution stats for testing
INSERT INTO distribution_stats (user_id, platform, streams, revenue, lifetime_streams, lifetime_earnings, monthly_streams, monthly_listeners, territory, country_code, period_start, period_end) VALUES
-- Store performance data
('user_123', 'Spotify', 650000, 3250.00, 650000, 3250.00, 65000, 12500, 'USA', 'US', '2025-01-01', '2025-01-31'),
('user_123', 'Apple Music', 200000, 1200.00, 200000, 1200.00, 20000, 4000, 'USA', 'US', '2025-01-01', '2025-01-31'),
('user_123', 'TikTok', 100000, 500.00, 100000, 500.00, 10000, 8000, 'USA', 'US', '2025-01-01', '2025-01-31'),
('user_123', 'YouTube Music', 50000, 250.00, 50000, 250.00, 5000, 2000, 'USA', 'US', '2025-01-01', '2025-01-31'),

-- Territory data
('user_123', 'Spotify', 450000, 2250.00, 450000, 2250.00, 45000, 8500, 'USA', 'US', '2025-01-01', '2025-01-31'),
('user_123', 'Apple Music', 150000, 900.00, 150000, 900.00, 15000, 3000, 'USA', 'US', '2025-01-01', '2025-01-31'),
('user_123', 'Spotify', 100000, 500.00, 100000, 500.00, 10000, 2000, 'UK', 'GB', '2025-01-01', '2025-01-31'),
('user_123', 'Apple Music', 30000, 180.00, 30000, 180.00, 3000, 600, 'UK', 'GB', '2025-01-01', '2025-01-31'),
('user_123', 'Spotify', 80000, 400.00, 80000, 400.00, 8000, 1500, 'Brazil', 'BR', '2025-01-01', '2025-01-31'),
('user_123', 'TikTok', 20000, 100.00, 20000, 100.00, 2000, 1600, 'Brazil', 'BR', '2025-01-01', '2025-01-31')
ON CONFLICT (user_id, platform, period_start) DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup

-- Check distribution_stats columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'distribution_stats' ORDER BY ordinal_position;

-- Check views
-- SELECT table_name FROM information_schema.views WHERE table_name LIKE 'distribution_%';

-- Check functions
-- SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%distribution%' OR routine_name LIKE '%booking%';
