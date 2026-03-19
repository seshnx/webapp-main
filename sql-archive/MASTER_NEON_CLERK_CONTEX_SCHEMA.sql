-- =====================================================
-- MASTER NEON + CLERK + CONVEX REALTIME SCHEMA
-- =====================================================
-- Complete database schema for SeshNx application
--
-- Architecture:
-- - Neon (PostgreSQL): Primary database for persistent data
-- - Clerk: Authentication and user management
-- - Convex: Real-time features (chat, presence, read receipts)
--
-- Key changes from Supabase version:
-- - All user IDs are TEXT (Clerk format: user_abc123)
-- - No auth.users references
-- - RLS policies simplified (Clerk handles auth)
--
-- Run order:
-- 1. 00_core_unified_schema.sql (if not already run)
-- 2. THIS FILE - Adds missing tables and fixes
-- 3. fix_clerk_uuid_mismatch.sql (fixes existing tables)
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- STUDIOS & ROOMS MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address JSONB NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    amenities TEXT[] DEFAULT '{}',
    equipment_list JSONB DEFAULT '[]'::jsonb,
    rooms JSONB DEFAULT '[]'::jsonb,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    pricing JSONB DEFAULT '{}'::jsonb,
    policies JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    rating_average NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON studios(owner_id);
CREATE INDEX IF NOT EXISTS idx_studios_status ON studios(status);

