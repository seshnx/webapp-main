# Fix Social API 500 Errors

## Issue
The social feed API is returning 500 errors: "FUNCTION_INVOCATION_FAILED"

## Root Cause
Vercel serverless functions written in TypeScript (.ts files) with ES module imports are not compiled properly in the api/ directory, causing module resolution errors:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/src/config/mongodb'
```

## What Was Fixed
1. ✅ Converted ALL social API endpoints from TypeScript (.ts) to JavaScript (.js) with CommonJS syntax
2. ✅ Updated import statements from ES modules to CommonJS `require()`
3. ✅ Added proper MongoDB initialization promise handling to prevent race conditions
4. ✅ Added database availability checks (503 Service Unavailable if MongoDB not connected)

### Files Converted:
- `api/social/posts/index.ts` → `index.js`
- `api/social/comments/index.ts` → `index.js`
- `api/social/reactions/index.ts` → `index.js`
- `api/social/follows/index.ts` → `index.js`
- `api/social/saved/index.ts` → `index.js`
- `api/social/health.ts` → `health.js`

### Pattern Applied:
```javascript
// BEFORE (TypeScript with ES modules - BROKEN):
import { initMongoDB } from '../../../src/config/mongodb';

// AFTER (JavaScript with CommonJS - WORKING):
const { initMongoDB, isMongoDbAvailable } = require('../../../src/config/mongodb');
```

## Required Fix for MongoDB Connection

The MongoDB configuration needs to properly handle environment variables:

**Server-side (API routes):** `MONGODB_URI` and `MONGODB_DB_NAME`
**Client-side (browser):** `VITE_MONGODB_CONNECTION_STRING` and `VITE_MONGODB_DB_NAME`

## Environment Variables to Set in Vercel

Go to: Vercel Dashboard → Project Settings → Environment Variables

Add these:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=sesh-nx
```

**IMPORTANT:** Use the SAME connection string for both `MONGODB_URI` and `VITE_MONGODB_CONNECTION_STRING`

## Testing the Fix

After setting environment variables:

1. Redeploy the app
2. Check browser console for MongoDB connection messages
3. Look for "✅ MongoDB connected successfully" in Vercel logs
4. Test all social API endpoints:
   - GET /api/social/posts?limit=20
   - GET /api/social/comments?post_id=xxx
   - GET /api/social/reactions?target_id=xxx&target_type=post
   - GET /api/social/follows?user_id=xxx&type=followers
   - GET /api/social/saved?user_id=xxx
   - GET /api/social/health

## Debug Mode

Enable debug mode to see detailed logs:
```javascript
// In browser console
localStorage.setItem('DEBUG_SOCIAL', 'true')
location.reload()
```

Then check:
```javascript
// View debug stats
window.SocialDebug.printSummary()
```

## Expected Behavior After Fix

**Before:**
```
GET /api/social/posts?limit=20 500 (Internal Server Error)
FUNCTION_INVOCATION_FAILED
```

**After:**
```
GET /api/social/posts?limit=20 200 OK
{
  "success": true,
  "posts": [...]
}
```

## MongoDB Connection Debug Logs

You should see these in Vercel logs when it works:
```
🔄 Connecting to MongoDB...
✅ MongoDB connected successfully
   Database: sesh-nx
✅ MongoDB connection verified
✅ MongoDB initialized for posts API
```

If you see:
```
❌ MongoDB connection string not found. Checking env vars...
```

Then `MONGODB_URI` is not set in Vercel environment variables.
