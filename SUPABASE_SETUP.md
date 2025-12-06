# Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Click **"New Project"**
4. Fill in:
   - **Name**: `seshnx-chat` (or your choice)
   - **Database Password**: (save this - you'll need it!)
   - **Region**: Choose closest to your users
5. Wait ~2 minutes for provisioning

### 2. Get Your Credentials
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Set Up Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **"Run"**
5. Wait for success message

### 4. Enable Realtime
1. Go to **Database** → **Replication**
2. Enable replication for:
   - `messages`
   - `conversations`
   - `presence`
   - `read_receipts`

### 5. Add Environment Variables to Vercel
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Redeploy your project

### 6. Install Dependencies
```bash
npm install
```

## Authentication Setup

Since you're using Firebase Auth, you'll need to:

### Option A: Keep Firebase Auth (Recommended)
- Use Firebase Auth for authentication
- Pass Firebase user ID to Supabase queries
- Adjust RLS policies to work with Firebase UIDs

### Option B: Migrate to Supabase Auth
- More integrated but requires more migration work
- Better long-term if you want to fully move off Firebase

## Next Steps

1. ✅ Supabase project created
2. ✅ Database schema set up
3. ✅ Environment variables added to Vercel
4. ⏭️ Update chat components to use Supabase (I can help with this)
5. ⏭️ Test chat functionality
6. ⏭️ Remove Firebase RTDB code

## Benefits Over RTDB

- ✅ No billing required (free tier)
- ✅ Better queries (SQL)
- ✅ More reliable
- ✅ Better performance
- ✅ Real-time works out of the box
- ✅ Easier to debug

## Need Help?

Once you've set up Supabase, I can help you:
- Update chat components to use Supabase
- Migrate existing data (if any)
- Set up proper RLS policies for your auth system

