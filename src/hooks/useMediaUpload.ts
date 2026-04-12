import { useUpload, type UploadResult } from "./useUpload";
import { STORAGE_FOLDERS, type StorageFolder } from "../config/storage";

/**
 * Media upload result interface — kept for backward compatibility.
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
 * Media upload hook for Cloudflare R2 via presigned URLs.
 *
 * Thin wrapper around useUpload that preserves the same interface for existing consumers.
 * Fixes the original bug where `generateUploadUrlMutation` was used instead of `generateUploadUrlAction`.
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const { uploadMedia: coreUpload, uploading, error } = useUpload();

  const uploadMedia = async (
    file: File | null,
    folder: string = STORAGE_FOLDERS.POST_MEDIA
  ): Promise<MediaUploadResult | null> => {
    if (!file) return null;

    // Normalize folder name
    let storageFolder = folder.replace("_", "-") as StorageFolder;
    if (
      !storageFolder.startsWith("profile-") &&
      !storageFolder.startsWith("post-") &&
      !storageFolder.startsWith("studio-") &&
      !storageFolder.startsWith("gear-") &&
      !storageFolder.startsWith("doc") &&
      !storageFolder.startsWith("attach")
    ) {
      storageFolder = STORAGE_FOLDERS.POST_MEDIA;
    }

    // Delegate to core upload hook
    const result = await coreUpload(file, storageFolder);

    if (!result) return null;

    // Map UploadResult → MediaUploadResult (same shape, explicit cast for clarity)
    return result as MediaUploadResult;
  };

  return { uploadMedia, uploading, error };
}
