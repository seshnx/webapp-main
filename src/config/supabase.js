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

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Use PKCE flow for better security
      }
    })
  : null;

export const isSupabaseAvailable = () => !!supabase;
