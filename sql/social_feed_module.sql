-- =====================================================
-- SOCIAL FEED MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Social Feed module (SocialNx)
--
-- MIGRATION-SAFE: This script can be run multiple times safely.
-- It will:
--   - Create tables if they don't exist
--   - Add missing columns to existing tables
--   - Create indexes only if columns exist
--   - Recreate policies (DROP IF EXISTS then CREATE)
-- =====================================================

-- =====================================================
-- POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    author_photo TEXT,
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb, -- Array of media objects {type, url, thumbnail}
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    location JSONB, -- {name, lat, lng}
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    comment_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- For reposts/replies
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'display_name') THEN
        ALTER TABLE posts ADD COLUMN display_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'author_photo') THEN
        ALTER TABLE posts ADD COLUMN author_photo TEXT;
    END IF;
    
    -- Add columns that the application code expects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'text') THEN
        ALTER TABLE posts ADD COLUMN text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'role') THEN
        ALTER TABLE posts ADD COLUMN role TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'media_type') THEN
        ALTER TABLE posts ADD COLUMN media_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'media_urls') THEN
        ALTER TABLE posts ADD COLUMN media_urls TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'reactions') THEN
        ALTER TABLE posts ADD COLUMN reactions JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'media') THEN
        ALTER TABLE posts ADD COLUMN media JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'hashtags') THEN
        ALTER TABLE posts ADD COLUMN hashtags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'mentions') THEN
        ALTER TABLE posts ADD COLUMN mentions TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'location') THEN
        ALTER TABLE posts ADD COLUMN location JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'visibility') THEN
        ALTER TABLE posts ADD COLUMN visibility TEXT DEFAULT 'public';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'comment_count') THEN
        ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'reaction_count') THEN
        ALTER TABLE posts ADD COLUMN reaction_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'save_count') THEN
        ALTER TABLE posts ADD COLUMN save_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'view_count') THEN
        ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'is_pinned') THEN
        ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'parent_post_id') THEN
        ALTER TABLE posts ADD COLUMN parent_post_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
        ALTER TABLE posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'deleted_at') THEN
        ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Indexes for posts (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'parent_post_id') THEN
        CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'hashtags') THEN
        CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'posts' AND column_name = 'visibility') THEN
        CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
        CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
    END IF;
END $$;

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    author_photo TEXT,
    content TEXT NOT NULL,
    media JSONB DEFAULT '[]'::jsonb,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested replies
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'display_name') THEN
        ALTER TABLE comments ADD COLUMN display_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'author_photo') THEN
        ALTER TABLE comments ADD COLUMN author_photo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'media') THEN
        ALTER TABLE comments ADD COLUMN media JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'parent_comment_id') THEN
        ALTER TABLE comments ADD COLUMN parent_comment_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'reaction_count') THEN
        ALTER TABLE comments ADD COLUMN reaction_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'updated_at') THEN
        ALTER TABLE comments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'deleted_at') THEN
        ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Indexes for comments (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'comments' AND column_name = 'parent_comment_id') THEN
        CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);
END $$;

-- =====================================================
-- REACTIONS TABLE (Likes, Emojis, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    emoji TEXT NOT NULL DEFAULT '👍',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id, emoji)
);

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    -- Add target_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reactions' AND column_name = 'target_type') THEN
        ALTER TABLE reactions ADD COLUMN target_type TEXT NOT NULL DEFAULT 'post';
        ALTER TABLE reactions ADD CONSTRAINT reactions_target_type_check 
            CHECK (target_type IN ('post', 'comment'));
    ELSE
        -- If column exists but doesn't have the check constraint, add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'reactions' 
                       AND constraint_name = 'reactions_target_type_check') THEN
            ALTER TABLE reactions ADD CONSTRAINT reactions_target_type_check 
                CHECK (target_type IN ('post', 'comment'));
        END IF;
    END IF;
    
    -- Add other columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reactions' AND column_name = 'target_id') THEN
        ALTER TABLE reactions ADD COLUMN target_id UUID NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reactions' AND column_name = 'emoji') THEN
        ALTER TABLE reactions ADD COLUMN emoji TEXT NOT NULL DEFAULT '👍';
    END IF;
END $$;

-- Indexes for reactions (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at DESC);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'reactions' AND column_name = 'target_type'
               AND EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'reactions' AND column_name = 'target_id')) THEN
        CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);
    END IF;
