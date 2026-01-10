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

import { ClerkDevTools } from '@clerk/clerk-react';

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
 * @returns {boolean} True if Clerk publishable key is present
 */
export function isClerkConfigured() {
  return !!clerkPubKey;
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
  },

  // Enable/disable features
  // See: https://clerk.com/docs/reference/clerk/clerk-provider#props
  // afterSignInUrl: '/dashboard',
  // afterSignUpUrl: '/onboarding',
  // signInForceRedirectUrl: false,
  // signUpForceRedirectUrl: false,

  // OAuth providers (configure in Clerk Dashboard)
  // supportedOAuthProviders: ['oauth_google', 'oauth_apple', 'oauth_facebook'],

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
};

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
};

/**
 * Example Clerk integration in main.jsx:
 *
 * import { ClerkProvider } from '@clerk/clerk-react';
 * import { clerkConfig } from '@/config/clerk';
 * import ReactDOM from 'react-dom/client';
 * import App from './App';
 * import './index.css';
 *
 * ReactDOM.createRoot(document.getElementById('root')).render(
 *   <React.StrictMode>
 *     <ClerkProvider {...clerkConfig}>
 *       <App />
 *     </ClerkProvider>
 *   </React.StrictMode>
 * );
 */

/**
 * Example usage in components:
 *
 * import { useAuth, useUser, SignIn, SignUp } from '@clerk/clerk-react';
 *
 * function MyComponent() {
 *   const { isLoaded, isSignedIn, userId } = useAuth();
 *   const { user } = useUser();
 *
 *   if (!isLoaded) return <div>Loading...</div>;
 *
 *   if (!isSignedIn) {
 *     return <SignIn afterSignInUrl="/dashboard" />;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.firstName}!</p>
 *       <p>User ID: {userId}</p>
 *     </div>
 *   );
 * }
 *
 * // Access custom metadata
 * const accountTypes = user?.publicMetadata?.account_types || ['Fan'];
 * const activeRole = user?.publicMetadata?.active_role || 'Fan';
 */

/**
 * Example protected route:
 *
 * import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
 *
 * function Dashboard() {
 *   return (
 *     <>
 *       <SignedIn>
 *         <DashboardContent />
 *       </SignedIn>
 *       <SignedOut>
 *         <RedirectToSignIn />
 *       </SignedOut>
 *     </>
 *   );
 * }
 */

/**
 * Example logout:
 *
 * import { useSignOut } from '@clerk/clerk-react';
 *
 * function LogoutButton() {
 *   const { signOut } = useSignOut();
 *
 *   return (
 *     <button onClick={() => signOut({ redirectUrl: '/' })}>
 *       Sign Out
 *     </button>
 *   );
 * }
 */
