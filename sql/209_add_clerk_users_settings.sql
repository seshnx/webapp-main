-- =====================================================
-- ADD SETTINGS COLUMN TO CLERK_USERS TABLE
-- =====================================================
-- This migration adds the missing settings column to clerk_users table
-- to support user-specific settings storage
-- =====================================================

-- Add settings column to clerk_users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clerk_users'
        AND column_name = 'settings'
    ) THEN
        ALTER TABLE clerk_users
        ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;

        -- Add comment
        COMMENT ON COLUMN clerk_users.settings IS 'User-specific settings stored as JSONB (theme, notifications, preferences, etc.)';

        RAISE NOTICE 'Added settings column to clerk_users table';
    ELSE
        RAISE NOTICE 'settings column already exists in clerk_users table';
    END IF;
END $$;

-- Add display_name column if it doesn't exist (referenced in queries but might be missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clerk_users'
        AND column_name = 'display_name'
    ) THEN
        ALTER TABLE clerk_users
        ADD COLUMN display_name TEXT;

        -- Add comment
        COMMENT ON COLUMN clerk_users.display_name IS 'Display name for the user (can differ from legal name)';

        RAISE NOTICE 'Added display_name column to clerk_users table';
    ELSE
        RAISE NOTICE 'display_name column already exists in clerk_users table';
    END IF;
END $$;

-- Add default_profile_role column if it doesn't exist (referenced in queries)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clerk_users'
        AND column_name = 'default_profile_role'
    ) THEN
        ALTER TABLE clerk_users
        ADD COLUMN default_profile_role TEXT;

        -- Add comment
        COMMENT ON COLUMN clerk_users.default_profile_role IS 'Default profile role to use when user has multiple account types';

        RAISE NOTICE 'Added default_profile_role column to clerk_users table';
    ELSE
        RAISE NOTICE 'default_profile_role column already exists in clerk_users table';
    END IF;
END $$;

-- Add effective_display_name column if it doesn't exist (referenced in queries)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clerk_users'
        AND column_name = 'effective_display_name'
    ) THEN
        ALTER TABLE clerk_users
        ADD COLUMN effective_display_name TEXT;

        -- Add comment
        COMMENT ON COLUMN clerk_users.effective_display_name IS 'Computed display name based on active role and profile data';

        RAISE NOTICE 'Added effective_display_name column to clerk_users table';
    ELSE
        RAISE NOTICE 'effective_display_name column already exists in clerk_users table';
    END IF;
END $$;
