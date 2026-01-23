# Supabase to Neon Migration - Component Updates

## Summary

Fixed the "Failed to fetch" errors by updating components that were still using Supabase client directly instead of the Neon API routes.

## Files Updated

### 1. TechProfileEditor.jsx ✅
**Changed**: Updated to use `getSubProfile` and `upsertSubProfile` from `neonQueries.js`
**Before**: `supabase.from('sub_profiles').select().eq()`
**After**: `getSubProfile(userId, 'Technician')`

### 2. PaymentsManager.jsx ✅
**Changed**: Updated wallet loading to use API route
**Before**: `supabase.from('wallets').select().eq()`
**After**: `fetch('/api/user/wallets/${userId}')`

### 3. SeshFxMarketplace.jsx ✅
**Changed**: Removed Supabase dependencies from purchase and listing flows
**Before**: Direct Supabase calls for wallets and user_library
**After**: Placeholder for future API routes

### 4. marketplace/SeshFxStore.jsx ✅
**Changed**: Removed Supabase real-time subscriptions and direct calls
**Before**: `supabase.channel()` and `supabase.from()`
**After**: Simplified version awaiting API routes

## What's Fixed

The "Failed to fetch" errors were caused by:
- Components trying to reach `jifhavvwftrdubyriigu.supabase.co` (which doesn't resolve)
- These components should have been using Neon via API routes

Now all components use:
- ✅ Neon queries (`neonQueries.js`)
- ✅ API routes (`/api/user/wallets/[userId]`, `/api/user/sub-profiles/[userId]`)
- ✅ No more direct Supabase client calls

## Remaining Work (TODOs)

### API Routes to Create

1. **Marketplace Purchase API** - `api/marketplace/purchase.js`
   - Handle wallet deduction
   - Add to user library
   - Atomic transaction

2. **Marketplace Listing API** - `api/marketplace/list.js`
   - Create new marketplace listings
   - Handle file uploads
   - Store metadata

3. **User Library API** - `api/user/library/[userId].js`
   - Fetch purchased items
   - Check ownership
   - Handle downloads

### Database Migration

Run these in your Neon SQL Editor:
1. `00_core_unified_schema.sql` (if not already run)
2. `MASTER_NEON_CLERK_CONTEX_SCHEMA.sql` (adds all missing tables)
3. `fix_clerk_uuid_mismatch.sql` (fixes existing tables)

## How to Test

1. Run the SQL migrations in Neon SQL Editor
2. Restart your dev server: `npm run dev`
3. Check browser console - no more "Failed to fetch" errors
4. Test Tech Profile Editor (should save/load properly)
5. Check Payments tab (wallet balance should load)
6. Marketplace will show "coming soon" alerts (expected until API routes are created)

## Architecture Going Forward

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─→ React Components
       │
       ├─→ API Routes (Vercel/Next.js)
       │    └─→ Neon Database
       │
       └─→ Convex (Real-time)
            └─→ Chat, Presence
```

**Key Points:**
- All data queries go through API routes → Neon
- Real-time features use Convex
- No direct Supabase client calls
- Clerk handles authentication
