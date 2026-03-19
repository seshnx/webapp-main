-- =====================================================
-- ADD MISSING PROFILE FIELDS
-- =====================================================
-- This migration adds fields that ProfileManager tries to update
-- =====================================================

-- Add display name preferences to clerk_users
ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS use_legal_name_only BOOLEAN DEFAULT false;
ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS use_user_name_only BOOLEAN DEFAULT false;
ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS effective_display_name TEXT;

-- Add hourly rate to profiles (for technicians/talent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2);

-- Add search terms for better search functionality
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_terms TEXT[];

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_clerk_users_effective_display_name ON clerk_users(effective_display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_hourly_rate ON profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_profiles_search_terms ON profiles USING GIN(search_terms);
