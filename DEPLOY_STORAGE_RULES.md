# Deploy Firebase Storage Rules

## Quick Fix for Image Access

The storage rules need to be deployed to allow public read access to the auth background images.

## Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **seshnx-db**
3. Click **Storage** in the left sidebar
4. Click the **Rules** tab
5. Copy the ENTIRE contents of `storage.rules` file
6. Paste into the rules editor
7. Click **Publish** button

## Method 2: Firebase CLI

```bash
firebase deploy --only storage
```

## What the Rules Do

The updated rules allow:
- **Public read access** to image files (jpg, jpeg, png, webp) at the root level
- This allows your auth background images (1502797.jpg, 2682798.jpg, etc.) to be accessed
- Only authenticated users can write/upload new images

## Rule Structure

```javascript
// Auth Background Images (Root level - Public read)
match /{imageFileName} {
  allow read: if imageFileName.matches('.*\\.(jpg|jpeg|png|webp)$');
  allow write: if request.auth != null;
}
```

This matches files at the root of your storage bucket that end with image extensions.

## Verify

After deploying:
1. Wait 10-30 seconds for rules to propagate
2. Try accessing one of your image URLs directly:
   - `https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/1502797.jpg?alt=media`
3. If the image loads, the rules are working!

## Troubleshooting

If images still don't load:
1. **Check file extensions**: Make sure files end with .jpg, .jpeg, .png, or .webp
2. **Check file location**: Images should be at the root of the bucket, not in subfolders
3. **Wait for propagation**: Rules can take up to 1 minute to propagate
4. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)

