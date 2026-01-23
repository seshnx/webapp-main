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

import { put, del, list, head } from '@vercel/blob';

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
 * @returns {boolean} True if Blob token is present
 */
export function isBlobConfigured() {
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
};

/**
 * Get the storage folder for a specific media type
 *
 * @param {string} mediaType - Type of media (post, profile, document, etc.)
 * @returns {string} Storage folder path
 *
 * @example
 * getFolderForMediaType('profile'); // 'profile-photos'
 * getFolderForMediaType('post'); // 'post-media'
 */
export function getFolderForMediaType(mediaType) {
  const folderMap = {
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
 * Upload a file to Vercel Blob
 *
 * @param {File|Blob} file - File to upload
 * @param {string} folder - Storage folder (e.g., 'profile-photos')
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Blob object with URL, metadata
 *
 * @example
 * // Upload a profile photo
 * const blob = await uploadFile(file, 'profile-photos');
 * console.log(blob.url); // https://blob.../profile-photos/user123.jpg
 *
 * // Upload with custom filename
 * const blob = await uploadFile(file, 'post-media', {
 *   addRandomSuffix: false,
 *   customFileName: 'my-custom-name'
 * });
 */
export async function uploadFile(file, folder = STORAGE_FOLDERS.POST_MEDIA, options = {}) {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured. Set VITE_BLOB_READ_WRITE_TOKEN environment variable.');
  }

  try {
    // Generate unique filename (we handle random suffix ourselves to avoid CORS issues)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name?.split('.').pop() || 'jpg';
    const filename = options.customFileName || `${folder}-${timestamp}-${randomString}.${extension}`;

    // Full path with folder
    const key = `${folder}/${filename}`;

    // Upload to Vercel Blob with safe options only
    // Note: addRandomSuffix option causes CORS errors in browser, so we handle it ourselves
    const blob = await put(key, file, {
      access: 'public',
      token: blobToken,
      contentType: file.type || 'application/octet-stream',
    });

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      contentType: blob.contentType,
    };
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files
 *
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - Storage folder
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} Array of blob objects
 *
 * @example
 * const blobs = await uploadMultipleFiles(files, 'post-media');
 * console.log(blobs.map(b => b.url));
 */
export async function uploadMultipleFiles(files, folder = STORAGE_FOLDERS.POST_MEDIA, options = {}) {
  const uploadPromises = files.map(file => uploadFile(file, folder, options));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Vercel Blob
 *
 * @param {string} url - Blob URL to delete
 * @returns {Promise<void>}
 *
 * @example
 * await deleteFile('https://blob.../profile-photos/user123.jpg');
 */
export async function deleteFile(url) {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured.');
  }

  try {
    await del(url, { token: blobToken });
  } catch (error) {
    console.error('Vercel Blob delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple files
 *
 * @param {string[]} urls - Array of blob URLs to delete
 * @returns {Promise<void>}
 *
 * @example
 * await deleteMultipleFiles([
 *   'https://blob.../file1.jpg',
 *   'https://blob.../file2.jpg'
 * ]);
 */
export async function deleteMultipleFiles(urls) {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured.');
  }

  try {
    await del(urls, { token: blobToken });
  } catch (error) {
    console.error('Vercel Blob delete multiple error:', error);
    throw error;
  }
}

// =====================================================
// FILE RETRIEVAL OPERATIONS
// =====================================================

/**
 * Get file metadata without downloading
 *
 * @param {string} url - Blob URL
 * @returns {Promise<Object>} File metadata
 *
 * @example
 * const metadata = await getFileMetadata('https://blob.../file.jpg');
 * console.log(metadata.size, metadata.contentType);
 */
export async function getFileMetadata(url) {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured.');
  }

  try {
    const metadata = await head(url, { token: blobToken });
    return metadata;
  } catch (error) {
    console.error('Vercel Blob metadata error:', error);
    throw error;
  }
}

/**
 * List all files in a folder
 *
 * @param {string} folder - Folder to list (e.g., 'profile-photos')
 * @returns {Promise<Object[]>} Array of blob objects
 *
 * @example
 * const files = await listFiles('profile-photos');
 * console.log(files.map(f => f.url));
 */
export async function listFiles(folder = '') {
  if (!blobToken) {
    throw new Error('Vercel Blob is not configured.');
  }

  try {
    const result = await list({ prefix: folder, token: blobToken });
    return result.blobs;
  } catch (error) {
    console.error('Vercel Blob list error:', error);
    throw error;
  }
}

/**
 * Get public URL for a blob
 *
 * @param {Object|string} blob - Blob object or URL string
 * @returns {string} Public URL
 *
 * @example
 * const url = getFileUrl(blob);
 * // or
 * const url = getFileUrl('https://blob.../file.jpg');
 */
export function getFileUrl(blob) {
  if (typeof blob === 'string') {
    return blob;
  }
  return blob?.url || null;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if a file is an image
 *
 * @param {File} file - File to check
 * @returns {boolean} True if file is an image
 *
 * @example
 * if (isImageFile(file)) {
 *   // Handle image upload
 * }
 */
export function isImageFile(file) {
  return file.type?.startsWith('image/') || false;
}

/**
 * Check if a file is a video
 *
 * @param {File} file - File to check
 * @returns {boolean} True if file is a video
 *
 * @example
 * if (isVideoFile(file)) {
 *   // Handle video upload
 * }
 */
export function isVideoFile(file) {
  return file.type?.startsWith('video/') || false;
}

/**
 * Validate file size
 *
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in megabytes
 * @returns {boolean} True if file is within size limit
 *
 * @example
 * if (!validateFileSize(file, 5)) {
 *   alert('File is too large. Maximum size is 5MB.');
 * }
 */
export function validateFileSize(file, maxSizeMB = 5) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 *
 * @example
 * console.log(formatFileSize(2621440)); // "2.5 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// =====================================================
// REACT HOOK EXAMPLE (for reference)
// =====================================================

/**
 * Example React hook for file uploads
 *
 * This is a reference implementation. Use it in your components:
 *
 * @example
 * function ProfilePhotoUpload() {
 *   const [uploading, setUploading] = useState(false);
 *   const [photoUrl, setPhotoUrl] = useState(null);
 *
 *   const handleFileChange = async (e) => {
 *     const file = e.target.files[0];
 *     if (!file) return;
 *
 *     if (!isImageFile(file)) {
 *       toast.error('Please upload an image file');
 *       return;
 *     }
 *
 *     if (!validateFileSize(file, 5)) {
 *       toast.error('File size must be less than 5MB');
 *       return;
 *     }
 *
 *     setUploading(true);
 *     try {
 *       const blob = await uploadFile(file, STORAGE_FOLDERS.PROFILE_PHOTOS);
 *       setPhotoUrl(blob.url);
 *       toast.success('Photo uploaded successfully');
 *     } catch (error) {
 *       toast.error('Failed to upload photo');
 *       console.error(error);
 *     } finally {
 *       setUploading(false);
 *     }
 *   };
 *
 *   return (
 *     <input
 *       type="file"
 *       onChange={handleFileChange}
 *       disabled={uploading}
 *       accept="image/*"
 *     />
 *   );
 * }
 */

/**
 * Development Notice
 *
 * For local development with Vercel Blob:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Link your project: vercel link
 * 3. Pull environment variables: vercel env pull .env.local
 *
 * This will set BLOB_READ_WRITE_TOKEN in your local environment.
 *
 * For production deployment on Vercel, the token is automatically configured.
 */
