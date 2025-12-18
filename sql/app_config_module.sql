-- =====================================================
-- APP CONFIG MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for app-wide configuration and utilities
-- =====================================================

-- =====================================================
-- APP CONFIG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS app_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT, -- 'feature_flags', 'pricing', 'limits', etc.
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for app_config
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
CREATE INDEX IF NOT EXISTS idx_app_config_category ON app_config(category);
CREATE INDEX IF NOT EXISTS idx_app_config_is_public ON app_config(is_public);

-- =====================================================
-- SUB PROFILES TABLE (User role-specific profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS sub_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'Producer', 'Engineer', 'Talent', etc.
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    specialties TEXT[] DEFAULT '{}',
    hourly_rate NUMERIC(10, 2),
    location JSONB,
    portfolio JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role) -- One sub-profile per user per role
);

-- Indexes for sub_profiles
CREATE INDEX IF NOT EXISTS idx_sub_profiles_user_id ON sub_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_role ON sub_profiles(role);
CREATE INDEX IF NOT EXISTS idx_sub_profiles_is_active ON sub_profiles(is_active);

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

CREATE TRIGGER trigger_app_config_updated_at
    BEFORE UPDATE ON app_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_sub_profiles_updated_at
    BEFORE UPDATE ON sub_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_profiles ENABLE ROW LEVEL SECURITY;

-- App Config: Everyone can view public config
CREATE POLICY "Public config is viewable by everyone" ON app_config
    FOR SELECT USING (is_public = true);

-- Sub Profiles: Users can see their own sub-profiles
CREATE POLICY "Users can view their own sub-profiles" ON sub_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Sub Profiles: Everyone can view active sub-profiles
CREATE POLICY "Active sub-profiles are viewable by everyone" ON sub_profiles
    FOR SELECT USING (is_active = true);

-- Sub Profiles: Users can insert their own sub-profiles
CREATE POLICY "Users can insert their own sub-profiles" ON sub_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE app_config IS 'Application-wide configuration settings';
COMMENT ON TABLE sub_profiles IS 'User role-specific profile information';

