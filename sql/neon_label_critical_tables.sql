-- =====================================================
-- NEON LABEL CRITICAL TABLES
-- =====================================================
-- This file contains the CRITICAL tables needed for Label Dashboard
-- to work with real data for the partnership meeting.
--
-- These tables are converted from business_center_module_fixed.sql
-- with auth.users replaced with clerk_users for Neon compatibility.
--
-- Run this in Neon SQL Editor AFTER running neon_unified_schema.sql
--
-- Order of execution:
-- 1. sql/neon_unified_schema.sql (creates clerk_users, profiles, etc.)
-- 2. sql/contracts_module.sql (creates contract tables)
-- 3. sql/marketing_campaigns_module.sql (creates campaign tables)
-- 4. sql/neon_label_critical_tables.sql (THIS FILE - creates label/business tables)
-- =====================================================

-- =====================================================
-- LABEL ROSTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS label_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Artist info (denormalized for quick access)
    name TEXT NOT NULL,
    email TEXT,
    photo_url TEXT,

    -- Contract details
    role TEXT, -- Artist, Producer, Songwriter, etc.
    contract_type TEXT, -- Recording, Distribution, Publishing, etc.
    signed_date DATE,
    contract_end_date DATE,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),

    -- Additional metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one active roster entry per label-artist pair
    UNIQUE(label_id, artist_id)
);

-- Indexes for label_roster
CREATE INDEX IF NOT EXISTS idx_label_roster_label_id ON label_roster(label_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_artist_id ON label_roster(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_status ON label_roster(status);

-- =====================================================
-- RELEASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    label_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Release details
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Single', 'EP', 'Album', 'Mixtape')),
    genre TEXT,
    release_date DATE,

    -- Artwork
    cover_art_url TEXT,

    -- Tracking
    isrc TEXT UNIQUE, -- International Standard Recording Code
    upc TEXT UNIQUE,  -- Universal Product Code

    -- Platform distribution (JSONB for flexibility)
    platforms JSONB DEFAULT '{}'::jsonb, -- {spotify: true, apple: true, etc.}

    -- Track listing (JSONB for flexibility)
    tracks JSONB DEFAULT '[]'::jsonb, -- [{title, duration, isrc, explicit, etc.}]

    -- Status tracking
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'distributed', 'archived')),

    -- Distribution metadata
    distributor TEXT,
    catalog_number TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Denormalized stats (updated periodically)
    streams BIGINT DEFAULT 0,
    revenue NUMERIC(10, 2) DEFAULT 0,
    monthly_streams BIGINT DEFAULT 0
);

-- Indexes for releases
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_id ON releases(label_id);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_type ON releases(type);

-- =====================================================
-- DISTRIBUTION STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS distribution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

    -- Platform-specific stats
    platform TEXT NOT NULL, -- spotify, apple_music, youtube, etc.

    -- Streaming metrics
    streams BIGINT DEFAULT 0,
    monthly_streams BIGINT DEFAULT 0,
    monthly_listeners INTEGER DEFAULT 0,

    -- Revenue metrics
    revenue NUMERIC(10, 2) DEFAULT 0,
    lifetime_earnings NUMERIC(10, 2) DEFAULT 0,
    lifetime_streams BIGINT DEFAULT 0,

    -- Period tracking
    period_start DATE,
    period_end DATE,

    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one stats record per user-platform-period
    UNIQUE(user_id, platform, period_start)
);

