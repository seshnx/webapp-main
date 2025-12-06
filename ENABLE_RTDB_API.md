# Enable Realtime Database API in Google Cloud

## The Problem

Even though RTDB is created in Firebase Console, you're getting:
```
❌ RTDB initialization failed: Service database is not available
```

This means the **Realtime Database API is not enabled** in Google Cloud Console.

## Solution: Enable the API

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/library/firebasedatabase.googleapis.com?project=seshnx-db

OR manually:
1. Go to: https://console.cloud.google.com/
2. Select project: **seshnx-db**
3. Go to **APIs & Services** → **Library**
4. Search for: **"Firebase Realtime Database API"**

### Step 2: Enable the API
1. Click on **"Firebase Realtime Database API"**
2. Click the **"Enable"** button
3. Wait ~30 seconds for it to activate

### Step 3: Verify
1. You should see "API enabled" status
2. Refresh your app
3. Check console - should see `✅ RTDB initialized successfully`

## Alternative: Direct Link

Click this link (replace `seshnx-db` with your project ID if different):
https://console.cloud.google.com/apis/library/firebasedatabase.googleapis.com?project=seshnx-db

Then click **"Enable"**.

## Why This Happens

Firebase Console creates the database, but Google Cloud requires the API to be explicitly enabled for the service to be accessible via the SDK.

## After Enabling

1. Wait 30-60 seconds for API to activate
2. Hard refresh browser (Ctrl+Shift+R)
3. Check console logs
4. RTDB should now initialize successfully

