# Migration from Firebase RTDB to Supabase

## Why Supabase?
- ✅ Postgres database (more powerful than RTDB)
- ✅ Real-time subscriptions (similar to Firebase)
- ✅ Free tier: 500MB database, 2GB bandwidth, 50K monthly active users
- ✅ Built-in Auth (can keep Firebase Auth or migrate)
- ✅ Storage included
- ✅ Easy Vercel integration
- ✅ Similar API to Firebase

## Setup Steps

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Name: `seshnx-db` (or your choice)
   - Database Password: (save this!)
   - Region: Choose closest to users
5. Wait ~2 minutes for provisioning

### 2. Get Your Credentials
In Supabase Dashboard:
- Go to Settings → API
- Copy:
  - `Project URL` (e.g., `https://xxxxx.supabase.co`)
  - `anon/public key` (for client-side)
  - `service_role key` (for server-side - keep secret!)

### 3. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 4. Add Environment Variables to Vercel
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Database Schema

We'll create tables for:
- `messages` - Chat messages
- `conversations` - User conversation lists
- `presence` - Online/offline status
- `read_receipts` - Message read status

## Migration Benefits

- No billing required (free tier)
- Better queries (SQL)
- More reliable than RTDB
- Better performance
- Real-time works out of the box