-- Indexes for distribution_stats
CREATE INDEX IF NOT EXISTS idx_distribution_stats_user_id ON distribution_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_release_id ON distribution_stats(release_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_platform ON distribution_stats(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_period ON distribution_stats(period_start, period_end);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_label_roster_updated_at ON label_roster;
CREATE TRIGGER trigger_label_roster_updated_at
    BEFORE UPDATE ON label_roster
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_releases_updated_at ON releases;
CREATE TRIGGER trigger_releases_updated_at
    BEFORE UPDATE ON releases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_distribution_stats_updated_at ON distribution_stats;
CREATE TRIGGER trigger_distribution_stats_updated_at
    BEFORE UPDATE ON distribution_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE label_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Labels can view their roster" ON label_roster;
DROP POLICY IF EXISTS "Labels can insert roster entries" ON label_roster;
DROP POLICY IF EXISTS "Labels can update their roster" ON label_roster;

DROP POLICY IF EXISTS "Everyone can view releases" ON releases;
DROP POLICY IF EXISTS "Artists can insert their releases" ON releases;
DROP POLICY IF EXISTS "Labels can insert releases" ON releases;

DROP POLICY IF EXISTS "Users can view their distribution stats" ON distribution_stats;
DROP POLICY IF EXISTS "Users can insert distribution stats" ON distribution_stats;

-- Create policies for label_roster
CREATE POLICY "Labels can view their roster" ON label_roster
    FOR SELECT USING (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id)); -- Simplified, will use clerk JWT context

CREATE POLICY "Labels can insert roster entries" ON label_roster
    FOR INSERT WITH CHECK (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Labels can update their roster" ON label_roster
    FOR UPDATE USING (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

-- Create policies for releases
CREATE POLICY "Everyone can view releases" ON releases
    FOR SELECT USING (true);

CREATE POLICY "Artists can insert their releases" ON releases
    FOR INSERT WITH CHECK (artist_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Labels can insert releases" ON releases
    FOR INSERT WITH CHECK (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Artists can update their releases" ON releases
    FOR UPDATE USING (artist_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Labels can update their releases" ON releases
    FOR UPDATE USING (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

-- Create policies for distribution_stats
CREATE POLICY "Users can view their distribution stats" ON distribution_stats
    FOR SELECT USING (user_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Users can insert distribution stats" ON distribution_stats
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for releases with artist and label info
CREATE OR REPLACE VIEW releases_with_details AS
SELECT
    r.*,
    artist.username as artist_username,
    artist.email as artist_email,
    sp_artist.display_name as artist_display_name,
    sp_artist.photo_url as artist_photo_url,
    label.username as label_username,
    sp_label.display_name as label_display_name
FROM releases r
JOIN clerk_users artist ON artist.id = r.artist_id
LEFT JOIN profiles sp_artist ON sp_artist.user_id = artist.id
LEFT JOIN clerk_users label ON label.id = r.label_id
LEFT JOIN profiles sp_label ON sp_label.user_id = label.id;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - For Demo Purposes)
-- =====================================================

-- Uncomment the following to add sample data for demo

-- Sample label roster entry
-- INSERT INTO label_roster (label_id, artist_id, name, email, photo_url, status, signed_date)
-- VALUES
-- ('label-uuid-here', 'artist-uuid-here', 'Demo Artist', 'demo@artist.com', 'https://...', 'active', CURRENT_DATE);

-- Sample release
-- INSERT INTO releases (artist_id, label_id, title, type, genre, release_date, status)
-- VALUES
-- ('artist-uuid-here', 'label-uuid-here', 'Summer Hits', 'EP', 'Pop', CURRENT_DATE + INTERVAL '30 days', 'distributed');

-- Sample distribution stats
-- INSERT INTO distribution_stats (user_id, platform, streams, lifetime_earnings, monthly_streams)
-- VALUES
-- ('artist-uuid-here', 'spotify', 150000, 5000, 25000);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE label_roster IS 'Label artist roster and contract tracking';
COMMENT ON TABLE releases IS 'Music releases (singles, EPs, albums) with distribution metadata';
COMMENT ON TABLE distribution_stats IS 'Streaming and revenue statistics by platform';

-- =====================================================
-- IMPORTANT NOTES FOR NEON + CLERK SETUP
-- =====================================================
--
-- 1. Clerk Authentication Context:
--    The RLS policies above use a simplified approach. In production with Clerk:
--    - Configure Clerk to include user_id in JWT token
--    - Use Neon's "connection with authentication" feature
--    - Or use middleware to set the user context
--
-- 2. Alternative: Disable RLS and handle authorization in application code
--    - For demo: You can disable RLS temporarily
--    - ALTER TABLE label_roster DISABLE ROW LEVEL SECURITY;
--
-- 3. For Development:
--    - These tables work immediately for queries
--    - RLS policies may need adjustment based on Clerk integration
--
-- 4. Migration from Supabase:
--    - Original files use auth.users (Supabase)
--    - This file converts to clerk_users (Neon + Clerk)
--    - All foreign keys updated
-- =====================================================
