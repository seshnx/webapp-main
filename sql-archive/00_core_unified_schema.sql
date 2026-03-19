-- =====================================================
-- NEON UNIFIED DATABASE SCHEMA
-- =====================================================
-- SeshNx Application - Complete PostgreSQL Schema for Neon
--
-- This schema combines all modules into a single unified database:
-- - User Profiles & Authentication
-- - Social Feed (posts, comments, reactions)
-- - Bookings & Sessions
-- - Marketplace (gear, SeshFx store)
-- - Education (schools, students, staff)
-- - Business Center (distribution, royalties)
-- - Legal Documents
-- - Tech Services
-- - Notifications
--
-- Key differences from Supabase version:
-- - No auth.users references (uses clerk_users table instead)
-- - Clerk manages authentication, we sync user data via webhooks
-- - Uses standard PostgreSQL features compatible with Neon
--
-- Run this in your Neon SQL Editor: https://console.neon.tech/
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For JSONB GIN indexes

-- =====================================================
-- CLERK USERS TABLE (Synced from Clerk)
-- =====================================================
-- This table stores user data synced from Clerk via webhooks
CREATE TABLE IF NOT EXISTS clerk_users (
    id TEXT PRIMARY KEY, -- Clerk user ID (string format like 'user_abc123')
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    username TEXT UNIQUE,
    profile_photo_url TEXT,

    -- Account types (from Clerk metadata)
    account_types TEXT[] DEFAULT ARRAY['Fan'], -- ['Talent', 'Engineer', 'Producer', etc.]
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

-- Indexes for clerk_users
CREATE INDEX IF NOT EXISTS idx_clerk_users_email ON clerk_users(email);
CREATE INDEX IF NOT EXISTS idx_clerk_users_username ON clerk_users(username);
CREATE INDEX IF NOT EXISTS idx_clerk_users_active_role ON clerk_users(active_role);
CREATE INDEX IF NOT EXISTS idx_clerk_users_account_types ON clerk_users USING GIN(account_types);
CREATE INDEX IF NOT EXISTS idx_clerk_users_location ON clerk_users USING GIN(zip_code);

-- =====================================================
-- PROFILES TABLE (Extended profile data)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Basic info
    display_name TEXT,
    bio TEXT,
    location JSONB, -- {city, state, country, lat, lng}
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb, -- {spotify, soundcloud, instagram, etc.}

    -- Profile photos
    photo_url TEXT,
    cover_photo_url TEXT,

    -- Account-specific fields (stored in JSONB for flexibility)
    talent_info JSONB, -- {genre, subrole, skills, influences}
    engineer_info JSONB, -- {specializations, equipment, daw}
    producer_info JSONB, -- {genres, credits, studio_setup}
    studio_info JSONB, -- {name, address, equipment, rates}
    education_info JSONB, -- {school, program, graduation_year}
    label_info JSONB, -- {name, genre, roster_size}

    -- Stats
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    reputation_score NUMERIC(4, 2) DEFAULT 0.00, -- 0.00 to 5.00

    -- Settings
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private')),
    messaging_permission TEXT DEFAULT 'everyone' CHECK (messaging_permission IN ('everyone', 'followers', 'none')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles USING GIN(display_name gin_trgm_ops); -- Text search
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_profiles_talent_info ON profiles USING GIN(talent_info);
CREATE INDEX IF NOT EXISTS idx_profiles_engineer_info ON profiles USING GIN(engineer_info);
CREATE INDEX IF NOT EXISTS idx_profiles_producer_info ON profiles USING GIN(producer_info);

-- =====================================================
-- SUB-PROFILES TABLE (Multiple account types per user)
-- =====================================================
CREATE TABLE IF NOT EXISTS sub_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Account type for this sub-profile
    account_type TEXT NOT NULL CHECK (account_type IN (
        'Talent', 'Engineer', 'Producer', 'Composer',
        'Studio', 'Technician', 'Fan', 'Student',
        'EDUStaff', 'EDUAdmin', 'Intern', 'Label',
        'Agent', 'GAdmin'
    )),

    -- Profile data (same structure as main profile)
    display_name TEXT,
    bio TEXT,
    photo_url TEXT,
    profile_data JSONB DEFAULT '{}'::jsonb,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one active sub-profile per account type per user
    UNIQUE(user_id, account_type)
);

-- Indexes for sub_profiles
CREATE INDEX IF NOT EXISTS idx_sub_profiles_user_id ON sub_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_account_type ON sub_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_is_active ON sub_profiles(is_active);

-- =====================================================
-- SOCIAL FEED MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    display_name TEXT,
    author_photo TEXT,

    -- Content
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb, -- [{type, url, thumbnail, name, isGif}]
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    location JSONB, -- {name, lat, lng}

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
    seshfx_integration JSONB, -- {projectId, status, export_url}

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);

CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    emoji TEXT NOT NULL DEFAULT '👍',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);

CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at DESC);

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
    target_type TEXT, -- 'post', 'comment', 'booking', etc.
    target_id UUID,

    -- Content
    title TEXT,
    body TEXT,
    link TEXT,

    -- Status
    read BOOLEAN DEFAULT false,
    action_taken TEXT, -- 'accept', 'decline', etc. for booking notifications

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_type, target_id);

