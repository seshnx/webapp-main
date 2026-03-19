-- =====================================================
-- EXTERNAL ARTISTS TABLE
-- =====================================================
-- This table allows labels to track and manage artists who
-- are not yet on the SeshNx platform. It supports the full
-- artist lifecycle from invitation to platform migration.
--
-- Run this in Neon SQL Editor after running neon_label_critical_tables.sql
-- =====================================================

-- Create external_artists table
CREATE TABLE IF NOT EXISTS external_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,

    -- Artist identity
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,

    -- Artist details
    stage_name TEXT,
    genre TEXT[],
    primary_role TEXT, -- Singer, Rapper, Producer, Songwriter, DJ, etc.

    -- Social/external links
    spotify_url TEXT,
    soundcloud_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,

    -- Contract info
    contract_type TEXT,
    signed_date DATE,
    contract_end_date DATE,

    -- Status workflow
    status TEXT DEFAULT 'invited' CHECK (status IN (
        'invited',      -- Sent invitation but not joined
        'active',       -- Active external artist
        'inactive',     -- Temporarily inactive
        'platform',     -- Joined platform (migrated to clerk_users)
        'terminated'    -- Contract ended
    )),

    -- Invitation tracking
    invitation_token TEXT UNIQUE,
    invitation_sent_at TIMESTAMPTZ,
    invitation_expires_at TIMESTAMPTZ,

    -- Platform migration
    clerk_user_id TEXT REFERENCES clerk_users(id), -- When they join platform

    -- Performance tracking (denormalized)
    total_streams BIGINT DEFAULT 0,
    total_revenue NUMERIC(10,2) DEFAULT 0,

    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one external artist per label per email
    UNIQUE(label_id, email)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_external_artists_label_id ON external_artists(label_id);
CREATE INDEX IF NOT EXISTS idx_external_artists_status ON external_artists(status);
CREATE INDEX IF NOT EXISTS idx_external_artists_invitation_token ON external_artists(invitation_token);
CREATE INDEX IF NOT EXISTS idx_external_artists_email ON external_artists(email);
CREATE INDEX IF NOT EXISTS idx_external_artists_clerk_user_id ON external_artists(clerk_user_id);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS trigger_external_artists_updated_at ON external_artists;
CREATE TRIGGER trigger_external_artists_updated_at
    BEFORE UPDATE ON external_artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE external_artists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Labels can view their external artists" ON external_artists;
DROP POLICY IF EXISTS "Labels can insert external artists" ON external_artists;
DROP POLICY IF EXISTS "Labels can update their external artists" ON external_artists;
DROP POLICY IF EXISTS "Labels can delete their external artists" ON external_artists;

-- Create policies for external_artists
CREATE POLICY "Labels can view their external artists"
ON external_artists FOR SELECT
USING (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Labels can insert external artists"
ON external_artists FOR INSERT
WITH CHECK (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Labels can update their external artists"
ON external_artists FOR UPDATE
USING (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

CREATE POLICY "Labels can delete their external artists"
ON external_artists FOR DELETE
USING (label_id = (SELECT id FROM clerk_users WHERE id = clerk_users.id));

-- =====================================================
-- UNIFIED LABEL ROSTER VIEW
-- =====================================================
-- This view combines platform artists (from label_roster)
-- with external artists for a complete roster view
CREATE OR REPLACE VIEW unified_label_roster AS
SELECT
    lr.id,
    lr.label_id,
    lr.artist_id,
    lr.name,
    lr.email,
    lr.photo_url,
    lr.status,
    lr.signed_date,
    'platform'::text as artist_type,
    cu.username,
    p.display_name,
    lr.role,
    lr.contract_type
FROM label_roster lr
JOIN clerk_users cu ON cu.id = lr.artist_id
LEFT JOIN profiles p ON p.user_id = cu.id

UNION ALL

SELECT
    ea.id,
    ea.label_id,
    NULL::text as artist_id, -- No clerk user yet
    ea.name,
    ea.email,
    NULL::text as photo_url,
    ea.status,
    ea.signed_date,
    'external'::text as artist_type,
    NULL::text as username,
    ea.stage_name as display_name,
    ea.primary_role as role,
    ea.contract_type
FROM external_artists ea;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE external_artists IS 'Artists not yet on the platform, managed by labels';
COMMENT ON COLUMN external_artists.status IS 'invited: invitation sent, active: working with label, platform: joined SeshNx, terminated: contract ended';
COMMENT ON COLUMN external_artists.invitation_token IS 'Token for email invitation link (7-day expiry)';
COMMENT ON COLUMN external_artists.clerk_user_id IS 'Links to clerk_users when artist joins platform';
COMMENT ON VIEW unified_label_roster IS 'Combined view of platform and external artists for a label';

-- =====================================================
-- SAMPLE DATA (OPTIONAL - For Demo Purposes)
-- =====================================================
-- Uncomment to add sample data for testing

-- INSERT INTO external_artists (
--   label_id, name, email, stage_name, primary_role,
--   contract_type, signed_date, status
-- ) VALUES (
--   'label-uuid-here',
--   'Jane Doe',
--   'jane@example.com',
--   'Starlight',
--   'Singer',
--   'Recording',
--   CURRENT_DATE,
--   'invited'
-- );

-- =====================================================
-- USAGE NOTES
-- =====================================================
--
-- 1. To add an external artist:
--    INSERT INTO external_artists (label_id, name, email, stage_name, primary_role)
--    VALUES ($1, $2, $3, $4, $5);
--
-- 2. To generate invitation token:
--    UPDATE external_artists
--    SET invitation_token = gen_random_uuid()::text,
--        invitation_sent_at = NOW(),
--        invitation_expires_at = NOW() + INTERVAL '7 days'
--    WHERE id = $1;
--
-- 3. To migrate when artist joins platform:
--    UPDATE external_artists
--    SET clerk_user_id = $1, status = 'platform'
--    WHERE id = $2;
--
-- 4. To get unified roster:
--    SELECT * FROM unified_label_roster
--    WHERE label_id = $1
--    ORDER BY signed_date DESC;
--
-- =====================================================
