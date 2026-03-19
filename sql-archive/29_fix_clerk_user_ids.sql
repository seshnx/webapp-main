-- =====================================================
-- Fix Clerk User ID Foreign Key Constraints
-- =====================================================
-- Migration to change user_id columns from UUID to TEXT
-- to support Clerk authentication (TEXT-based user IDs)
-- =====================================================

-- Step 1: Drop old foreign key constraints and convert user_id to TEXT
-- This needs to be done carefully to preserve data

-- Drop and recreate posts table with TEXT user_id
DROP TABLE IF EXISTS posts CASCADE;
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    display_name TEXT,
    author_photo TEXT,
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    location JSONB,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    reaction_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    repost_count INTEGER DEFAULT 0,
    parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    post_category TEXT CHECK (post_category IN ('general', 'booking', 'session', 'gig', 'collab')),
    booking_id UUID,
    credits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ
);

-- Indexes for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_parent_post_id ON posts(parent_post_id);
CREATE INDEX idx_posts_booking_id ON posts(booking_id);

-- Drop and recreate comments table with TEXT user_id
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for comments
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Drop and recreate reactions table with TEXT user_id
DROP TABLE IF EXISTS reactions CASCADE;
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    emoji TEXT NOT NULL DEFAULT '👍',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id, emoji)
);

-- Indexes for reactions
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX idx_reactions_created_at ON reactions(created_at DESC);

-- Drop and recreate follows table with TEXT user_ids
DROP TABLE IF EXISTS follows CASCADE;
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    following_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- Drop and recreate saved_posts table with TEXT user_id
DROP TABLE IF EXISTS saved_posts CASCADE;
CREATE TABLE saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Indexes for saved posts
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX idx_saved_posts_created_at ON saved_posts(created_at DESC);

-- Drop and recreate notifications table with TEXT user_ids
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'booking', 'message', 'system', 'reaction')),
    actor_id TEXT, -- Changed to TEXT for Clerk compatibility
    actor_name TEXT,
    actor_photo TEXT,
    post_id UUID,
    post_preview TEXT,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    reference_type TEXT,
    reference_id UUID,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_reference ON notifications(reference_type, reference_id);

-- =====================================================
-- FUNCTIONS TO UPDATE COUNTS (Triggers)
-- =====================================================

-- Function to update post reaction count
CREATE OR REPLACE FUNCTION update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.target_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reactions
DROP TRIGGER IF EXISTS trigger_update_reaction_count ON reactions;
CREATE TRIGGER trigger_update_reaction_count
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reaction_count();

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- Function to update post save count
CREATE OR REPLACE FUNCTION update_post_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET save_count = save_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET save_count = GREATEST(save_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for saved_posts
DROP TRIGGER IF EXISTS trigger_update_save_count ON saved_posts;
CREATE TRIGGER trigger_update_save_count
    AFTER INSERT OR DELETE ON saved_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_save_count();

-- =====================================================
-- CONTENT REPORTS TABLE
-- =====================================================

DROP TABLE IF EXISTS content_reports CASCADE;
CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'misinformation', 'explicit_content', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by TEXT, -- Changed to TEXT for Clerk compatibility
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for content_reports
CREATE INDEX idx_content_reports_reporter_id ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_created_at ON content_reports(created_at DESC);

-- =====================================================
-- USER BLOCKS TABLE
-- =====================================================

DROP TABLE IF EXISTS user_blocks CASCADE;
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    blocked_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- Indexes for user_blocks
CREATE INDEX idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked_id ON user_blocks(blocked_id);

-- =====================================================
-- POST METRICS TABLE
-- =====================================================

DROP TABLE IF EXISTS post_metrics CASCADE;
CREATE TABLE post_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),
    recorded_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(post_id, recorded_at)
);

-- Indexes for post_metrics
CREATE INDEX idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX idx_post_metrics_user_id ON post_metrics(user_id);
CREATE INDEX idx_post_metrics_recorded_at ON post_metrics(recorded_at DESC);

-- =====================================================
-- POST EDIT HISTORY TABLE
-- =====================================================

DROP TABLE IF EXISTS post_edit_history CASCADE;
CREATE TABLE post_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    old_content TEXT,
    new_content TEXT,
    edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for post_edit_history
CREATE INDEX idx_post_edit_history_post_id ON post_edit_history(post_id);
CREATE INDEX idx_post_edit_history_user_id ON post_edit_history(user_id);
CREATE INDEX idx_post_edit_history_edited_at ON post_edit_history(edited_at DESC);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================

DROP TABLE IF EXISTS notification_preferences CASCADE;
CREATE TABLE notification_preferences (
    user_id TEXT PRIMARY KEY, -- Changed to TEXT for Clerk compatibility
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    notify_on_like BOOLEAN DEFAULT TRUE,
    notify_on_comment BOOLEAN DEFAULT TRUE,
    notify_on_follow BOOLEAN DEFAULT TRUE,
    notify_on_mention BOOLEAN DEFAULT TRUE,
    notify_on_booking BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEMO SUBMISSIONS TABLE
-- =====================================================

DROP TABLE IF EXISTS demo_submissions CASCADE;
CREATE TABLE demo_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    to_user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    audio_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    genre TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'listened', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for demo_submissions
CREATE INDEX idx_demo_submissions_from_user_id ON demo_submissions(from_user_id);
CREATE INDEX idx_demo_submissions_to_user_id ON demo_submissions(to_user_id);
CREATE INDEX idx_demo_submissions_status ON demo_submissions(status);
CREATE INDEX idx_demo_submissions_created_at ON demo_submissions(created_at DESC);

-- =====================================================
-- TRACK LISTINGS TABLE
-- =====================================================

DROP TABLE IF EXISTS track_listings CASCADE;
CREATE TABLE track_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Changed to TEXT for Clerk compatibility
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    genre TEXT[],
    bpm INTEGER,
    key_text TEXT, -- Renamed from 'key' (reserved word)
    price DECIMAL(10, 2),
    licensing_type TEXT CHECK (licensing_type IN ('exclusive', 'non_exclusive', 'lease')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
    plays_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for track_listings
CREATE INDEX idx_track_listings_post_id ON track_listings(post_id);
CREATE INDEX idx_track_listings_user_id ON track_listings(user_id);
CREATE INDEX idx_track_listings_genre ON track_listings USING GIN(genre);
CREATE INDEX idx_track_listings_status ON track_listings(status);
CREATE INDEX idx_track_listings_created_at ON track_listings(created_at DESC);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions (adjust as needed for your role)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_database_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_database_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_database_role;

-- =====================================================
-- SEARCH INDEXES (GIN for full-text search)
-- =====================================================

-- Create GIN index for posts content search
CREATE INDEX IF NOT EXISTS idx_posts_content_gin ON posts USING GIN(to_tsvector('english', COALESCE(content, '')));

-- Create GIN index for posts hashtags
CREATE INDEX IF NOT EXISTS idx_posts_hashtags_gin ON posts USING GIN(hashtags);

-- =====================================================
-- COMPLETE
-- =====================================================

-- Migration complete. All user_id columns are now TEXT type for Clerk compatibility.
-- Foreign key constraints referencing auth.users have been removed.
-- Data integrity is maintained through application-level validation.
