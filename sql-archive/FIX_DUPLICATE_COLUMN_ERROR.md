# Fix: Duplicate Column Error

## Problem

You're getting this error:
```
ERROR: column "display_name" specified more than once (SQLSTATE 42701)
```

## Cause

This happens because of **conflicting table definitions** between schema files:

1. `00_core_unified_schema.sql` creates `sub_profiles` with columns: `account_type`, `display_name`, `bio`, `photo_url`, `profile_data`
2. `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql` creates `sub_profiles` with columns: `role`, `data`

When you run both files, the second one fails because the table already exists with a different structure.

## Solution

### Option 1: Drop and Recreate (Clean Slate) ⭐ **RECOMMENDED**

Run this in Neon SQL Editor to drop all conflicting tables and start fresh:

```sql
-- Drop all conflicting tables in order
DROP TABLE IF EXISTS saved_posts CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS sub_profiles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS market_items CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS clerk_users CASCADE;
```

Then run:
```sql
sql/00_core_schema_clean.sql
```

### Option 2: Use Only One Schema File

**Choose ONE of these approaches:**

#### Approach A: Core Schema Only
Run only `00_core_schema_clean.sql` (new file, fixes the conflicts)

#### Approach B: Master Schema
Run only `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql` (includes everything)

### Option 3: Selective Migration

If you want to keep existing data, check which tables exist:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sub_profiles'
ORDER BY ordinal_position;
```

Then manually fix conflicts.

## Schema File Comparison

| Table | 00_core_unified_schema.sql | MASTER_NEON_CLERK_CONTEX_SCHEMA.sql | 00_core_schema_clean.sql (NEW) |
|-------|----------------------------|-------------------------------------|-------------------------------|
| sub_profiles | `account_type`, `display_name`, `bio`, `photo_url`, `profile_data` | `role`, `data` | `role`, `data` ✅ |
| profiles | `display_name` TEXT | (not in master) | `display_name` TEXT ✅ |
| posts | `display_name`, `author_photo` | (not in master) | `display_name`, `author_photo` ✅ |
| comments | `display_name`, `author_photo` | (not in master) | `display_name`, `author_photo` ✅ |

## Which File to Use?

### For New Database (Recommended):
```
00_core_schema_clean.sql
MASTER_NEON_CLERK_CONTEX_SCHEMA.sql
fix_clerk_uuid_mismatch.sql
```

### For Existing Database:
1. Check what tables exist
2. Drop conflicting tables if needed
3. Run `00_core_schema_clean.sql`

## Verification

After running the migration, verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'clerk_users', 'profiles', 'sub_profiles', 'posts',
    'comments', 'reactions', 'follows', 'notifications',
    'bookings', 'sessions', 'market_items', 'schools', 'students'
)
ORDER BY table_name;

-- Check no duplicate columns in sub_profiles
SELECT column_name, COUNT(*)
FROM information_schema.columns
WHERE table_name = 'sub_profiles'
GROUP BY column_name
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

## Quick Fix (One Command)

If you just want to fix it quickly, run this in Neon SQL Editor:

```sql
-- Drop all tables that might have conflicts
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO your_database_user;
GRANT ALL ON SCHEMA public TO public;

-- Then run: 00_core_schema_clean.sql
```

⚠️ **WARNING:** The above will delete ALL data in your database!
