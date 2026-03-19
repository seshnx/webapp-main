-- =====================================================
-- FIX MISSING COLUMNS IN EXISTING TABLES
-- =====================================================
-- Migration: 206_fix_missing_columns.sql
-- Description: Adds missing columns to tables that were
--              created from older schema versions
-- Author: Claude Code
-- Date: 2025-01-27
-- =====================================================

-- This script safely adds missing columns to existing tables
-- Run this if you get "column does not exist" errors

DO $$
DECLARE
    v_table_name TEXT;
    v_column_name TEXT;
    v_exists INTEGER;
    fix_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Adding missing columns to existing tables...';
    RAISE NOTICE '=====================================================';

    -- =====================================================
    -- clerk_users table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clerk_users') THEN
        -- Add default_profile_role if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'clerk_users' AND column_name = 'default_profile_role'
        ) THEN
            ALTER TABLE clerk_users ADD COLUMN default_profile_role TEXT;
            RAISE NOTICE 'Added clerk_users.default_profile_role';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- =====================================================
    -- posts table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        -- Add posted_as_role if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'posts' AND column_name = 'posted_as_role'
        ) THEN
            ALTER TABLE posts ADD COLUMN posted_as_role TEXT;
            CREATE INDEX IF NOT EXISTS idx_posts_posted_as_role ON posts(posted_as_role);
            RAISE NOTICE 'Added posts.posted_as_role';
            fix_count := fix_count + 1;
        END IF;

        -- Add display_name if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'posts' AND column_name = 'display_name'
        ) THEN
            ALTER TABLE posts ADD COLUMN display_name TEXT;
            RAISE NOTICE 'Added posts.display_name';
            fix_count := fix_count + 1;
        END IF;

        -- Add author_photo if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'posts' AND column_name = 'author_photo'
        ) THEN
            ALTER TABLE posts ADD COLUMN author_photo TEXT;
            RAISE NOTICE 'Added posts.author_photo';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- =====================================================
    -- notifications table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Add is_read if missing (THIS IS THE ERROR YOU HIT)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'notifications' AND column_name = 'is_read'
        ) THEN
            ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added notifications.is_read';
            fix_count := fix_count + 1;
        END IF;

        -- Add read_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'notifications' AND column_name = 'read_at'
        ) THEN
            ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
            RAISE NOTICE 'Added notifications.read_at';
            fix_count := fix_count + 1;
        END IF;

        -- Add metadata if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'notifications' AND column_name = 'metadata'
        ) THEN
            ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
            RAISE NOTICE 'Added notifications.metadata';
            fix_count := fix_count + 1;
        END IF;

        -- Create index on is_read after adding column
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'notifications' AND indexname = 'idx_notifications_is_read'
        ) THEN
            CREATE INDEX idx_notifications_is_read ON notifications(is_read);
            RAISE NOTICE 'Created idx_notifications_is_read';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- =====================================================
    -- sub_profiles table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_profiles') THEN
        -- Add display_name if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'display_name'
        ) THEN
            ALTER TABLE sub_profiles ADD COLUMN display_name TEXT;
            RAISE NOTICE 'Added sub_profiles.display_name';
            fix_count := fix_count + 1;
        END IF;

        -- Add bio if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'bio'
        ) THEN
            ALTER TABLE sub_profiles ADD COLUMN bio TEXT;
            RAISE NOTICE 'Added sub_profiles.bio';
            fix_count := fix_count + 1;
        END IF;

        -- Add photo_url if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'photo_url'
        ) THEN
            ALTER TABLE sub_profiles ADD COLUMN photo_url TEXT;
            RAISE NOTICE 'Added sub_profiles.photo_url';
            fix_count := fix_count + 1;
        END IF;

        -- Add location if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'location'
        ) THEN
            ALTER TABLE sub_profiles ADD COLUMN location JSONB;
            RAISE NOTICE 'Added sub_profiles.location';
            fix_count := fix_count + 1;
        END IF;

        -- Add website if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'website'
        ) THEN
            ALTER TABLE sub_profiles ADD COLUMN website TEXT;
            RAISE NOTICE 'Added sub_profiles.website';
            fix_count := fix_count + 1;
        END IF;

        -- Rename role column to account_type if old schema
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'role'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sub_profiles' AND column_name = 'account_type'
        ) THEN
            ALTER TABLE sub_profiles RENAME COLUMN role TO account_type;
            RAISE NOTICE 'Renamed sub_profiles.role to account_type';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- =====================================================
    -- bookings table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        -- Add sender_id if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'sender_id'
        ) THEN
            ALTER TABLE bookings ADD COLUMN sender_id TEXT REFERENCES clerk_users(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_bookings_sender_id ON bookings(sender_id);
            RAISE NOTICE 'Added bookings.sender_id';
            fix_count := fix_count + 1;
        END IF;

        -- Add target_id if missing (different from studio_owner_id)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'target_id'
        ) THEN
            ALTER TABLE bookings ADD COLUMN target_id TEXT REFERENCES clerk_users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added bookings.target_id';
            fix_count := fix_count + 1;
        END IF;

        -- Add service_type if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'service_type'
        ) THEN
            ALTER TABLE bookings ADD COLUMN service_type TEXT;
            RAISE NOTICE 'Added bookings.service_type';
            fix_count := fix_count + 1;
        END IF;

        -- Add time if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'time'
        ) THEN
            ALTER TABLE bookings ADD COLUMN time TEXT;
            RAISE NOTICE 'Added bookings.time';
            fix_count := fix_count + 1;
        END IF;

        -- Add duration if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'duration'
        ) THEN
            ALTER TABLE bookings ADD COLUMN duration INTEGER;
            RAISE NOTICE 'Added bookings.duration';
            fix_count := fix_count + 1;
        END IF;

        -- Add offer_amount if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'offer_amount'
        ) THEN
            ALTER TABLE bookings ADD COLUMN offer_amount NUMERIC(10,2);
            RAISE NOTICE 'Added bookings.offer_amount';
            fix_count := fix_count + 1;
        END IF;

        -- Add message if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'message'
        ) THEN
            ALTER TABLE bookings ADD COLUMN message TEXT;
            RAISE NOTICE 'Added bookings.message';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- =====================================================
    -- profiles table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Add settings if missing (stored as JSONB)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'profiles' AND column_name = 'settings'
        ) THEN
            ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
            RAISE NOTICE 'Added profiles.settings';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- =====================================================
    -- comments table - Add missing columns
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        -- Add display_name if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'comments' AND column_name = 'display_name'
        ) THEN
            ALTER TABLE comments ADD COLUMN display_name TEXT;
            RAISE NOTICE 'Added comments.display_name';
            fix_count := fix_count + 1;
        END IF;

        -- Add author_photo if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'comments' AND column_name = 'author_photo'
        ) THEN
            ALTER TABLE comments ADD COLUMN author_photo TEXT;
            RAISE NOTICE 'Added comments.author_photo';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Complete! Added % missing columns.', fix_count;
    RAISE NOTICE '=====================================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding missing columns: %', SQLERRM;
        RAISE NOTICE 'Error details: % %', SQLSTATE, SQLERRM;
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- After running this, all tables should have the columns
-- expected by the current application code
-- =====================================================
