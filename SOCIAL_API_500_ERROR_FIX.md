# Fix Social API 500 Errors

## Issue
The social feed API is returning 500 errors: "FUNCTION_INVOCATION_FAILED"

## Root Cause
1. The API routes had a `require()` call which doesn't work with ES modules
2. MongoDB environment variable names may be inconsistent between client and server

## What Was Fixed
1. ✅ Removed `require()` calls from api/social/posts/index.ts
2. ✅ Improved error handling to show MongoDB connection status
3. ✅ Added proper MongoDB initialization promise handling

## Required Fix for MongoDB Connection

The MongoDB configuration needs to properly handle environment variables:

**Server-side (API routes):** `MONGODB_URI` or `MONGO_URL`
**Client-side (browser):** `VITE_MONGODB_CONNECTION_STRING`

## Environment Variables to Set in Vercel

Go to: Vercel Dashboard → Project Settings → Environment Variables

Add these:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=seshnx
```

**IMPORTANT:** Use the SAME connection string for both `MONGODB_URI` and `VITE_MONGODB_CONNECTION_STRING`

## Testing the Fix

After setting environment variables:

1. Redeploy the app
2. Check browser console for MongoDB connection messages
3. Look for "✅ MongoDB connected successfully" in Vercel logs
4. Test social feed: /api/social/posts?limit=20

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
   Database: seshnx
✅ MongoDB connection verified
✅ MongoDB initialized for posts API
```

If you see:
```
❌ MongoDB connection string not found. Checking env vars...
```

Then `MONGODB_URI` is not set in Vercel environment variables.
