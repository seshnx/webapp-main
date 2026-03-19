-- =====================================================
-- SOCIAL FEED PHASE 1: CORE COMPLETION MIGRATIONS
-- =====================================================
-- This script adds database support for reposts, search,
-- and content moderation features.
--
-- Run this in Neon SQL Editor AFTER running 00_core_unified_schema.sql
-- =====================================================

-- =====================================================
-- REPOST FEATURE ADDITIONS
-- =====================================================

-- Add repost_count column to posts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'repost_count'
    ) THEN
        ALTER TABLE posts ADD COLUMN repost_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add index for parent_post_id to optimize repost queries
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);

-- =====================================================
-- SEARCH FEATURE ADDITIONS
-- =====================================================

-- Add GIN indexes for full-text search on post content
CREATE INDEX IF NOT EXISTS idx_posts_content_gin ON posts USING GIN(
    to_tsvector('english', COALESCE(content, ''))
);

-- Add index for hashtag array search
CREATE INDEX IF NOT EXISTS idx_posts_hashtags_gin ON posts USING GIN(hashtags);

-- Add index for mention array search
CREATE INDEX IF NOT EXISTS idx_posts_mentions_gin ON posts USING GIN(mentions);

-- Add index for user display name search
CREATE INDEX IF NOT EXISTS idx_clerk_users_display_name_gin ON clerk_users USING GIN(
    to_tsvector('english',
        COALESCE(first_name, '') || ' ' ||
        COALESCE(last_name, '') || ' ' ||
        COALESCE(username, '') || ' ' ||
        COALESCE(email, '')
    )
);

-- =====================================================
-- CONTENT MODERATION ADDITIONS
-- =====================================================

-- Create content_reports table
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Target (what is being reported)
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),

    target_id UUID NOT NULL,

    -- Report details
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'misinformation', 'explicit_content', 'other')),
    description TEXT,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),

    -- Review info
    reviewed_by TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for content_reports
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);

-- =====================================================
-- REPOST TRIGGER
-- =====================================================

-- Function to update repost count when a repost is created
CREATE OR REPLACE FUNCTION update_repost_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_post_id IS NOT NULL THEN
        -- New repost created, increment count
        UPDATE posts
        SET repost_count = COALESCE(repost_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.parent_post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_post_id IS NOT NULL THEN
        -- Repost deleted, decrement count
        UPDATE posts
        SET repost_count = GREATEST(0, COALESCE(repost_count, 0) - 1),
            updated_at = NOW()
        WHERE id = OLD.parent_post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_update_repost_count ON posts;

-- Create trigger to automatically update repost counts
CREATE TRIGGER trigger_update_repost_count
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_repost_count();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user has reposted a post
CREATE OR REPLACE FUNCTION has_user_reposted(p_user_id TEXT, p_post_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM posts
        WHERE user_id = p_user_id
        AND parent_post_id = p_post_id
        AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get all reposts of a post
CREATE OR REPLACE FUNCTION get_post_reposts(p_post_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    user_id TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    display_name TEXT,
    author_photo TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        p.display_name,
        p.author_photo
    FROM posts p
    WHERE p.parent_post_id = p_post_id
    AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup

-- Check posts columns
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'posts'
-- AND column_name IN ('repost_count', 'parent_post_id')
-- ORDER BY ordinal_position;

-- Check content_reports table
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_name = 'content_reports';

-- Check indexes
-- SELECT indexname, tablename
-- FROM pg_indexes
-- WHERE tablename IN ('posts', 'content_reports')
-- AND indexname LIKE '%repost%'
-- OR indexname LIKE '%gin%'
-- ORDER BY tablename, indexname;
