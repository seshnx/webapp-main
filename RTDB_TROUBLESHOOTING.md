# RTDB Troubleshooting Checklist

## Current Status
✅ Environment variables loaded correctly
✅ App has databaseURL in options
✅ API is enabled in Google Cloud
❌ Still getting "Service database is not available"

## Most Likely Issues (in order)

### 1. Billing Not Enabled ⚠️ **MOST COMMON**
**Realtime Database REQUIRES a billing account to be linked.**

Check: https://console.cloud.google.com/billing?project=seshnx-db

- If no billing account: Link one (Blaze plan required for RTDB)
- If billing is linked: Verify it's active
- Free tier doesn't include RTDB - you need Blaze plan

### 2. Database Not Fully Provisioned
**New databases can take 5-10 minutes to fully activate.**

Check: https://console.firebase.google.com/project/seshnx-db/database

- Database should show as **"Active"** (not "Creating" or "Pending")
- Try accessing the database in Firebase Console
- If you can see the database UI, it's ready
- Wait a few more minutes if it was just created

### 3. API Key Restrictions
**API key might be restricted from accessing RTDB.**

Check: Firebase Console → Project Settings → General → Your apps

- Find your web app
- Check if API key has restrictions
- If restricted, either:
  - Remove restrictions, OR
  - Add "Firebase Realtime Database" to allowed APIs

### 4. Database Region Mismatch
**Database region must match your project region.**

Check: Firebase Console → Realtime Database → Data tab

- Look at the database URL shown
- Should match: `https://seshnx-db-default-rtdb.firebaseio.com`
- If different region, update your config

## Quick Fix Steps

1. **Enable Billing** (if not already):
   - Go to: https://console.cloud.google.com/billing?project=seshnx-db
   - Link a billing account
   - Select Blaze plan (pay-as-you-go, free tier for small usage)

2. **Wait for Provisioning** (if database is new):
   - Wait 5-10 minutes after database creation
   - Verify it shows "Active" in Firebase Console

3. **Verify Database Access**:
   - Go to: https://console.firebase.google.com/project/seshnx-db/database
   - Try to view/create data in the console
   - If you can access it there, it should work in your app

4. **Check API Key**:
   - Firebase Console → Project Settings → General
   - Find your web app's API key
   - Ensure no restrictions blocking RTDB

## After Fixing

1. Hard refresh browser (Ctrl+Shift+R)
2. Check console for: `✅ RTDB initialized successfully`
3. Test chat functionality

## Still Not Working?

If all above are correct, try:
- Creating a new Firebase project
- Using a different browser (to rule out cache)
- Checking Vercel build logs for any warnings

