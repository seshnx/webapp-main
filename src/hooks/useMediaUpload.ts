import { useState } from 'react';
import { uploadFile, STORAGE_FOLDERS, type StorageFolder } from '../config/vercel-blob';

/**
 * Media upload result interface
 */
export interface MediaUploadResult {
  url: string;
  previewUrl: string;
  storageRef: string;
  type: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Media upload hook return value
 */
export interface UseMediaUploadReturn {
  uploadMedia: (file: File | null, folder?: string) => Promise<MediaUploadResult | null>;
  uploading: boolean;
  error: string | null;
}

/**
 * Media upload hook for Vercel Blob Storage
 *
 * @returns Media upload function and state
 *
 * @example
 * function MediaUpload() {
 *   const { uploadMedia, uploading, error } = useMediaUpload();
 *
 *   const handleUpload = async (file) => {
 *     const result = await uploadMedia(file, 'post-media');
 *     if (result) {
 *       console.log('Uploaded:', result.url);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
 *       {uploading && <div>Uploading...</div>}
 *       {error && <div>Error: {error}</div>}
 *     </div>
 *   );
 * }
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Uploads media file to Vercel Blob Storage.
   *
   * @param file - The file to upload
   * @param folder - The folder within storage (e.g., 'post-media', 'profile-photos', 'chat')
   * @returns Object containing media URL/reference and type
   */
  const uploadMedia = async (
    file: File | null,
    folder: string = STORAGE_FOLDERS.POST_MEDIA
  ): Promise<MediaUploadResult | null> => {
    if (!file) return null;

    setUploading(true);
    setError(null);

    try {
      // Map folder names to Vercel Blob storage folders
      let storageFolder = folder.replace('_', '-') as StorageFolder;
      if (!storageFolder.startsWith('profile-') && !storageFolder.startsWith('post-')) {
        // Default to post-media if not a recognized folder
        storageFolder = STORAGE_FOLDERS.POST_MEDIA;
      }

      // Upload to Vercel Blob
      const blob = await uploadFile(file, storageFolder);

      // Determine media type
      let mediaType = 'file';
      if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (file.type.startsWith('image/')) {
        mediaType = 'image';
      }

      setUploading(false);

      // Return object compatible with existing code that uses this hook
      const result: MediaUploadResult = {
        url: blob.url,
        previewUrl: blob.url, // For Vercel Blob, same as main URL
        storageRef: blob.url, // URL as storage reference
        type: mediaType,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };

      return result;
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || 'An unknown error occurred during upload.');
      setUploading(false);
      return null;
    }
  };

  return { uploadMedia, uploading, error };
}
