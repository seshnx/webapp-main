-- ============================================
-- Supabase Profiles Table Schema Update
-- ============================================
-- This script adds all missing columns to the profiles table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add missing columns to profiles table
-- Using IF NOT EXISTS pattern to make it safe to run multiple times

-- Settings column (JSONB for flexible settings storage)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Preferred role (fallback when user has multiple roles)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_role TEXT DEFAULT 'Fan';

-- Zip code (location data) - using zip_code as primary column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Also add 'zip' column for backward compatibility (some components use 'zip')
-- Note: Consider migrating to zip_code everywhere for consistency
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS zip TEXT;

-- Display name (optional stage/artist name)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Bio/About section
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Hourly rate (for talent/studio bookings)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2);

-- Website URL
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Banner/cover image URL (for profile header)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Name display preferences
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS use_legal_name_only BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS use_user_name_only BOOLEAN DEFAULT false;

-- Ensure existing columns have proper defaults if needed
-- (These should already exist, but adding defaults for safety)

-- Account types (array of roles)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'account_types'
    ) THEN
        ALTER TABLE profiles ADD COLUMN account_types TEXT[] DEFAULT ARRAY['Fan']::TEXT[];
    END IF;
END $$;

-- Active role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'active_role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN active_role TEXT DEFAULT 'Fan';
    END IF;
END $$;

-- Effective display name
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'effective_display_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN effective_display_name TEXT;
    END IF;
END $$;

-- Search terms (array for full-text search)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'search_terms'
    ) THEN
        ALTER TABLE profiles ADD COLUMN search_terms TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Updated at timestamp
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create index on search_terms for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_search_terms ON profiles USING GIN(search_terms);

-- Create index on account_types for role filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_types ON profiles USING GIN(account_types);

-- Create index on zip_code for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_zip_code ON profiles(zip_code) WHERE zip_code IS NOT NULL;

-- Add comment to table for documentation
COMMENT ON TABLE profiles IS 'User profiles with role-based data and settings';
COMMENT ON COLUMN profiles.settings IS 'JSONB object storing user preferences, notifications, privacy, and module settings';
COMMENT ON COLUMN profiles.preferred_role IS 'Fallback role used when user has multiple roles';
COMMENT ON COLUMN profiles.search_terms IS 'Array of lowercase searchable terms for profile discovery';

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify all columns exist:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;
-- ============================================

