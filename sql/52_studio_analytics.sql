-- =====================================================
-- STUDIO ANALYTICS VIEWS - SQL Editor Script
-- =====================================================
-- This script creates materialized views and helper functions
-- for Studio Ops analytics and reporting
-- =====================================================
-- Materialized views provide fast read access to aggregated data
-- Refresh hourly via Convex action or cron job
-- =====================================================

-- =====================================================
-- BOOKING STATS MATERIALIZED VIEW
-- =====================================================
-- Monthly revenue, bookings, and client metrics per studio
CREATE MATERIALIZED VIEW IF NOT EXISTS booking_stats AS
SELECT
    b.studio_owner_id,
    DATE_TRUNC('month', b.date::timestamp) AS month,
    COUNT(*) AS total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'Completed') AS completed_bookings,
    COUNT(*) FILTER (WHERE b.status = 'Cancelled') AS cancelled_bookings,
    COUNT(*) FILTER (WHERE b.status = 'Pending') AS pending_bookings,
    COUNT(*) FILTER (WHERE b.status = 'Confirmed') AS confirmed_bookings,
    COALESCE(SUM(b.offer_amount), 0) AS total_revenue,
    COALESCE(SUM(b.offer_amount) FILTER (WHERE b.status = 'Completed'), 0) AS confirmed_revenue,
    COALESCE(SUM(b.offer_amount) FILTER (WHERE b.status = 'Pending' OR b.status = 'Confirmed'), 0) AS pending_revenue,
    COUNT(DISTINCT b.sender_id) AS unique_clients,
    COALESCE(AVG(b.offer_amount) FILTER (WHERE b.status = 'Completed'), 0) AS avg_booking_value,
    COALESCE(SUM(b.duration_hours) FILTER (WHERE b.status = 'Completed'), 0) AS total_hours_booked
FROM bookings b
WHERE b.date IS NOT NULL
    AND b.studio_owner_id IS NOT NULL
GROUP BY b.studio_owner_id, DATE_TRUNC('month', b.date::timestamp);

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_stats_studio_month ON booking_stats(studio_owner_id, month);
CREATE INDEX IF NOT EXISTS idx_booking_stats_month ON booking_stats(month);

-- =====================================================
-- CLIENT LIFETIME VALUE (CLV) VIEW
-- =====================================================
-- Track client value and engagement metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS client_lifetime_value AS
SELECT
    sc.id AS client_id,
    sc.studio_id,
    sc.name,
    sc.email,
    sc.client_type,
    sc.tags,
    sc.total_bookings,
    sc.total_spent,
    sc.first_booking_date,
    sc.last_booking_date,
    EXTRACT(DAY FROM (NOW() - sc.last_booking_date))::INTEGER AS days_since_last_booking,
    COALESCE(sc.total_spent / NULLIF(sc.total_bookings, 0), 0) AS avg_booking_value,
    CASE
        WHEN sc.total_bookings = 0 THEN 'New'
        WHEN sc.total_bookings BETWEEN 1 AND 3 THEN 'Occasional'
        WHEN sc.total_bookings BETWEEN 4 AND 10 THEN 'Regular'
        ELSE 'VIP'
    END AS engagement_tier
FROM studio_clients sc
WHERE sc.studio_id IS NOT NULL
    AND sc.client_type != 'inactive';

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_lifetime_value_id ON client_lifetime_value(client_id);
CREATE INDEX IF NOT EXISTS idx_client_lifetime_value_studio_id ON client_lifetime_value(studio_id);
CREATE INDEX IF NOT EXISTS idx_client_lifetime_value_engagement ON client_lifetime_value(engagement_tier);
CREATE INDEX IF NOT EXISTS idx_clv_total_spent ON client_lifetime_value(total_spent DESC);

-- =====================================================
-- ROOM UTILIZATION VIEW
-- =====================================================
-- Track studio room usage and utilization rates (when rooms are implemented)
CREATE MATERIALIZED VIEW IF NOT EXISTS room_utilization AS
SELECT
    b.studio_owner_id,
    b.venue_id,
    DATE_TRUNC('month', b.date::timestamp) AS month,
    COUNT(*) AS total_sessions,
    COALESCE(SUM(b.duration_hours), 0) AS total_hours,
    COALESCE(SUM(b.offer_amount), 0) AS revenue,
    COUNT(*) FILTER (WHERE b.status = 'Completed') AS completed_sessions,
    -- Utilization rate will be calculated based on total available hours
    COALESCE(SUM(b.duration_hours) FILTER (WHERE b.status = 'Completed'), 0) AS utilized_hours
