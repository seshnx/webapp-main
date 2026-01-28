-- =====================================================
-- ADD DEFAULT_PROFILE_ROLE COLUMN TO CLERK_USERS TABLE
-- =====================================================
-- Migration: 203_add_default_profile_role.sql
-- Description: Adds a column to track the user's default profile role for posts/chats
-- Author: Claude Code
-- Date: 2025-01-27
-- =====================================================

-- Add default_profile_role column to clerk_users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clerk_users' AND column_name = 'default_profile_role'
    ) THEN
        ALTER TABLE clerk_users ADD COLUMN default_profile_role TEXT;

        COMMENT ON COLUMN clerk_users.default_profile_role IS 'The default profile role to use for posts and chats when no specific role is selected';

        -- Set default to active_role for existing users
        UPDATE clerk_users SET default_profile_role = active_role WHERE default_profile_role IS NULL;
    END IF;
END $$;

-- Create index for filtering users by default role
CREATE INDEX IF NOT EXISTS idx_clerk_users_default_profile_role ON clerk_users(default_profile_role);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
