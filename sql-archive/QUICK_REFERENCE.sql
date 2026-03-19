-- ============================================================================
-- SQL QUICK REFERENCE
-- ============================================================================
-- Common queries and commands for database management
-- ============================================================================

-- ============================================================================
-- TABLE INFO
-- ============================================================================

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Get table row counts
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Get table size
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- INDEX INFO
-- ============================================================================

-- List all indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check missing indexes (potential performance issues)
SELECT
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
ORDER BY n_distinct DESC;

-- ============================================================================
-- DATABASE OBJECTS
-- ============================================================================

-- List all functions
SELECT
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- List all triggers
SELECT
    event_object_table as table_name,
    trigger_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- USER DATA
-- ============================================================================

-- Count users by type
SELECT
    account_type,
    COUNT(*) as count
FROM profiles
GROUP BY account_type
ORDER BY count DESC;

-- Active sessions (if tracking)
SELECT
    user_id,
    last_active,
    EXTRACT(EPOCH FROM (NOW() - last_active))/60 as minutes_since_active
FROM profiles
WHERE last_active > NOW() - INTERVAL '1 hour'
ORDER BY last_active DESC;

-- ============================================================================
-- BOOKINGS
-- ============================================================================

-- Booking statistics
SELECT
    status,
    COUNT(*) as count,
    SUM(CASE WHEN start_time >= NOW() THEN 1 ELSE 0 END) as upcoming
FROM bookings
GROUP BY status;

-- Bookings by date range
SELECT
    DATE(start_time) as booking_date,
    COUNT(*) as total_bookings,
    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
FROM bookings
WHERE start_time >= NOW() - INTERVAL '30 days'
GROUP BY DATE(start_time)
ORDER BY booking_date DESC;

-- ============================================================================
-- MARKETPLACE
-- ============================================================================

-- Active marketplace items
SELECT
    category,
    status,
    COUNT(*) as count
FROM market_items
GROUP BY category, status
ORDER BY count DESC;

-- Items by price range
SELECT
    CASE
        WHEN price < 100 THEN 'Under $100'
        WHEN price < 500 THEN '$100-$500'
        WHEN price < 1000 THEN '$500-$1000'
        WHEN price < 5000 THEN '$1000-$5000'
        ELSE '$5000+'
    END as price_range,
    COUNT(*) as count
FROM market_items
WHERE status = 'active'
GROUP BY price_range
ORDER BY
    CASE
        WHEN price < 100 THEN 1
        WHEN price < 500 THEN 2
        WHEN price < 1000 THEN 3
        WHEN price < 5000 THEN 4
        ELSE 5
    END;

-- ============================================================================
-- SOCIAL FEED
-- ============================================================================

-- Post statistics
SELECT
    DATE(created_at) as post_date,
    COUNT(*) as total_posts,
    SUM(comment_count) as total_comments
FROM posts
WHERE deleted_at IS NULL
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY post_date DESC
LIMIT 30;

-- Most liked posts (last 7 days)
SELECT
    p.id,
    pr.display_name,
    p.content,
    p.like_count,
    p.comment_count,
    p.created_at
FROM posts p
LEFT JOIN profiles pr ON pr.user_id = p.user_id
WHERE p.deleted_at IS NULL
AND p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.like_count DESC
LIMIT 10;

-- ============================================================================
-- DATABASE VERIFICATION
-- ============================================================================

-- Check critical tables exist
DO $$
DECLARE
    table_name text;
    missing_tables text[] := '{}';
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'profiles', 'bookings', 'market_items', 'posts',
        'equipment_database', 'instrument_database'
    ]
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public' AND tablename = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All critical tables present ✓';
    END IF;
END $$;

-- Check table sizes
SELECT
    'Total database size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT
    'Largest table',
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC NULLS LAST
LIMIT 1;

-- ============================================================================
-- PERFORMANCE
-- ============================================================================

-- Slow queries (requires pg_stat_statements extension)
SELECT
    query,
    calls,
    total_time,
    mean_time,
    stddev_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table bloat (unused space)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- Vacuum analyze all tables (run periodically)
VACUUM ANALYZE;

-- Reindex specific table
REINDEX TABLE equipment_database;
REINDEX TABLE instrument_database;

-- Clean up old data (example: delete posts older than 1 year)
-- DELETE FROM posts WHERE created_at < NOW() - INTERVAL '1 year' AND deleted_at IS NOT NULL;

-- ============================================================================
-- EXPORT/IMPORT
-- ============================================================================

-- Export table to CSV
\copy (SELECT * FROM equipment_database) TO 'equipment_export.csv' CSV HEADER

-- Import from CSV
\copy equipment_database FROM 'equipment_import.csv' CSV HEADER

-- ============================================================================
-- USEFUL ONE-LINERS
-- ============================================================================

-- Current database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Database version
SELECT version();

-- Current user
SELECT current_user, session_user;

-- List all schemas
SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;
