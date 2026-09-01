/**
 * Cloudflare R2 Storage Configuration
 *
 * Cloudflare R2 storage configuration.
 * R2 provides zero egress fees, S3-compatible API, and Cloudflare Image Resizing.
 *
 * Frontend env var: VITE_R2_PUBLIC_URL (e.g. https://media.seshnx.com)
 * Convex env vars:  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *                   R2_BUCKET_NAME, R2_PUBLIC_URL
 */

// R2 public URL from frontend environment
const R2_PUBLIC_URL: string = import.meta.env.VITE_R2_PUBLIC_URL || "";

// =====================================================
// STORAGE FOLDERS
// =====================================================

export const STORAGE_FOLDERS = {
  PROFILE_PHOTOS: "profile-photos",
  PROFILE_BANNERS: "profile-banners",
  POST_MEDIA: "post-media",
  DOCUMENTS: "documents",
  STUDIO_IMAGES: "studio-images",
  GEAR_IMAGES: "gear-images",
  ATTACHMENTS: "attachments",
} as const;

export type StorageFolder =
  (typeof STORAGE_FOLDERS)[keyof typeof STORAGE_FOLDERS];

// =====================================================
// TYPES
// =====================================================

export interface UploadOptions {
  customFileName?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadedBlob {
  url: string;
}

// =====================================================
// STORAGE HELPERS
// =====================================================

/**
 * Check if R2 storage is properly configured.
 */
export function isStorageConfigured(): boolean {
  return !!R2_PUBLIC_URL;
}

/**
 * Generate a unique storage key for a file formatted under user-media/{username}/{folder}/{filename}.
 *
 * @param folder - Storage folder (e.g. 'post-media', 'profile-photos')
 * @param file - File to generate key for
 * @param customFileName - Optional custom filename override
 * @param username - Optional username or identifier
 * @returns Full object key (e.g. 'user-media/username/post-media/1714123456_abc_photo.jpg')
 */
export function generateStorageKey(
  folder: StorageFolder | string,
  file: File | Blob,
  customFileName?: string,
  username?: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const rawFileName = (file as File).name || "file";
  const sanitizedName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const name = customFileName || `${timestamp}_${randomString}_${sanitizedName}`;
  const cleanFolder = folder.replace(/^\/+/, "");

  if (cleanFolder.startsWith("user-media/")) {
    return `${cleanFolder}/${name}`;
  }

  const userSlug = username
    ? username.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()
    : "anonymous";

  return `user-media/${userSlug}/${cleanFolder}/${name}`;
}

/**
 * Extract R2 object key from a public URL.
 * Returns null if the URL is not an R2 URL.
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return null;
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}

/**
 * Get the storage folder for a media type string.
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
// PRESIGNED URL UPLOAD (XHR with progress)
// =====================================================

/**
 * Upload a file to R2 using a presigned URL with real progress tracking.
 *
 * Uses XMLHttpRequest instead of fetch because fetch does not support
 * upload progress events.
 *
 * IMPORTANT: The R2 bucket must have CORS configured to allow PUT requests
 * from your app's origin. Set this in the Cloudflare dashboard:
 *   - Allowed Origins: https://your-app.vercel.app, http://localhost:5173
 *   - Allowed Methods: PUT
 *   - Allowed Headers: content-type
 */
export function uploadToPresignedUrl(
  file: File | Blob,
  presignedUrl: string,
  onProgress?: (progress: number) => void,
  headers?: Record<string, string>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed: network error"));
    xhr.onabort = () => reject(new Error("Upload aborted"));

    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      (file as File).type || "application/octet-stream"
    );

    if (headers) {
      for (const [headerKey, headerVal] of Object.entries(headers)) {
        if (headerVal) {
          xhr.setRequestHeader(headerKey, headerVal);
        }
      }
    }

    xhr.send(file);
  });
}

// =====================================================
// IMAGE OPTIMIZATION
// =====================================================

export interface ImageOptimizeOptions {
  width?: number;
  height?: number;
  format?: "webp" | "avif" | "json";
  quality?: number;
  fit?: "contain" | "cover" | "crop" | "scale-down";
}

