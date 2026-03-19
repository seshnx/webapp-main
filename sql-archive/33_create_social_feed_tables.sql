-- =====================================================
-- SOCIAL FEED TABLES - CLERK COMPATIBLE VERSION
-- =====================================================
-- Creates all social feed tables with TEXT user_id for Clerk
-- =====================================================

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    display_name TEXT,
    author_photo TEXT,
    content TEXT,
    text TEXT, -- Alias for content
    role TEXT,
    media_type TEXT,
    media_urls TEXT[] DEFAULT '{}',
    media JSONB DEFAULT '[]'::jsonb,
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    location JSONB,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    reaction_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    repost_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    parent_post_id UUID,
    post_category TEXT CHECK (post_category IN ('general', 'booking', 'session', 'gig', 'collab')),
    booking_id UUID,
    posted_as_role TEXT,
    credits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMPTZ
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_booking_id ON posts(booking_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_as_role ON posts(posted_as_role);

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_posts_content_gin ON posts USING GIN(to_tsvector('english', COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS idx_posts_hashtags_gin ON posts USING GIN(hashtags);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    parent_comment_id UUID,
    content TEXT NOT NULL,
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- REACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    emoji TEXT NOT NULL DEFAULT '👍',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id, emoji)
);

-- Indexes for reactions
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at DESC);

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- =====================================================
-- SAVED POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Indexes for saved posts
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at DESC);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'booking', 'message', 'system', 'reaction')),
    actor_id TEXT,
    actor_name TEXT,
    actor_photo TEXT,
    target_type TEXT,
    target_id UUID,
    title TEXT,
    body TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    reference_type TEXT,
    reference_id UUID,
    message TEXT,
    post_preview TEXT
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_type, reference_id);

-- =====================================================
-- CONTENT REPORTS TABLE
-- =====================================================
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

-- Indexes for content_reports
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);

-- =====================================================
-- USER BLOCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id TEXT NOT NULL,
    blocked_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- Indexes for user_blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);

-- =====================================================
-- POST METRICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),
    recorded_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(post_id, recorded_at)
);

-- Indexes for post_metrics
CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_user_id ON post_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at ON post_metrics(recorded_at DESC);

-- =====================================================
-- POST EDIT HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    old_content TEXT,
    new_content TEXT,
    edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for post_edit_history
CREATE INDEX IF NOT EXISTS idx_post_edit_history_post_id ON post_edit_history(post_id);
CREATE INDEX IF NOT EXISTS idx_post_edit_history_user_id ON post_edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_post_edit_history_edited_at ON post_edit_history(edited_at DESC);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id TEXT PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    notify_on_like BOOLEAN DEFAULT true,
    notify_on_comment BOOLEAN DEFAULT true,
    notify_on_follow BOOLEAN DEFAULT true,
    notify_on_mention BOOLEAN DEFAULT true,
    notify_on_booking BOOLEAN DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEMO SUBMISSIONS TABLE
-- =====================================================
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

-- Indexes for demo_submissions
CREATE INDEX IF NOT EXISTS idx_demo_submissions_from_user_id ON demo_submissions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_to_user_id ON demo_submissions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_status ON demo_submissions(status);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_created_at ON demo_submissions(created_at DESC);

-- =====================================================
-- TRACK LISTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS track_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID,
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

-- Indexes for track_listings
CREATE INDEX IF NOT EXISTS idx_track_listings_post_id ON track_listings(post_id);
CREATE INDEX IF NOT EXISTS idx_track_listings_user_id ON track_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_track_listings_genre ON track_listings USING GIN(genre);
CREATE INDEX IF NOT EXISTS idx_track_listings_status ON track_listings(status);
CREATE INDEX IF NOT EXISTS idx_track_listings_created_at ON track_listings(created_at DESC);

-- =====================================================
-- COMPLETE
-- =====================================================
