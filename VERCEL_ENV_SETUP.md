# Vercel Environment Variables Setup

## Quick Setup Instructions

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable below (one at a time or bulk import)

## Required Environment Variables

### Supabase (REQUIRED - Authentication & Database)

⚠️ **CRITICAL**: Without these, sign-in will NOT work!

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**To find these values:**
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click **Settings** → **API**
3. Copy the **Project URL** → `VITE_SUPABASE_URL`
4. Copy the **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## After Adding Variables

1. **Redeploy** your project (or push a new commit)
2. Vercel will use these variables in the build
3. Your app will connect to Supabase for authentication and database

## Optional Variables

If you have a Giphy API key for GIF support:
```
VITE_GIPHY_API_KEY=your_giphy_api_key_here
```

## Verification

After deployment, check the browser console:
- ✅ Should see "Supabase client initialized" message
- ✅ No authentication errors

