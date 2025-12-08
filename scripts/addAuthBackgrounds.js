/**
 * Helper script to add auth background images to Firestore
 * 
 * Usage: 
 * 1. Convert gs:// URLs to download URLs
 * 2. Add them to Firestore collection: artifacts/{appId}/auth_backgrounds
 * 
 * Run this in browser console or as a Node script
 */

// Your Firebase Storage URLs (gs:// format)
const gsUrls = [
  'gs://seshnx-db.firebasestorage.app/1502797.jpg',
  'gs://seshnx-db.firebasestorage.app/2682798.jpg',
  'gs://seshnx-db.firebasestorage.app/2682820.jpg',
  'gs://seshnx-db.firebasestorage.app/2682821.png',
  'gs://seshnx-db.firebasestorage.app/2682836.jpg',
  'gs://seshnx-db.firebasestorage.app/2682944.jpg',
  'gs://seshnx-db.firebasestorage.app/635740.jpg',
];

// Convert gs:// URL to Firebase Storage download URL
function gsToDownloadUrl(gsUrl) {
  // Format: gs://bucket-name/path/to/file.jpg
  // Convert to: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path%2Fto%2Ffile.jpg?alt=media
  const match = gsUrl.match(/gs:\/\/([^\/]+)\/(.+)/);
  if (!match) return null;
  
  const bucket = match[1];
  const path = match[2];
  const encodedPath = encodeURIComponent(path);
  
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
}

// Convert all URLs
const downloadUrls = gsUrls.map((url, index) => ({
  url: gsToDownloadUrl(url),
  order: index,
  originalGs: url
}));

console.log('Converted URLs:', downloadUrls);

// If running in browser with Firebase initialized:
// Uncomment and run this code in browser console after importing Firebase

/*
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

async function addBackgroundImages() {
  for (const image of downloadUrls) {
    try {
      await addDoc(collection(db, `artifacts/${appId}/auth_backgrounds`), {
        url: image.url,
        order: image.order
      });
      console.log(`Added: ${image.originalGs}`);
    } catch (error) {
      console.error(`Failed to add ${image.originalGs}:`, error);
    }
  }
  console.log('All images added!');
}

addBackgroundImages();
*/

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.addAuthBackgrounds = async function() {
    const { collection, addDoc } = await import('firebase/firestore');
    const { db, appId } = await import('../config/firebase');
    
    for (const image of downloadUrls) {
      try {
        await addDoc(collection(db, `artifacts/${appId}/auth_backgrounds`), {
          url: image.url,
          order: image.order
        });
        console.log(`✅ Added: ${image.originalGs}`);
      } catch (error) {
        console.error(`❌ Failed to add ${image.originalGs}:`, error);
      }
    }
    console.log('🎉 All images added!');
  };
}