END $$;

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Prevent self-follow
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- =====================================================
-- SAVED POSTS TABLE (Bookmarks)
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
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
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'booking', 'message', 'system')),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT,
    actor_photo TEXT,
    target_type TEXT, -- 'post', 'comment', 'booking', etc.
    target_id UUID,
    title TEXT,
    body TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    action_taken TEXT, -- 'accept', 'decline', etc. for booking notifications
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    -- Add target_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'target_type') THEN
        ALTER TABLE notifications ADD COLUMN target_type TEXT;
    END IF;
    
    -- Add other columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'target_id') THEN
        ALTER TABLE notifications ADD COLUMN target_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type TEXT NOT NULL DEFAULT 'system';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'actor_id') THEN
        ALTER TABLE notifications ADD COLUMN actor_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'actor_name') THEN
        ALTER TABLE notifications ADD COLUMN actor_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'actor_photo') THEN
        ALTER TABLE notifications ADD COLUMN actor_photo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'title') THEN
        ALTER TABLE notifications ADD COLUMN title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'body') THEN
        ALTER TABLE notifications ADD COLUMN body TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'link') THEN
        ALTER TABLE notifications ADD COLUMN link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'read') THEN
        ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'action_taken') THEN
        ALTER TABLE notifications ADD COLUMN action_taken TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'updated_at') THEN
        ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Indexes for notifications (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'read') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'target_type'
               AND EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'notifications' AND column_name = 'target_id')) THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_type, target_id);
    END IF;
END $$;

-- =====================================================
-- TRIGGERS FOR COUNT UPDATES
-- =====================================================

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_comment_count ON comments;
CREATE TRIGGER trigger_update_post_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Function to update post reaction count
CREATE OR REPLACE FUNCTION update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
        UPDATE posts SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'post' THEN
        UPDATE posts SET reaction_count = GREATEST(0, reaction_count - 1) WHERE id = OLD.target_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment reaction count
CREATE OR REPLACE FUNCTION update_comment_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.target_type = 'comment' THEN
        UPDATE comments SET reaction_count = reaction_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'comment' THEN
        UPDATE comments SET reaction_count = GREATEST(0, reaction_count - 1) WHERE id = OLD.target_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for reaction counts (separate for posts and comments)
DROP TRIGGER IF EXISTS trigger_update_post_reaction_count ON reactions;
CREATE TRIGGER trigger_update_post_reaction_count
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_reaction_count();

DROP TRIGGER IF EXISTS trigger_update_comment_reaction_count ON reactions;
CREATE TRIGGER trigger_update_comment_reaction_count
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW EXECUTE FUNCTION update_comment_reaction_count();

-- Function to update post save count
CREATE OR REPLACE FUNCTION update_post_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET save_count = save_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET save_count = GREATEST(0, save_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_post_save_count ON saved_posts;
CREATE TRIGGER trigger_update_post_save_count
    AFTER INSERT OR DELETE ON saved_posts
    FOR EACH ROW EXECUTE FUNCTION update_post_save_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON posts;
CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_comments_updated_at ON comments;
CREATE TRIGGER trigger_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Posts: Users can read public posts and their own posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());

-- Posts: Users can insert their own posts
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Posts: Users can update their own posts
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Comments: Users can read comments on posts they can see
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

-- Comments: Users can insert their own comments
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reactions: Users can read all reactions
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON reactions;
CREATE POLICY "Reactions are viewable by everyone" ON reactions
    FOR SELECT USING (true);

-- Reactions: Users can insert their own reactions
DROP POLICY IF EXISTS "Users can insert their own reactions" ON reactions;
CREATE POLICY "Users can insert their own reactions" ON reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Follows: Users can read all follows
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

-- Follows: Users can insert their own follows
DROP POLICY IF EXISTS "Users can insert their own follows" ON follows;
CREATE POLICY "Users can insert their own follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Saved Posts: Users can only see their own saved posts
DROP POLICY IF EXISTS "Users can view their own saved posts" ON saved_posts;
CREATE POLICY "Users can view their own saved posts" ON saved_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Saved Posts: Users can insert their own saved posts
DROP POLICY IF EXISTS "Users can insert their own saved posts" ON saved_posts;
CREATE POLICY "Users can insert their own saved posts" ON saved_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications: System can insert notifications
DROP POLICY IF EXISTS "Notifications can be inserted" ON notifications;
CREATE POLICY "Notifications can be inserted" ON notifications
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE posts IS 'Social media posts in the feed';
COMMENT ON TABLE comments IS 'Comments on posts';
COMMENT ON TABLE reactions IS 'User reactions (likes, emojis) to posts and comments';
COMMENT ON TABLE follows IS 'User follow relationships';
COMMENT ON TABLE saved_posts IS 'Bookmarked/saved posts by users';
COMMENT ON TABLE notifications IS 'User notifications for social interactions';

