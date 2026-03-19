# Convex Migration Quickstart Guide

## Overview
This guide helps you migrate SeshNx from Neon PostgreSQL + MongoDB to Convex-only architecture.

## Prerequisites

1. **Backup your databases**
   ```bash
   # Backup Neon
   pg_dump $NEON_DATABASE_URL > backup.sql

   # Backup MongoDB
   mongodump --uri="$MONGODB_URI" --out=./mongo-backup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```

## Migration Steps

### Step 1: Export Data

Export all data from Neon and MongoDB to JSON files:

```bash
node scripts/export-data.js
```

This creates files in the `data/` directory:
- `users.json`
- `posts.json`
- `comments.json`
- `reactions.json`
- `follows.json`
- `bookings.json`
- `schools.json`
- `students.json`
- `broadcasts.json`

### Step 2: Run Migration

**Option A: Run Full Migration**
```bash
node scripts/run-convex-migration.js
```

**Option B: Run Step-by-Step**
```bash
# 1. Export data (already done)
node scripts/run-convex-migration.js --step=1

# 2. Migrate users
node scripts/run-convex-migration.js --step=2

# 3. Migrate social features
node scripts/run-convex-migration.js --step=3

# 4. Migrate business data
node scripts/run-convex-migration.js --step=4

# 5. Migrate broadcasts
node scripts/run-convex-migration.js --step=5

# 6. Validate migration
node scripts/run-convex-migration.js --step=6
```

### Step 3: Update Application Code

After successful migration:

1. **Update imports** - Replace Neon/MongoDB imports with Convex
2. **Update API routes** - Convert to Convex functions
3. **Update components** - Use Convex hooks
4. **Test thoroughly** - Verify all features work

### Step 4: Deploy to Production

```bash
# Deploy Convex schema
npx convex deploy

# Deploy application
npm run build:vercel
```

## Validation

Check migration success:

```bash
npx convex run migrate:validateMigration
```

Expected output:
```json
{
  "users": 1000,
  "posts": 5000,
  "comments": 10000,
  "reactions": 25000,
  "follows": 5000
}
```

## Rollback

If migration fails:

1. Keep Neon/MongoDB running during transition
2. Use feature flags to switch back
3. Fix the issue
4. Retry migration

## Cleanup

After successful migration:

1. Remove old database credentials
2. Delete unused config files
3. Remove migration scripts (after 30 days)
4. Update documentation

## Troubleshooting

### Issue: Migration fails at step 2
**Solution**: Check that `data/users.json` exists and is valid JSON

### Issue: Users not found
**Solution**: Verify clerk_ids match between Neon and Convex

### Issue: Out of memory
**Solution**: Migrate in smaller batches using `--step` flag

### Issue: Validation fails
**Solution**: Check Convex dashboard for errors, re-run failed step

## Next Steps

- ✅ Monitor application performance
- ✅ Test all features thoroughly
- ✅ Set up Convex backups
- ✅ Update team documentation
- ✅ Remove old database costs

## Support

For issues or questions:
1. Check `CONVEX_MIGRATION_PLAN.md` for detailed architecture
2. Check `convex/DATA_MIGRATION_GUIDE.md` for technical details
3. Check Convex dashboard for error logs
