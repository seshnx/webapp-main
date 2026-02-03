/**
 * Clerk Authentication Configuration
 *
 * This module configures Clerk for authentication, replacing Supabase Auth.
 * Clerk provides a complete authentication solution with OAuth, magic links,
 * multi-factor authentication, and user management.
 *
 * Environment Variables Required:
 * - VITE_CLERK_PUBLISHABLE_KEY: Clerk publishable key (frontend)
 * - VITE_CLERK_SECRET_KEY: Clerk secret key (backend/server-side only)
 *
 * Clerk Dashboard: https://dashboard.clerk.com/
 *
 * Documentation: https://clerk.com/docs
 */

import type { AccountType } from '../types';

// Validate required environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  if (import.meta.env.DEV) {
    console.error(
      '❌ Clerk: VITE_CLERK_PUBLISHABLE_KEY is not set. ' +
      'Authentication will not work. Get your key from https://dashboard.clerk.com/'
    );
  } else {
    console.error('❌ Clerk: Missing publishable key in production');
  }
}

/**
 * Clerk Publishable Key
 *
 * This key is safe to expose in the frontend and is used to initialize
 * the Clerk browser SDK.
 */
export { clerkPubKey };

/**
 * Check if Clerk is properly configured
 *
 * @returns True if Clerk publishable key is present
 */
export function isClerkConfigured(): boolean {
  return !!clerkPubKey;
}

/**
 * Clerk configuration appearance
 */
export interface ClerkAppearance {
  elements?: {
    primaryButton?: {
      backgroundColor?: string;
      color?: string;
      '&:hover'?: {
        backgroundColor?: string;
      };
    };
    input?: {
      borderColor?: string;
      '&:focus'?: {
        borderColor?: string;
      };
    };
  };
  variables?: {
    colorPrimary?: string;
    colorBackground?: string;
    colorInputBackground?: string;
    colorDanger?: string;
    colorSuccess?: string;
  };
}

/**
 * Clerk Configuration Options
 *
 * These options can be passed to <ClerkProvider> in main.jsx.
 * Customize these based on your application's needs.
 */
export const clerkConfig = {
  // Enable Clerk DevTools in development
  publishableKey: clerkPubKey,

  // Appearance customization
  appearance: {
    // Customize the Clerk components appearance
    elements: {
      // Primary button styling
      primaryButton: {
        backgroundColor: 'hsl(222, 78%, 58%)', // SeshNx primary color #3D84ED
        color: 'white',
        '&:hover': {
          backgroundColor: 'hsl(223, 82%, 57%)', // SeshNx accent color #3C5DE8
        },
      },
      // Input field styling
      input: {
        borderColor: '#e2e8f0',
        '&:focus': {
          borderColor: '#3D84ED',
        },
      },
    },
    // Add custom CSS
    variables: {
      colorPrimary: '#3D84ED',
      colorBackground: 'white',
      colorInputBackground: 'white',
      colorDanger: '#ef4444',
      colorSuccess: '#22c55e',
    },
  } as ClerkAppearance,

  // Debug mode (development only)
  debug: import.meta.env.DEV,
};

/**
 * Clerk Metadata Keys
 *
 * These keys are used to store application-specific metadata in Clerk user objects.
 * This metadata will be synced to Aurora profiles table via webhooks.
 */
export const CLERK_METADATA_KEYS = {
  // Basic profile information
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  ACCOUNT_TYPES: 'account_types', // Array of role strings
  ACTIVE_ROLE: 'active_role',     // Currently active role

  // Profile completion
  PROFILE_COMPLETED: 'profile_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Custom fields
  BIO: 'bio',
  ZIP_CODE: 'zip_code',

  // Timestamps
  LAST_LOGIN: 'last_login',
  PROFILE_UPDATED: 'profile_updated',
} as const;

/**
 * Clerk Webhook Events
 *
 * These events should be handled in your backend webhook handler
 * to sync user data with Aurora profiles table.
 */
export const CLERK_WEBHOOK_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  SESSION_CREATED: 'session.created',
  SESSION_ENDED: 'session.ended',
  SESSION_REVOKED: 'session.revoked',
} as const;

/**
 * JWT Template Configuration for Neon
 */
export const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE || 'neon-jwt';

/**
 * Clerk user metadata interface
 */
export interface ClerkUserMetadata {
  accountTypes: AccountType[];
  activeRole: AccountType;
  profileCompleted: boolean;
  onboardingCompleted: boolean;
  bio?: string;
  zipCode?: string;
}

/**
 * Clerk Integration Helpers
 */

/**
 * Get the current user's ID from Clerk
 * This is useful for database queries that need the user ID
 *
 * @param auth - Clerk auth object from useAuth()
 * @returns User ID or null if not authenticated
 */
