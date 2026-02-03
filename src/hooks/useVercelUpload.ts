/**
 * Vercel Blob Upload Hook
 *
 * This hook provides a drop-in replacement for useMediaUpload,
 * using Vercel Blob instead of Supabase Storage.
 *
 * @example
 * import { useVercelUpload } from '@/hooks/useVercelUpload';
 *
 * function MediaUpload() {
 *   const { uploadMedia, uploading, error } = useVercelUpload();
 *
 *   const handleUpload = async (file) => {
 *     const result = await uploadMedia(file, 'post-media');
 *     if (result) {
 *       console.log('Uploaded:', result.url);
 *     }
 *   };
 *
 *   return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
 * }
 */

import { useState } from 'react';
import {
  uploadFile,
  STORAGE_FOLDERS,
  isImageFile,
  isVideoFile,
  validateFileSize,
  type StorageFolder
} from '../config/vercel-blob';

/**
 * Upload result interface
 */
export interface UploadResult {
  url: string;
  previewUrl: string;
  storageRef: string;
  type: string;
  name: string;
  size: number;
  mimeType: string;
  contentType?: string;
  uploadedAt?: Date;
  downloadUrl?: string;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

/**
 * Vercel upload hook return value
 */
export interface UseVercelUploadReturn {
  uploadMedia: (file: File, uploadPath?: string | null, options?: UploadOptions) => Promise<UploadResult | null>;
  uploadMultiple: (files: FileList | File[], uploadPath?: string | null, options?: UploadOptions) => Promise<UploadResult[]>;
  uploading: boolean;
  error: string | null;
  progress: number;
  isUploading: boolean;
  hasError: boolean;
  clearError: () => void;
}

/**
 * Vercel Blob Upload Hook
 *
 * Drop-in replacement for useMediaUpload that uses Vercel Blob instead of Supabase Storage.
 *
 * @param defaultFolder - Default folder for uploads (e.g., 'post-media', 'profile-photos')
 * @returns Upload functions and state
 */
export function useVercelUpload(defaultFolder: StorageFolder = STORAGE_FOLDERS.POST_MEDIA): UseVercelUploadReturn {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  /**
   * Uploads media file to Vercel Blob Storage.
   *
   * @param file - The file to upload
   * @param uploadPath - The folder/path for storage (optional, uses defaultFolder if not provided)
   * @param options - Additional upload options
   * @returns Object containing media URL and metadata
   *
   * @example
   * const result = await uploadMedia(file);
   * console.log(result.url); // https://blob.../post-media/file.jpg
   */
  const uploadMedia = async (
    file: File | null,
    uploadPath: string | null = null,
    options: UploadOptions = {}
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    // Validate file size (default 10MB max)
    const maxSizeMB = options.maxSizeMB || 10;
    if (!validateFileSize(file, maxSizeMB)) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      console.error(errorMsg);
      return null;
    }

    // Validate file type if specified
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      const errorMsg = `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`;
      setError(errorMsg);
      console.error(errorMsg);
      return null;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Determine media type
      let mediaType = 'file';
      if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (file.type.startsWith('image/')) {
        mediaType = 'image';
      }

      // Sanitize filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

      // Add random suffix for uniqueness
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const customFileName = `${timestamp}_${randomSuffix}_${sanitizedName}`;

      // Use provided uploadPath or default to defaultFolder
      const targetFolder = (uploadPath || defaultFolder) as StorageFolder;

      // Upload to Vercel Blob
      setProgress(20); // Uploading started

      const blob = await uploadFile(file, targetFolder, {
        customFileName,
      });

      setProgress(100); // Upload complete

      const result: UploadResult = {
        url: blob.url,
        previewUrl: blob.url, // Same as URL for Vercel Blob
        storageRef: blob.url, // URL as reference
        type: mediaType,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };

      setUploading(false);
      setProgress(0);

      return result;
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'An unknown error occurred during upload.');
      setUploading(false);
      setProgress(0);
      return null;
    }
  };

  /**
   * Upload multiple files
   *
   * @param files - Files to upload
   * @param uploadPath - The folder/path for storage (optional, uses defaultFolder if not provided)
   * @param options - Additional upload options
   * @returns Array of upload results
   *
   * @example
   * const results = await uploadMultiple(fileList);
   * console.log(`Uploaded ${results.length} files`);
   */
  const uploadMultiple = async (
    files: FileList | File[] | null,
    uploadPath: string | null = null,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const fileArray = Array.from(files);
      const results: UploadResult[] = [];
      const totalFiles = fileArray.length;

      const targetFolder = (uploadPath || defaultFolder) as StorageFolder;

      for (let i = 0; i < fileArray.length; i++) {
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
        const result = await uploadMedia(fileArray[i], targetFolder, options);
        if (result) {
          results.push(result);
        }
      }

      setProgress(100);
      setUploading(false);
      return results;
    } catch (err: any) {
      console.error('Batch upload failed:', err);
      setError(err.message || 'Batch upload failed');
      setUploading(false);
      setProgress(0);
      return [];
    }
  };

  return {
    uploadMedia,
    uploadMultiple,
    uploading,
    error,
    progress,

    // Helper methods
    isUploading: uploading,
    hasError: !!error,
    clearError: () => setError(null),
  };
}

