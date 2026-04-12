import { useUpload, type UploadResult } from "./useUpload";
import { STORAGE_FOLDERS, type StorageFolder } from "../config/storage";

/**
 * Image upload hook return value
 */
export interface UseImageUploadReturn {
  uploadImage: (file: File | null, path?: string) => Promise<string | null>;
  uploading: boolean;
  error: string | null;
}

/**
 * Simple image upload hook using Cloudflare R2 via presigned URLs.
 *
 * Thin wrapper around useUpload that preserves the same return interface
 for existing consumers.
 */
export function useImageUpload(): UseImageUploadReturn {
  const { uploadMedia, uploading, error } = useUpload();

  const uploadImage = async (
    file: File | null,
    path: string = STORAGE_FOLDERS.PROFILE_PHOTOS
  ): Promise<string | null> => {
    if (!file) return null;

    // Normalize folder name
    let storageFolder = path.replace("_", "-") as StorageFolder;
    if (!storageFolder) {
      storageFolder = STORAGE_FOLDERS.PROFILE_PHOTOS;
    }

    // Delegate to core upload hook
    const result = await uploadMedia(file, storageFolder);

    return result?.url ?? null;
  };

  return { uploadImage, uploading, error };
}