export function getClerkUserId(auth: { userId?: string | null }): string | null {
  return auth?.userId || null;
}

/**
 * Get the current user's metadata from Clerk
 *
 * @param user - Clerk user object from useUser()
 * @returns User metadata (public and unsafe)
 */
export function getClerkUserMetadata(user: any): ClerkUserMetadata {
  if (!user) {
    return {
      accountTypes: ['Fan'],
      activeRole: 'Fan',
      profileCompleted: false,
      onboardingCompleted: false,
    };
  }

  return {
    // Public metadata (visible to client)
    accountTypes: (user?.publicMetadata?.account_types as AccountType[]) || ['Fan'],
    activeRole: (user?.publicMetadata?.active_role as AccountType) || 'Fan',
    profileCompleted: user?.publicMetadata?.profile_completed || false,
    onboardingCompleted: user?.publicMetadata?.onboarding_completed || false,
    bio: user?.publicMetadata?.bio || '',
    zipCode: user?.publicMetadata?.zip_code || '',

    // Unsafe metadata (only on server)
    // Note: This is only accessible in server-side code
  };
}

/**
 * Check if user has a specific account type
 *
 * @param user - Clerk user object from useUser()
 * @param accountType - Account type to check
 * @returns True if user has the account type
 */
export function hasAccountType(user: any, accountType: AccountType): boolean {
  const accountTypes = (user?.publicMetadata?.account_types as AccountType[]) || [];
  return accountTypes.includes(accountType);
}

/**
 * Check if user has a specific permission
 * This is a helper that combines account type checking with permissions
 *
 * @param user - Clerk user object from useUser()
 * @param permission - Permission to check
 * @returns True if user has the permission
 */
export function hasPermission(user: any, permission: string): boolean {
  // Import permissions from utils/permissions.js
  // This would need to be imported at the top of the file
  // For now, return false - implement based on your permission system
  return false;
}

/**
 * Get the user's display name
 *
 * @param user - Clerk user object from useUser()
 * @returns Display name (first name, last name, or username)
 */
export function getUserDisplayName(user: any): string {
  if (!user) return 'Guest';

  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const username = user?.username;
  const email = user?.primaryEmailAddress?.emailAddress;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (username) {
    return username;
  }

  if (email) {
    return email.split('@')[0];
  }

  return 'User';
}

/**
 * Get the user's profile photo URL
 *
 * @param user - Clerk user object from useUser()
 * @returns Profile photo URL or null
 */
export function getUserPhotoUrl(user: any): string | null {
  return user?.imageUrl || null;
}

/**
 * Clerk Error Types
 * Map Clerk errors to user-friendly messages
 */
export const CLERK_ERRORS = {
  AUTH_FAILED: 'Authentication failed. Please try again.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  PASSWORD_TOO_WEAK: 'Password is too weak. Please use a stronger password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  VERIFICATION_FAILED: 'Verification failed. Please try again.',
} as const;

/**
 * Get a user-friendly error message from Clerk error
 *
 * @param error - Clerk error object
 * @returns User-friendly error message
 */
export function getClerkErrorMessage(error: any): string {
  const errorMessages: Record<string, string> = {
    'form_identifier_exists': CLERK_ERRORS.EMAIL_ALREADY_EXISTS,
    'form_password_pwned': CLERK_ERRORS.PASSWORD_TOO_WEAK,
    'form_password_length_too_short': CLERK_ERRORS.PASSWORD_TOO_WEAK,
    'session_expired': CLERK_ERRORS.SESSION_EXPIRED,
  };

  const clerkError = error?.errors?.[0];
  const errorCode = clerkError?.code;

  return errorMessages[errorCode || ''] || CLERK_ERRORS.AUTH_FAILED;
}

/**
 * Clerk OAuth Providers
 * Configure these in Clerk Dashboard under "Configure → Domains → SSO Connections"
 */
export const CLERK_OAUTH_PROVIDERS = {
  GOOGLE: 'oauth_google',
  APPLE: 'oauth_apple',
  FACEBOOK: 'oauth_facebook',
  GITHUB: 'oauth_github',
  DISCORD: 'oauth_discord',
  SPOTIFY: 'oauth_spotify',
} as const;

/**
 * Get enabled OAuth providers from environment variables
 * Format: VITE_CLERK_OAUTH_PROVIDERS=google,apple,github
 */
export function getEnabledOAuthProviders(): string[] {
  const providers = import.meta.env.VITE_CLERK_OAUTH_PROVIDERS?.split(',') || [];
  return providers
    .filter(Boolean)
    .map(p => `oauth_${p.toLowerCase().trim()}`);
}
