# SQL Schema Verification Report for Neon Setup

## ❌ Critical Issues Found

### Issue #1: Missing Label Tables in Main Schema
The `neon_unified_schema.sql` does NOT include these critical tables needed for Label Dashboard:
- `label_roster` - Artist roster management
- `releases` - Music releases tracking
- `distribution_stats` - Streaming and revenue data

These tables are ONLY defined in `business_center_module_fixed.sql` which still uses Supabase's `auth.users`.

### Issue #2: auth.users References Still Present
**24 SQL files** still reference `auth.users` (Supabase-specific):
- business_center_module_fixed.sql ❌
- education_module_fixed.sql ❌
- marketplace_module_fixed.sql ❌
- bookings_module_fixed.sql ❌
- payments_module_fixed.sql ❌
- tech_services_module_fixed.sql ❌
- legal_docs_module_fixed.sql ❌
- social_feed_module.sql ❌
- And 16 more...

### Issue #3: auth.uid() in RLS Policies
Row Level Security policies use `auth.uid()` which works in both Supabase AND Neon, but requires:
- Neon: Uses the `auth.uid()` from the connection (Clerk JWT would need to be passed)
- Supabase: Built-in authentication

## ✅ What IS Ready (Neon-Compatible)

Only 3 files are properly configured for Neon:
1. ✅ `neon_unified_schema.sql` - Uses `clerk_users` table
2. ✅ `contracts_module.sql` - Uses `clerk_users` table
3. ✅ `marketing_campaigns_module.sql` - Uses `clerk_users` table

## 🔧 Immediate Fix Required

### Option A: Complete Neon Migration (Recommended for Meeting)
Create a single comprehensive schema file that includes ALL tables with `clerk_users`:

```sql
-- Run this FIRST in Neon SQL Editor
-- File: sql/neon_complete_schema.sql (to be created)

-- This would include:
1. clerk_users table (✅ exists in neon_unified_schema.sql)
2. profiles table (✅ exists)
3. label_roster table (❌ MISSING - needs to be added)
4. releases table (❌ MISSING - needs to be added)
5. distribution_stats table (❌ MISSING - needs to be added)
6. contracts tables (✅ exists in contracts_module.sql)
7. marketing_campaigns tables (✅ exists in marketing_campaigns_module.sql)
8. All other module tables (need auth.users → clerk_users conversion)
```

### Option B: Quick Fix for Meeting (Minimal Working Setup)
Run only these files in Neon SQL Editor for the meeting:

```sql
-- Step 1: Base schema
sql/neon_unified_schema.sql

-- Step 2: Add missing label tables (NEEDS TO BE CREATED)
-- File: sql/label_tables_neon.sql (needs auth.users → clerk_users updates)

-- Step 3: Contract management
sql/contracts_module.sql

-- Step 4: Marketing campaigns
sql/marketing_campaigns_module.sql
```

## 📋 Tables Needed for Label Demo

For the label dashboard to work with REAL data, these tables must exist:

### Critical (Required for Demo):
```sql
-- These are MISSING from neon_unified_schema.sql but referenced by LabelDashboard.jsx:

CREATE TABLE label_roster (
    id UUID PRIMARY KEY,
    label_id UUID REFERENCES clerk_users(id),  -- Was: auth.users
    artist_id UUID REFERENCES clerk_users(id),  -- Was: auth.users
    name TEXT,
    email TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'active',
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE releases (
    id UUID PRIMARY KEY,
    artist_id UUID REFERENCES clerk_users(id),  -- Was: auth.users
    label_id UUID REFERENCES clerk_users(id),    -- Was: auth.users
    title TEXT NOT NULL,
    type TEXT,
    release_date DATE,
    cover_art_url TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE distribution_stats (
    user_id UUID REFERENCES clerk_users(id),    -- Was: auth.users
    lifetime_streams BIGINT DEFAULT 0,
    lifetime_earnings NUMERIC(10, 2) DEFAULT 0,
    monthly_listeners INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 Recommendation for Meeting This Week

**Create and run**: `sql/neon_label_critical_tables.sql` with the above tables.

This will make the Label Dashboard work with real data without migrating all 24 SQL files.

## After Meeting: Full Migration Plan

1. Convert all 24 SQL files from `auth.users` → `clerk_users`
2. Combine into unified schema
3. Test all features
4. Document migration guide