FROM bookings b
WHERE b.date IS NOT NULL
    AND b.venue_id IS NOT NULL
    AND b.studio_owner_id IS NOT NULL
GROUP BY b.studio_owner_id, b.venue_id, DATE_TRUNC('month', b.date::timestamp);

CREATE UNIQUE INDEX IF NOT EXISTS idx_room_utilization_studio_room_month ON room_utilization(studio_owner_id, venue_id, month);
CREATE INDEX IF NOT EXISTS idx_room_utilization_month ON room_utilization(month);

-- =====================================================
-- STAFF PERFORMANCE VIEW
-- =====================================================
-- Staff hours, earnings, and session counts
CREATE MATERIALIZED VIEW IF NOT EXISTS staff_performance AS
SELECT
    ss.id AS staff_id,
    ss.studio_id,
    ss.name,
    ss.role,
    ss.status,
    COUNT(ssh.id) AS total_shifts,
    COALESCE(SUM(ssh.hours_worked), 0) AS total_hours_worked,
    COALESCE(SUM(ssh.pay_amount), 0) AS total_earnings,
    COUNT(DISTINCT ssh.booking_id) AS sessions_worked,
    COALESCE(AVG(ssh.hours_worked), 0) AS avg_shift_hours,
    MIN(ssh.shift_date) AS first_shift,
    MAX(ssh.shift_date) AS last_shift
