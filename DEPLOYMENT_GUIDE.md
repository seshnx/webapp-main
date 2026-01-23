# Deployment Guide - SocialFeed Fix

## Overview

This document explains the SocialFeed environment variable fixes and how to deploy them to production.

## What Was Changed

### Problem
All SocialFeed functions were broken because environment variables weren't accessible in client-side code. Vite only exposes variables prefixed with `VITE_` to the browser.

### Solution
1. Added `VITE_` prefix to environment variables that need client-side access
2. Updated `src/config/vercel-blob.js` to use `VITE_BLOB_READ_WRITE_TOKEN`
3. Cleaned `.env.local` to only contain frontend-safe variables
4. Created `.env.production.template` for Vercel setup reference

### Files Modified
- `.env.local` - Cleaned to only contain VITE_ prefixed frontend variables
- `src/config/vercel-blob.js` - Updated to use VITE_ prefix
- `.env.production.template` - Created for Vercel setup reference

## Environment Variables Strategy

### Frontend Variables (Client-Side Access)
These MUST be prefixed with `VITE_` and are exposed to the browser:

```bash
VITE_NEON_DATABASE_URL          # Neon PostgreSQL connection
VITE_BLOB_READ_WRITE_TOKEN      # Vercel Blob storage token
VITE_CLERK_PUBLISHABLE_KEY      # Clerk public key
VITE_CONVEX_URL                 # Convex deployment URL
VITE_STRIPE_PUBLISHABLE_KEY     # Stripe public key
VITE_API_ENDPOINT               # API endpoint URL
VITE_SUPABASE_URL              # Supabase URL (legacy)
VITE_SUPABASE_ANON_KEY         # Supabase anon key (legacy)
VITE_SENTRY_DSN                # Sentry public DSN
```

**These are SAFE for Git** as they only contain public keys or development credentials.

### Backend Variables (Server-Side Only)
These are ONLY accessible in API routes and are NOT exposed to the browser:

```bash
CLERK_SECRET_KEY                # Clerk secret key
STRIPE_SECRET_KEY               # Stripe secret key
STRIPE_WEBHOOK_SECRET           # Stripe webhook secret
SENTRY_AUTH_TOKEN              # Sentry auth token
CONVEX_DEPLOY_KEY              # Convex deploy key
```

**These must be set in Vercel Dashboard** - NEVER commit to Git!

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `seshnx-webapp`
3. Navigate to **Settings** > **Environment Variables**
4. Add the following variables:

#### Required Frontend Variables (VITE_ prefix):

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_NEON_DATABASE_URL` | `postgresql://neondb_owner:npg_yLHWnNa8l2tv@ep-young-glitter-ahzrw96g-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` | All |
| `VITE_BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_A8uhvDxHIfKcDYQt_0YSZxD3zrlbSFuGtj72eNFZ4eLibTN` | All |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk` | All |
| `VITE_CONVEX_URL` | `https://brainy-basilisk-921.convex.cloud` | All |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_51ShEYP5dIfhXSRylJWvuvAQUZHq0xa8IdXxOD2XPGNNRHg7Plv0rZUhezfaXSMSdrxJbfhcZqLQdpQj9A51YTlZ600yqGzsRdF` | All |
| `VITE_API_ENDPOINT` | `https://api.seshnx.com` | All |
| `VITE_SUPABASE_URL` | `https://jifhavvwftrdubyriugu.supabase.co` | All |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | All |
| `VITE_SENTRY_DSN` | `https://304d0e1a858d6d79421a78dd5e0e6920@o4510574064959488.ingest.us.sentry.io/4510574075379712` | All |

#### Required Backend Variables (No VITE_ prefix):

| Name | Value | Environments |
|------|-------|--------------|
| `CLERK_SECRET_KEY` | `sk_test_xxxxxxxx` (get from Clerk Dashboard) | All |
| `STRIPE_SECRET_KEY` | `sk_test_xxxxxxxx` (get from Stripe Dashboard) | All |
| `SENTRY_AUTH_TOKEN` | `your-sentry-auth-token` (get from Sentry Dashboard) | All |
| `CONVEX_DEPLOY_KEY` | `your-convex-deploy-key` (get from Convex Dashboard) | All |

**Note:** For Production environment, use production credentials, not test keys!

### Step 2: Commit Changes to Git

The `.env.local` file is already in `.gitignore`, so it won't be committed. This is correct behavior.

To commit the code changes:

```bash
cd webapp-main

# Stage the modified files
git add .env.production.template
git add src/config/vercel-blob.js

# Commit with a clear message
git commit -m "fix(socialfeed): Add VITE_ prefix to environment variables

- Add VITE_NEON_DATABASE_URL for client-side database access
- Add VITE_BLOB_READ_WRITE_TOKEN for client-side file uploads
- Update vercel-blob.js to use VITE_BLOB_READ_WRITE_TOKEN
- Create .env.production.template for Vercel setup reference
- Clean .env.local to only contain frontend-safe variables

This fixes all SocialFeed functions that were broken due to environment
variables not being accessible in client-side code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Step 3: Push to Git

```bash
# Push to your repository
git push origin main
```

### Step 4: Deploy to Vercel

After pushing to Git, Vercel will automatically deploy. To verify:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments**
4. Wait for the deployment to complete
5. Check the deployment logs for any errors

### Step 5: Test in Production

After deployment, test all SocialFeed functions:

1. **Feed Loading**
   - [ ] Posts load in "For You" tab
   - [ ] Posts load in "Following" tab
   - [ ] "Discover" tab works

2. **Post Creation**
   - [ ] Can create text posts
   - [ ] Can create posts with images
   - [ ] Can create posts with videos
   - [ ] Can create posts with audio

3. **Post Interactions**
   - [ ] Like/emoji reactions work
   - [ ] Comments can be added
   - [ ] Posts can be shared
   - [ ] Posts can be saved

4. **Follow System**
   - [ ] Can follow users
   - [ ] Can unfollow users
   - [ ] Follow status displays correctly

## Troubleshooting

### Issue: "Neon client is not configured" error

**Cause:** `VITE_NEON_DATABASE_URL` not set in Vercel

**Solution:**
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add `VITE_NEON_DATABASE_URL` with your Neon connection string
3. Redeploy your application

### Issue: "File uploads not working"

**Cause:** `VITE_BLOB_READ_WRITE_TOKEN` not set in Vercel

**Solution:**
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add `VITE_BLOB_READ_WRITE_TOKEN`
3. Redeploy your application

### Issue: API routes not working

**Cause:** Backend environment variables not set (missing VITE_ prefix)

**Solution:**
1. Ensure backend variables (CLERK_SECRET_KEY, etc.) are set WITHOUT VITE_ prefix
2. These should be in Vercel Dashboard, not in .env files
3. Redeploy your application

## Security Best Practices

### ✅ DO:
- Use environment-specific keys (test vs production)
- Rotate credentials regularly
- Never commit secrets to Git
- Add .env.local to .gitignore
- Use Vercel Dashboard for production secrets

### ❌ DON'T:
- Share production credentials via email/chat
- Commit secrets to version control
- Use production keys in development
- Log secrets in error messages
- Expose backend secrets to frontend code

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Console](https://console.neon.tech/)
- [Vercel Dashboard](https://vercel.com/dashboard)

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Ensure variables have correct prefixes (VITE_ for frontend, no prefix for backend)
