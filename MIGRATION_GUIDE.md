# Neon + Convex + Clerk Migration Guide

This guide walks you through migrating from **Supabase + AWS** to **Neon + Convex + Clerk + Vercel Blob**.

## Overview of Architecture Change

### Old Architecture (Supabase + AWS)
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Supabase   │────▶│   DynamoDB   │────▶│    AWS      │
│ (PostgreSQL)│     │  (NoSQL DB)  │     │  Services   │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│ Supabase    │                          │     S3      │
│ Auth        │                          │ (Storage)   │
└─────────────┘                          └─────────────┘
```

### New Architecture (Neon + Convex + Clerk + Vercel)
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    Neon     │────▶│   Convex     │────▶│ Vercel Blob │
│ (PostgreSQL)│     │ (Real-time)  │     │  (Storage)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    ▲
       │                    │
       ▼                    │
┌─────────────┐             │
│   Clerk     │─────────────┘
│  (Auth)     │  (User sync via webhooks)
└─────────────┘
```

## Migration Steps

### Phase 1: Preparation (Day 1)

#### 1.1 Create Accounts
- [ ] **Neon**: https://console.neon.tech/ (Free tier available)
- [ ] **Clerk**: https://dashboard.clerk.com/ (Free tier available)
- [ ] **Convex**: Already set up (expand existing project)
- [ ] **Vercel**: Already using for deployment (Blob is automatic)

#### 1.2 Install Dependencies
```bash
# Install Neon dependencies
npm install @neondatabase/serverless

# Install Vercel Blob
npm install @vercel/blob

# Install Clerk (if not already installed)
npm install @clerk/clerk-react
```

#### 1.3 Backup Existing Data
```bash
# Export Supabase data using pg_dump
pg_dump $SUPABASE_URL > supabase_backup_$(date +%Y%m%d).sql

# Or use Supabase Dashboard to export CSVs
```

---

### Phase 2: Set Up Services (Day 2)

#### 2.1 Create Neon Database

1. Go to https://console.neon.tech/
2. Click "Create a project"
3. Choose region (closest to your users)
4. Select PostgreSQL version (latest)
5. Copy the connection string

6. Run the unified schema in Neon SQL Editor:
   - Open Neon Console → SQL Editor
   - Copy contents of `sql/neon_unified_schema.sql`
   - Paste and execute

#### 2.2 Set Up Clerk Authentication

1. Go to https://dashboard.clerk.com/
2. Create a new application
3. Configure:
   - **Allowed redirect URLs**: `http://localhost:5173` (dev), your production URL
   - **JWT Template**: Create a template to include user metadata
   - **Webhooks**: Add endpoint URL (see Phase 4)

4. Copy API keys from Dashboard → API Keys

#### 2.3 Update Environment Variables

```bash
# Copy the template
cp .env.neon.template .env.local

# Edit .env.local and add your credentials
```

Required variables:
```env
VITE_NEON_DATABASE_URL=postgresql://...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_SECRET_KEY=sk_test_...
VITE_CONVEX_URL=https://...
BLOB_READ_WRITE_TOKEN=... # (automatic on Vercel)
```

#### 2.4 Update Convex Schema

```bash
# Replace the Convex schema
cp convex/schema-expanded.ts convex/schema.ts

# Deploy updated schema
npx convex dev
```

---

### Phase 3: Migrate Data (Day 3)

#### 3.1 Run Migration Script

Use the provided migration script to migrate data from Supabase to Neon:

```bash
# Create migration script
node scripts/migrate-to-neon.js
```

The script will:
1. Connect to both Supabase and Neon
2. Migrate users (from auth.users → clerk_users)
3. Migrate profiles
4. Migrate posts, comments, reactions
5. Migrate bookings
6. Migrate marketplace items
7. Verify data integrity

#### 3.2 Verify Migration

```sql
-- In Neon SQL Editor, run:

-- Check user count
SELECT COUNT(*) FROM clerk_users;

-- Check posts
SELECT COUNT(*) FROM posts;

-- Check profiles
SELECT COUNT(*) FROM profiles;
```

---

### Phase 4: Integrate Clerk Authentication (Day 4)

#### 4.1 Update App Component

```jsx
// src/main.jsx
import { ClerkProvider } from '@clerk/clerk-react';
import { clerkConfig } from '@/config/clerk';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider {...clerkConfig}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

#### 4.2 Set Up Clerk Webhooks

Create a webhook handler (Vercel Edge Function or API route):

```javascript
// api/webhooks/clerk.js (example)
export default async function handler(req, res) {
  const evt = req.body;

  switch (evt.type) {
    case 'user.created':
      // Sync user to Neon clerk_users table
      await syncUserToNeon(evt.data);
      break;
    case 'user.updated':
      // Update user in Neon
      await updateUserInNeon(evt.data);
      break;
    case 'user.deleted':
      // Soft delete user
      await deleteUserFromNeon(evt.data.id);
      break;
  }

  res.status(200).json({ received: true });
}
```

Add webhook URL in Clerk Dashboard:
1. Go to Dashboard → Webhooks
2. Add: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`

