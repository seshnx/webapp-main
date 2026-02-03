import { useState } from 'react';
import { uploadFile, STORAGE_FOLDERS, type StorageFolder } from '../config/vercel-blob';

/**
 * Image upload hook return value
 */
export interface UseImageUploadReturn {
  uploadImage: (file: File | null, path?: string) => Promise<string | null>;
  uploading: boolean;
  error: string | null;
}

/**
 * Simple image upload hook
 *
 * @returns Image upload function and state
 *
 * @example
 * function ProfilePhoto() {
 *   const { uploadImage, uploading, error } = useImageUpload();
 *
 *   const handleUpload = async (file) => {
 *     const url = await uploadImage(file, 'profile-photos');
 *     if (url) {
 *       console.log('Uploaded:', url);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files[0])} />
 *       {uploading && <div>Uploading...</div>}
 *       {error && <div>Error: {error}</div>}
 *     </div>
 *   );
 * }
 */
export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File | null,
    path: string = STORAGE_FOLDERS.PROFILE_PHOTOS
  ): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    setError(null);

    try {
      // Map path to storage folder
      let storageFolder = path.replace('_', '-') as StorageFolder;

      // Default to profile-photos if path is empty
      if (!storageFolder || (storageFolder as any) === 'undefined') {
        storageFolder = STORAGE_FOLDERS.PROFILE_PHOTOS;
      }

      // Upload to Vercel Blob
      const blob = await uploadFile(file, storageFolder);

      setUploading(false);
      return blob.url;
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setError(err.message || 'Failed to upload image');
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading, error };
}
