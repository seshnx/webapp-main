import { createClient } from '@supabase/supabase-js';

// Vite requires VITE_ prefix. 
// If you haven't renamed them in Vercel yet, we try to grab the NEXT_PUBLIC_ ones just in case your build tool exposes them.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found. Authentication will not work.');
  console.error('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  console.error('   Current values:', {
    url: supabaseUrl ? '✓ Set' : '✗ Missing',
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing'
  });
} else {
  // Validate key format (should start with eyJ for JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.warn('⚠️ Supabase anon key format looks incorrect. Should start with "eyJ" (JWT format).');
  }
  console.log('✓ Supabase client initialized:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length,
    keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
  });
}

// Check if storage is available (not blocked by tracking prevention)
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true, // Always try to persist - Supabase handles storage errors gracefully
        autoRefreshToken: true, // Auto-refresh tokens to keep session alive
        detectSessionInUrl: true, // Detect session in URL (for OAuth callbacks)
        flowType: 'pkce', // Use PKCE flow for better security
        storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Explicitly use localStorage
        storageKey: 'sb-auth-token' // Custom storage key
      }
    })
  : null;

// Warn if storage is blocked
if (supabase && !isStorageAvailable()) {
  console.warn('⚠️ Browser storage is blocked (likely due to Tracking Prevention). Session persistence is disabled.');
  console.warn('   Users will need to sign in on each page refresh.');
}

export const isSupabaseAvailable = () => !!supabase;
