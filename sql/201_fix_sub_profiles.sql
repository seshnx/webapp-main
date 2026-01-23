-- =====================================================
-- Fix sub_profiles table - Add is_active column if missing
-- =====================================================
-- Run this BEFORE running legal_docs_module_fixed.sql
-- if you get an error about is_active column not existing
-- =====================================================

-- Check if sub_profiles table exists and add is_active column if missing
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'sub_profiles'
    ) THEN
        -- Add is_active column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sub_profiles' AND column_name = 'is_active'
        ) THEN
            ALTER TABLE sub_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
    END IF;
END $$;

-- Drop and recreate policies that reference is_active to ensure they work
DO $$ 
BEGIN
    -- Drop existing policies on sub_profiles
    DROP POLICY IF EXISTS "Users can view their own sub-profiles" ON sub_profiles;
    DROP POLICY IF EXISTS "Active sub-profiles are viewable by everyone" ON sub_profiles;
    DROP POLICY IF EXISTS "Users can insert their own sub-profiles" ON sub_profiles;
    DROP POLICY IF EXISTS "Users can update their own sub-profiles" ON sub_profiles;
    DROP POLICY IF EXISTS "Users can delete their own sub-profiles" ON sub_profiles;
    
    -- Only recreate if table exists and column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'sub_profiles'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sub_profiles' AND column_name = 'is_active'
    ) THEN
        -- Recreate policies
        CREATE POLICY "Users can view their own sub-profiles" ON sub_profiles
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Active sub-profiles are viewable by everyone" ON sub_profiles
            FOR SELECT USING (is_active = true);
        
        CREATE POLICY "Users can insert their own sub-profiles" ON sub_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own sub-profiles" ON sub_profiles
            FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own sub-profiles" ON sub_profiles
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

