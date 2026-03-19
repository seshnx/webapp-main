-- =====================================================
-- STUDIO OPS BOOKING ENHANCEMENTS - SQL Migration Script
-- =====================================================
-- This script adds new columns to existing tables
-- to support Studio Ops expansion features
-- =====================================================
-- Run this after the base bookings_module_fixed.sql is already in place
-- =====================================================

-- =====================================================
-- EXTEND BOOKINGS TABLE
-- =====================================================
-- Add check-in/check-out tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_duration_hours NUMERIC(4, 2);

-- Add notes fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add booking source tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT
    CHECK (source IN ('web', 'app', 'phone', 'email', 'walk_in', 'referral'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_at ON bookings(check_in_at)
    WHERE check_in_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);

-- =====================================================
-- EXTEND BLOCKED_DATES TABLE
-- =====================================================
-- Add recurrence rule support for recurring blocks
ALTER TABLE blocked_dates ADD COLUMN IF NOT EXISTS recurrence_rule JSONB;

-- Add index for queries checking active blocks
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- =====================================================
-- CREATE STUDIO_OPS_HELPER FUNCTIONS
-- =====================================================

-- Function to calculate actual duration from check-in/out times
CREATE OR REPLACE FUNCTION calculate_actual_booking_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_in_at IS NOT NULL AND NEW.check_out_at IS NOT NULL THEN
        NEW.actual_duration_hours := EXTRACT(EPOCH FROM (NEW.check_out_at - NEW.check_in_at)) / 3600;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate duration
CREATE TRIGGER trigger_calculate_actual_booking_duration
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.check_in_at IS NOT NULL AND NEW.check_out_at IS NOT NULL)
    EXECUTE FUNCTION calculate_actual_booking_duration();

-- Function to update client booking stats when booking is completed
CREATE OR REPLACE FUNCTION update_client_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update on status change to Completed
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Update total_bookings and total_spent for the client
        UPDATE studio_clients
        SET
            total_bookings = total_bookings + 1,
            total_spent = total_spent + COALESCE(NEW.offer_amount, 0),
            last_booking_date = NEW.date::date
        WHERE studio_id = NEW.studio_owner_id
            AND client_id = NEW.sender_id;

        -- Update first_booking_date if this is their first booking
        UPDATE studio_clients
        SET first_booking_date = NEW.date::date
        WHERE studio_id = NEW.studio_owner_id
            AND client_id = NEW.sender_id
            AND first_booking_date IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for client stats (will be active once studio_clients table exists)
-- Note: This trigger will only work if studio_clients table exists
-- Commented out to avoid errors, uncomment after CRM module is deployed:
/*
CREATE TRIGGER trigger_update_client_booking_stats
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_client_booking_stats();
*/

-- =====================================================
-- HELPER QUERIES FOR COMMON OPERATIONS
-- =====================================================

-- View for active bookings with check-in status
CREATE OR REPLACE VIEW active_bookings_with_checkin AS
SELECT
    b.id,
    b.sender_id,
    b.sender_name,
    b.studio_owner_id,
    b.type,
    b.date,
    b.start_time,
    b.end_time,
    b.status,
    b.offer_amount,
    b.check_in_at,
    b.check_out_at,
    b.actual_duration_hours,
    b.source,
    CASE
        WHEN b.check_in_at IS NOT NULL AND b.check_out_at IS NULL THEN 'checked_in'
        WHEN b.check_in_at IS NOT NULL AND b.check_out_at IS NOT NULL THEN 'completed'
        WHEN b.start_time <= NOW() AND b.status = 'Confirmed' THEN 'should_check_in'
        ELSE 'upcoming'
    END AS check_in_status
FROM bookings b
WHERE b.date::date >= CURRENT_DATE - INTERVAL '7 days'
    AND b.status IN ('Confirmed', 'In Progress', 'Completed')
ORDER BY b.start_time;

-- View for bookings needing action
CREATE OR REPLACE VIEW bookings_needing_action AS
SELECT
    id,
    sender_id,
    sender_name,
    studio_owner_id,
    type,
    date,
    start_time,
    status,
    source,
    CASE
        WHEN status = 'Pending' AND start_time < NOW() + INTERVAL '24 hours' THEN 'urgent_response_needed'
        WHEN status = 'Confirmed' AND check_in_at IS NULL AND start_time < NOW() THEN 'overdue_check_in'
        WHEN status = 'Confirmed' AND check_out_at IS NOT NULL AND check_in_at IS NULL THEN 'overdue_check_in'
        WHEN status = 'In Progress' AND end_time < NOW() AND check_out_at IS NULL THEN 'overdue_check_out'
        WHEN check_out_at IS NOT NULL AND actual_duration_hours IS NULL THEN 'needs_duration_calculation'
        ELSE 'normal'
    END AS action_needed
FROM bookings
WHERE date::date >= CURRENT_DATE - INTERVAL '30 days'
    AND (
        (status = 'Pending' AND start_time < NOW() + INTERVAL '24 hours') OR
        (status = 'Confirmed' AND check_in_at IS NULL AND start_time < NOW()) OR
        (status = 'In Progress' AND end_time < NOW() AND check_out_at IS NULL) OR
        (check_out_at IS NOT NULL AND actual_duration_hours IS NULL)
    );

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN bookings.check_in_at IS 'Timestamp when client checked in for their session';
COMMENT ON COLUMN bookings.check_out_at IS 'Timestamp when client checked out from their session';
COMMENT ON COLUMN bookings.actual_duration_hours IS 'Actual session duration calculated from check-in/out times';
COMMENT ON COLUMN bookings.client_notes IS 'Notes provided by the client (visible to client)';
COMMENT ON COLUMN bookings.internal_notes IS 'Internal notes for studio staff only (not visible to client)';
COMMENT ON COLUMN bookings.source IS 'How the booking was initiated - web, app, phone, email, walk_in, or referral';
COMMENT ON COLUMN blocked_dates.recurrence_rule IS 'JSON configuration for recurring blocks - e.g., {"frequency": "weekly", "days": ["monday"], "end_date": "..."}';

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- 1. Run this script AFTER bookings_module_fixed.sql is deployed
-- 2. Run BEFORE deploying Studio Ops CRM module (to avoid FK errors)
-- 3. Commented trigger for client_booking_stats will be activated in Phase 2
-- 4. All new columns have default NULL values - no data migration needed
-- 5. Indexes are created with WHERE clauses when appropriate for partial indexes

-- =====================================================
-- END OF STUDIO OPS BOOKING ENHANCEMENTS
-- =====================================================
