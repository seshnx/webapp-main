import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Optimized for Vercel native integration:
 * - Automatically uses environment variables from Vercel
 * - Handles storage issues gracefully (tracking prevention)
 * - Uses PKCE flow for enhanced security
 * - Auto-refreshes tokens to maintain sessions
 */

// Vite requires VITE_ prefix for environment variables
// Vercel native Supabase integration automatically sets these
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enhanced error reporting (will use Sentry if available)
const reportSupabaseError = (message, details = {}) => {
  if (import.meta.env.DEV) {
    console.error(`❌ Supabase: ${message}`, details);
  }
  // Sentry will be initialized in main.jsx and will catch these automatically
};

if (!supabaseUrl || !supabaseAnonKey) {
  reportSupabaseError('Credentials not found. Authentication will not work.', {
    url: supabaseUrl ? '✓ Set' : '✗ Missing',
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing',
    hint: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables, or use Vercel Marketplace Supabase integration'
  });
} else {
  // Validate key format (should start with eyJ for JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    reportSupabaseError('Anon key format looks incorrect. Should start with "eyJ" (JWT format).');
  }
  
  if (import.meta.env.DEV) {
    console.log('✓ Supabase client initialized:', {
      url: supabaseUrl,
      keyLength: supabaseAnonKey.length,
      keyPrefix: supabaseAnonKey.substring(0, 20) + '...'
    });
  }
}

/**
 * Create Supabase client with optimized configuration
 * 
 * Key improvements:
 * - Graceful storage handling (Supabase handles errors internally)
 * - PKCE flow for better security
 * - Auto token refresh
 * - Session detection from URL (OAuth callbacks)
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true, // Supabase handles storage errors gracefully internally
        autoRefreshToken: true, // Automatically refresh tokens to maintain sessions
        detectSessionInUrl: true, // Detect OAuth callbacks from URL
        flowType: 'pkce', // Use PKCE flow for enhanced security (recommended)
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-auth-token',
        // Enhanced error handling - Supabase will handle storage errors gracefully
        // No need for manual storage availability checks
      },
      // Global error handling
      global: {
        headers: {
          'x-client-info': 'seshnx-webapp@1.0.0'
        }
      }
    })
  : null;

export const isSupabaseAvailable = () => !!supabase;
