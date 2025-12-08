# Deploy Firestore Security Rules

## Quick Fix for 403 Forbidden Error

The security rules are correct in the code, but they need to be deployed to Firebase.

## Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **seshnx-db**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab
5. Copy the ENTIRE contents of `firestore.rules` file
6. Paste into the rules editor
7. Click **Publish** button

## Method 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Make sure you're in the project root
firebase deploy --only firestore:rules
```

## Method 3: Manual Rule Addition

If you just want to add the auth_backgrounds rule manually:

1. Go to Firebase Console → Firestore → Rules
2. Find the section with other `artifacts/{appId}/...` rules
3. Add this rule BEFORE the closing brace:

```javascript
// 8. Auth Background Images (Public read for login page)
match /artifacts/{appId}/auth_backgrounds/{document=**} {
  allow read: if true; // Public read - needed for login/auth page
  allow write: if request.auth != null; // Only authenticated users can write
}
```

## Verify Deployment

After deploying:
1. Wait 10-30 seconds for rules to propagate
2. Refresh your app
3. The 403 error should be gone
4. Background images should load from Firestore

## Current Rule Location

The rule should be at line 45-49 in `firestore.rules`:

```javascript
// 8. Auth Background Images (Public read for login page)
match /artifacts/{appId}/auth_backgrounds/{document=**} {
  allow read: if true; // Public read - needed for login/auth page
  allow write: if isAuthenticated(); // Only authenticated users can write
}
```

## Troubleshooting

If you still get 403 after deploying:

1. **Check rule syntax**: Make sure there are no syntax errors (Firebase Console will show errors)
2. **Wait for propagation**: Rules can take up to 1 minute to propagate
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check collection path**: Verify the collection exists at `artifacts/seshnx-db/auth_backgrounds`

## Test the Rule

You can test if the rule works by trying to read the collection in Firebase Console:
1. Go to Firestore Database → Data tab
2. Navigate to: `artifacts` → `seshnx-db` → `auth_backgrounds`
3. If you can see it (even if empty), the rule is working

