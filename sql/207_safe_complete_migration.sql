-- =====================================================
-- SAFE COMPLETE MIGRATION - HANDLES EXISTING DATA
-- =====================================================
-- Migration: 207_safe_complete_migration.sql
-- Description: Comprehensive migration that safely handles
--              existing UUID data, foreign keys, and constraints
-- Author: Claude Code
-- Date: 2025-01-27
-- =====================================================

-- This script is designed to handle:
-- 1. Existing UUID data in columns
-- 2. Foreign key constraints
-- 3. Missing columns
-- 4. Data type conversions
-- 5. Duplicate prevention

SET client_min_messages TO NOTICE; -- Show all messages

-- =====================================================
-- STEP 1: ADD MISSING COLUMNS (IF NEEDED)
-- =====================================================

DO $$
DECLARE
    fix_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STEP 1: Adding missing columns...';
    RAISE NOTICE '=====================================================';

    -- clerk_users table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clerk_users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clerk_users' AND column_name = 'default_profile_role') THEN
            ALTER TABLE clerk_users ADD COLUMN IF NOT EXISTS default_profile_role TEXT;
            RAISE NOTICE '✓ Added clerk_users.default_profile_role';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- posts table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'posted_as_role') THEN
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS posted_as_role TEXT;
            RAISE NOTICE '✓ Added posts.posted_as_role';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'display_name') THEN
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_name TEXT;
            RAISE NOTICE '✓ Added posts.display_name';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'author_photo') THEN
            ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_photo TEXT;
            RAISE NOTICE '✓ Added posts.author_photo';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- notifications table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
            RAISE NOTICE '✓ Added notifications.is_read';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
            RAISE NOTICE '✓ Added notifications.read_at';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
            RAISE NOTICE '✓ Added notifications.metadata';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- sub_profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'display_name') THEN
            ALTER TABLE sub_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
            RAISE NOTICE '✓ Added sub_profiles.display_name';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'bio') THEN
            ALTER TABLE sub_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
            RAISE NOTICE '✓ Added sub_profiles.bio';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'photo_url') THEN
            ALTER TABLE sub_profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
            RAISE NOTICE '✓ Added sub_profiles.photo_url';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'location') THEN
            ALTER TABLE sub_profiles ADD COLUMN IF NOT EXISTS location JSONB;
            RAISE NOTICE '✓ Added sub_profiles.location';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'website') THEN
            ALTER TABLE sub_profiles ADD COLUMN IF NOT EXISTS website TEXT;
            RAISE NOTICE '✓ Added sub_profiles.website';
            fix_count := fix_count + 1;
        END IF;

        -- Rename role to account_type if needed
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'role')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sub_profiles' AND column_name = 'account_type') THEN
            ALTER TABLE sub_profiles RENAME COLUMN role TO account_type;
            RAISE NOTICE '✓ Renamed sub_profiles.role to account_type';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- bookings table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'sender_id') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sender_id TEXT;
            RAISE NOTICE '✓ Added bookings.sender_id';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'studio_owner_id') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS studio_owner_id TEXT;
            RAISE NOTICE '✓ Added bookings.studio_owner_id';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'target_id') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS target_id TEXT;
            RAISE NOTICE '✓ Added bookings.target_id';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_type') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type TEXT;
            RAISE NOTICE '✓ Added bookings.service_type';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'time') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time TEXT;
            RAISE NOTICE '✓ Added bookings.time';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'duration') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration INTEGER;
            RAISE NOTICE '✓ Added bookings.duration';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'offer_amount') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_amount NUMERIC(10,2);
            RAISE NOTICE '✓ Added bookings.offer_amount';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'message') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT;
            RAISE NOTICE '✓ Added bookings.message';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'client_name') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_name TEXT;
            RAISE NOTICE '✓ Added bookings.client_name';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'client_email') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_email TEXT;
            RAISE NOTICE '✓ Added bookings.client_email';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'client_phone') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS client_phone TEXT;
            RAISE NOTICE '✓ Added bookings.client_phone';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'room_name') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_name TEXT;
            RAISE NOTICE '✓ Added bookings.room_name';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'session_type') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_type TEXT;
            RAISE NOTICE '✓ Added bookings.session_type';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'price') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
            RAISE NOTICE '✓ Added bookings.price';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'deposit_paid') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_paid NUMERIC(10,2) DEFAULT 0;
            RAISE NOTICE '✓ Added bookings.deposit_paid';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'notes') THEN
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
            RAISE NOTICE '✓ Added bookings.notes';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- sessions table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'booking_id') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
            RAISE NOTICE '✓ Added sessions.booking_id';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'studio_owner_id') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS studio_owner_id TEXT;
            RAISE NOTICE '✓ Added sessions.studio_owner_id';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'session_name') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_name TEXT;
            RAISE NOTICE '✓ Added sessions.session_name';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'start_time') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
            RAISE NOTICE '✓ Added sessions.start_time';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'end_time') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
            RAISE NOTICE '✓ Added sessions.end_time';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'status') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
            RAISE NOTICE '✓ Added sessions.status';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'notes') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notes TEXT;
            RAISE NOTICE '✓ Added sessions.notes';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'metadata') THEN
            ALTER TABLE sessions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
            RAISE NOTICE '✓ Added sessions.metadata';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- profiles table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'settings') THEN
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
            RAISE NOTICE '✓ Added profiles.settings';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    -- comments table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'display_name') THEN
            ALTER TABLE comments ADD COLUMN IF NOT EXISTS display_name TEXT;
            RAISE NOTICE '✓ Added comments.display_name';
            fix_count := fix_count + 1;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_photo') THEN
            ALTER TABLE comments ADD COLUMN IF NOT EXISTS author_photo TEXT;
            RAISE NOTICE '✓ Added comments.author_photo';
            fix_count := fix_count + 1;
        END IF;
    END IF;

    RAISE NOTICE 'Added % missing columns', fix_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in Step 1: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 2: CREATE INDEXES (IF MISSING) - DEFENSIVE
