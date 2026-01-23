-- =====================================================
-- MARKETING CAMPAIGNS MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Marketing Campaign management system
-- =====================================================

-- =====================================================
-- MARKETING CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    release_id UUID, -- Will reference releases table when created
    artist_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Campaign details
    name TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN (
        'album_release',
        'single_release',
        'ep_release',
        'tour_announcement',
        'brand_partnership',
        'festival_season',
        'holiday_special',
        'other'
    )),
    description TEXT,
    budget NUMERIC(10, 2),

    -- Timeline
    start_date DATE,
    end_date DATE,
    launch_date DATE,

    -- Status
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning',
        'active',
        'paused',
        'completed',
        'cancelled'
    )),

    -- Campaign goals/metrics
    target_streams INTEGER,
    target_playlist_adds INTEGER,

    -- Actual metrics
    total_spend NUMERIC(10, 2) DEFAULT 0,
    streams_attributed INTEGER DEFAULT 0,
    playlist_additions INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5, 2),
    roi NUMERIC(10, 2), -- Return on investment

    -- Platform breakdown (JSONB for flexibility)
    platforms JSONB DEFAULT '{}'::jsonb, -- {instagram: true, tiktok: true, spotify: true}

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists (migration-safe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'marketing_campaigns'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'release_id') THEN
            ALTER TABLE marketing_campaigns ADD COLUMN release_id UUID;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'target_streams') THEN
            ALTER TABLE marketing_campaigns ADD COLUMN target_streams INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'target_playlist_adds') THEN
            ALTER TABLE marketing_campaigns ADD COLUMN target_playlist_adds INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'playlist_additions') THEN
            ALTER TABLE marketing_campaigns ADD COLUMN playlist_additions INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'platforms') THEN
            ALTER TABLE marketing_campaigns ADD COLUMN platforms JSONB DEFAULT '{}'::jsonb;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_campaigns' AND column_name = 'roi') THEN
            ALTER TABLE marketing_campaigns ADD COLUMN roi NUMERIC(10, 2);
        END IF;
    END IF;
END $$;

-- Indexes for marketing_campaigns
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_label_id ON marketing_campaigns(label_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_artist_id ON marketing_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_launch_date ON marketing_campaigns(launch_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_label_status ON marketing_campaigns(label_id, status);

-- =====================================================
-- CAMPAIGN MILESTONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,
    milestone_date DATE NOT NULL,

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_progress',
        'completed',
        'cancelled'
    )),

    -- Assignee
    assignee_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Priority
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Dependencies
    depends_on UUID REFERENCES campaign_milestones(id) ON DELETE SET NULL,

    -- Metadata
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_milestones_campaign_id ON campaign_milestones(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_milestones_status ON campaign_milestones(status);
CREATE INDEX IF NOT EXISTS idx_campaign_milestones_assignee_id ON campaign_milestones(assignee_id);
CREATE INDEX IF NOT EXISTS idx_campaign_milestones_date ON campaign_milestones(milestone_date);

-- =====================================================
-- CAMPAIGN ASSETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('image', 'video', 'audio', 'document', 'other')),

    -- Storage URLs (Vercel Blob)
    url TEXT NOT NULL,
    thumbnail_url TEXT,

    -- Platform/Channel
    platform TEXT, -- instagram, tiktok, twitter, youtube, spotify, etc.
    asset_format TEXT, -- post, story, reel, banner, etc.

    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),

    -- Metadata
    description TEXT,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_assets_campaign_id ON campaign_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_type ON campaign_assets(type);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_platform ON campaign_assets(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_status ON campaign_assets(status);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_scheduled_for ON campaign_assets(scheduled_for);

-- =====================================================
-- CAMPAIGN METRICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,

    platform TEXT NOT NULL, -- instagram, tiktok, spotify, apple_music, youtube
    metric_type TEXT NOT NULL, -- views, likes, shares, comments, streams, saves, clicks

    metric_value NUMERIC(15, 2) NOT NULL,
    previous_value NUMERIC(15, 2), -- For calculating growth

    -- Date context
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE,

    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_platform ON campaign_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_type ON campaign_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_recorded_at ON campaign_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_platform ON campaign_metrics(campaign_id, platform);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at triggers to all campaign tables
DROP TRIGGER IF EXISTS trigger_marketing_campaigns_updated_at ON marketing_campaigns;
CREATE TRIGGER trigger_marketing_campaigns_updated_at
    BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_campaign_milestones_updated_at ON campaign_milestones;
CREATE TRIGGER trigger_campaign_milestones_updated_at
    BEFORE UPDATE ON campaign_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all campaign tables
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Marketing Campaigns: Labels can see their own campaigns
DROP POLICY IF EXISTS "Labels can view their campaigns" ON marketing_campaigns;
CREATE POLICY "Labels can view their campaigns" ON marketing_campaigns
    FOR SELECT USING (auth.uid() = label_id);

DROP POLICY IF EXISTS "Labels can insert their campaigns" ON marketing_campaigns;
CREATE POLICY "Labels can insert their campaigns" ON marketing_campaigns
    FOR INSERT WITH CHECK (auth.uid() = label_id);

DROP POLICY IF EXISTS "Labels can update their campaigns" ON marketing_campaigns;
CREATE POLICY "Labels can update their campaigns" ON marketing_campaigns
    FOR UPDATE USING (auth.uid() = label_id);

DROP POLICY IF EXISTS "Labels can delete their campaigns" ON marketing_campaigns;
CREATE POLICY "Labels can delete their campaigns" ON marketing_campaigns
    FOR DELETE USING (auth.uid() = label_id);

-- Campaign Milestones: Inherit from campaign
DROP POLICY IF EXISTS "Labels can view their campaign milestones" ON campaign_milestones;
CREATE POLICY "Labels can view their campaign milestones" ON campaign_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM marketing_campaigns
            WHERE marketing_campaigns.id = campaign_milestones.campaign_id
            AND marketing_campaigns.label_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Labels can insert their campaign milestones" ON campaign_milestones;
CREATE POLICY "Labels can insert their campaign milestones" ON campaign_milestones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketing_campaigns
            WHERE marketing_campaigns.id = campaign_milestones.campaign_id
            AND marketing_campaigns.label_id = auth.uid()
        )
    );

