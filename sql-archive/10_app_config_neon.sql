-- =====================================================
-- APP CONFIG MODULE - Neon + Clerk Compatible
-- =====================================================
-- This script handles both new installations and migrations
-- from the existing app_config table structure
-- =====================================================

-- =====================================================
-- APP CONFIG TABLE - Migration Safe
-- =====================================================

-- Check if table exists with old schema (config_key) and migrate
DO $$
BEGIN
    -- If table exists with old schema, migrate it
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'app_config'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'app_config' AND column_name = 'config_key'
    ) THEN
        -- Rename old columns to new names
        ALTER TABLE app_config RENAME COLUMN config_key TO key;
        ALTER TABLE app_config RENAME COLUMN config_value TO value;

        -- Add new columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'description'
        ) THEN
            ALTER TABLE app_config ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'category'
        ) THEN
            ALTER TABLE app_config ADD COLUMN category TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'is_public'
        ) THEN
            ALTER TABLE app_config ADD COLUMN is_public BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'updated_by'
        ) THEN
            ALTER TABLE app_config ADD COLUMN updated_by TEXT REFERENCES clerk_users(id) ON DELETE SET NULL;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE app_config ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;

        -- Ensure updated_at exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE app_config ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;

        -- Add NOT NULL constraints if needed
        ALTER TABLE app_config ALTER COLUMN key SET NOT NULL;
        ALTER TABLE app_config ALTER COLUMN value SET NOT NULL;

        -- Ensure primary key exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'app_config' AND constraint_type = 'PRIMARY KEY'
        ) THEN
            ALTER TABLE app_config ADD COLUMN id UUID DEFAULT gen_random_uuid();
            ALTER TABLE app_config ADD PRIMARY KEY (id);
        END IF;

    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'app_config'
    ) THEN
        -- Create new table if it doesn't exist
        CREATE TABLE app_config (
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
    ELSE
        -- Table exists but may be missing some columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'key'
        ) THEN
            -- If key doesn't exist, check for config_key
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'app_config' AND column_name = 'config_key'
            ) THEN
                ALTER TABLE app_config RENAME COLUMN config_key TO key;
            ELSE
                ALTER TABLE app_config ADD COLUMN key TEXT;
            END IF;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'value'
        ) THEN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'app_config' AND column_name = 'config_value'
            ) THEN
                ALTER TABLE app_config RENAME COLUMN config_value TO value;
            ELSE
                ALTER TABLE app_config ADD COLUMN value JSONB;
            END IF;
        END IF;

        -- Add other missing columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'description'
        ) THEN
            ALTER TABLE app_config ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'category'
        ) THEN
            ALTER TABLE app_config ADD COLUMN category TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'is_public'
        ) THEN
            ALTER TABLE app_config ADD COLUMN is_public BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'updated_by'
        ) THEN
            ALTER TABLE app_config ADD COLUMN updated_by TEXT REFERENCES clerk_users(id) ON DELETE SET NULL;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE app_config ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE app_config ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;

        -- Ensure constraints
        ALTER TABLE app_config ALTER COLUMN key SET NOT NULL;
        ALTER TABLE app_config ALTER COLUMN value SET NOT NULL;

        -- Add unique constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'app_config' AND constraint_name = 'app_config_key_key'
        ) THEN
            ALTER TABLE app_config ADD CONSTRAINT app_config_key_key UNIQUE (key);
        END IF;
    END IF;
END $$;

-- Indexes for app_config (create if not exists)
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
CREATE INDEX IF NOT EXISTS idx_app_config_category ON app_config(category);
CREATE INDEX IF NOT EXISTS idx_app_config_is_public ON app_config(is_public);

-- =====================================================
-- SUB PROFILES TABLE (User role-specific profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS sub_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'Producer', 'Engineer', 'Talent', etc.
    data JSONB DEFAULT '{}'::jsonb, -- Store role-specific data flexibly
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'sub_profiles' AND constraint_name = 'sub_profiles_user_id_role_key'
    ) THEN
        ALTER TABLE sub_profiles ADD CONSTRAINT sub_profiles_user_id_role_key UNIQUE (user_id, role);
    END IF;
END $$;

-- Indexes for sub_profiles (create if not exists)
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

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_app_config_updated_at ON app_config;
DROP TRIGGER IF EXISTS trigger_sub_profiles_updated_at ON sub_profiles;

-- Create triggers
CREATE TRIGGER trigger_app_config_updated_at
    BEFORE UPDATE ON app_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_sub_profiles_updated_at
    BEFORE UPDATE ON sub_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Note: Neon doesn't use auth.uid() like Supabase
-- RLS policies need to be handled at the application level
-- or with custom functions that get the user ID from the request context

-- Enable RLS on all tables (optional - can be managed at app level)
-- ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sub_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE app_config IS 'Application-wide configuration settings';
COMMENT ON TABLE sub_profiles IS 'User role-specific profile information (simplified for Clerk)';
