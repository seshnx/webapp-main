-- =====================================================
-- Fix Clerk User ID Foreign Key Constraints (ALTER TABLE)
-- =====================================================
-- Migration to change user_id columns from UUID to TEXT
-- to support Clerk authentication (TEXT-based user IDs)
-- =====================================================

-- Step 1: Drop foreign key constraints to auth.users
-- ================================================

-- Drop posts.user_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'posts_user_id_fkey'
    ) THEN
        ALTER TABLE posts DROP CONSTRAINT posts_user_id_fkey;
    END IF;
END $$;

-- Drop comments.user_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'comments_user_id_fkey'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
    END IF;
END $$;

-- Drop reactions.user_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'reactions_user_id_fkey'
    ) THEN
        ALTER TABLE reactions DROP CONSTRAINT reactions_user_id_fkey;
    END IF;
END $$;

-- Drop follows.follower_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'follows_follower_id_fkey'
    ) THEN
        ALTER TABLE follows DROP CONSTRAINT follows_follower_id_fkey;
    END IF;
END $$;

-- Drop follows.following_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'follows_following_id_fkey'
    ) THEN
        ALTER TABLE follows DROP CONSTRAINT follows_following_id_fkey;
    END IF;
END $$;

-- Drop saved_posts.user_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'saved_posts_user_id_fkey'
    ) THEN
        ALTER TABLE saved_posts DROP CONSTRAINT saved_posts_user_id_fkey;
    END IF;
END $$;

-- Drop notifications.user_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_user_id_fkey;
    END IF;
END $$;

-- Drop notifications.actor_id foreign key
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'notifications_actor_id_fkey'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_actor_id_fkey;
    END IF;
END $$;

-- Step 2: Change user_id columns from UUID to TEXT
-- ================================================

-- Alter posts.user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- Alter comments.user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'comments' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- Alter reactions.user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reactions' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE reactions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- Alter follows.follower_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'follows' AND column_name = 'follower_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE follows ALTER COLUMN follower_id TYPE TEXT USING follower_id::TEXT;
    END IF;
END $$;

-- Alter follows.following_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'follows' AND column_name = 'following_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE follows ALTER COLUMN following_id TYPE TEXT USING following_id::TEXT;
    END IF;
END $$;

-- Alter saved_posts.user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'saved_posts' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE saved_posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- Alter notifications.user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'user_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;

-- Alter notifications.actor_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'actor_id' AND data_type = 'uuid'
    ) THEN
        ALTER TABLE notifications ALTER COLUMN actor_id TYPE TEXT USING actor_id::TEXT;
    END IF;
END $$;

-- Step 3: Add missing columns if they don't exist
-- ================================================

-- Add posts.booking_id if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN booking_id UUID;
    END IF;
END $$;

-- Add posts.post_category if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'post_category'
    ) THEN
        ALTER TABLE posts ADD COLUMN post_category TEXT CHECK (post_category IN ('general', 'booking', 'session', 'gig', 'collab'));
    END IF;
END $$;

-- Add posts.credits if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'credits'
    ) THEN
        ALTER TABLE posts ADD COLUMN credits JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add posts.is_archived if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add posts.scheduled_for if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'scheduled_for'
    ) THEN
        ALTER TABLE posts ADD COLUMN scheduled_for TIMESTAMPTZ;
    END IF;
END $$;

-- Add notifications.reference_type if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'reference_type'
    ) THEN
        ALTER TABLE notifications ADD COLUMN reference_type TEXT;
    END IF;
END $$;

-- Add notifications.reference_id if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN reference_id UUID;
    END IF;
END $$;

-- Add notifications.metadata if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Update notifications type check to include 'reaction'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'notifications_type_check'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
        ALTER TABLE posts ADD CONSTRAINT notifications_type_check
            CHECK (type IN ('like', 'comment', 'follow', 'mention', 'booking', 'message', 'system', 'reaction'));
    END IF;
END $$;

-- Step 4: Create missing indexes
-- ==============================

-- Create idx_posts_booking_id if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_posts_booking_id'
    ) THEN
        CREATE INDEX idx_posts_booking_id ON posts(booking_id);
    END IF;
END $$;

-- Create idx_reactions_target if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_reactions_target'
    ) THEN
        CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);
    END IF;
END $$;

-- Create idx_notifications_reference if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_notifications_reference'
    ) THEN
        CREATE INDEX idx_notifications_reference ON notifications(reference_type, reference_id);
    END IF;
END $$;

-- Create GIN index for posts content search if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_posts_content_gin'
    ) THEN
        CREATE INDEX idx_posts_content_gin ON posts USING GIN(to_tsvector('english', COALESCE(content, '')));
    END IF;
END $$;

-- Create GIN index for posts hashtags if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_posts_hashtags_gin'
    ) THEN
        CREATE INDEX idx_posts_hashtags_gin ON posts USING GIN(hashtags);
    END IF;
END $$;

-- Step 5: Create missing tables
-- ==============================

-- Create content_reports table if missing
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'misinformation', 'explicit_content', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for content_reports
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);

-- Create user_blocks table if missing
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id TEXT NOT NULL,
    blocked_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- Create indexes for user_blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);

-- Create post_metrics table if missing
CREATE TABLE IF NOT EXISTS post_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),
    recorded_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(post_id, recorded_at)
);

-- Create indexes for post_metrics
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_user_id ON post_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at ON post_metrics(recorded_at DESC);

-- Create post_edit_history table if missing
CREATE TABLE IF NOT EXISTS post_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    old_content TEXT,
    new_content TEXT,
    edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for post_edit_history
CREATE INDEX IF NOT EXISTS idx_post_edit_history_post_id ON post_edit_history(post_id);
CREATE INDEX IF NOT EXISTS idx_post_edit_history_user_id ON post_edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_post_edit_history_edited_at ON post_edit_history(edited_at DESC);

-- Create notification_preferences table if missing
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id TEXT PRIMARY KEY,
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

-- Create demo_submissions table if missing
CREATE TABLE IF NOT EXISTS demo_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    genre TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'listened', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for demo_submissions
CREATE INDEX IF NOT EXISTS idx_demo_submissions_from_user_id ON demo_submissions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_to_user_id ON demo_submissions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_status ON demo_submissions(status);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_created_at ON demo_submissions(created_at DESC);

-- Create track_listings table if missing
CREATE TABLE IF NOT EXISTS track_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    genre TEXT[],
    bpm INTEGER,
    key_text TEXT,
    price DECIMAL(10, 2),
    licensing_type TEXT CHECK (licensing_type IN ('exclusive', 'non_exclusive', 'lease')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
    plays_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for track_listings
CREATE INDEX IF NOT EXISTS idx_track_listings_post_id ON track_listings(post_id);
CREATE INDEX IF NOT EXISTS idx_track_listings_user_id ON track_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_track_listings_genre ON track_listings USING GIN(genre);
CREATE INDEX IF NOT EXISTS idx_track_listings_status ON track_listings(status);
CREATE INDEX IF NOT EXISTS idx_track_listings_created_at ON track_listings(created_at DESC);

-- =====================================================
-- COMPLETE
-- =====================================================
-- Migration complete. All user_id columns are now TEXT type for Clerk compatibility.
