-- Migration: Add missing columns to distribution_stats table
-- Date: 2025-01-22
-- Description: Fixes "column lifetime_earnings does not exist" error in Business Center

-- Add missing columns to distribution_stats table
ALTER TABLE distribution_stats
ADD COLUMN IF NOT EXISTS lifetime_streams BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earnings NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_streams BIGINT DEFAULT 0;

-- Verify the columns were added
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'distribution_stats'
ORDER BY ordinal_position;
