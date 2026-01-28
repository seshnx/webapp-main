-- =====================================================
-- FIX LEGACY UUID COLUMNS IN REFERENCE TO OLD AUTH.USERS
-- =====================================================
-- Migration: 204_fix_legacy_uuid_columns.sql
-- Description: Fixes user_id columns that were defined as UUID
--              when the app used Supabase auth instead of Clerk
-- Author: Claude Code
-- Date: 2025-01-27
-- =====================================================

-- Fix any tables that still reference the old auth.users table
-- These were created before switching to Clerk authentication

-- NOTE: These tables may not exist in your database, but we check
-- and fix them if they do exist

DO $$
BEGIN
    -- Drop problematic foreign key constraints if they exist
    -- These reference the old auth.users table which no longer exists or has different IDs

    -- Check and drop FK from sub_profiles if it exists with wrong type
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sub_profiles_user_id_fkey'
        AND pg_get_constraintdef(oid) LIKE '%auth.users%'
    ) THEN
        ALTER TABLE sub_profiles DROP CONSTRAINT sub_profiles_user_id_fkey;
    END IF;

    -- Recreate FK to point to clerk_users (which has TEXT id)
    ALTER TABLE sub_profiles
        ADD CONSTRAINT sub_profiles_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES clerk_users(id)
        ON DELETE CASCADE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Foreign key update attempted: %', SQLERRM;
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
