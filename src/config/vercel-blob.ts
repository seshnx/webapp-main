/**
 * Vercel Blob Storage Configuration
 *
 * This module configures Vercel Blob for file storage, replacing AWS S3.
 * Vercel Blob is a simple, fast object storage service optimized for Vercel deployments.
 *
 * Environment Variables Required:
 * - BLOB_READ_WRITE_TOKEN: Vercel Blob token (automatically set in Vercel deployments)
 *
 * Vercel Dashboard: https://vercel.com/dashboard
 * Documentation: https://vercel.com/docs/storage/vercel-blob
 *
 * @example
 * import { uploadFile, deleteFile, getFileUrl } from '@/config/vercel-blob';
 *
 * // Upload a file
 * const blob = await uploadFile(file, 'profile-photos');
 *
 * // Delete a file
 * await deleteFile(blob.url);
 *
 * // Get public URL
 * const url = getFileUrl(blob);
 */

import { put, del } from '@vercel/blob';

// =====================================================
// BLOB STORAGE CONFIGURATION
// =====================================================

/**
 * Vercel Blob Token
 *
 * In Vercel deployments, this is automatically set.
 * For local development, you need to set VITE_BLOB_READ_WRITE_TOKEN in .env.local
 */
const blobToken = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;

if (!blobToken && import.meta.env.DEV) {
  console.warn(
    '⚠️ Vercel Blob: VITE_BLOB_READ_WRITE_TOKEN is not set. ' +
    'File uploads will not work in development. ' +
    'Install Vercel CLI and run: vercel link'
  );
}

/**
 * Check if Vercel Blob is properly configured
 *
 * @returns True if Blob token is present
 */
export function isBlobConfigured(): boolean {
  return !!blobToken;
}

// =====================================================
// STORAGE FOLDERS (Virtual Paths)
// =====================================================

/**
 * Storage folders for organizing files
 * These are used as prefixes in blob URLs
 */
export const STORAGE_FOLDERS = {
  PROFILE_PHOTOS: 'profile-photos',
  POST_MEDIA: 'post-media',
  DOCUMENTS: 'documents',
  STUDIO_IMAGES: 'studio-images',
  GEAR_IMAGES: 'gear-images',
  ATTACHMENTS: 'attachments',
} as const;

/**
 * Storage folder type
 */
export type StorageFolder = typeof STORAGE_FOLDERS[keyof typeof STORAGE_FOLDERS];

/**
 * Get the storage folder for a specific media type
 *
 * @param mediaType - Type of media (post, profile, document, etc.)
 * @returns Storage folder path
 *
 * @example
 * getFolderForMediaType('profile'); // 'profile-photos'
 * getFolderForMediaType('post'); // 'post-media'
 */
export function getFolderForMediaType(mediaType: string): StorageFolder {
  const folderMap: Record<string, StorageFolder> = {
    profile: STORAGE_FOLDERS.PROFILE_PHOTOS,
    avatar: STORAGE_FOLDERS.PROFILE_PHOTOS,
    post: STORAGE_FOLDERS.POST_MEDIA,
    post_media: STORAGE_FOLDERS.POST_MEDIA,
    document: STORAGE_FOLDERS.DOCUMENTS,
    doc: STORAGE_FOLDERS.DOCUMENTS,
    studio: STORAGE_FOLDERS.STUDIO_IMAGES,
    gear: STORAGE_FOLDERS.GEAR_IMAGES,
    attachment: STORAGE_FOLDERS.ATTACHMENTS,
  };

  return folderMap[mediaType] || STORAGE_FOLDERS.POST_MEDIA;
}

// =====================================================
// FILE UPLOAD OPERATIONS
// =====================================================

/**
 * Upload options interface
 */
export interface UploadOptions {
  customFileName?: string;
}

/**
 * Uploaded blob interface
 */
export interface UploadedBlob {
  url: string;
}