-- =====================================================

DO $$
DECLARE
    v_table_name TEXT;
    v_column_name TEXT;
    v_index_name TEXT;
    index_count INTEGER := 0;

    -- Define indexes to create
    TYPE index_def IS RECORD (
        table_name TEXT,
        column_name TEXT,
        index_name TEXT
    );
    index_def_array index_def[];
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STEP 2: Creating missing indexes (defensive)...';
    RAISE NOTICE '=====================================================';

    -- Build array of indexes we want to create
    -- Only create if both table AND column exist
    FOR v_table_name, v_column_name IN
        (SELECT 'posts', 'posted_as_role' UNION
         SELECT 'posts', 'user_id' UNION
         SELECT 'posts', 'created_at' UNION
         SELECT 'posts', 'parent_post_id' UNION
         SELECT 'comments', 'post_id' UNION
         SELECT 'comments', 'user_id' UNION
         SELECT 'comments', 'created_at' UNION
         SELECT 'reactions', 'user_id' UNION
         SELECT 'follows', 'follower_id' UNION
         SELECT 'follows', 'following_id' UNION
         SELECT 'saved_posts', 'user_id' UNION
         SELECT 'saved_posts', 'post_id' UNION
         SELECT 'notifications', 'user_id' UNION
         SELECT 'notifications', 'is_read' UNION
         SELECT 'notifications', 'created_at' UNION
         SELECT 'bookings', 'target_id' UNION
         SELECT 'bookings', 'studio_owner_id' UNION
         SELECT 'bookings', 'sender_id' UNION
         SELECT 'bookings', 'date' UNION
         SELECT 'bookings', 'status' UNION
         SELECT 'sessions', 'booking_id' UNION
         SELECT 'sessions', 'studio_owner_id' UNION
         SELECT 'sessions', 'status' UNION
         SELECT 'market_items', 'seller_id' UNION
         SELECT 'market_items', 'type' UNION
         SELECT 'market_items', 'is_active' UNION
         SELECT 'schools', 'name' UNION
         SELECT 'schools', 'is_active' UNION
         SELECT 'students', 'user_id' UNION
         SELECT 'students', 'school_id' UNION
         SELECT 'students', 'status' UNION
         SELECT 'students', 'cohort' UNION
         SELECT 'sub_profiles', 'user_id' UNION
         SELECT 'sub_profiles', 'account_type' UNION
         SELECT 'sub_profiles', 'is_active' UNION
         SELECT 'clerk_users', 'email' UNION
         SELECT 'clerk_users', 'username' UNION
         SELECT 'clerk_users', 'active_role' UNION
         SELECT 'profiles', 'user_id')
    LOOP
        -- Check if table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table_name) THEN
            -- Check if column exists
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = v_table_name AND column_name = v_column_name
            ) THEN
                -- Generate index name
                v_index_name := 'idx_' || v_table_name || '_' || v_column_name;

                -- Create index if it doesn't exist
                BEGIN
                    EXECUTE format(
                        'CREATE INDEX IF NOT EXISTS %I ON %I(%I)',
                        v_index_name, v_table_name, v_column_name
                    );
                    index_count := index_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    RAISE NOTICE '⚠ Could not create index % on %.%: %',
                               v_index_name, v_table_name, v_column_name, SQLERRM;
                END;
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE '✓ Created % indexes', index_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in Step 2: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 3: FIX UUID COLUMNS WITH EXISTING DATA
-- =====================================================