/**
 * Image upload hook return value
 */
export interface UseVercelImageUploadReturn {
  uploadImage: (file: File | null, folder?: StorageFolder) => Promise<UploadResult | null>;
  uploading: boolean;
  error: string | null;
  isUploading: boolean;
  hasError: boolean;
}

/**
 * Image-specific upload hook
 *
 * Convenience hook for uploading images with built-in validation.
 *
 * @param options - Upload options
 * @returns Image upload functions and state
 *
 * @example
 * function ProfilePhotoUpload() {
 *   const { uploadImage, uploading, error } = useVercelImageUpload();
 *
 *   const handleUpload = async (file) => {
 *     const result = await uploadImage(file, 'profile-photos');
 *     if (result) {
 *       console.log('Photo uploaded:', result.url);
 *     }
 *   };
 *
 *   return <input type="file" accept="image/*" onChange={...} />;
 * }
 */
export function useVercelImageUpload(options: UploadOptions = {}): UseVercelImageUploadReturn {
  const { uploadMedia, uploading, error } = useVercelUpload();

  /**
   * Upload an image file
   *
   * @param file - Image file to upload
   * @param folder - Storage folder (default: 'profile-photos')
   * @returns Upload result
   */
  const uploadImage = async (
    file: File | null,
    folder: StorageFolder = STORAGE_FOLDERS.PROFILE_PHOTOS
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    // Validate it's an image
    if (!isImageFile(file)) {
      console.error('File is not an image');
      return null;
    }

    // Default image options
    const imageOptions: UploadOptions = {
      maxSizeMB: 5, // 5MB default for images
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      ...options,
    };

    return await uploadMedia(file, folder, imageOptions);
  };

  return {
    uploadImage,
    uploading,
    error,
    isUploading: uploading,
    hasError: !!error,
  };
}

/**
 * Video upload hook return value
 */
export interface UseVercelVideoUploadReturn {
  uploadVideo: (file: File | null, folder?: StorageFolder) => Promise<UploadResult | null>;
  uploading: boolean;
  error: string | null;
  isUploading: boolean;
  hasError: boolean;
}

/**
 * Video-specific upload hook
 *
 * Convenience hook for uploading videos with built-in validation.
 *
 * @param options - Upload options
 * @returns Video upload functions and state
 *
 * @example
 * function VideoUpload() {
 *   const { uploadVideo, uploading, error } = useVercelVideoUpload();
 *
 *   const handleUpload = async (file) => {
 *     const result = await uploadVideo(file, 'post-media');
 *     if (result) {
 *       console.log('Video uploaded:', result.url);
 *     }
 *   };
 *
 *   return <input type="file" accept="video/*" onChange={...} />;
 * }
 */
export function useVercelVideoUpload(options: UploadOptions = {}): UseVercelVideoUploadReturn {
  const { uploadMedia, uploading, error } = useVercelUpload();

  /**
   * Upload a video file
   *
   * @param file - Video file to upload
   * @param folder - Storage folder (default: 'post-media')
   * @returns Upload result
   */
  const uploadVideo = async (
    file: File | null,
    folder: StorageFolder = STORAGE_FOLDERS.POST_MEDIA
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    // Validate it's a video
    if (!isVideoFile(file)) {
      console.error('File is not a video');
      return null;
    }

    // Default video options
    const videoOptions: UploadOptions = {
      maxSizeMB: 50, // 50MB default for videos
      allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
      ...options,
    };

    return await uploadMedia(file, folder, videoOptions);
  };

  return {
    uploadVideo,
    uploading,
    error,
    isUploading: uploading,
    hasError: !!error,
  };
}

/**
 * Document upload hook return value
 */
export interface UseVercelDocumentUploadReturn {
  uploadDocument: (file: File | null, folder?: StorageFolder) => Promise<UploadResult | null>;
  uploading: boolean;
  error: string | null;
  isUploading: boolean;
  hasError: boolean;
}

