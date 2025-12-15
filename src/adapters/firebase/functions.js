import { supabase } from '../../config/supabase';

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
  }
}

export function getFunctions(_app) {
  return { __type: 'supabase-functions' };
}

export function httpsCallable(_functions, name) {
  return async (data) => {
    ensureSupabase();
    const { data: result, error } = await supabase.functions.invoke(String(name), {
      body: data || {},
    });
    if (error) throw error;
    return { data: result };
  };
}
