import { useState } from 'react';
import { supabase } from '../config/supabase';

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file, path) => {
    if (!file) return null;
    
    if (!supabase) {
      setError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
      console.error('Supabase Storage is not available.');
      return null;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const uniqueName = `${timestamp}_${file.name}`;
      const fullPath = `${path}/${uniqueName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(DEFAULT_BUCKET)
        .upload(fullPath, file, {
          upsert: true,
          cacheControl: '3600',
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(DEFAULT_BUCKET)
        .getPublicUrl(fullPath);
      
      setUploading(false);
      return urlData.publicUrl;
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err);
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading, error };
};
