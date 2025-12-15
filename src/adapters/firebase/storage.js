import { supabase } from '../../config/supabase';

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }
}

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public';

export function ref(_storage, path) {
  return { bucket: _storage?.bucket || DEFAULT_BUCKET, path: String(path) };
}

export async function uploadBytes(storageRef, fileOrBlob) {
  ensureSupabase();
  const bucket = storageRef.bucket || DEFAULT_BUCKET;
  const path = storageRef.path;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileOrBlob, { upsert: true });

  if (error) throw error;
  return { ref: storageRef, metadata: data };
}

export function uploadBytesResumable(storageRef, fileOrBlob) {
  // Minimal shim (no progress events).
  const task = {
    snapshot: { ref: storageRef },
    on: (_event, _progress, _error, complete) => {
      uploadBytes(storageRef, fileOrBlob)
        .then(() => complete?.())
        .catch(() => complete?.());
    },
  };
  return task;
}

export async function getDownloadURL(storageRef) {
  ensureSupabase();
  const bucket = storageRef.bucket || DEFAULT_BUCKET;
  const { data } = supabase.storage.from(bucket).getPublicUrl(storageRef.path);
  return data.publicUrl;
}

export async function deleteObject(storageRef) {
  ensureSupabase();
  const bucket = storageRef.bucket || DEFAULT_BUCKET;
  const { error } = await supabase.storage.from(bucket).remove([storageRef.path]);
  if (error) throw error;
}