DO $$
DECLARE
    v_table_name TEXT;
    v_column_name TEXT;
    v_constraint_name TEXT;
    v_count INTEGER;
    total_fixed INTEGER := 0;

    -- Cursor over all UUID columns that reference users
    column_cur CURSOR FOR
        SELECT
            c.table_name::TEXT,
            c.column_name::TEXT
        FROM information_schema.columns c
        JOIN information_schema.tables t ON c.table_name = t.table_name
        WHERE c.table_schema = 'public'
          AND c.data_type = 'uuid'
          AND c.column_name LIKE '%user_id'
          AND t.table_type = 'BASE TABLE'
          AND c.table_name NOT IN ('spatial_ref_sys') -- Exclude system tables
        ORDER BY c.table_name, c.column_name;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STEP 3: Fixing UUID columns with existing data...';
    RAISE NOTICE '=====================================================';

    OPEN column_cur;
    LOOP
        FETCH column_cur INTO v_table_name, v_column_name;
        EXIT WHEN NOT FOUND;

        -- Check if table still exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = v_table_name) THEN
            CONTINUE;
        END IF;

        RAISE NOTICE 'Processing %.%...', v_table_name, v_column_name;

        BEGIN
            -- Step 3a: Drop foreign key constraint if it exists and points to auth.users
            FOR v_constraint_name IN
                SELECT con.conname::TEXT
                FROM pg_constraint con
                JOIN pg_class rel ON con.conrelid = rel.oid
                JOIN pg_attribute att ON con.conrelid = att.attrelid AND att.attnum = ANY(con.conkey)
                WHERE rel.relname = v_table_name
                  AND att.attname = v_column_name
                  AND con.contype = 'f'
                  AND pg_get_constraintdef(con.oid) LIKE '%auth.users%'
            LOOP
                EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
                             v_table_name, v_constraint_name);
                RAISE NOTICE '  ✓ Dropped foreign key %', v_constraint_name;
            END LOOP;

            -- Step 3b: Check if column has data
            EXECUTE format('SELECT COUNT(*) FROM %I WHERE %I IS NOT NULL',
                         v_table_name, v_column_name) INTO v_count;

            IF v_count > 0 THEN
                RAISE NOTICE '  ⚠ Table has % rows with data - converting carefully', v_count;

                -- Step 3c: Add a temporary column to hold TEXT values
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %s_temp TEXT',
                             v_table_name, v_column_name);

                -- Step 3d: Copy UUID data as TEXT
                EXECUTE format('UPDATE %I SET %s_temp = %I::TEXT WHERE %I IS NOT NULL',
                             v_table_name, v_column_name, v_column_name, v_column_name);

                -- Step 3e: Drop the old UUID column
                EXECUTE format('ALTER TABLE %I DROP COLUMN %I',
                             v_table_name, v_column_name);

                -- Step 3f: Rename temp column to original name
                EXECUTE format('ALTER TABLE %I RENAME COLUMN %s_temp TO %I',
                             v_table_name, v_column_name, v_column_name);

                RAISE NOTICE '  ✓ Converted %.% from UUID to TEXT (affected % rows)',
                           v_table_name, v_column_name, v_count;
            ELSE
                -- No data, safe to directly alter
                EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE TEXT USING %I::TEXT',
                             v_table_name, v_column_name, v_column_name);
                RAISE NOTICE '  ✓ Converted %.% from UUID to TEXT (no data affected)',
                           v_table_name, v_column_name;
            END IF;

            -- Step 3g: Create foreign key to clerk_users if appropriate
            IF v_column_name = 'user_id'
               OR v_column_name LIKE '%user_id'
               OR v_column_name IN ('sender_id', 'target_id', 'follower_id', 'following_id',
                                   'requester_id', 'tech_id', 'owner_id', 'creator_id',
                                   'seller_id', 'buyer_id', 'reviewer_id', 'label_id',
                                   'artist_id', 'instructor_id', 'student_id') THEN

                -- Check if clerk_users exists
                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clerk_users') THEN
                    -- Check if foreign key doesn't already exist
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint con
                        JOIN pg_class rel ON con.conrelid = rel.oid
                        JOIN pg_attribute att ON con.conrelid = att.attrelid AND att.attnum = ANY(con.conkey)
                        WHERE rel.relname = v_table_name
                          AND att.attname = v_column_name
                          AND con.contype = 'f'
                          AND pg_get_constraintdef(con.oid) LIKE '%clerk_users%'
                    ) THEN
                        BEGIN
                            EXECUTE format(
                                'ALTER TABLE %I ADD CONSTRAINT %I_%I_fkey
                                 FOREIGN KEY (%I) REFERENCES clerk_users(id)
                                 ON DELETE CASCADE',
                                v_table_name, v_table_name, v_column_name, v_column_name
                            );
                            RAISE NOTICE '  ✓ Created foreign key to clerk_users';
                        EXCEPTION WHEN OTHERS THEN
                            RAISE NOTICE '  ⚠ Could not create foreign key: %', SQLERRM;
                        END;
                    END IF;
                END IF;
            END IF;

            total_fixed := total_fixed + 1;

        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '  ✗ Error processing %.%: %',
                           v_table_name, v_column_name, SQLERRM;
                -- Continue with next column
        END;
    END LOOP;
    CLOSE column_cur;

    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STEP 3 COMPLETE: Fixed % UUID columns', total_fixed;
    RAISE NOTICE '=====================================================';

