# Clerk → Neon Webhook Setup Guide

This guide walks you through setting up automatic user synchronization between Clerk and your Neon PostgreSQL database.

## Overview

The webhook handler (`api/webhooks/clerk-user-sync.js`) listens for events from Clerk and automatically:
- ✅ Creates new users in `clerk_users` table when they sign up
- ✅ Updates user data when profiles are changed
- ✅ Soft-deletes users when accounts are deleted

## Prerequisites

Before setting up the webhook, you need:

1. ✅ Clerk account with application configured
2. ✅ Neon PostgreSQL database with `clerk_users` table
3. ✅ Deploy the webhook endpoint to Vercel

---

## Step 1: Prepare Your Neon Database

Run the SQL schema to create the `clerk_users` table:

```sql
-- Go to Neon Console → SQL Editor
-- Run: sql/neon_unified_schema.sql
```

This will create the `clerk_users` table and all necessary indexes.

---

## Step 2: Get Your Webhook Secret from Clerk

1. Go to https://dashboard.clerk.com/
2. Select your application
3. Navigate to **Developers** → **Webhooks**
4. Click **"Add Endpoint"**
5. Enter the webhook URL (you'll get this after deploying):
   ```
   https://app.seshnx.com/api/webhooks/clerk-user-sync
   ```
6. Select events to listen for:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
7. Click **"Create"**
8. **Copy the Webhook Secret** (looks like `whsec_...`)
   - You'll need this for environment variables

---

## Step 3: Configure Environment Variables

Add the webhook secret to your Vercel environment variables:

### Via Vercel CLI:
```bash
vercel env add CLERK_WEBHOOK_SECRET
```

Paste your webhook secret when prompted.

### Or via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `CLERK_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (your webhook secret)
   - **Environments**: Production, Preview, Development

---

## Step 4: Deploy to Vercel

The webhook endpoint is automatically deployed when you push to Vercel:

```bash
git add .
git commit -m "Add Clerk webhook handler for user sync"
git push
# Or use: vercel --prod
```

Your webhook will be available at:
```
https://app.seshnx.com/api/webhooks/clerk-user-sync
```

---

## Step 5: Test the Webhook

### Option A: Test via Clerk Dashboard

1. In Clerk Dashboard → Webhooks → Your endpoint
2. Click **"Test"** button
3. Select a sample event (e.g., "user.created")
4. Click **"Send test webhook"**
5. Check Vercel function logs:
   ```bash
   vercel logs --follow
   ```
6. You should see:
   ```
   📥 Received Clerk webhook: user.created
   ✅ User created in Neon: user_...
   ✅ Successfully processed user.created
   ```

### Option B: Test with Real Signup

1. Go to https://app.seshnx.com
2. Sign up as a new user
3. Check Clerk Dashboard → Users (user should appear)
4. Check Neon Database → `clerk_users` table (user should sync)
5. Check Vercel logs for webhook processing

---

## Webhook Events Explained

### `user.created`
**When**: User signs up via Clerk
**Action**: `INSERT INTO clerk_users`
```sql
INSERT INTO clerk_users (
  id, email, first_name, last_name, account_types, active_role
) VALUES (...)
```

### `user.updated`
**When**: User updates profile, email, or metadata
**Action**: `UPDATE clerk_users`
```sql
UPDATE clerk_users
SET email = ..., first_name = ..., account_types = ...
WHERE id = ...
```

### `user.deleted`
**When**: User account is deleted in Clerk
**Action**: `UPDATE clerk_users SET deleted_at = NOW()`
```sql
UPDATE clerk_users
SET deleted_at = NOW()
WHERE id = ...
```

---

## Troubleshooting

### Issue: "Webhook secret not configured"
**Solution**: Add `CLERK_WEBHOOK_SECRET` to Vercel environment variables

### Issue: "Invalid webhook signature"
**Solution**: Verify the webhook secret matches what's in Clerk Dashboard

### Issue: "relation clerk_users does not exist"
**Solution**: Run the SQL schema file in Neon Console

### Issue: User created in Clerk but not in Neon
**Solution**: Check Vercel function logs for webhook processing errors

### View Webhook Logs:
```bash
# Live logs
vercel logs --follow

# Filter by webhook
vercel logs --filter "clerk-user-sync"
```

---

## Security Features

✅ **Signature Verification**: Uses Svix to verify all webhooks are from Clerk
✅ **Error Handling**: Graceful error handling with detailed logs
✅ **SQL Injection Prevention**: Uses parameterized queries
✅ **Rate Limiting**: Protected by Vercel's built-in rate limiting

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `CLERK_WEBHOOK_SECRET` | Secret for verifying webhook signatures | `whsec_abc123...` |
| `VITE_NEON_DATABASE_URL` | Neon database connection string | `postgresql://...` |
| `NEON_DATABASE_URL` | Alternative Neon connection string | `postgresql://...` |

---

## Next Steps

After the webhook is set up and working:

1. **Test user signup**: Sign up a new user and verify sync
2. **Test profile updates**: Update profile in Clerk and verify sync
3. **Test user deletion**: Delete a test user and verify soft delete
4. **Monitor logs**: Keep an eye on Vercel function logs for any errors

---

## Need Help?

- **Clerk Webhooks Docs**: https://clerk.com/docs/integrations/webhooks/sync-data
- **Neon Docs**: https://neon.tech/docs
- **Vercel Functions**: https://vercel.com/docs/functions/serverless-functions

---

## Advanced: Custom Webhook Events

You can extend the webhook handler to sync additional data:

```javascript
case 'user.created':
  // Sync to clerk_users
  await handleUserCreated(data);
  // Create extended profile
  await createExtendedProfile(data);
  break;
```

See `api/webhooks/clerk-user-sync.js` for implementation details.
