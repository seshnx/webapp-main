-- =====================================================
-- BLOCKED DATES TABLE - SQL Editor Script
-- =====================================================
-- This script creates the blocked_dates table for studio
-- availability management (blocking time slots)
-- =====================================================

-- =====================================================
-- BLOCKED DATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason TEXT,
    time_slot TEXT DEFAULT 'full' CHECK (time_slot IN ('full', 'morning', 'afternoon', 'evening', 'custom')),
    start_time TIME, -- For custom time slots
    end_time TIME,   -- For custom time slots
    room_id UUID,    -- Optional: block specific room
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    -- Add reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'reason') THEN
        ALTER TABLE blocked_dates ADD COLUMN reason TEXT;
    END IF;
    
    -- Add time_slot column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'time_slot') THEN
        ALTER TABLE blocked_dates ADD COLUMN time_slot TEXT DEFAULT 'full';
        -- Add check constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'blocked_dates' 
                       AND constraint_name = 'blocked_dates_time_slot_check') THEN
            ALTER TABLE blocked_dates ADD CONSTRAINT blocked_dates_time_slot_check 
                CHECK (time_slot IN ('full', 'morning', 'afternoon', 'evening', 'custom'));
        END IF;
    END IF;
    
    -- Add start_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'start_time') THEN
        ALTER TABLE blocked_dates ADD COLUMN start_time TIME;
    END IF;
    
    -- Add end_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'end_time') THEN
        ALTER TABLE blocked_dates ADD COLUMN end_time TIME;
    END IF;
    
    -- Add room_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'room_id') THEN
        ALTER TABLE blocked_dates ADD COLUMN room_id UUID;
    END IF;
    
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'created_at') THEN
        ALTER TABLE blocked_dates ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blocked_dates' AND column_name = 'updated_at') THEN
        ALTER TABLE blocked_dates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Indexes for blocked_dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_studio_owner_id ON blocked_dates(studio_owner_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_studio_date ON blocked_dates(studio_owner_id, date);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_room_id ON blocked_dates(room_id) WHERE room_id IS NOT NULL;

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

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trigger_blocked_dates_updated_at ON blocked_dates;
CREATE TRIGGER trigger_blocked_dates_updated_at
    BEFORE UPDATE ON blocked_dates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on blocked_dates
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Studio owners can view their blocked dates" ON blocked_dates;
DROP POLICY IF EXISTS "Studio owners can insert their blocked dates" ON blocked_dates;
DROP POLICY IF EXISTS "Studio owners can update their blocked dates" ON blocked_dates;
DROP POLICY IF EXISTS "Studio owners can delete their blocked dates" ON blocked_dates;

-- Studio owners can view their own blocked dates
CREATE POLICY "Studio owners can view their blocked dates" ON blocked_dates
    FOR SELECT USING (auth.uid() = studio_owner_id);

-- Studio owners can insert their own blocked dates
CREATE POLICY "Studio owners can insert their blocked dates" ON blocked_dates
    FOR INSERT WITH CHECK (auth.uid() = studio_owner_id);

-- Studio owners can update their own blocked dates
CREATE POLICY "Studio owners can update their blocked dates" ON blocked_dates
    FOR UPDATE USING (auth.uid() = studio_owner_id);

-- Studio owners can delete their own blocked dates
CREATE POLICY "Studio owners can delete their blocked dates" ON blocked_dates
    FOR DELETE USING (auth.uid() = studio_owner_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE blocked_dates IS 'Studio owner blocked time slots and dates for availability management';
COMMENT ON COLUMN blocked_dates.time_slot IS 'Time slot type: full (entire day), morning, afternoon, evening, or custom';
COMMENT ON COLUMN blocked_dates.start_time IS 'Start time for custom time slots';
COMMENT ON COLUMN blocked_dates.end_time IS 'End time for custom time slots';
COMMENT ON COLUMN blocked_dates.room_id IS 'Optional: block specific room instead of entire studio';

