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

### Firebase (Legacy - for some features)

```
VITE_FIREBASE_API_KEY=AIzaSyCmGxvXX2D11Jo3NZlD0jO1vQpskaG0sCU
VITE_FIREBASE_AUTH_DOMAIN=seshnx-db.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://seshnx-db-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seshnx-db
VITE_FIREBASE_STORAGE_BUCKET=seshnx-db.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=718084970004
VITE_FIREBASE_APP_ID=1:718084970004:web:d68ba48c5eb493af9db901
VITE_FIREBASE_MEASUREMENT_ID=G-7SP53NK9FM
```

## Bulk Import (Easier Method)

1. In Vercel, go to **Settings** → **Environment Variables**
2. Click **"Import"** or **"Add"** button
3. Copy the entire block above
4. Paste and save

## After Adding Variables

1. **Redeploy** your project (or push a new commit)
2. Vercel will use these variables in the build
3. Your app will connect to the new `seshnx-db` Firebase project

## Optional Variables

If you have a Giphy API key for GIF support:
```
VITE_GIPHY_API_KEY=your_giphy_api_key_here
```

## Verification

After deployment, check the browser console:
- ✅ Should see RTDB initialized (if enabled in Firebase)
- ✅ Should see Storage initialized (if enabled in Firebase)
- ❌ No "Service not available" errors if services are enabled

