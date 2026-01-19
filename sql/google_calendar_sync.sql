-- Google Calendar Sync Table
-- Stores Google Calendar connection and sync settings for studios

CREATE TABLE IF NOT EXISTS google_calendar_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Google OAuth credentials
    access_token TEXT NOT NULL,
    refresh_token TEXT,

    -- Calendar information
    calendar_id TEXT DEFAULT 'primary',
    calendar_name TEXT,

    -- Sync status
    is_connected BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ,

    -- Sync settings (JSONB for flexibility)
    sync_settings JSONB DEFAULT '{
        "bidirectionalSync": true,
        "syncInterval": 15,
        "autoSync": true,
        "syncConfirmedOnly": false,
        "createEventsForPending": true
    }'::jsonb,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_google_calendar_sync_studio_id ON google_calendar_sync(studio_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_sync_connected ON google_calendar_sync(is_connected) WHERE is_connected = true;

-- Add google_event_id column to bookings table for tracking sync
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Unique constraint: One calendar connection per studio
CREATE UNIQUE INDEX IF NOT EXISTS idx_google_calendar_sync_unique_studio ON google_calendar_sync(studio_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_calendar_sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER google_calendar_sync_updated_at
    BEFORE UPDATE ON google_calendar_sync
    FOR EACH ROW
    EXECUTE FUNCTION update_google_calendar_sync_updated_at();

-- Comments
COMMENT ON TABLE google_calendar_sync IS 'Stores Google Calendar connection and sync settings for studios';
COMMENT ON COLUMN google_calendar_sync.access_token IS 'Google OAuth access token for API access';
COMMENT ON COLUMN google_calendar_sync.refresh_token IS 'Google OAuth refresh token for obtaining new access tokens';
COMMENT ON COLUMN google_calendar_sync.calendar_id IS 'Google Calendar ID to sync with (default: primary)';
COMMENT ON COLUMN google_calendar_sync.sync_settings IS 'JSON object containing sync preferences';
COMMENT ON COLUMN bookings.google_event_id IS 'Google Calendar event ID for two-way sync';
