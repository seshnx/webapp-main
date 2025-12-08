# Auth Wizard Background Images Setup

## Overview
The AuthWizard component now features an animated background with images fetched from Firestore. Images slowly move, zoom in, and have a blur vignette effect.

## Firestore Collection Structure

Create a collection at: `artifacts/{appId}/config/auth_backgrounds`

### Document Structure
Each document should have:
- `url` (string): The full URL to the image (can be from Firebase Storage, Cloudinary, Unsplash, etc.)
- `order` (number): Display order (0, 1, 2, etc.)

### Example Document
```json
{
  "url": "https://firebasestorage.googleapis.com/v0/b/your-app.appspot.com/o/auth_bg%2Fimage1.jpg?alt=media",
  "order": 0
}
```

## Adding Images via Firebase Console

1. Go to Firestore Database in Firebase Console
2. Navigate to: `artifacts` → `{your-app-id}` → `config` → `auth_backgrounds`
3. Click "Add document"
4. Add fields:
   - `url` (string): Image URL
   - `order` (number): Display order
5. Repeat for multiple images

## Adding Images via Code

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from './config/firebase';

// Upload image to Firebase Storage first, then:
await addDoc(collection(db, `artifacts/${appId}/config/auth_backgrounds`), {
  url: 'https://your-image-url.com/image.jpg',
  order: 0
});
```

## Recommended Image Specifications

- **Resolution**: 1920x1080 or higher
- **Format**: JPG or PNG
- **File Size**: Optimize to < 500KB for faster loading
- **Aspect Ratio**: 16:9 recommended

## Firestore Security Rules

Add this rule to allow reading background images:

```javascript
match /artifacts/{appId}/config/auth_backgrounds/{document=**} {
  allow read: if true; // Public read access
  allow write: if request.auth != null && 
    request.auth.token.admin == true; // Admin only write
}
```

## Fallback Behavior

If no images are found in Firestore, the component will use placeholder images from Unsplash. The background will still animate properly.

