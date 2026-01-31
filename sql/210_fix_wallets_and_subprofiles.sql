-- =====================================================
-- FIX WALLETS AND SUB_PROFILES TABLES
-- =====================================================
-- This migration fixes schema mismatches for wallets and sub_profiles
-- to work with Clerk authentication instead of Supabase
-- =====================================================

-- =====================================================
-- FIX WALLETS TABLE
-- =====================================================

-- Check if wallets table exists and fix it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'wallets'
    ) THEN
        -- Drop old wallets table if it references auth.users (which doesn't exist in Neon)
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'wallets'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.table_name = 'wallets'
        ) THEN
            -- Drop foreign key constraint if it references auth.users
            DECLARE
                fk_name TEXT;
            BEGIN
                SELECT tc.constraint_name INTO fk_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_name = 'wallets'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND kcu.column_name = 'user_id';

                IF fk_name IS NOT NULL THEN
                    EXECUTE format('ALTER TABLE wallets DROP CONSTRAINT %I', fk_name);
                    RAISE NOTICE 'Dropped foreign key constraint % from wallets table', fk_name;
                END IF;
            END;
        END IF;

        -- Check if user_id column is UUID (wrong type) and recreate table
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'wallets'
            AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            -- Recreate wallets table with correct user_id type
            DROP TABLE IF EXISTS wallets CASCADE;
            RAISE NOTICE 'Dropped old wallets table (had wrong user_id type)';
        END IF;
    END IF;
END $$;

-- Create wallets table with correct schema (if it doesn't exist)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Will reference clerk_users(id) which is TEXT
    balance NUMERIC(12, 2) DEFAULT 0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add comment
COMMENT ON TABLE wallets IS 'User wallet balances for SeshNx tokens';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- =====================================================
-- ENSURE SUB_PROFILES TABLE EXISTS WITH CORRECT SCHEMA
-- =====================================================

-- Check if sub_profiles table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'sub_profiles'
    ) THEN
        CREATE TABLE sub_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL, -- References clerk_users(id) which is TEXT

            -- Account type for this sub-profile
            account_type TEXT NOT NULL CHECK (account_type IN (
                'Talent', 'Engineer', 'Producer', 'Composer',
                'Studio', 'Technician', 'Fan', 'Student',
                'EDUStaff', 'EDUAdmin', 'Intern', 'Label',
                'Agent', 'GAdmin'
            )),

            -- Profile data (same structure as main profile)
            display_name TEXT,
            bio TEXT,
            photo_url TEXT,
            profile_data JSONB DEFAULT '{}'::jsonb,

            -- Status
            is_active BOOLEAN DEFAULT true,
            is_primary BOOLEAN DEFAULT false,

            -- Timestamps
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),

            -- Ensure one active sub-profile per account type per user
            UNIQUE(user_id, account_type)
        );

        RAISE NOTICE 'Created sub_profiles table';

        -- Create indexes
        CREATE INDEX idx_sub_profiles_user_id ON sub_profiles(user_id);
        CREATE INDEX idx_sub_profiles_account_type ON sub_profiles(account_type);
        CREATE INDEX idx_sub_profiles_is_active ON sub_profiles(is_active);

        RAISE NOTICE 'Created indexes for sub_profiles table';
    ELSE
        RAISE NOTICE 'sub_profiles table already exists';
    END IF;
END $$;

-- Add comment if table exists
COMMENT ON TABLE sub_profiles IS 'User sub-profiles for multiple account types';
