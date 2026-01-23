-- =====================================================
-- BUSINESS CENTER MODULE - SQL Editor Script (Fixed)
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

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'studios') THEN
        -- Add missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'owner_id') THEN
            ALTER TABLE studios ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'name') THEN
            ALTER TABLE studios ADD COLUMN name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'description') THEN
            ALTER TABLE studios ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'address') THEN
            ALTER TABLE studios ADD COLUMN address JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'phone') THEN
            ALTER TABLE studios ADD COLUMN phone TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'email') THEN
            ALTER TABLE studios ADD COLUMN email TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'website') THEN
            ALTER TABLE studios ADD COLUMN website TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'logo_url') THEN
            ALTER TABLE studios ADD COLUMN logo_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'cover_image_url') THEN
            ALTER TABLE studios ADD COLUMN cover_image_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'gallery_images') THEN
            ALTER TABLE studios ADD COLUMN gallery_images JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'amenities') THEN
            ALTER TABLE studios ADD COLUMN amenities TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'equipment_list') THEN
            ALTER TABLE studios ADD COLUMN equipment_list JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'rooms') THEN
            ALTER TABLE studios ADD COLUMN rooms JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'operating_hours') THEN
            ALTER TABLE studios ADD COLUMN operating_hours JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'pricing') THEN
            ALTER TABLE studios ADD COLUMN pricing JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'policies') THEN
            ALTER TABLE studios ADD COLUMN policies JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'is_verified') THEN
            ALTER TABLE studios ADD COLUMN is_verified BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'rating_average') THEN
            ALTER TABLE studios ADD COLUMN rating_average NUMERIC(3, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'review_count') THEN
            ALTER TABLE studios ADD COLUMN review_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'booking_count') THEN
            ALTER TABLE studios ADD COLUMN booking_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'status') THEN
            ALTER TABLE studios ADD COLUMN status TEXT DEFAULT 'active';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'created_at') THEN
            ALTER TABLE studios ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'updated_at') THEN
            ALTER TABLE studios ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for studios (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'owner_id') THEN
        CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON studios(owner_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_studios_status ON studios(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'is_verified') THEN
        CREATE INDEX IF NOT EXISTS idx_studios_is_verified ON studios(is_verified);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'rating_average') THEN
        CREATE INDEX IF NOT EXISTS idx_studios_rating ON studios(rating_average DESC);
    END IF;
END $$;

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

-- Indexes for label_roster (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'label_roster' AND column_name = 'label_id') THEN
        CREATE INDEX IF NOT EXISTS idx_label_roster_label_id ON label_roster(label_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'label_roster' AND column_name = 'artist_id') THEN
        CREATE INDEX IF NOT EXISTS idx_label_roster_artist_id ON label_roster(artist_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'label_roster' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_label_roster_status ON label_roster(status);
    END IF;
END $$;

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

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'distribution_stats') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'user_id') THEN
            ALTER TABLE distribution_stats ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'release_id') THEN
            ALTER TABLE distribution_stats ADD COLUMN release_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'platform') THEN
            ALTER TABLE distribution_stats ADD COLUMN platform TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'streams') THEN
            ALTER TABLE distribution_stats ADD COLUMN streams BIGINT DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'downloads') THEN
            ALTER TABLE distribution_stats ADD COLUMN downloads BIGINT DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'revenue') THEN
            ALTER TABLE distribution_stats ADD COLUMN revenue NUMERIC(12, 2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'period_start') THEN
            ALTER TABLE distribution_stats ADD COLUMN period_start DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'period_end') THEN
            ALTER TABLE distribution_stats ADD COLUMN period_end DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'metadata') THEN
            ALTER TABLE distribution_stats ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'created_at') THEN
            ALTER TABLE distribution_stats ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'updated_at') THEN
            ALTER TABLE distribution_stats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for distribution_stats (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_distribution_stats_user_id ON distribution_stats(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'release_id') THEN
        CREATE INDEX IF NOT EXISTS idx_distribution_stats_release_id ON distribution_stats(release_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'platform') THEN
        CREATE INDEX IF NOT EXISTS idx_distribution_stats_platform ON distribution_stats(platform);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'period_start')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'period_end') THEN
        CREATE INDEX IF NOT EXISTS idx_distribution_stats_period ON distribution_stats(period_start, period_end);
    END IF;