---

### Phase 5: Update File Uploads (Day 5)

#### 5.1 Replace S3 Uploads with Vercel Blob

Old code (Supabase Storage):
```javascript
import { uploadToSupabase } from '@/config/supabase';

const { data, error } = await uploadToSupabase(file, 'profile-photos');
```

New code (Vercel Blob):
```javascript
import { uploadFile } from '@/config/vercel-blob';

const blob = await uploadFile(file, 'profile-photos');
```

#### 5.2 Update All Upload Components

Check and update these components:
- `ProfilePhotoUpload.jsx`
- `CreatePostWidget.jsx`
- `StudioImageUpload.jsx`
- `GearImageUpload.jsx`

---

### Phase 6: Update Database Queries (Day 6)

#### 6.1 Replace Supabase Queries

Old code:
```javascript
import { supabase } from '@/config/supabase';

const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false });
```

New code:
```javascript
import { executeQuery } from '@/config/neon';

const posts = await executeQuery('getPosts', [50]);
```

#### 6.2 Update Real-time Subscriptions

Old code (Supabase):
```javascript
import { useEffect } from 'react';
import { supabase } from '@/config/supabase';

useEffect(() => {
  const subscription = supabase
    .channel('posts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'posts'
    }, (payload) => {
      // Handle new post
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

New code (Convex):
```javascript
import { useQuery } from 'convex/react';

// Automatically updates in real-time!
const posts = useQuery(api.posts.listRecent);
```

---

### Phase 7: Testing (Day 7)

#### 7.1 Test Authentication

- [ ] Sign up with email
- [ ] Sign in with Google OAuth
- [ ] Sign out
- [ ] Access protected routes

#### 7.2 Test Database Operations

- [ ] Create a post
- [ ] Comment on a post
- [ ] React to a post
- [ ] Create a booking
- [ ] List marketplace items

#### 7.3 Test Real-time Features

- [ ] Open two browser windows
- [ ] Create a post in one window
- [ ] Verify it appears in the other window instantly
- [ ] Test typing indicators
- [ ] Test presence (online status)

#### 7.4 Test File Uploads

- [ ] Upload profile photo
- [ ] Upload post media (image/video)
- [ ] Verify files are accessible via CDN
- [ ] Delete uploaded files

---

### Phase 8: Deployment (Day 8)

#### 8.1 Deploy to Production

1. **Update Vercel Environment Variables**:
   ```
   VITE_NEON_DATABASE_URL=...
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   VITE_CLERK_SECRET_KEY=sk_live_...
   ```

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Migrate to Neon + Clerk + Convex"
   git push origin main
   ```

3. **Run Convex deployment**:
   ```bash
   npx convex deploy --yes
   ```

4. **Verify production**:
   - Check all features work
   - Monitor error logs
   - Test authentication flow

#### 8.2 Monitor Post-Deployment

Check these dashboards:
- Neon: https://console.neon.tech/ (database metrics)
- Clerk: https://dashboard.clerk.com/ (auth metrics)
- Convex: https://dashboard.convex.dev/ (real-time metrics)
- Vercel: https://vercel.com/dashboard (deployment logs)

---

## Rollback Plan

If issues arise, you can roll back:

```bash
# Revert to previous commit
git revert HEAD

# Restore Supabase environment variables
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Redeploy
git push origin main
```

---

## Cost Comparison

| Service | Old (Supabase + AWS) | New (Neon + Convex + Clerk) |
|---------|---------------------|----------------------------|
| Database | Supabase Pro (~$25/mo) | Neon Scale (~$19/mo) |
| Auth | Supabase (included) | Clerk Pro (~$25/mo) |
| Real-time | Supabase (included) | Convex Pro (~$25/mo) |
| Storage | AWS S3 (~$5/mo) | Vercel Blob (~$0.15/GB) |
| **Total** | **~$30/mo** | **~$70/mo** |

**Note**: New architecture is more expensive but offers:
- Better real-time performance (Convex)
- More auth features (Clerk)
- Simpler infrastructure (single database)
- Better developer experience

---

## Troubleshooting

### Issue: Neon connection fails
**Solution**: Check connection string format. Use `sslmode=require` parameter.

### Issue: Clerk webhooks not working
**Solution**: Verify webhook URL is accessible and Clerk secret is set correctly.

### Issue: Convex sync not working
**Solution**: Ensure Convex functions are deployed: `npx convex dev` or `npx convex deploy`.

### Issue: Vercel Blob uploads fail locally
**Solution**: Run `vercel link` and `vercel env pull .env.local` to get Blob token.

---

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)

---

## Questions?

If you encounter issues during migration:
1. Check service-specific documentation
2. Review error logs in each dashboard
3. Test with sample data before full migration
4. Keep backups until migration is verified
