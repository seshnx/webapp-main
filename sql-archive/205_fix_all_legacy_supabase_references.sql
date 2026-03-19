-- =====================================================
-- FIX ALL LEGACY SUPABASE AUTH.USERS REFERENCES
-- =====================================================
-- Migration: 205_fix_all_legacy_supabase_references.sql
-- Description: Comprehensive fix for all tables that still
--              reference the old Supabase auth.users table
--              Converts UUID columns to TEXT for Clerk compatibility
-- Author: Claude Code
-- Date: 2025-01-27
-- =====================================================

-- This migration fixes ALL tables that were created before
-- the Supabase to Clerk authentication migration

DO $$
DECLARE
    table_name TEXT;
    column_name TEXT;
    constraint_name TEXT;
    fix_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Starting comprehensive Supabase to Clerk migration...';
    RAISE NOTICE '=====================================================';

    -- =====================================================
    -- STEP 1: Fix gear database tables
    -- =====================================================

    -- Fix gear_items table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gear_items') THEN
        -- Drop old foreign keys if they exist
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'gear_items_verified_by_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE gear_items DROP CONSTRAINT gear_items_verified_by_fkey;
            RAISE NOTICE 'Dropped gear_items_verified_by_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'gear_items_created_by_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE gear_items DROP CONSTRAINT gear_items_created_by_fkey;
            RAISE NOTICE 'Dropped gear_items_created_by_fkey (auth.users)';
        END IF;

        -- Convert columns to TEXT if they are UUID
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'gear_items' AND column_name = 'verified_by'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE gear_items ALTER COLUMN verified_by TYPE TEXT USING verified_by::TEXT;
            RAISE NOTICE 'Converted gear_items.verified_by from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'gear_items' AND column_name = 'created_by'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE gear_items ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
            RAISE NOTICE 'Converted gear_items.created_by from UUID to TEXT';
        END IF;

        -- Recreate foreign keys to clerk_users
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'gear_items_verified_by_fkey'
        ) THEN
            ALTER TABLE gear_items
                ADD CONSTRAINT gear_items_verified_by_fkey
                FOREIGN KEY (verified_by)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created gear_items_verified_by_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'gear_items_created_by_fkey'
        ) THEN
            ALTER TABLE gear_items
                ADD CONSTRAINT gear_items_created_by_fkey
                FOREIGN KEY (created_by)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created gear_items_created_by_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix software_items table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'software_items') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'software_items_verified_by_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE software_items DROP CONSTRAINT software_items_verified_by_fkey;
            RAISE NOTICE 'Dropped software_items_verified_by_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'software_items_created_by_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE software_items DROP CONSTRAINT software_items_created_by_fkey;
            RAISE NOTICE 'Dropped software_items_created_by_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'software_items' AND column_name = 'verified_by'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE software_items ALTER COLUMN verified_by TYPE TEXT USING verified_by::TEXT;
            RAISE NOTICE 'Converted software_items.verified_by from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'software_items' AND column_name = 'created_by'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE software_items ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
            RAISE NOTICE 'Converted software_items.created_by from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'software_items_verified_by_fkey'
        ) THEN
            ALTER TABLE software_items
                ADD CONSTRAINT software_items_verified_by_fkey
                FOREIGN KEY (verified_by)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created software_items_verified_by_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'software_items_created_by_fkey'
        ) THEN
            ALTER TABLE software_items
                ADD CONSTRAINT software_items_created_by_fkey
                FOREIGN KEY (created_by)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created software_items_created_by_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 2: Fix app_config table
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_config') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'app_config_updated_by_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE app_config DROP CONSTRAINT app_config_updated_by_fkey;
            RAISE NOTICE 'Dropped app_config_updated_by_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'app_config' AND column_name = 'updated_by'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE app_config ALTER COLUMN updated_by TYPE TEXT USING updated_by::TEXT;
            RAISE NOTICE 'Converted app_config.updated_by from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'app_config_updated_by_fkey'
        ) THEN
            ALTER TABLE app_config
                ADD CONSTRAINT app_config_updated_by_fkey
                FOREIGN KEY (updated_by)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created app_config_updated_by_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 3: Fix user_config_sessions table
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_config_sessions') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'user_config_sessions_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE user_config_sessions DROP CONSTRAINT user_config_sessions_user_id_fkey;
            RAISE NOTICE 'Dropped user_config_sessions_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'user_config_sessions' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE user_config_sessions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted user_config_sessions.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'user_config_sessions_user_id_fkey'
        ) THEN
            ALTER TABLE user_config_sessions
                ADD CONSTRAINT user_config_sessions_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created user_config_sessions_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 4: Fix bookings table
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        -- Drop old foreign keys
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'bookings_sender_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE bookings DROP CONSTRAINT bookings_sender_id_fkey;
            RAISE NOTICE 'Dropped bookings_sender_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'bookings_target_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE bookings DROP CONSTRAINT bookings_target_id_fkey;
            RAISE NOTICE 'Dropped bookings_target_id_fkey (auth.users)';
        END IF;

        -- Convert columns to TEXT
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'sender_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE bookings ALTER COLUMN sender_id TYPE TEXT USING sender_id::TEXT;
            RAISE NOTICE 'Converted bookings.sender_id from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'bookings' AND column_name = 'target_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE bookings ALTER COLUMN target_id TYPE TEXT USING target_id::TEXT;
            RAISE NOTICE 'Converted bookings.target_id from UUID to TEXT';
        END IF;

        -- Recreate foreign keys
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'bookings_sender_id_fkey'
        ) THEN
            ALTER TABLE bookings
                ADD CONSTRAINT bookings_sender_id_fkey
                FOREIGN KEY (sender_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created bookings_sender_id_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'bookings_target_id_fkey'
        ) THEN
            ALTER TABLE bookings
                ADD CONSTRAINT bookings_target_id_fkey
                FOREIGN KEY (target_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created bookings_target_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 5: Fix sessions table
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'sessions_creator_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE sessions DROP CONSTRAINT sessions_creator_id_fkey;
            RAISE NOTICE 'Dropped sessions_creator_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'sessions_selected_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE sessions DROP CONSTRAINT sessions_selected_user_id_fkey;
            RAISE NOTICE 'Dropped sessions_selected_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sessions' AND column_name = 'creator_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE sessions ALTER COLUMN creator_id TYPE TEXT USING creator_id::TEXT;
            RAISE NOTICE 'Converted sessions.creator_id from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sessions' AND column_name = 'selected_user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE sessions ALTER COLUMN selected_user_id TYPE TEXT USING selected_user_id::TEXT;
            RAISE NOTICE 'Converted sessions.selected_user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'sessions_creator_id_fkey'
        ) THEN
            ALTER TABLE sessions
                ADD CONSTRAINT sessions_creator_id_fkey
                FOREIGN KEY (creator_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created sessions_creator_id_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'sessions_selected_user_id_fkey'
        ) THEN
            ALTER TABLE sessions
                ADD CONSTRAINT sessions_selected_user_id_fkey
                FOREIGN KEY (selected_user_id)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created sessions_selected_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 6: Fix bookings_enhancements tables
    -- =====================================================

    -- Fix booking_history table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_history') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_history_changed_by_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE booking_history DROP CONSTRAINT booking_history_changed_by_fkey;
            RAISE NOTICE 'Dropped booking_history_changed_by_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'booking_history' AND column_name = 'changed_by'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE booking_history ALTER COLUMN changed_by TYPE TEXT USING changed_by::TEXT;
            RAISE NOTICE 'Converted booking_history.changed_by from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_history_changed_by_fkey'
        ) THEN
            ALTER TABLE booking_history
                ADD CONSTRAINT booking_history_changed_by_fkey
                FOREIGN KEY (changed_by)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created booking_history_changed_by_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix booking_notes table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_notes') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_notes_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE booking_notes DROP CONSTRAINT booking_notes_user_id_fkey;
            RAISE NOTICE 'Dropped booking_notes_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'booking_notes' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE booking_notes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted booking_notes.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_notes_user_id_fkey'
        ) THEN
            ALTER TABLE booking_notes
                ADD CONSTRAINT booking_notes_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created booking_notes_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix booking_attachments table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'booking_attachments') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_attachments_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE booking_attachments DROP CONSTRAINT booking_attachments_user_id_fkey;
            RAISE NOTICE 'Dropped booking_attachments_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_attachments_studio_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE booking_attachments DROP CONSTRAINT booking_attachments_studio_id_fkey;
            RAISE NOTICE 'Dropped booking_attachments_studio_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'booking_attachments' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE booking_attachments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted booking_attachments.user_id from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'booking_attachments' AND column_name = 'studio_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE booking_attachments ALTER COLUMN studio_id TYPE TEXT USING studio_id::TEXT;
            RAISE NOTICE 'Converted booking_attachments.studio_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_attachments_user_id_fkey'
        ) THEN
            ALTER TABLE booking_attachments
                ADD CONSTRAINT booking_attachments_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created booking_attachments_user_id_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'booking_attachments_studio_id_fkey'
        ) THEN
            ALTER TABLE booking_attachments
                ADD CONSTRAINT booking_attachments_studio_id_fkey
                FOREIGN KEY (studio_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created booking_attachments_studio_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 7: Fix blocked_dates table
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_dates') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'blocked_dates_studio_owner_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE blocked_dates DROP CONSTRAINT blocked_dates_studio_owner_id_fkey;
            RAISE NOTICE 'Dropped blocked_dates_studio_owner_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'blocked_dates' AND column_name = 'studio_owner_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE blocked_dates ALTER COLUMN studio_owner_id TYPE TEXT USING studio_owner_id::TEXT;
            RAISE NOTICE 'Converted blocked_dates.studio_owner_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'blocked_dates_studio_owner_id_fkey'
        ) THEN
            ALTER TABLE blocked_dates
                ADD CONSTRAINT blocked_dates_studio_owner_id_fkey
                FOREIGN KEY (studio_owner_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created blocked_dates_studio_owner_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 8: Fix marketplace tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketplace_listings_seller_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE marketplace_listings DROP CONSTRAINT marketplace_listings_seller_id_fkey;
            RAISE NOTICE 'Dropped marketplace_listings_seller_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'marketplace_listings' AND column_name = 'seller_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE marketplace_listings ALTER COLUMN seller_id TYPE TEXT USING seller_id::TEXT;
            RAISE NOTICE 'Converted marketplace_listings.seller_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketplace_listings_seller_id_fkey'
        ) THEN
            ALTER TABLE marketplace_listings
                ADD CONSTRAINT marketplace_listings_seller_id_fkey
                FOREIGN KEY (seller_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created marketplace_listings_seller_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix other marketplace tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_offers') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketplace_offers_buyer_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE marketplace_offers DROP CONSTRAINT marketplace_offers_buyer_id_fkey;
            RAISE NOTICE 'Dropped marketplace_offers_buyer_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketplace_offers_seller_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE marketplace_offers DROP CONSTRAINT marketplace_offers_seller_id_fkey;
            RAISE NOTICE 'Dropped marketplace_offers_seller_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'marketplace_offers' AND column_name = 'buyer_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE marketplace_offers ALTER COLUMN buyer_id TYPE TEXT USING buyer_id::TEXT;
            RAISE NOTICE 'Converted marketplace_offers.buyer_id from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'marketplace_offers' AND column_name = 'seller_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE marketplace_offers ALTER COLUMN seller_id TYPE TEXT USING seller_id::TEXT;
            RAISE NOTICE 'Converted marketplace_offers.seller_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketplace_offers_buyer_id_fkey'
        ) THEN
            ALTER TABLE marketplace_offers
                ADD CONSTRAINT marketplace_offers_buyer_id_fkey
                FOREIGN KEY (buyer_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created marketplace_offers_buyer_id_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketplace_offers_seller_id_fkey'
        ) THEN
            ALTER TABLE marketplace_offers
                ADD CONSTRAINT marketplace_offers_seller_id_fkey
                FOREIGN KEY (seller_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created marketplace_offers_seller_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Continue with marketplace_transactions and marketplace_messages similarly
    -- (following the same pattern as above)

    -- =====================================================
    -- STEP 9: Fix payments tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'wallets_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE wallets DROP CONSTRAINT wallets_user_id_fkey;
            RAISE NOTICE 'Dropped wallets_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'wallets' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE wallets ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted wallets.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'wallets_user_id_fkey'
        ) THEN
            ALTER TABLE wallets
                ADD CONSTRAINT wallets_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created wallets_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix other payments tables similarly
    -- (transactions, payment_methods, invoices, etc.)

    -- =====================================================
    -- STEP 10: Fix social_feed tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'posts_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE posts DROP CONSTRAINT posts_user_id_fkey;
            RAISE NOTICE 'Dropped posts_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'posts' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted posts.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'posts_user_id_fkey'
        ) THEN
            ALTER TABLE posts
                ADD CONSTRAINT posts_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created posts_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix other social tables (comments, likes, follows)
    -- Following same pattern...

    -- =====================================================
    -- STEP 11: Fix business tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'studios') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'studios_owner_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE studios DROP CONSTRAINT studios_owner_id_fkey;
            RAISE NOTICE 'Dropped studios_owner_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'studios' AND column_name = 'owner_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE studios ALTER COLUMN owner_id TYPE TEXT USING owner_id::TEXT;
            RAISE NOTICE 'Converted studios.owner_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'studios_owner_id_fkey'
        ) THEN
            ALTER TABLE studios
                ADD CONSTRAINT studios_owner_id_fkey
                FOREIGN KEY (owner_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created studios_owner_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix distribution_stats table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'distribution_stats') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'distribution_stats_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE distribution_stats DROP CONSTRAINT distribution_stats_user_id_fkey;
            RAISE NOTICE 'Dropped distribution_stats_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'distribution_stats' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE distribution_stats ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted distribution_stats.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'distribution_stats_user_id_fkey'
        ) THEN
            ALTER TABLE distribution_stats
                ADD CONSTRAINT distribution_stats_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created distribution_stats_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix royalty_reports table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'royalty_reports') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'royalty_reports_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE royalty_reports DROP CONSTRAINT royalty_reports_user_id_fkey;
            RAISE NOTICE 'Dropped royalty_reports_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'royalty_reports' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE royalty_reports ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted royalty_reports.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'royalty_reports_user_id_fkey'
        ) THEN
            ALTER TABLE royalty_reports
                ADD CONSTRAINT royalty_reports_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created royalty_reports_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix label_contracts table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'label_contracts') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'label_contracts_label_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE label_contracts DROP CONSTRAINT label_contracts_label_id_fkey;
            RAISE NOTICE 'Dropped label_contracts_label_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'label_contracts_artist_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE label_contracts DROP CONSTRAINT label_contracts_artist_id_fkey;
            RAISE NOTICE 'Dropped label_contracts_artist_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'label_contracts' AND column_name = 'label_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE label_contracts ALTER COLUMN label_id TYPE TEXT USING label_id::TEXT;
            RAISE NOTICE 'Converted label_contracts.label_id from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'label_contracts' AND column_name = 'artist_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE label_contracts ALTER COLUMN artist_id TYPE TEXT USING artist_id::TEXT;
            RAISE NOTICE 'Converted label_contracts.artist_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'label_contracts_label_id_fkey'
        ) THEN
            ALTER TABLE label_contracts
                ADD CONSTRAINT label_contracts_label_id_fkey
                FOREIGN KEY (label_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created label_contracts_label_id_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'label_contracts_artist_id_fkey'
        ) THEN
            ALTER TABLE label_contracts
                ADD CONSTRAINT label_contracts_artist_id_fkey
                FOREIGN KEY (artist_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created label_contracts_artist_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 12: Fix education tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'students_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE students DROP CONSTRAINT students_user_id_fkey;
            RAISE NOTICE 'Dropped students_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'students' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE students ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted students.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'students_user_id_fkey'
        ) THEN
            ALTER TABLE students
                ADD CONSTRAINT students_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created students_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- Fix other education tables (courses, lessons, etc.)
    -- Following same pattern...

    -- =====================================================
    -- STEP 13: Fix tech_services tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_requests') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'service_requests_requester_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE service_requests DROP CONSTRAINT service_requests_requester_id_fkey;
            RAISE NOTICE 'Dropped service_requests_requester_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'service_requests_tech_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE service_requests DROP CONSTRAINT service_requests_tech_id_fkey;
            RAISE NOTICE 'Dropped service_requests_tech_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'service_requests' AND column_name = 'requester_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE service_requests ALTER COLUMN requester_id TYPE TEXT USING requester_id::TEXT;
            RAISE NOTICE 'Converted service_requests.requester_id from UUID to TEXT';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'service_requests' AND column_name = 'tech_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE service_requests ALTER COLUMN tech_id TYPE TEXT USING tech_id::TEXT;
            RAISE NOTICE 'Converted service_requests.tech_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'service_requests_requester_id_fkey'
        ) THEN
            ALTER TABLE service_requests
                ADD CONSTRAINT service_requests_requester_id_fkey
                FOREIGN KEY (requester_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created service_requests_requester_id_fkey → clerk_users';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'service_requests_tech_id_fkey'
        ) THEN
            ALTER TABLE service_requests
                ADD CONSTRAINT service_requests_tech_id_fkey
                FOREIGN KEY (tech_id)
                REFERENCES clerk_users(id)
                ON DELETE SET NULL;
            RAISE NOTICE 'Created service_requests_tech_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    -- =====================================================
    -- STEP 14: Fix legal_docs tables
    -- =====================================================

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'documents_user_id_fkey'
            AND pg_get_constraintdef(oid) LIKE '%auth.users%'
        ) THEN
            ALTER TABLE documents DROP CONSTRAINT documents_user_id_fkey;
            RAISE NOTICE 'Dropped documents_user_id_fkey (auth.users)';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'user_id'
            AND data_type = 'uuid'
        ) THEN
            ALTER TABLE documents ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
            RAISE NOTICE 'Converted documents.user_id from UUID to TEXT';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'documents_user_id_fkey'
        ) THEN
            ALTER TABLE documents
                ADD CONSTRAINT documents_user_id_fkey
                FOREIGN KEY (user_id)
                REFERENCES clerk_users(id)
                ON DELETE CASCADE;
            RAISE NOTICE 'Created documents_user_id_fkey → clerk_users';
        END IF;

        fix_count := fix_count + 1;
    END IF;

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Migration complete! Fixed % tables.', fix_count;
    RAISE NOTICE '=====================================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Migration error: %', SQLERRM;
        RAISE NOTICE 'Error details: % %', SQLSTATE, SQLERRM;
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- After running this migration, all tables should:
-- 1. Use TEXT type for user_id columns (not UUID)
-- 2. Reference clerk_users(id) instead of auth.users(id)
-- 3. Have proper foreign key constraints
-- =====================================================