FROM studio_staff ss
LEFT JOIN staff_shifts ssh ON ss.id = ssh.staff_id
WHERE ss.studio_id IS NOT NULL
GROUP BY ss.id, ss.studio_id, ss.name, ss.role, ss.status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_performance_staff_id ON staff_performance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_studio_id ON staff_performance(studio_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_role ON staff_performance(role);

-- =====================================================
-- INVENTORY STATUS VIEW
-- =====================================================
-- Current inventory levels with alerts
CREATE MATERIALIZED VIEW IF NOT EXISTS inventory_status AS
SELECT
    ii.id AS item_id,
    ii.studio_id,
    ii.name,
    ii.category,
    ii.current_stock,
    ii.min_stock_level,
    ii.max_stock_level,
    ii.unit,
    ii.unit_cost,
    COALESCE(ii.current_stock * ii.unit_cost, 0) AS inventory_value,
    CASE
        WHEN ii.current_stock = 0 THEN 'out_of_stock'
        WHEN ii.current_stock <= ii.min_stock_level THEN 'low_stock'
        WHEN ii.max_stock_level IS NOT NULL AND ii.current_stock >= ii.max_stock_level THEN 'overstocked'
        ELSE 'normal'
    END AS stock_status,
    EXTRACT(DAY FROM (NOW() - ii.last_restocked_date))::INTEGER AS days_since_restock
FROM inventory_items ii
WHERE ii.studio_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_status_item_id ON inventory_status(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status_studio_id ON inventory_status(studio_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status_stock_status ON inventory_status(stock_status);
CREATE INDEX IF NOT EXISTS idx_inventory_status_category ON inventory_status(category);

-- =====================================================
-- TASK OVERVIEW VIEW
-- =====================================================
-- Task summary by studio
CREATE MATERIALIZED VIEW IF NOT EXISTS task_overview AS
SELECT
    st.studio_id,
    COUNT(*) FILTER (WHERE st.status = 'todo') AS pending_tasks,
    COUNT(*) FILTER (WHERE st.status = 'in_progress') AS in_progress_tasks,
    COUNT(*) FILTER (WHERE st.status = 'completed') AS completed_tasks,
    COUNT(*) FILTER (WHERE st.status = 'todo' AND st.due_date < NOW()) AS overdue_tasks,
    COUNT(*) FILTER (WHERE st.priority = 'urgent' AND st.status NOT IN ('completed', 'cancelled')) AS urgent_tasks,
    COUNT(*) FILTER (WHERE st.due_date >= NOW() AND st.due_date <= NOW() + INTERVAL '7 days' AND st.status NOT IN ('completed', 'cancelled')) AS due_this_week
FROM studio_tasks st
WHERE st.studio_id IS NOT NULL
GROUP BY st.studio_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_overview_studio_id ON task_overview(studio_id);

-- =====================================================
-- REFRESH FUNCTIONS
-- =====================================================

-- Function to refresh all materialized views concurrently
CREATE OR REPLACE FUNCTION refresh_studio_analytics()
RETURNS void AS $$
BEGIN
    -- Refresh booking stats
    REFRESH MATERIALIZED VIEW CONCURRENTLY booking_stats;

    -- Refresh client LTV
    REFRESH MATERIALIZED VIEW CONCURRENTLY client_lifetime_value;

    -- Refresh room utilization
    REFRESH MATERIALIZED VIEW CONCURRENTLY room_utilization;

    -- Refresh staff performance
    REFRESH MATERIALIZED VIEW CONCURRENTLY staff_performance;

    -- Refresh inventory status
    REFRESH MATERIALIZED VIEW CONCURRENTLY inventory_status;

    -- Refresh task overview
    REFRESH MATERIALIZED VIEW CONCURRENTLY task_overview;

    RAISE NOTICE 'All studio analytics materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate utilization rate for a room and time period
CREATE OR REPLACE FUNCTION calculate_room_utilization(
    p_studio_id UUID,
    p_venue_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS NUMERIC(4, 2) AS $$
DECLARE
    v_available_hours NUMERIC;
    v_booked_hours NUMERIC;
    v_utilization NUMERIC;
BEGIN
    -- Assuming 10-hour operational day (9am-7pm)
    v_available_hours := EXTRACT(DAY FROM (p_end_date - p_start_date)) * 10;

    SELECT COALESCE(SUM(duration_hours), 0)
    INTO v_booked_hours
    FROM bookings
    WHERE studio_owner_id = p_studio_id
        AND venue_id = p_venue_id
        AND date::date BETWEEN p_start_date AND p_end_date
        AND status IN ('Confirmed', 'Completed');

    v_utilization := CASE
        WHEN v_available_hours > 0 THEN (v_booked_hours / v_available_hours) * 100
        ELSE 0
    END;

    RETURN v_utilization;
END;
$$ LANGUAGE plpgsql;

-- Get top clients by revenue for a studio
CREATE OR REPLACE FUNCTION get_top_clients(
    p_studio_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    client_id UUID,
    client_name TEXT,
    email TEXT,
    total_spent NUMERIC,
    total_bookings INTEGER,
    avg_booking_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.id AS client_id,
        sc.name AS client_name,
        sc.email,
        sc.total_spent,
        sc.total_bookings,
        sc.total_spent / NULLIF(sc.total_bookings, 0) AS avg_booking_value
    FROM studio_clients sc
    WHERE sc.studio_id = p_studio_id
        AND sc.total_bookings > 0
    ORDER BY sc.total_spent DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON MATERIALIZED VIEW booking_stats IS 'Monthly revenue and booking metrics per studio - refresh hourly';
COMMENT ON MATERIALIZED VIEW client_lifetime_value IS 'Client value and engagement analysis with tier classification';
COMMENT ON MATERIALIZED VIEW room_utilization IS 'Studio room usage and utilization rates by month';
COMMENT ON MATERIALIZED VIEW staff_performance IS 'Staff hours, earnings, and session metrics';
COMMENT ON MATERIALIZED VIEW inventory_status IS 'Current inventory levels with stock status alerts';
COMMENT ON MATERIALIZED VIEW task_overview IS 'Task summary counts by studio - pending, in progress, overdue';

COMMENT ON FUNCTION refresh_studio_analytics() IS 'Refresh all studio analytics materialized views concurrently';
COMMENT ON FUNCTION calculate_room_utilization() IS 'Calculate utilization percentage for a room in a date range';
COMMENT ON FUNCTION get_top_clients() IS 'Return top clients by total revenue for a studio';

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- 1. Run this script once to create all materialized views
-- 2. Schedule refresh_studio_analytics() to run hourly:
--    - Via Convex action
--    - Via cron job: 0 * * * * psql -d your_database -c "SELECT refresh_studio_analytics();"
-- 3. Query materialized views directly for fast analytics:
--    SELECT * FROM booking_stats WHERE studio_owner_id = '...' AND month >= '2025-01-01';
-- 4. Views refresh concurrently without blocking reads

-- =====================================================
-- END OF STUDIO ANALYTICS VIEWS
-- =====================================================
