-- =====================================================
-- FIX SUB_PROFILES TABLE - ADD ACCOUNT_TYPE COLUMN
-- =====================================================
-- The sub_profiles table exists but uses 'role' column instead of 'account_type'
-- This migration adds account_type as a proper column and migrates existing data
-- =====================================================

-- Check if table has 'role' column and no 'account_type' column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'sub_profiles'
    ) THEN
        -- Check if role column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles'
            AND column_name = 'role'
        ) THEN
            -- Check if account_type doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'sub_profiles'
                AND column_name = 'account_type'
            ) THEN
                -- Add account_type column
                ALTER TABLE sub_profiles ADD COLUMN account_type TEXT;

                -- Migrate data from role to account_type
                UPDATE sub_profiles SET account_type = role WHERE account_type IS NULL;

                -- Add check constraint to account_type
                ALTER TABLE sub_profiles ADD CONSTRAINT sub_profiles_account_type_check
                    CHECK (account_type IN (
                        'Talent', 'Engineer', 'Producer', 'Composer',
                        'Studio', 'Technician', 'Fan', 'Student',
                        'EDUStaff', 'EDUAdmin', 'Intern', 'Label',
                        'Agent', 'GAdmin'
                    ));

                -- Drop the old unique constraint on (user_id, role) if it exists
                ALTER TABLE sub_profiles DROP CONSTRAINT IF EXISTS sub_profiles_user_id_role_key;

                -- Add new unique constraint on (user_id, account_type)
                ALTER TABLE sub_profiles ADD CONSTRAINT sub_profiles_user_id_account_type_key
                    UNIQUE(user_id, account_type);

                RAISE NOTICE 'Added account_type column to sub_profiles and migrated data from role column';
            ELSE
                RAISE NOTICE 'account_type column already exists in sub_profiles';
            END IF;
        ELSE
            RAISE NOTICE 'role column does not exist in sub_profiles - table may have different schema';
        END IF;
    ELSE
        RAISE NOTICE 'sub_profiles table does not exist';
    END IF;
END $$;

-- Update the unique constraint name if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'sub_profiles'
        AND constraint_name = 'sub_profiles_user_id_role_key'
    ) THEN
        ALTER TABLE sub_profiles DROP CONSTRAINT sub_profiles_user_id_role_key;
        RAISE NOTICE 'Dropped old unique constraint on (user_id, role)';
    END IF;
END $$;

-- Add index on account_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'sub_profiles'
        AND indexname = 'idx_sub_profiles_account_type'
    ) THEN
        CREATE INDEX idx_sub_profiles_account_type ON sub_profiles(account_type);
        RAISE NOTICE 'Created index on account_type column';
    END IF;
END $$;