CREATE TABLE IF NOT EXISTS studio_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT CHECK (room_type IN ('Recording Studio', 'Mixing Room', 'Live Room', 'Rehearsal Space', 'Podcast Studio', 'Other')),
    square_footage INTEGER,
    capacity INTEGER,
    hourly_rate NUMERIC(10, 2),
    daily_rate NUMERIC(10, 2),

    -- Equipment & features
    equipment JSONB DEFAULT '[]'::jsonb,
    features TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',

    -- Availability
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    minimum_booking_hours INTEGER DEFAULT 1,
    cancellation_notice_hours INTEGER DEFAULT 24,

    -- Media
    photos JSONB DEFAULT '[]'::jsonb,
    virtual_tour_url TEXT,

    -- Metadata
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_rooms_studio_id ON studio_rooms(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_rooms_room_type ON studio_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_studio_rooms_is_active ON studio_rooms(is_active);

-- =====================================================
-- LABEL & DISTRIBUTION MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS label_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    artist_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Artist info (denormalized for quick access)
    name TEXT NOT NULL,
    email TEXT,
    photo_url TEXT,

    -- Contract details
    role TEXT,
    contract_type TEXT,
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

CREATE INDEX IF NOT EXISTS idx_label_roster_label_id ON label_roster(label_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_artist_id ON label_roster(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_status ON label_roster(status);

CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    label_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Release details
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Single', 'EP', 'Album', 'Mixtape')),
    genre TEXT,
    release_date DATE,

    -- Artwork
    cover_art_url TEXT,

    -- Tracking
    isrc TEXT UNIQUE,
    upc TEXT UNIQUE,

    -- Platform distribution
    platforms JSONB DEFAULT '{}'::jsonb,
    tracks JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'distributed', 'rejected', 'takedowned')),

    -- Distribution details
    distributor TEXT,
    catalog_number TEXT,
    upc_ean TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_id ON releases(label_id);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

CREATE TABLE IF NOT EXISTS distribution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

    -- Platform-specific stats
    platform TEXT NOT NULL,

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

CREATE INDEX IF NOT EXISTS idx_distribution_stats_user_id ON distribution_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_release_id ON distribution_stats(release_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_platform ON distribution_stats(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_period ON distribution_stats(period_start, period_end);

CREATE TABLE IF NOT EXISTS external_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Artist details
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    stage_name TEXT,

    -- Genre & role
    genre TEXT[] DEFAULT '{}',
    primary_role TEXT,

    -- Social links
    social_links JSONB DEFAULT '{}'::jsonb,

    -- Contract details
    contract_type TEXT,
    signed_date DATE,

    -- Invitation (for platform onboarding)
    invitation_token TEXT UNIQUE,
    invitation_sent_at TIMESTAMPTZ,
    invitation_expires_at TIMESTAMPTZ,
    clerk_user_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('invited', 'active', 'inactive', 'platform')),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_artists_label_id ON external_artists(label_id);
CREATE INDEX IF NOT EXISTS idx_external_artists_status ON external_artists(status);
CREATE INDEX IF NOT EXISTS idx_external_artists_invitation_token ON external_artists(invitation_token);

-- =====================================================
-- BOOKINGS ENHANCEMENTS
-- =====================================================

-- Add studio_owner_id column to bookings if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'studio_owner_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN studio_owner_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES studio_rooms(id) ON DELETE CASCADE,

    -- Blocked date range
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Reason
    reason TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,

    -- Metadata
    created_by TEXT REFERENCES clerk_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure no overlaps (excluding same studio)
    EXCLUDE USING GIST (
        studio_id WITH =,
        tsrange(start_date, end_date, '[]') WITH &&
    )
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_studio_id ON blocked_dates(studio_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date_range ON blocked_dates USING GIST(tsrange(start_date, end_date, '[]'));

-- =====================================================
-- WALLETS & PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE REFERENCES clerk_users(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,

    -- Transaction details
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer', 'refund', 'payout')),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),

    -- Description
    description TEXT,
    reference_type TEXT, -- 'booking', 'gear_purchase', 'service', etc.
    reference_id UUID,
    payment_method TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_type, reference_id);

-- =====================================================
-- APP CONFIG (Simple version)
-- =====================================================

CREATE TABLE IF NOT EXISTS app_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
CREATE INDEX IF NOT EXISTS idx_app_config_category ON app_config(category);
CREATE INDEX IF NOT EXISTS idx_app_config_is_public ON app_config(is_public);

-- =====================================================
-- SUB PROFILES (Simplified for Clerk)
-- =====================================================

-- Drop existing sub_profiles if it has old structure
DROP TABLE IF EXISTS sub_profiles CASCADE;

CREATE TABLE sub_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_sub_profiles_user_id ON sub_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_role ON sub_profiles(role);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_is_active ON sub_profiles(is_active);

-- =====================================================
-- GOOGLE CALENDAR SYNC
-- =====================================================

CREATE TABLE IF NOT EXISTS calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google',
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    calendar_id TEXT,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id ON calendar_connections(user_id);

CREATE TABLE IF NOT EXISTS synced_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL, -- External calendar event ID
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Event details
    title TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    description TEXT,
    location TEXT,

    -- Sync status
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'error')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_synced_events_user_id ON synced_events(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_events_connection_id ON synced_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_synced_events_booking_id ON synced_events(booking_id);

-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Campaign details
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('album_release', 'single_release', 'tour', 'event', 'brand_awareness', 'other')),
    description TEXT,

    -- Budget & goals
    budget NUMERIC(10, 2),
    actual_spend NUMERIC(10, 2) DEFAULT 0,

    -- Timeline
    start_date DATE,
    end_date DATE,

    -- Platforms & channels
    platforms JSONB DEFAULT '{}'::jsonb,
    target_audience JSONB DEFAULT '{}'::jsonb,

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),

    -- Metrics
    reach INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5, 2),
    conversions INTEGER DEFAULT 0,
    roi NUMERIC(10, 2),

    -- Assets
    assets JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_owner_id ON marketing_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- =====================================================
-- CONTRACTS & LEGAL DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id TEXT REFERENCES clerk_users(id) ON DELETE CASCADE,
    artist_id TEXT REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Contract details
    type TEXT CHECK (type IN ('recording', 'distribution', 'publishing', 'management', 'licensing', 'other')),
    title TEXT NOT NULL,
    description TEXT,

    -- Dates
    start_date DATE,
    end_date DATE,
    signing_date DATE,

    -- Terms
    terms JSONB DEFAULT '{}'::jsonb,
    split_percentage NUMERIC(5, 2),
    advance_amount NUMERIC(10, 2),
    royalty_rate NUMERIC(5, 2),

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'expired', 'terminated')),

    -- Documents
    document_url TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_label_id ON contracts(label_id);
