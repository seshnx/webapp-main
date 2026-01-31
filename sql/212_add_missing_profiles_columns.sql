-- =====================================================
-- ADD MISSING PROFILES TABLE COLUMNS
-- =====================================================
-- This migration adds missing columns to the profiles table
-- that are needed by the ProfileManager but don't exist yet
-- =====================================================

-- Add missing columns to profiles table
DO $$
BEGIN
    -- Add hourly_rate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'hourly_rate'
    ) THEN
        ALTER TABLE profiles ADD COLUMN hourly_rate NUMERIC(10, 2) DEFAULT 0;
        COMMENT ON COLUMN profiles.hourly_rate IS 'Hourly rate for services';
        RAISE NOTICE 'Added hourly_rate column to profiles table';
    END IF;

    -- Add use_legal_name_only column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'use_legal_name_only'
    ) THEN
        ALTER TABLE profiles ADD COLUMN use_legal_name_only BOOLEAN DEFAULT false;
        COMMENT ON COLUMN profiles.use_legal_name_only IS 'Whether to use only legal name for display';
        RAISE NOTICE 'Added use_legal_name_only column to profiles table';
    END IF;

    -- Add use_user_name_only column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'use_user_name_only'
    ) THEN
        ALTER TABLE profiles ADD COLUMN use_user_name_only BOOLEAN DEFAULT false;
        COMMENT ON COLUMN profiles.use_user_name_only IS 'Whether to use only display name for show';
        RAISE NOTICE 'Added use_user_name_only column to profiles table';
    END IF;

    -- Add search_terms column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'search_terms'
    ) THEN
        ALTER TABLE profiles ADD COLUMN search_terms TEXT[] DEFAULT '{}';
        COMMENT ON COLUMN profiles.search_terms IS 'Search terms for better discoverability';
        CREATE INDEX idx_profiles_search_terms ON profiles USING GIN(search_terms);
        RAISE NOTICE 'Added search_terms column to profiles table';
    END IF;

    -- Add studio_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'studio_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN studio_name TEXT;
        COMMENT ON COLUMN profiles.studio_name IS 'Studio name for studio accounts';
        RAISE NOTICE 'Added studio_name column to profiles table';
    END IF;
END $$;

-- Report completion
DO $$
BEGIN
    RAISE NOTICE 'Successfully added all missing columns to profiles table';
END $$;
