// src/hooks/useMediaUpload.js

import { useState } from 'react';
import { supabase } from '../config/supabase';

// Use configured storage bucket or default to 'public'
const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public';

export const useMediaUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Uploads media file directly to Supabase Storage.
   * @param {File} file - The file to upload.
   * @param {string} uploadPath - The path/folder within the bucket (e.g., 'posts/user123', 'chat_media/conv456').
   * @returns {Promise<object|null>} Object containing media URL/reference and type.
   */
  const uploadMedia = async (file, uploadPath = 'general') => {
    if (!file) return null;

    if (!supabase) {
      setError('Supabase is not configured. Please set environment variables.');
      console.error('Supabase Storage is not available.');
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      // Create a unique filename to prevent collisions
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${timestamp}_${sanitizedName}`;
      const fullPath = `${uploadPath}/${uniqueName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(DEFAULT_BUCKET)
        .upload(fullPath, file, {
          upsert: true,
          cacheControl: '3600',
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(DEFAULT_BUCKET)
        .getPublicUrl(fullPath);

      const publicUrl = urlData.publicUrl;

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
      return {
        url: publicUrl,
        previewUrl: publicUrl, // For Supabase, same as main URL
        storageRef: fullPath, // Path in storage bucket
        type: mediaType,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || 'An unknown error occurred during upload.');
      setUploading(false);
      return null;
    }
  };

  return { uploadMedia, uploading, error };
};
