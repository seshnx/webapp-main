-- =====================================================
-- FIX MARKETPLACE DELETED_AT COLUMN
-- =====================================================
-- This migration adds the missing deleted_at column to gear_listings table
-- to support soft deletes in the marketplace
-- =====================================================

-- Add deleted_at column to gear_listings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gear_listings'
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE gear_listings
        ADD COLUMN deleted_at TIMESTAMPTZ;

        -- Add comment
        COMMENT ON COLUMN gear_listings.deleted_at IS 'Timestamp for soft deletes. NULL means the listing is active.';

        RAISE NOTICE 'Added deleted_at column to gear_listings table';
    ELSE
        RAISE NOTICE 'deleted_at column already exists in gear_listings table';
    END IF;
END $$;

-- Add index on deleted_at for better query performance
CREATE INDEX IF NOT EXISTS idx_gear_listings_deleted_at
ON gear_listings(deleted_at)
WHERE deleted_at IS NULL;