-- Campaign Assets: Inherit from campaign
DROP POLICY IF EXISTS "Labels can view their campaign assets" ON campaign_assets;
CREATE POLICY "Labels can view their campaign assets" ON campaign_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM marketing_campaigns
            WHERE marketing_campaigns.id = campaign_assets.campaign_id
            AND marketing_campaigns.label_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Labels can insert their campaign assets" ON campaign_assets;
CREATE POLICY "Labels can insert their campaign assets" ON campaign_assets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketing_campaigns
            WHERE marketing_campaigns.id = campaign_assets.campaign_id
            AND marketing_campaigns.label_id = auth.uid()
        )
    );

-- Campaign Metrics: Inherit from campaign
DROP POLICY IF EXISTS "Labels can view their campaign metrics" ON campaign_metrics;
CREATE POLICY "Labels can view their campaign metrics" ON campaign_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM marketing_campaigns
            WHERE marketing_campaigns.id = campaign_metrics.campaign_id
            AND marketing_campaigns.label_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Labels can insert their campaign metrics" ON campaign_metrics;
CREATE POLICY "Labels can insert their campaign metrics" ON campaign_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketing_campaigns
            WHERE marketing_campaigns.id = campaign_metrics.campaign_id
            AND marketing_campaigns.label_id = auth.uid()
        )
    );

-- =====================================================
-- VIEWS
-- =====================================================

-- View for campaigns with label and artist info
CREATE OR REPLACE VIEW marketing_campaigns_with_details AS
SELECT
    mc.*,
    label.email AS label_email,
    label.username AS label_username,
    artist.email AS artist_email,
    artist.username AS artist_username,
    sp_artist.display_name AS artist_display_name,
    sp_artist.photo_url AS artist_photo_url
FROM marketing_campaigns mc
JOIN clerk_users label ON mc.label_id = label.id
LEFT JOIN clerk_users artist ON mc.artist_id = artist.id
LEFT JOIN profiles sp_artist ON sp_artist.user_id = artist.id;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE marketing_campaigns IS 'Marketing campaigns for label releases and artist promotions';
COMMENT ON TABLE campaign_milestones IS 'Timeline milestones and tasks within marketing campaigns';
COMMENT ON TABLE campaign_assets IS 'Creative assets (images, videos) for marketing campaigns';
COMMENT ON TABLE campaign_metrics IS 'Performance metrics tracking for marketing campaigns';
