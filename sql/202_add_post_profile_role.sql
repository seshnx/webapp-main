-- =====================================================
-- ADD POSTED_AS_ROLE COLUMN TO POSTS TABLE
-- =====================================================
-- Migration: 202_add_post_profile_role.sql
-- Description: Adds a column to track which profile role was used when creating a post
-- Author: Claude Code
-- Date: 2025-01-27
-- =====================================================

-- Add posted_as_role column to posts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'posted_as_role'
    ) THEN
        ALTER TABLE posts ADD COLUMN posted_as_role TEXT;

        COMMENT ON COLUMN posts.posted_as_role IS 'The account role used when posting (Talent, Studio, Engineer, etc.)';
    END IF;
END $$;

-- Create index for filtering posts by role
CREATE INDEX IF NOT EXISTS idx_posts_posted_as_role ON posts(posted_as_role);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