CREATE INDEX IF NOT EXISTS idx_contracts_artist_id ON contracts(artist_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- =====================================================
-- EQUIPMENT DATABASE
-- =====================================================

CREATE TABLE IF NOT EXISTS equipment_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    type TEXT,
    series TEXT,
    size TEXT,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    search_tokens TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    verified_by TEXT[] DEFAULT '{}',
    added_by TEXT REFERENCES clerk_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_database_verified ON equipment_database(verified);
CREATE INDEX IF NOT EXISTS idx_equipment_database_category ON equipment_database(category);
CREATE INDEX IF NOT EXISTS idx_equipment_database_search ON equipment_database USING GIN(search_tokens);

CREATE TABLE IF NOT EXISTS equipment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    submitted_by TEXT NOT NULL REFERENCES clerk_users(id),
    submitter_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    votes JSONB DEFAULT '{"yes": [], "fake": [], "duplicate": []}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_submissions_status ON equipment_submissions(status);

-- =====================================================
-- INSTRUMENT DATABASE
-- =====================================================

CREATE TABLE IF NOT EXISTS instrument_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    type TEXT,
    series TEXT,
    size TEXT,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    search_tokens TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    verified_by TEXT[] DEFAULT '{}',
    added_by TEXT REFERENCES clerk_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instrument_database_verified ON instrument_database(verified);
CREATE INDEX IF NOT EXISTS idx_instrument_database_category ON instrument_database(category);
CREATE INDEX IF NOT EXISTS idx_instrument_database_search ON instrument_database USING GIN(search_tokens);

CREATE TABLE IF NOT EXISTS instrument_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    type TEXT,
    series TEXT,
    size TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    submitted_by TEXT NOT NULL REFERENCES clerk_users(id),
    submitter_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    votes JSONB DEFAULT '{"yes": [], "fake": [], "duplicate": []}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instrument_submissions_status ON instrument_submissions(status);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
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
        ('studios'), ('studio_rooms'), ('label_roster'), ('releases'),
        ('distribution_stats'), ('external_artists'), ('wallets'),
        ('transactions'), ('app_config'), ('sub_profiles'),
        ('synced_events'), ('marketing_campaigns'), ('contracts'),
        ('equipment_database'), ('instrument_database')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_%s_updated_at ON %I', table_name, table_name);
        EXECUTE format('CREATE TRIGGER trigger_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Unified roster view (platform + external artists)
CREATE OR REPLACE VIEW unified_label_roster AS
SELECT
    lr.id,
    lr.artist_id,
    lr.name,
    lr.email,
    lr.photo_url,
    lr.status,
    lr.signed_date,
    'platform'::TEXT as artist_type,
    cu.username,
    p.display_name
FROM label_roster lr
JOIN clerk_users cu ON cu.id = lr.artist_id
LEFT JOIN profiles p ON p.user_id = cu.id

UNION ALL

SELECT
    ea.id,
    NULL::TEXT as artist_id,
    ea.name,
    ea.email,
    NULL::TEXT as photo_url,
    ea.status,
    ea.signed_date,
    'external'::TEXT as artist_type,
    NULL::TEXT as username,
    ea.stage_name as display_name
FROM external_artists ea;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE studios IS 'Studio profiles for recording studios';
COMMENT ON TABLE studio_rooms IS 'Individual rooms within studios available for booking';
COMMENT ON TABLE label_roster IS 'Artist roster for labels';
COMMENT ON TABLE releases IS 'Music releases (singles, EPs, albums)';
COMMENT ON TABLE distribution_stats IS 'Streaming and revenue metrics by platform';
COMMENT ON TABLE external_artists IS 'Artists not yet on the SeshNx platform';
COMMENT ON TABLE wallets IS 'User wallet balances';
COMMENT ON TABLE transactions IS 'Transaction history for payments';
COMMENT ON TABLE contracts IS 'Legal contracts between labels and artists';
COMMENT ON TABLE marketing_campaigns IS 'Marketing campaigns and promotions';
COMMENT ON TABLE equipment_database IS 'Verified equipment database';
COMMENT ON TABLE instrument_database IS 'Verified instrument database';
