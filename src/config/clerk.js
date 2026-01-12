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
 * JWT Template Configuration for Neon
 *
 * To integrate Clerk with Neon PostgreSQL, you need to create a JWT template
 * in Clerk Dashboard that includes the user ID. This JWT will be passed to Neon
 * for authentication and Row Level Security (RLS).
 *
 * Steps:
 * 1. Go to Clerk Dashboard → JWT Templates → New Template
 * 2. Name: "neon-jwt"
 * 3. Claims: Include "user_id" claim
 * 4. Token lifespan: 5 minutes (recommended)
 * 5. Copy the template key to VITE_CLERK_JWT_TEMPLATE env var
 *
 * Example JWT Template Claims:
 * {
 *   "user_id": "{{user.id}}",
 *   "email": "{{user.primary_email_address}}",
 *   "first_name": "{{user.first_name}}",
 *   "last_name": "{{user.last_name}}"
 * }
 */
export const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE || 'neon-jwt';

/**
 * Clerk Integration Helpers
 */

/**
 * Get the current user's ID from Clerk
 * This is useful for database queries that need the user ID
 *
 * @param {object} auth - Clerk auth object from useAuth()
 * @returns {string|null} User ID or null if not authenticated
 */
export function getClerkUserId(auth) {
  return auth?.userId || null;
}

/**
 * Get the current user's metadata from Clerk
 *
 * @param {object} user - Clerk user object from useUser()
 * @returns {object} User metadata (public and unsafe)
 */
export function getClerkUserMetadata(user) {
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
    accountTypes: user?.publicMetadata?.account_types || ['Fan'],
    activeRole: user?.publicMetadata?.active_role || 'Fan',
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
 * @param {object} user - Clerk user object from useUser()
 * @param {string} accountType - Account type to check
 * @returns {boolean} True if user has the account type
 */
export function hasAccountType(user, accountType) {
  const accountTypes = user?.publicMetadata?.account_types || [];
  return accountTypes.includes(accountType);
}

/**
 * Check if user has a specific permission
 * This is a helper that combines account type checking with permissions
 *
 * @param {object} user - Clerk user object from useUser()
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has the permission
 */
export function hasPermission(user, permission) {
  // Import permissions from utils/permissions.js
  // This would need to be imported at the top of the file
  // For now, return false - implement based on your permission system
  return false;
}

/**
 * Get the user's display name
 *
 * @param {object} user - Clerk user object from useUser()
 * @returns {string} Display name (first name, last name, or username)
 */
export function getUserDisplayName(user) {
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
 * @param {object} user - Clerk user object from useUser()
 * @returns {string|null} Profile photo URL or null
 */
export function getUserPhotoUrl(user) {
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
};

/**
 * Get a user-friendly error message from Clerk error
 *
 * @param {Error} error - Clerk error object
 * @returns {string} User-friendly error message
 */
export function getClerkErrorMessage(error) {
  const errorMessages = {
    'form_identifier_exists': CLERK_ERRORS.EMAIL_ALREADY_EXISTS,
    'form_password_pwned': CLERK_ERRORS.PASSWORD_TOO_WEAK,
    'form_password_length_too_short': CLERK_ERRORS.PASSWORD_TOO_WEAK,
    'session_expired': CLERK_ERRORS.SESSION_EXPIRED,
  };

  const clerkError = error?.errors?.[0];
  const errorCode = clerkError?.code;

  return errorMessages[errorCode] || CLERK_ERRORS.AUTH_FAILED;
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
};

/**
 * Get enabled OAuth providers from environment variables
 * Format: VITE_CLERK_OAUTH_PROVIDERS=google,apple,github
 */
export function getEnabledOAuthProviders() {
  const providers = import.meta.env.VITE_CLERK_OAUTH_PROVIDERS?.split(',') || [];
  return providers
    .filter(Boolean)
    .map(p => `oauth_${p.toLowerCase().trim()}`);
}

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

/**
 * Clerk + Neon Integration Pattern
 *
 * When querying Neon with Clerk authentication:
 *
 * 1. Frontend gets JWT from Clerk:
 *    const token = await getToken({ template: CLERK_JWT_TEMPLATE });
 *
 * 2. Backend validates JWT and extracts user_id:
 *    const decoded = jwt.verify(token, VITE_CLERK_SECRET_KEY);
 *    const userId = decoded.user_id;
 *
 * 3. Backend sets Neon connection parameter:
 *    await neonPool.connect({
 *      connectionString: `${neonUrl}?options=project=${neonProjectId}`,
 *      statement: `SET LOCAL jwt.claims.user_id = '${userId}';`
 *    });
 *
 * 4. Neon RLS policies use auth.uid() which returns the user_id
 */