/**
 * Document-specific upload hook
 *
 * Convenience hook for uploading documents with built-in validation.
 *
 * @param options - Upload options
 * @returns Document upload functions and state
 *
 * @example
 * function DocumentUpload() {
 *   const { uploadDocument, uploading, error } = useVercelDocumentUpload();
 *
 *   const handleUpload = async (file) => {
 *     const result = await uploadDocument(file, 'documents');
 *     if (result) {
 *       console.log('Document uploaded:', result.url);
 *     }
 *   };
 *
 *   return <input type="file" accept=".pdf,.doc,.docx" onChange={...} />;
 * }
 */
export function useVercelDocumentUpload(options: UploadOptions = {}): UseVercelDocumentUploadReturn {
  const { uploadMedia, uploading, error } = useVercelUpload();

  /**
   * Upload a document file
   *
   * @param file - Document file to upload
   * @param folder - Storage folder (default: 'documents')
   * @returns Upload result
   */
  const uploadDocument = async (
    file: File | null,
    folder: StorageFolder = STORAGE_FOLDERS.DOCUMENTS
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    // Default document options
    const documentOptions: UploadOptions = {
      maxSizeMB: 10, // 10MB default for documents
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      ...options,
    };

    return await uploadMedia(file, folder, documentOptions);
  };

  return {
    uploadDocument,
    uploading,
    error,
    isUploading: uploading,
    hasError: !!error,
  };
}

/**
 * Batch upload hook return value
 */
export interface UseVercelBatchUploadReturn {
  uploadBatch: (files: FileList | File[], folder?: StorageFolder, options?: UploadOptions) => Promise<UploadResult[]>;
  uploading: boolean;
  error: string | null;
  progress: number;
  isUploading: boolean;
  hasError: boolean;
}

/**
 * Batch upload hook for multiple files
 *
 * Optimized for uploading multiple files at once.
 *
 * @returns Batch upload functions and state
 *
 * @example
 * function MultiFileUpload() {
 *   const { uploadBatch, uploading, progress } = useVercelBatchUpload();
 *
 *   const handleUpload = async (files) => {
 *     const results = await uploadBatch(files, 'post-media');
 *     console.log(`Uploaded ${results.length} files`);
 *   };
 *
 *   return <input type="file" multiple onChange={...} />;
 * }
 */
export function useVercelBatchUpload(): UseVercelBatchUploadReturn {
  const { uploadMultiple, uploading, error, progress } = useVercelUpload();

  /**
   * Upload multiple files
   *
   * @param files - Files to upload
   * @param folder - Storage folder
   * @param options - Upload options
   * @returns Array of upload results
   */
  const uploadBatch = async (
    files: FileList | File[],
    folder: StorageFolder = STORAGE_FOLDERS.POST_MEDIA,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> => {
    return await uploadMultiple(files, folder, options);
  };

  return {
    uploadBatch,
    uploading,
    error,
    progress,
    isUploading: uploading,
    hasError: !!error,
  };
}

/**
 * Upload with preview hook return value
 */
export interface UseVercelUploadWithPreviewReturn {
  uploadWithPreview: (file: File | null, folder?: StorageFolder) => Promise<UploadResult | null>;
  preview: string | null;
  uploading: boolean;
  error: string | null;
  clearPreview: () => void;
  isUploading: boolean;
  hasError: boolean;
}

/**
 * Hook with upload preview capability
 *
 * Shows preview of images before upload completes.
 *
 * @returns Upload with preview functions and state
 *
 * @example
 * function ImageUploadWithPreview() {
 *   const { uploadWithPreview, preview, uploading } = useVercelUploadWithPreview();
 *
 *   return (
 *     <div>
 *       {preview && <img src={preview} alt="Preview" />}
 *       <input
 *         type="file"
 *         accept="image/*"
 *         onChange={(e) => uploadWithPreview(e.target.files[0])}
 *         disabled={uploading}
 *       />
 *     </div>
 *   );
 * }
 */
export function useVercelUploadWithPreview(): UseVercelUploadWithPreviewReturn {
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadMedia, uploading, error } = useVercelUpload();

  /**
   * Upload file with local preview
   *
   * @param file - File to upload
   * @param folder - Storage folder
   * @returns Upload result
   */
  const uploadWithPreview = async (
    file: File | null,
    folder: StorageFolder = STORAGE_FOLDERS.POST_MEDIA
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    // Create local preview for images
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload the file
    const result = await uploadMedia(file, folder);

    // Update preview with uploaded URL
    if (result) {
      setPreview(result.url);
    }

    return result;
  };

  /**
   * Clear the preview
   */
  const clearPreview = (): void => {
    setPreview(null);
  };

  return {
    uploadWithPreview,
    preview,
    uploading,
    error,
    clearPreview,
    isUploading: uploading,
    hasError: !!error,
  };
}

export default useVercelUpload;
