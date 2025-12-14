// src/hooks/useMediaUpload.js

import { useState } from 'react';
// Firebase Storage imports are removed as the upload is handled by the new API/MinIO

// Define the API endpoint from environment variables
// Replace this with the actual environment variable access method for your framework (e.g., import.meta.env, process.env)
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000";

export const useMediaUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Uploads media file to the backend API for processing (watermarking, MinIO storage).
   * @param {File} file - The file to upload.
   * @param {string} uploadType - The type of upload (e.g., 'beat', 'post', 'profile').
   * @returns {Promise<object|null>} Object containing media URL/reference and type.
   */
  const uploadMedia = async (file, uploadType = 'general') => {
    if (!file) return null;
    
    setUploading(true);
    setError(null);
    
    try {
      // 1. Prepare data for the API
      const formData = new FormData();
      formData.append('mediaFile', file);
      formData.append('uploadType', uploadType); // Pass context for server-side path logic

      // 2. Call the new self-hosted backend API
      const response = await fetch(`${API_ENDPOINT}/api/v1/upload-asset`, {
        method: 'POST',
        // The API service running on HP ProDesk handles the MinIO credentials and FFmpeg
        body: formData, 
      });

      // Handle HTTP errors from the API
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      // 3. Parse the secure response from the backend
      const result = await response.json();
      
      setUploading(false);
      
      // The API returns the necessary MinIO storage references and URLs
      return {
          url: result.url,
          previewUrl: result.previewUrl, // New: Public URL for streaming from MinIO 'seshnx-previews' bucket
          storageRef: result.storageRef, // New: Private reference to the raw file in MinIO 'seshnx-raw-audio' bucket
          type: file.type.startsWith('video/') ? 'video' : (file.type.startsWith('audio/') ? 'audio' : 'image'),
          name: file.name
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
