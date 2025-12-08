# Quick Guide: Add Auth Background Images

## Your Images
You have 7 images ready to add:
- 1502797.jpg
- 2682798.jpg
- 2682820.jpg
- 2682821.png
- 2682836.jpg
- 2682944.jpg
- 635740.jpg

## Method 1: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `seshnx-db`
3. Go to **Firestore Database**
4. Navigate to: `artifacts` → `seshnx-db` → `auth_backgrounds` (subcollection)
5. For each image, click **Add document** and add:
   - `url`: Use the converted URL below
   - `order`: 0, 1, 2, 3, 4, 5, 6 (respectively)

### Converted Download URLs:

```
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/1502797.jpg?alt=media
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682798.jpg?alt=media
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682820.jpg?alt=media
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682821.png?alt=media
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682836.jpg?alt=media
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682944.jpg?alt=media
https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/635740.jpg?alt=media
```

## Method 2: Browser Console (Automated)

1. Open your app in browser
2. Open Developer Console (F12)
3. Copy and paste this code:

```javascript
const images = [
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/1502797.jpg?alt=media', order: 0 },
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682798.jpg?alt=media', order: 1 },
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682820.jpg?alt=media', order: 2 },
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682821.png?alt=media', order: 3 },
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682836.jpg?alt=media', order: 4 },
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/2682944.jpg?alt=media', order: 5 },
  { url: 'https://firebasestorage.googleapis.com/v0/b/seshnx-db.firebasestorage.app/o/635740.jpg?alt=media', order: 6 },
];

// Import Firebase (adjust path if needed)
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from './config/firebase';

// Add all images
for (const image of images) {
  try {
    await addDoc(collection(db, `artifacts/${appId}/auth_backgrounds`), image);
    console.log(`✅ Added image ${image.order}`);
  } catch (error) {
    console.error(`❌ Error adding image ${image.order}:`, error);
  }
}

console.log('🎉 All images added!');
```

## Method 3: Using Firebase Storage getDownloadURL (Recommended)

If you have the file references in Firebase Storage, use this:

```javascript
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db, appId } from './config/firebase';

const fileNames = [
  '1502797.jpg',
  '2682798.jpg',
  '2682820.jpg',
  '2682821.png',
  '2682836.jpg',
  '2682944.jpg',
  '635740.jpg',
];

async function addImages() {
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    const storageRef = ref(storage, fileName);
    
    try {
      const downloadURL = await getDownloadURL(storageRef);
      await addDoc(collection(db, `artifacts/${appId}/auth_backgrounds`), {
        url: downloadURL,
        order: i
      });
      console.log(`✅ Added ${fileName}`);
    } catch (error) {
      console.error(`❌ Error with ${fileName}:`, error);
    }
  }
  console.log('🎉 All done!');
}

addImages();
```

## Verify

After adding, refresh your auth page and the images should appear in the background with the pan/zoom animation!