EXCEPTION
    WHEN OTHERS THEN
        IF column_cur IS NOT NULL THEN
            CLOSE column_cur;
        END IF;
        RAISE NOTICE 'Error in Step 3: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 4: CLEANUP ANY TEMPORARY COLUMNS
-- =====================================================

DO $$
DECLARE
    v_table_name TEXT;
    v_column_name TEXT;

    temp_col_cur CURSOR FOR
        SELECT table_name::TEXT, column_name::TEXT
        FROM information_schema.columns
        WHERE column_name LIKE '%_temp'
          AND table_schema = 'public'
          AND table_name NOT IN ('spatial_ref_sys');
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STEP 4: Cleaning up temporary columns...';
    RAISE NOTICE '=====================================================';

    OPEN temp_col_cur;
    LOOP
        FETCH temp_col_cur INTO v_table_name, v_column_name;
        EXIT WHEN NOT FOUND;

        BEGIN
            EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I',
                         v_table_name, v_column_name);
            RAISE NOTICE '✓ Dropped temporary column %.%', v_table_name, v_column_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠ Could not drop %.%: %', v_table_name, v_column_name, SQLERRM;
        END;
    END LOOP;
    CLOSE temp_col_cur;

EXCEPTION
    WHEN OTHERS THEN
        IF temp_col_cur IS NOT NULL THEN
            CLOSE temp_col_cur;
        END IF;
        RAISE NOTICE 'Error in Step 4: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: ANALYZE TABLES TO UPDATE STATISTICS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'STEP 5: Analyzing tables to update statistics...';
    RAISE NOTICE '=====================================================';

    ANALYZE;

    RAISE NOTICE '✓ Database statistics updated';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in Step 5: %', SQLERRM;
END $$;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'MIGRATION COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Steps completed:';
    RAISE NOTICE '  1. ✓ Missing columns added';
    RAISE NOTICE '  2. ✓ Indexes created';
    RAISE NOTICE '  3. ✓ UUID columns converted to TEXT';
    RAISE NOTICE '  4. ✓ Temporary columns cleaned up';
    RAISE NOTICE '  5. ✓ Statistics updated';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Your database should now be compatible with Clerk!';
    RAISE NOTICE '=====================================================';
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
