-- =====================================================
-- SAFE CORE SCHEMA MIGRATION
-- =====================================================
-- This script safely creates or updates tables
-- Run this FIRST before any other schema files
-- =====================================================

-- =====================================================
-- CLERK USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS clerk_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    profile_photo_url TEXT,

    -- Account types (from Clerk metadata)
    account_types TEXT[] DEFAULT ARRAY['Fan'],
    active_role TEXT DEFAULT 'Fan',

    -- Profile completion
    profile_completed BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,

    -- Custom fields
    bio TEXT,
    zip_code TEXT,

    -- Timestamps
    last_login_at TIMESTAMPTZ,
    profile_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Soft delete
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PROFILES TABLE (Extended profile data)
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Basic info
    display_name TEXT,
    bio TEXT,
    location JSONB,
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,

    -- Profile photos
    photo_url TEXT,
    cover_photo_url TEXT,

    -- Account-specific fields (stored in JSONB for flexibility)
    talent_info JSONB,
    engineer_info JSONB,
    producer_info JSONB,
    studio_info JSONB,
    education_info JSONB,
    label_info JSONB,

    -- Stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    reputation_score NUMERIC(4, 2) DEFAULT 0.00,

    -- Settings
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private')),
    messaging_permission TEXT DEFAULT 'everyone' CHECK (messaging_permission IN ('everyone', 'followers', 'none')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUB-PROFILES TABLE (Simplified)
-- =====================================================

-- Drop existing if wrong structure to allow clean recreation
DO $$
BEGIN
    -- Check if table exists and has old structure
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'sub_profiles'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sub_profiles' AND column_name = 'role'
    ) THEN
        DROP TABLE sub_profiles CASCADE;
        RAISE NOTICE 'Dropped old sub_profiles table for recreation';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS sub_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- =====================================================
-- SOCIAL FEED TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    display_name TEXT,
    author_photo TEXT,

    -- Content
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    location JSONB,

    -- Visibility & engagement
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    comment_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,

    -- Hierarchy (for replies/reposts)
    parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,

    -- SeshFx integration
    seshfx_integration JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    display_name TEXT,
    author_photo TEXT,
    content TEXT NOT NULL,
    media JSONB DEFAULT '[]'::jsonb,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'booking', 'message', 'system')),

    -- Actor (who triggered the notification)
    actor_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,
    actor_name TEXT,
    actor_photo TEXT,

    -- Target (what the notification is about)
    target_type TEXT,
    target_id UUID,

    -- Content
    title TEXT,
    message TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id TEXT NOT NULL,
    studio_owner_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Booking details
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Client info
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),

    -- Pricing
    price NUMERIC(10, 2),
    deposit_paid NUMERIC(10, 2) DEFAULT 0,

    -- Room/Session info
    room_name TEXT,
    session_type TEXT,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign key to user
    user_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL
);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    studio_owner_id TEXT REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Session details
    session_name TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETPLACE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Item details
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('preset', 'sample', 'kit', 'other')),
    price INTEGER NOT NULL,

    -- Media
    preview_url TEXT,
    download_url TEXT,
    cover_image_url TEXT,

    -- Tags
    tags TEXT[] DEFAULT '{}',

    -- Stats
    download_count INTEGER DEFAULT 0,
    rating_average NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCHOOLS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,

    -- Contact info
    email TEXT,
    phone TEXT,
    website TEXT,

    -- Location
    address JSONB,

    -- Programs
    programs TEXT[] DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id TEXT,
    enrollment_date DATE,
    graduation_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended', 'expelled')),
    program TEXT,
    cohort TEXT,
    gpa NUMERIC(4, 2),
    credits_earned INTEGER DEFAULT 0,
    internship_studio_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Clerk users indexes
CREATE INDEX IF NOT EXISTS idx_clerk_users_email ON clerk_users(email);
CREATE INDEX IF NOT EXISTS idx_clerk_users_username ON clerk_users(username);
CREATE INDEX IF NOT EXISTS idx_clerk_users_active_role ON clerk_users(active_role);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_profiles_talent_info ON profiles USING GIN(talent_info);

-- Sub-profiles indexes
CREATE INDEX IF NOT EXISTS idx_sub_profiles_user_id ON sub_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_role ON sub_profiles(role);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_is_active ON sub_profiles(is_active);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);

-- Reactions indexes
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Saved posts indexes
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_target_id ON bookings(target_id);
CREATE INDEX IF NOT EXISTS idx_bookings_studio_owner_id ON bookings(studio_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_studio_owner_id ON sessions(studio_owner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Market items indexes
CREATE INDEX IF NOT EXISTS idx_market_items_seller_id ON market_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_items_type ON market_items(type);
CREATE INDEX IF NOT EXISTS idx_market_items_is_active ON market_items(is_active);

-- Schools indexes
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_cohort ON students(cohort);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN VALUES
        ('clerk_users'), ('profiles'), ('sub_profiles'), ('posts'), ('comments'),
        ('bookings'), ('sessions'), ('market_items'), ('schools'), ('students')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_%s_updated_at ON %I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER trigger_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE clerk_users IS 'Users synced from Clerk authentication';
COMMENT ON TABLE profiles IS 'Extended user profile information';
COMMENT ON TABLE sub_profiles IS 'Multiple account types per user (simplified structure)';
COMMENT ON TABLE posts IS 'Social feed posts';
COMMENT ON TABLE comments IS 'Comments on posts';
COMMENT ON TABLE reactions IS 'Reactions to posts and comments';
COMMENT ON TABLE bookings IS 'Studio and service bookings';
COMMENT ON TABLE sessions IS 'Booking sessions';
COMMENT ON TABLE market_items IS 'Marketplace items for sale';
COMMENT ON TABLE schools IS 'Educational institutions';
COMMENT ON TABLE students IS 'Student enrollments';
