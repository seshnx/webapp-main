-- =====================================================
-- CRITICAL MIGRATION: Fix UUID-to-TEXT type mismatch for Clerk
-- =====================================================
-- This script fixes tables that have UUID columns when they should have TEXT
-- to work with Clerk user IDs (format: user_abc123...)
-- =====================================================

-- =====================================================
-- STEP 1: Fix distribution_stats table
-- =====================================================

-- Add missing columns for lifetime stats
ALTER TABLE distribution_stats
ADD COLUMN IF NOT EXISTS lifetime_streams BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_earnings NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_streams BIGINT DEFAULT 0;

-- Ensure user_id is TEXT type (not UUID)
-- First, check if user_id is UUID and needs conversion
DO $$
BEGIN
    -- Check if user_id column is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'distribution_stats'
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
        -- Add a new temporary TEXT column
        ALTER TABLE distribution_stats ADD COLUMN IF NOT EXISTS user_id_new TEXT;

        -- Copy UUID values as TEXT
        UPDATE distribution_stats SET user_id_new = user_id::TEXT WHERE user_id_new IS NULL;

        -- Drop the old UUID column and rename the new one
        ALTER TABLE distribution_stats DROP COLUMN user_id;
        ALTER TABLE distribution_stats RENAME COLUMN user_id_new TO user_id;

        -- Recreate the foreign key constraint to clerk_users (which has TEXT id)
        ALTER TABLE distribution_stats
        ADD CONSTRAINT fk_distribution_stats_user_id
        FOREIGN KEY (user_id) REFERENCES clerk_users(id) ON DELETE CASCADE;

        RAISE NOTICE 'distribution_stats.user_id converted from UUID to TEXT';
    ELSE
        RAISE NOTICE 'distribution_stats.user_id is already TEXT type';
    END IF;
END $$;

-- =====================================================
-- STEP 2: Fix label_roster table
-- =====================================================

DO $$
BEGIN
    -- Convert label_id from UUID to TEXT if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'label_roster'
        AND column_name = 'label_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE label_roster ADD COLUMN IF NOT EXISTS label_id_new TEXT;
        UPDATE label_roster SET label_id_new = label_id::TEXT WHERE label_id_new IS NULL;

        -- Drop and recreate the foreign key constraint
        ALTER TABLE label_roster DROP CONSTRAINT IF EXISTS label_roster_label_id_fkey;
        ALTER TABLE label_roster DROP COLUMN label_id;
        ALTER TABLE label_roster RENAME COLUMN label_id_new TO label_id;

        ALTER TABLE label_roster
        ADD CONSTRAINT fk_label_roster_label_id
        FOREIGN KEY (label_id) REFERENCES clerk_users(id) ON DELETE CASCADE;

        RAISE NOTICE 'label_roster.label_id converted from UUID to TEXT';
    ELSE
        RAISE NOTICE 'label_roster.label_id is already TEXT type';
    END IF;

    -- Convert artist_id from UUID to TEXT if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'label_roster'
        AND column_name = 'artist_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE label_roster ADD COLUMN IF NOT EXISTS artist_id_new TEXT;
        UPDATE label_roster SET artist_id_new = artist_id::TEXT WHERE artist_id_new IS NULL;

        -- Drop and recreate the foreign key constraint
        ALTER TABLE label_roster DROP CONSTRAINT IF EXISTS label_roster_artist_id_fkey;
        ALTER TABLE label_roster DROP COLUMN artist_id;
        ALTER TABLE label_roster RENAME COLUMN artist_id_new TO artist_id;

        ALTER TABLE label_roster
        ADD CONSTRAINT fk_label_roster_artist_id
        FOREIGN KEY (artist_id) REFERENCES clerk_users(id) ON DELETE CASCADE;

        RAISE NOTICE 'label_roster.artist_id converted from UUID to TEXT';
    ELSE
        RAISE NOTICE 'label_roster.artist_id is already TEXT type';
    END IF;
END $$;

-- =====================================================
-- STEP 3: Fix releases table
-- =====================================================

DO $$
BEGIN
    -- Convert artist_id from UUID to TEXT if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'releases'
        AND column_name = 'artist_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE releases ADD COLUMN IF NOT EXISTS artist_id_new TEXT;
        UPDATE releases SET artist_id_new = artist_id::TEXT WHERE artist_id_new IS NULL;

        ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_artist_id_fkey;
        ALTER TABLE releases DROP COLUMN artist_id;
        ALTER TABLE releases RENAME COLUMN artist_id_new TO artist_id;

        ALTER TABLE releases
        ADD CONSTRAINT fk_releases_artist_id
        FOREIGN KEY (artist_id) REFERENCES clerk_users(id) ON DELETE CASCADE;

        RAISE NOTICE 'releases.artist_id converted from UUID to TEXT';
    ELSE
        RAISE NOTICE 'releases.artist_id is already TEXT type';
    END IF;

    -- Convert label_id from UUID to TEXT if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'releases'
        AND column_name = 'label_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE releases ADD COLUMN IF NOT EXISTS label_id_new TEXT;
        UPDATE releases SET label_id_new = label_id::TEXT WHERE label_id_new IS NULL;

        ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_label_id_fkey;
        ALTER TABLE releases DROP COLUMN label_id;
        ALTER TABLE releases RENAME COLUMN label_id_new TO label_id;

        ALTER TABLE releases
        ADD CONSTRAINT fk_releases_label_id
        FOREIGN KEY (label_id) REFERENCES clerk_users(id) ON DELETE SET NULL;

        RAISE NOTICE 'releases.label_id converted from UUID to TEXT';
    ELSE
        RAISE NOTICE 'releases.label_id is already TEXT type';
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show the final schema for these tables
SELECT
    'distribution_stats' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'distribution_stats'
AND column_name IN ('user_id', 'lifetime_streams', 'lifetime_earnings', 'monthly_streams')

UNION ALL

SELECT
    'label_roster' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'label_roster'
AND column_name IN ('label_id', 'artist_id')

UNION ALL

SELECT
    'releases' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'releases'
AND column_name IN ('artist_id', 'label_id')

ORDER BY table_name, column_name;
