-- =====================================================
-- Add Missing Columns to Notifications Table
-- =====================================================

-- Check and add missing columns to notifications table

-- Add message column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'message'
    ) THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;
END $$;

-- Add actor_photo column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'actor_photo'
    ) THEN
        ALTER TABLE notifications ADD COLUMN actor_photo TEXT;
    END IF;
END $$;

-- Add post_preview column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'post_preview'
    ) THEN
        ALTER TABLE notifications ADD COLUMN post_preview TEXT;
    END IF;
END $$;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
