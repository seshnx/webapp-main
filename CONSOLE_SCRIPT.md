# Quick Console Script to Add Background Images

Copy and paste this into your browser console (F12) while on your app:

```javascript
// Convert gs:// URLs to download URLs and add to Firestore
const gsUrls = [
  'gs://seshnx-db.firebasestorage.app/1502797.jpg',
  'gs://seshnx-db.firebasestorage.app/2682798.jpg',
  'gs://seshnx-db.firebasestorage.app/2682820.jpg',
  'gs://seshnx-db.firebasestorage.app/2682821.png',
  'gs://seshnx-db.firebasestorage.app/2682836.jpg',
  'gs://seshnx-db.firebasestorage.app/2682944.jpg',
  'gs://seshnx-db.firebasestorage.app/635740.jpg',
];

// Convert gs:// to download URL
function gsToDownloadUrl(gsUrl) {
  const match = gsUrl.match(/gs:\/\/([^\/]+)\/(.+)/);
  if (!match) return null;
  const bucket = match[1];
  const path = match[2];
  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
}

// Import Firebase functions (adjust import path if needed)
const { collection, addDoc } = await import('/src/config/firebase.js');
const { db, appId } = await import('/src/config/firebase.js');

// Add all images
for (let i = 0; i < gsUrls.length; i++) {
  const downloadUrl = gsToDownloadUrl(gsUrls[i]);
  if (downloadUrl) {
    try {
      await addDoc(collection(db, `artifacts/${appId}/auth_backgrounds`), {
        url: downloadUrl,
        order: i
      });
      console.log(`✅ Added image ${i + 1}: ${gsUrls[i]}`);
    } catch (error) {
      console.error(`❌ Error adding ${gsUrls[i]}:`, error);
    }
  }
}

console.log('🎉 All images added! Refresh the auth page to see them.');
```

## Alternative: Direct URLs (If imports don't work)

If the imports don't work in console, use these direct URLs in Firebase Console:

1. Go to Firestore → `artifacts` → `seshnx-db` → `auth_backgrounds`
2. Add documents with these URLs:

```
Order 0: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/1502797.jpg?alt=media
Order 1: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682798.jpg?alt=media
Order 2: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682820.jpg?alt=media
Order 3: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682821.png?alt=media
Order 4: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682836.jpg?alt=media
Order 5: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682944.jpg?alt=media
Order 6: https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/635740.jpg?alt=media
```