END $$;

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

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'royalty_reports') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'user_id') THEN
            ALTER TABLE royalty_reports ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'release_id') THEN
            ALTER TABLE royalty_reports ADD COLUMN release_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'report_period_start') THEN
            ALTER TABLE royalty_reports ADD COLUMN report_period_start DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'report_period_end') THEN
            ALTER TABLE royalty_reports ADD COLUMN report_period_end DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'total_revenue') THEN
            ALTER TABLE royalty_reports ADD COLUMN total_revenue NUMERIC(12, 2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'total_streams') THEN
            ALTER TABLE royalty_reports ADD COLUMN total_streams BIGINT DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'platform_breakdown') THEN
            ALTER TABLE royalty_reports ADD COLUMN platform_breakdown JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'artist_breakdown') THEN
            ALTER TABLE royalty_reports ADD COLUMN artist_breakdown JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'status') THEN
            ALTER TABLE royalty_reports ADD COLUMN status TEXT DEFAULT 'draft';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'notes') THEN
            ALTER TABLE royalty_reports ADD COLUMN notes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'created_at') THEN
            ALTER TABLE royalty_reports ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'updated_at') THEN
            ALTER TABLE royalty_reports ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for royalty_reports (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_royalty_reports_user_id ON royalty_reports(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'release_id') THEN
        CREATE INDEX IF NOT EXISTS idx_royalty_reports_release_id ON royalty_reports(release_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'report_period_start')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'report_period_end') THEN
        CREATE INDEX IF NOT EXISTS idx_royalty_reports_period ON royalty_reports(report_period_start, report_period_end);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_royalty_reports_status ON royalty_reports(status);
    END IF;
END $$;

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

-- Indexes for releases (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'artist_id') THEN
        CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'label_id') THEN
        CREATE INDEX IF NOT EXISTS idx_releases_label_id ON releases(label_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'release_date') THEN
        CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
    END IF;
END $$;

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

-- Indexes for school_partners (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_partners' AND column_name = 'school_id') THEN
        CREATE INDEX IF NOT EXISTS idx_school_partners_school_id ON school_partners(school_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_partners' AND column_name = 'partner_id') THEN
        CREATE INDEX IF NOT EXISTS idx_school_partners_partner_id ON school_partners(partner_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_partners' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_school_partners_status ON school_partners(status);
    END IF;
END $$;

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

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_studios_updated_at ON studios;
DROP TRIGGER IF EXISTS trigger_label_roster_updated_at ON label_roster;
DROP TRIGGER IF EXISTS trigger_distribution_stats_updated_at ON distribution_stats;
DROP TRIGGER IF EXISTS trigger_royalty_reports_updated_at ON royalty_reports;
DROP TRIGGER IF EXISTS trigger_releases_updated_at ON releases;
DROP TRIGGER IF EXISTS trigger_school_partners_updated_at ON school_partners;

-- Create triggers
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Studios are viewable by everyone" ON studios;
DROP POLICY IF EXISTS "Users can insert their own studios" ON studios;
DROP POLICY IF EXISTS "Users can view their label rosters" ON label_roster;
DROP POLICY IF EXISTS "Labels can insert roster entries" ON label_roster;
DROP POLICY IF EXISTS "Users can view their own distribution stats" ON distribution_stats;
DROP POLICY IF EXISTS "Users can view their own royalty reports" ON royalty_reports;
DROP POLICY IF EXISTS "Releases are viewable by everyone" ON releases;
DROP POLICY IF EXISTS "Artists can insert their own releases" ON releases;
DROP POLICY IF EXISTS "Users can view relevant school partnerships" ON school_partners;

-- Studios: Everyone can view active studios
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'status')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'owner_id') THEN
        CREATE POLICY "Studios are viewable by everyone" ON studios
            FOR SELECT USING (status = 'active' OR owner_id = auth.uid());
        
        CREATE POLICY "Users can insert their own studios" ON studios
            FOR INSERT WITH CHECK (auth.uid() = owner_id);
    END IF;
END $$;

-- Label Roster: Users can see rosters they're part of
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'label_roster' AND column_name = 'label_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'label_roster' AND column_name = 'artist_id') THEN
        CREATE POLICY "Users can view their label rosters" ON label_roster
            FOR SELECT USING (auth.uid() = label_id OR auth.uid() = artist_id);
        
        CREATE POLICY "Labels can insert roster entries" ON label_roster
            FOR INSERT WITH CHECK (auth.uid() = label_id);
    END IF;
END $$;

-- Distribution Stats: Users can only see their own stats
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distribution_stats' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own distribution stats" ON distribution_stats
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Royalty Reports: Users can only see their own reports
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'royalty_reports' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own royalty reports" ON royalty_reports
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Releases: Everyone can view distributed releases
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'status')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'artist_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'releases' AND column_name = 'label_id') THEN
        CREATE POLICY "Releases are viewable by everyone" ON releases
            FOR SELECT USING (status = 'distributed' OR artist_id = auth.uid() OR label_id = auth.uid());
        
        CREATE POLICY "Artists can insert their own releases" ON releases
            FOR INSERT WITH CHECK (auth.uid() = artist_id);
    END IF;
END $$;

-- School Partners: Users can see partnerships they're involved in
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_partners' AND column_name = 'partner_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_partners' AND column_name = 'status') THEN
        CREATE POLICY "Users can view relevant school partnerships" ON school_partners
            FOR SELECT USING (auth.uid() = partner_id OR status = 'active');
    END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE studios IS 'Music studio listings and information';
COMMENT ON TABLE label_roster IS 'Label artist roster and contracts';
COMMENT ON TABLE distribution_stats IS 'Music distribution statistics by platform';
COMMENT ON TABLE royalty_reports IS 'Royalty distribution reports';
COMMENT ON TABLE releases IS 'Music releases (singles, albums, EPs)';
COMMENT ON TABLE school_partners IS 'Partnerships between schools and businesses';

