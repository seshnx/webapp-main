import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file, path) => {
    if (!file) return null;
    
    if (!storage) {
      setError('Firebase Storage is not configured. Please set VITE_FIREBASE_STORAGE_BUCKET in your environment variables.');
      console.error('Firebase Storage is not available. storageBucket is missing from Firebase config.');
      return null;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const uniqueName = `${timestamp}_${file.name}`;
      const fullPath = `${path}/${uniqueName}`;
      const storageRef = ref(storage, fullPath);

      // Upload
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get URL
      const url = await getDownloadURL(snapshot.ref);
      setUploading(false);
      return url;
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err);
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading, error };
};