/**
 * Get an optimized image URL using Cloudflare Image Resizing.
 *
 * Only transforms URLs on the R2 public domain — other URLs
 * (e.g. legacy external URLs) pass through unchanged.
 *
 * Requires Cloudflare Image Resizing enabled on the domain.
 * Uses the /cdn-cgi/image/ path convention.
 *
 * @example
 * getOptimizedImageUrl(url, { width: 600, format: 'webp', quality: 80 })
 * // => https://media.seshnx.com/cdn-cgi/image/width=600,format=webp,quality=80/post-media/image.jpg
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageOptimizeOptions = {}
): string {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return url;

  const { width = 600, format = "webp", quality = 80, height, fit } = options;

  const params = [`width=${width}`];
  if (height) params.push(`height=${height}`);
  if (format) params.push(`format=${format}`);
  if (quality) params.push(`quality=${quality}`);
  if (fit) params.push(`fit=${fit}`);

  const path = url.replace(`${R2_PUBLIC_URL}/`, "");
  return `${R2_PUBLIC_URL}/cdn-cgi/image/${params.join(",")}/${path}`;
}

// =====================================================
// CLIENT-SIDE IMAGE COMPRESSION
// =====================================================

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
  skipIfSmallerThanMB?: number;
}

/**
 * Preconfigured compression profiles for different upload contexts
 */
export const COMPRESSION_PRESETS = {
  /** Heavy compression for profile pictures, avatars, and studio logos */
  AVATAR: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.80,
    format: "image/webp" as const,
    skipIfSmallerThanMB: 0.04, // Optimize anything above 40KB
  },
  /** Standard compression for social posts, galleries, feeds */
  STANDARD: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85,
    format: "image/webp" as const,
    skipIfSmallerThanMB: 0.25,
  },
  /** High resolution for release artwork / album covers */
  HIGH_RES: {
    maxWidth: 3000,
    maxHeight: 3000,
    quality: 0.92,
    format: "image/jpeg" as const,
    skipIfSmallerThanMB: 0.5,
  },
};

/**
 * Compress an image file client-side before upload using HTMLCanvasElement.
 * Bypasses SVGs and animated GIFs to preserve vector clarity and animations.
 *
 * @param file - Source image File
 * @param options - Compression settings (max dimensions, quality, format)
 * @returns Compressed File or original if compression is not beneficial/applicable
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  // Preserve SVGs, GIFs, and non-image files
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    !file.type.startsWith("image/")
  ) {
    return file;
  }

  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    format = "image/webp",
    skipIfSmallerThanMB = 0.25, // Skip if already under 250KB
  } = options;

  if (file.size <= skipIfSmallerThanMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional scale down
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);

            // If compressed blob is unexpectedly larger, keep original
            if (blob.size >= file.size) {
              return resolve(file);
            }

            const extension =
              format === "image/webp"
                ? ".webp"
                : format === "image/jpeg"
                ? ".jpg"
                : ".png";
            const baseName =
              file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

            const compressedFile = new File([blob], `${baseName}${extension}`, {
              type: format,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          format,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function isImageFile(file: File): boolean {
  return file.type?.startsWith("image/") || false;
}

export function isVideoFile(file: File): boolean {
  return file.type?.startsWith("video/") || false;
}

export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getFileUrl(blob: UploadedBlob | string): string | null {
  if (typeof blob === "string") return blob;
  return (blob as any)?.url || null;
}

// =====================================================
// UPLOAD SIZE LIMITS
// =====================================================

/**
 * Centralized upload size limits for Cloudflare R2.
 * Global cap: 200MB. Per-type limits enforced client-side.
 */
export const UPLOAD_LIMITS = {
  /** Absolute maximum file size across all types */
  MAX_FILE_SIZE_MB: 200,
  /** Maximum image size (25 MB) */
  IMAGE_MAX_MB: 25,
  /** Maximum video size (200 MB) */
  VIDEO_MAX_MB: 200,
  /** Maximum audio size (200 MB) */
  AUDIO_MAX_MB: 200,
  /** Maximum document size (50 MB) */
  DOCUMENT_MAX_MB: 50,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ] as readonly string[],
  ALLOWED_VIDEO_TYPES: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ] as readonly string[],
  ALLOWED_AUDIO_TYPES: [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",
    "audio/mp4",
  ] as readonly string[],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ] as readonly string[],
} as const;
