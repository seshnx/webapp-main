# Neon + Clerk + Convex Migration Guide

## Quick Summary

Your application now runs on a hybrid architecture:
- **Neon (PostgreSQL)**: Primary database for persistent data
- **Clerk**: Authentication and user management
- **Convex**: Real-time features (chat, presence)

## Migration Steps

### 1. Run the Core Schema (if not already done)

Open Neon SQL Editor (https://console.neon.tech/) and run:
```
00_core_unified_schema.sql
```

This creates the foundational tables (clerk_users, profiles, posts, bookings, etc.)

### 2. Run the Master Schema

Run in Neon SQL Editor:
```
MASTER_NEON_CLERK_CONTEX_SCHEMA.sql
```

This adds:
- Studio tables (studios, studio_rooms)
- Label & distribution tables (label_roster, releases, distribution_stats)
- Wallet & payment tables
- Equipment & instrument databases
- Marketing campaigns
- Contracts & legal documents
- And all other missing tables

### 3. Fix Existing Tables (if you ran old migrations)

If you previously ran the old Supabase migrations, run:
```
fix_clerk_uuid_mismatch.sql
```

This:
- Adds missing columns to `distribution_stats` (lifetime_streams, lifetime_earnings)
- Converts UUID columns to TEXT for Clerk user IDs
- Fixes foreign key constraints

## What Changed from Supabase

| Old (Supabase) | New (Neon + Clerk) |
|----------------|-------------------|
| `auth.users` | `clerk_users` (TEXT ID) |
| `auth.uid()` | Handled by Clerk JWT |
| `user_id` UUID | `user_id` TEXT |
| RLS with `auth.uid()` | Simplified or app-level checks |

## Files Created/Modified

### New Files
- `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql` - Complete unified schema
- `fix_clerk_uuid_mismatch.sql` - Fixes for existing tables
- `10_app_config_neon.sql` - Fixed app_config module
- `fix_distribution_stats_columns.sql` - Adds missing columns

### Original Files (Have Supabase References)
The following files still contain `auth.users` references and should NOT be used directly:
- `10_app_config.sql` (use `10_app_config_neon.sql`)
- `20_bookings.sql`
- `21_marketplace.sql`
- `22_payments.sql`
- `23_social_feed.sql`
- `30_booking_enhancements.sql`
- `31_blocked_dates.sql`
- `32_google_calendar_sync.sql`
- `40_business.sql`
- `41_business_features.sql`
- `43_label_critical.sql`
- `42_external_artists.sql`
- `50_studio_crm.sql`
- `51_studio_operations.sql`
- `52_studio_analytics.sql`
- `53_studio_ops_enhancements.sql`
- `60_tech_services.sql`
- `70_education.sql`
- `80_legal_docs.sql`
- `81_contracts.sql`
- `90_marketing_campaigns.sql`
- `100_databases.sql`
- `101_gear_import.sql`
- `102_software_import.sql`
- And many more...

**All these modules are now consolidated into `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql`**

## Troubleshooting

### Error: "relation 'studio_rooms' does not exist"
**Solution**: Run `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql`

### Error: "column lifetime_earnings does not exist"
**Solution**: Run `fix_clerk_uuid_mismatch.sql`

### Error: "invalid input syntax for type uuid: user_abc123"
**Solution**: Run `fix_clerk_uuid_mismatch.sql` to convert UUID columns to TEXT

### Error: "relation auth.users does not exist"
**Solution**: Use `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql` instead of individual module files

## Convex Realtime Setup

Your Convex schema handles real-time features. See `convex/schema.ts` for:
- Chat messages
- User presence
- Read receipts
- Real-time notifications

Convex runs independently and syncs with Neon via your API layer.

## Verification

After running the migrations, verify:

```sql
-- Check clerk_users table
SELECT COUNT(*) FROM clerk_users;

-- Check all critical tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'clerk_users', 'profiles', 'posts', 'bookings',
    'studios', 'studio_rooms', 'label_roster',
    'releases', 'distribution_stats', 'wallets'
)
ORDER BY table_name;
```

## Support

If you encounter issues:
1. Check the error message carefully
2. Look for the table/column name mentioned
3. Run the appropriate migration script
4. Refresh your application

## Architecture Notes

### Data Flow
1. **User logs in** → Clerk handles authentication
2. **User data synced** → Clerk webhook updates `clerk_users` table
3. **Application queries** → Neon queries return data
4. **Real-time updates** → Convex pushes updates to clients

### Key Differences
- No Supabase Auth → All auth is Clerk
- No Supabase Realtime → Convex handles real-time
- User IDs are strings → `user_abc123` format
- RLS is simplified → Most auth handled at app level

## Next Steps

1. ✅ Run migrations in Neon SQL Editor
2. ✅ Set up Clerk webhook to sync users to `clerk_users`
3. ✅ Deploy Convex for real-time features
4. ✅ Test the application thoroughly
5. ✅ Monitor for any missing tables/columns