/**
 * Upload a file to Vercel Blob
 *
 * @param file - File to upload
 * @param folder - Storage folder (e.g., 'profile-photos')
 * @param options - Upload options
 * @returns Blob object with URL, metadata
 *
 * @example
 * // Upload a profile photo
 * const blob = await uploadFile(file, 'profile-photos');
 * console.log(blob.url); // https://blob.../profile-photos/user123.jpg
 *
 * // Upload with custom filename
 * const blob = await uploadFile(file, 'post-media', {
 *   customFileName: 'my-custom-name'
 * });
 */
export async function uploadFile(
  file: File | Blob,
  folder: StorageFolder = STORAGE_FOLDERS.POST_MEDIA,
  options: UploadOptions = {}
): Promise<UploadedBlob> {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured. Set VITE_BLOB_READ_WRITE_TOKEN environment variable.');
  }

  try {
    // Generate unique filename (we handle random suffix ourselves to avoid CORS issues)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = (file as File).name || 'file';
    const extension = fileName.split('.').pop() || 'jpg';
    const filename = options.customFileName || `${folder}-${timestamp}-${randomString}.${extension}`;

    // Full path with folder
    const key = `${folder}/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(key, file, {
      access: 'public',
    });

    return {
      url: blob.url,
    };
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 *
 * @param files - Array of files to upload
 * @param folder - Storage folder
 * @param options - Upload options
 * @returns Array of blob objects
 *
 * @example
 * const blobs = await uploadMultipleFiles(files, 'post-media');
 * console.log(blobs.map(b => b.url));
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: StorageFolder = STORAGE_FOLDERS.POST_MEDIA,
  options: UploadOptions = {}
): Promise<UploadedBlob[]> {
  const uploadPromises = files.map(file => uploadFile(file, folder, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Vercel Blob
 *
 * @param url - Blob URL to delete
 * @returns Promise that resolves when deleted
 *
 * @example
 * await deleteFile('https://blob.../profile-photos/user123.jpg');
 */
export async function deleteFile(url: string): Promise<void> {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured.');
  }

  try {
    await del([url]);
  } catch (error) {
    console.error('Vercel Blob delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple files
 *
 * @param urls - Array of blob URLs to delete
 * @returns Promise that resolves when all deleted
 *
 * @example
 * await deleteMultipleFiles([
 *   'https://blob.../file1.jpg',
 *   'https://blob.../file2.jpg'
 * ]);
 */
export async function deleteMultipleFiles(urls: string[]): Promise<void> {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured.');
  }

  try {
    await del(urls);
  } catch (error) {
    console.error('Vercel Blob delete multiple error:', error);
    throw error;
  }
}

// File retrieval operations are not available in browser environment
// The @vercel/blob package only provides upload and delete functions for client-side use

/**
 * Get public URL for a blob
 *
 * @param blob - Blob object or URL string
 * @returns Public URL
 *
 * @example
 * const url = getFileUrl(blob);
 * // or
 * const url = getFileUrl('https://blob.../file.jpg');
 */
export function getFileUrl(blob: UploadedBlob | string): string | null {
  if (typeof blob === 'string') {
    return blob;
  }
  return (blob as any)?.url || null;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if a file is an image
 *
 * @param file - File to check
 * @returns True if file is an image
 *
 * @example
 * if (isImageFile(file)) {
 *   // Handle image upload
 * }
 */
export function isImageFile(file: File): boolean {
  return file.type?.startsWith('image/') || false;
}

/**
 * Check if a file is a video
 *
 * @param file - File to check
 * @returns True if file is a video
 *
 * @example
 * if (isVideoFile(file)) {
 *   // Handle video upload
 * }
 */
export function isVideoFile(file: File): boolean {
  return file.type?.startsWith('video/') || false;
}

/**
 * Validate file size
 *
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @returns True if file is within size limit
 *
 * @example
 * if (!validateFileSize(file, 5)) {
 *   alert('File is too large. Maximum size is 5MB.');
 * }
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted size (e.g., "2.5 MB")
 *
 * @example
 * console.log(formatFileSize(2621440)); // "2.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
