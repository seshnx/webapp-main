-- =====================================================
-- Fix Notifications Type Check Constraint
-- =====================================================

-- Drop and recreate the type check constraint to include 'reaction'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'notifications_type_check'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
    END IF;
END $$;

-- Add updated constraint with all valid types including 'reaction'
ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN ('like', 'comment', 'follow', 'mention', 'booking', 'message', 'system', 'reaction'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'notifications_type_check';
