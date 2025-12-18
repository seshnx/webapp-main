-- =====================================================
-- BUSINESS CENTER MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Business Center module (Studios, Labels, Distribution)
-- =====================================================

-- =====================================================
-- STUDIOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address JSONB NOT NULL, -- {street, city, state, zip, country, lat, lng}
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    amenities TEXT[] DEFAULT '{}', -- ['Parking', 'Kitchen', 'Lounge', etc.]
    equipment_list JSONB DEFAULT '[]'::jsonb, -- Array of equipment items
    rooms JSONB DEFAULT '[]'::jsonb, -- Array of room configurations
    operating_hours JSONB DEFAULT '{}'::jsonb, -- {monday: {open, close}, ...}
    pricing JSONB DEFAULT '{}'::jsonb, -- {hourly_rate, daily_rate, etc.}
    policies JSONB DEFAULT '{}'::jsonb, -- Studio policies and rules
    is_verified BOOLEAN DEFAULT false,
    rating_average NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for studios
CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON studios(owner_id);
CREATE INDEX IF NOT EXISTS idx_studios_status ON studios(status);
CREATE INDEX IF NOT EXISTS idx_studios_is_verified ON studios(is_verified);
CREATE INDEX IF NOT EXISTS idx_studios_rating ON studios(rating_average DESC);

-- =====================================================
-- LABEL ROSTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS label_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Label owner
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Artist' CHECK (role IN ('Artist', 'Producer', 'Songwriter', 'Engineer', 'Manager')),
    contract_type TEXT CHECK (contract_type IN ('Exclusive', 'Non-Exclusive', 'Distribution Only', 'Management')),
    signed_date DATE,
    contract_end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(label_id, artist_id) -- One roster entry per label-artist pair
);

-- Indexes for label_roster
CREATE INDEX IF NOT EXISTS idx_label_roster_label_id ON label_roster(label_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_artist_id ON label_roster(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_status ON label_roster(status);

-- =====================================================
-- DISTRIBUTION STATS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS distribution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    release_id UUID, -- Reference to release/album
    platform TEXT NOT NULL, -- 'Spotify', 'Apple Music', 'YouTube Music', etc.
    streams BIGINT DEFAULT 0,
    downloads BIGINT DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for distribution_stats
CREATE INDEX IF NOT EXISTS idx_distribution_stats_user_id ON distribution_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_release_id ON distribution_stats(release_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_platform ON distribution_stats(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_period ON distribution_stats(period_start, period_end);

-- =====================================================
-- ROYALTY REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS royalty_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    release_id UUID,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    platform_breakdown JSONB DEFAULT '{}'::jsonb, -- {spotify: {revenue, streams}, ...}
    artist_breakdown JSONB DEFAULT '[]'::jsonb, -- Array of {artist_id, share_percentage, revenue}
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for royalty_reports
CREATE INDEX IF NOT EXISTS idx_royalty_reports_user_id ON royalty_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_release_id ON royalty_reports(release_id);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_period ON royalty_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_status ON royalty_reports(status);

-- =====================================================
-- RELEASES TABLE (Music Releases)
-- =====================================================
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Single', 'EP', 'Album', 'Mixtape', 'Compilation')),
    release_date DATE,
    cover_art_url TEXT,
    genre TEXT,
    subgenre TEXT,
    isrc TEXT, -- International Standard Recording Code
    upc TEXT, -- Universal Product Code
    platforms JSONB DEFAULT '[]'::jsonb, -- Array of distribution platforms
    tracks JSONB DEFAULT '[]'::jsonb, -- Array of track information
    total_streams BIGINT DEFAULT 0,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'distributed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for releases
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_id ON releases(label_id);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

-- =====================================================
-- SCHOOL PARTNERS TABLE (For EDU-Business partnerships)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL, -- Reference to schools table
    partner_type TEXT CHECK (partner_type IN ('Studio', 'Label', 'Venue', 'Other')),
    partner_id UUID NOT NULL, -- Reference to studios/labels/users
    partnership_type TEXT CHECK (partnership_type IN ('Internship', 'Workshop', 'Event', 'Collaboration')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for school_partners
CREATE INDEX IF NOT EXISTS idx_school_partners_school_id ON school_partners(school_id);
CREATE INDEX IF NOT EXISTS idx_school_partners_partner_id ON school_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_school_partners_status ON school_partners(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_studios_updated_at
    BEFORE UPDATE ON studios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_label_roster_updated_at
    BEFORE UPDATE ON label_roster
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_distribution_stats_updated_at
    BEFORE UPDATE ON distribution_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_royalty_reports_updated_at
    BEFORE UPDATE ON royalty_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_releases_updated_at
    BEFORE UPDATE ON releases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_school_partners_updated_at
    BEFORE UPDATE ON school_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_partners ENABLE ROW LEVEL SECURITY;

-- Studios: Everyone can view active studios
CREATE POLICY "Studios are viewable by everyone" ON studios
    FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

-- Studios: Users can insert their own studios
CREATE POLICY "Users can insert their own studios" ON studios
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Label Roster: Users can see rosters they're part of
CREATE POLICY "Users can view their label rosters" ON label_roster
    FOR SELECT USING (auth.uid() = label_id OR auth.uid() = artist_id);

-- Label Roster: Labels can insert roster entries
CREATE POLICY "Labels can insert roster entries" ON label_roster
    FOR INSERT WITH CHECK (auth.uid() = label_id);

-- Distribution Stats: Users can only see their own stats
CREATE POLICY "Users can view their own distribution stats" ON distribution_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Royalty Reports: Users can only see their own reports
CREATE POLICY "Users can view their own royalty reports" ON royalty_reports
    FOR SELECT USING (auth.uid() = user_id);

-- Releases: Everyone can view distributed releases
CREATE POLICY "Releases are viewable by everyone" ON releases
    FOR SELECT USING (status = 'distributed' OR artist_id = auth.uid() OR label_id = auth.uid());

-- Releases: Artists can insert their own releases
CREATE POLICY "Artists can insert their own releases" ON releases
    FOR INSERT WITH CHECK (auth.uid() = artist_id);

-- School Partners: Users can see partnerships they're involved in
CREATE POLICY "Users can view relevant school partnerships" ON school_partners
    FOR SELECT USING (auth.uid() = partner_id OR status = 'active');

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE studios IS 'Music studio listings and information';
COMMENT ON TABLE label_roster IS 'Label artist roster and contracts';
COMMENT ON TABLE distribution_stats IS 'Music distribution statistics by platform';
COMMENT ON TABLE royalty_reports IS 'Royalty distribution reports';
COMMENT ON TABLE releases IS 'Music releases (singles, albums, EPs)';
COMMENT ON TABLE school_partners IS 'Partnerships between schools and businesses';