-- =====================================================
-- BOOKINGS MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    sender_name TEXT,
    target_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    target_name TEXT,

    -- Booking details
    type TEXT NOT NULL CHECK (type IN (
        'Session', 'Lesson', 'Consultation', 'Rehearsal', 'Collaboration',
        'Vocal Recording', 'Feature Verse', 'Background Vocals', 'Vocal Topline',
        'Live Performance', 'Session Work', 'Demo Recording',
        'Beat Production', 'Full Production', 'Mixing', 'Mastering',
        'Studio Rental', 'Equipment Rental'
    )),
    service_type TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Declined', 'Cancelled', 'Completed', 'In Progress')),

    -- Timing
    date TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_hours NUMERIC(4, 2),

    -- Location & details
    location JSONB,
    venue_id UUID,
    equipment TEXT[] DEFAULT '{}',
    description TEXT,
    message TEXT,

    -- Pricing
    budget_cap NUMERIC(10, 2),
    agreed_price NUMERIC(10, 2),
    logistics TEXT,

    -- Attachments (media/files)
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Status timestamps
    responded_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Review
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_sender_id ON bookings(sender_id);
CREATE INDEX IF NOT EXISTS idx_bookings_target_id ON bookings(target_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(type);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_sender_status ON bookings(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_target_status ON bookings(target_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    creator_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    duration_hours NUMERIC(4, 2),
    location JSONB,
    required_roles TEXT[] DEFAULT '{}',
    participants JSONB DEFAULT '[]'::jsonb, -- [{user_id, role, status}]
    status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
    budget NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_creator_id ON sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- =====================================================
-- MARKETPLACE MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('gear', 'seshfx', 'service', 'other')),
    subcategory TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor')),
    images JSONB DEFAULT '[]'::jsonb,
    location JSONB,
    shipping_available BOOLEAN DEFAULT true,
    local_pickup_available BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'removed', 'expired')),
    views INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_market_items_seller_id ON market_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category);
CREATE INDEX IF NOT EXISTS idx_market_items_category_status ON market_items(category, status);
CREATE INDEX IF NOT EXISTS idx_market_items_status ON market_items(status);
CREATE INDEX IF NOT EXISTS idx_market_items_created_at ON market_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_items_price ON market_items(price);

-- =====================================================
-- EDUCATION MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    address JSONB,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    type TEXT CHECK (type IN ('Music School', 'University', 'College', 'Academy', 'Studio School', 'Other')),
    accreditation TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);

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

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_cohort ON students(cohort);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC COUNTS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS trigger_clerk_users_updated_at ON clerk_users;
CREATE TRIGGER trigger_clerk_users_updated_at
    BEFORE UPDATE ON clerk_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_sessions_updated_at ON sessions;
CREATE TRIGGER trigger_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_market_items_updated_at ON market_items;
CREATE TRIGGER trigger_market_items_updated_at
    BEFORE UPDATE ON market_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's active profile
CREATE OR REPLACE FUNCTION get_active_profile(p_user_id TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    photo_url TEXT,
    bio TEXT,
    account_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.display_name,
        p.photo_url,
        p.bio,
        cu.active_role AS account_type
    FROM profiles p
    JOIN clerk_users cu ON p.user_id = cu.id
    WHERE cu.id = p_user_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for posts with author info
CREATE OR REPLACE VIEW posts_with_authors AS
SELECT
    p.*,
    cu.email,
    cu.username,
    sp.display_name,
    sp.photo_url,
    sp.bio
FROM posts p
JOIN clerk_users cu ON p.user_id = cu.id
LEFT JOIN profiles sp ON sp.user_id = cu.id;

-- View for bookings with participant info
CREATE OR REPLACE VIEW bookings_with_details AS
SELECT
    b.*,
    sender.email AS sender_email,
    sender.username AS sender_username,
    target.email AS target_email,
    target.username AS target_username
FROM bookings b
JOIN clerk_users sender ON b.sender_id = sender.id
JOIN clerk_users target ON b.target_id = target.id;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE clerk_users IS 'User data synced from Clerk authentication';
COMMENT ON TABLE profiles IS 'Extended user profile information';
COMMENT ON TABLE sub_profiles IS 'Multiple account type profiles per user';
COMMENT ON TABLE posts IS 'Social media posts in the feed';
COMMENT ON TABLE comments IS 'Comments on posts';
COMMENT ON TABLE reactions IS 'User reactions (likes, emojis) to posts and comments';
COMMENT ON TABLE follows IS 'User follow relationships';
COMMENT ON TABLE saved_posts IS 'Bookmarked/saved posts by users';
COMMENT ON TABLE notifications IS 'User notifications for social interactions';
COMMENT ON TABLE bookings IS 'Booking requests for sessions, studio rentals, and talent services';
COMMENT ON TABLE sessions IS 'Extended session information with participants';
COMMENT ON TABLE market_items IS 'Marketplace items (gear, services, SeshFx)';
COMMENT ON TABLE schools IS 'Educational institutions';
COMMENT ON TABLE students IS 'Student enrollment records';
