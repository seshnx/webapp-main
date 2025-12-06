# How to Enable Realtime Database in Firebase

## The Error You're Seeing

```
RTDB initialization error: Error: Service database is not available
```

This means **Realtime Database is not enabled** in your Firebase project `seshnx-db`.

## Step-by-Step: Enable RTDB

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your project: **seshnx-db**

### 2. Navigate to Realtime Database
- In the left sidebar, click **"Build"** → **"Realtime Database"**
- OR go directly: https://console.firebase.google.com/project/seshnx-db/database

### 3. Create Database
- Click the **"Create Database"** button
- If you see "Get started" or "Create database", click it

### 4. Choose Location
- Select a location (e.g., `us-central1` or closest to your users)
- Click **"Next"**

### 5. Choose Security Rules
- **For Development**: Choose **"Start in test mode"** (allows read/write for 30 days)
- **For Production**: Choose **"Start in production mode"** (requires proper security rules)
- Click **"Enable"**

### 6. Wait for Provisioning
- Firebase will create your database (takes ~30 seconds)
- You'll see the database URL: `https://seshnx-db-default-rtdb.firebaseio.com`

### 7. Verify It's Working
- After enabling, refresh your app
- Check browser console - should see: `✅ RTDB initialized successfully`
- The error should disappear

## Security Rules (Important!)

After enabling, set up security rules:

1. Go to **Realtime Database** → **Rules** tab
2. For development, you can use:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

3. For production, use proper rules based on your data structure

## Verify Your Config

Your `databaseURL` should be:
```
https://seshnx-db-default-rtdb.firebaseio.com
```

This should match what's in your Firebase Console.

## Still Not Working?

1. **Check Firebase Console** - Make sure RTDB shows as "Active"
2. **Check Environment Variables** - Make sure `VITE_FIREBASE_DATABASE_URL` is set in Vercel
3. **Redeploy** - After enabling RTDB, redeploy your Vercel app
4. **Clear Cache** - Hard refresh browser (Ctrl+Shift+R)

## Next Steps After Enabling

Once RTDB is enabled:
- ✅ Chat functionality will work
- ✅ Real-time presence tracking will work
- ✅ Conversation lists will load
- ✅ Messages will sync in real-time

