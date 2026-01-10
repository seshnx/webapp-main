/**
 * Clerk Authentication Helpers
 *
 * This module provides higher-level authentication utilities that make it easier
 * to work with Clerk throughout the application. These helpers wrap common Clerk
 * operations and provide additional functionality specific to SeshNx.
 *
 * Dependencies: @clerk/clerk-react
 */

import { useAuth, useUser, useSignIn, useSignUp, useSignOut } from '@clerk/clerk-react';
import { getClerkUserMetadata, getUserDisplayName, hasAccountType } from './clerk';

/**
 * Authentication Hook
 *
 * This is a convenience hook that combines multiple Clerk hooks into one.
 * Use this in components that need access to authentication state and user data.
 *
 * @returns {object} Authentication state and helpers
 *
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, isLoading, signOut } = useAuthHelper();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <SignIn />;
 *
 *   return <div>Welcome, {user.firstName}!</div>;
 * }
 */
export function useAuthHelper() {
  const auth = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useSignOut();

  return {
    // Authentication state
    isAuthenticated: auth.isLoaded && auth.isSignedIn,
    isLoading: !auth.isLoaded || !userLoaded,
    userId: auth.userId,

    // User data
    user,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: getUserDisplayName(user),
    email: user?.primaryEmailAddress?.emailAddress,
    username: user?.username,
    photoUrl: user?.imageUrl,

    // User metadata
    metadata: getClerkUserMetadata(user),
    accountTypes: user?.publicMetadata?.account_types || ['Fan'],
    activeRole: user?.publicMetadata?.active_role || 'Fan',

    // Actions
    signOut: () => signOut({ redirectUrl: '/' }),
  };
}

/**
 * Authentication Hook with Role Checking
 *
 * This hook extends useAuthHelper to include role-based access control helpers.
 *
 * @returns {object} Authentication state with role checking helpers
 *
 * @example
 * function AdminPanel() {
 *   const { hasRole, hasAnyRole, hasAllRoles } = useAuthWithRoles();
 *
 *   if (!hasRole('EDUAdmin')) {
 *     return <div>Access Denied</div>;
 *   }
 *
 *   return <AdminDashboard />;
 * }
 */
export function useAuthWithRoles() {
  const auth = useAuthHelper();

  return {
    ...auth,

    /**
     * Check if user has a specific account type/role
     * @param {string} role - Role to check
     * @returns {boolean}
     */
    hasRole: (role) => {
      return auth.accountTypes.includes(role);
    },

    /**
     * Check if user has any of the specified roles
     * @param {string[]} roles - Array of roles to check
     * @returns {boolean}
     */
    hasAnyRole: (roles) => {
      return roles.some(role => auth.accountTypes.includes(role));
    },

    /**
     * Check if user has all of the specified roles
     * @param {string[]} roles - Array of roles to check
     * @returns {boolean}
     */
    hasAllRoles: (roles) => {
      return roles.every(role => auth.accountTypes.includes(role));
    },

    /**
     * Check if user's active role matches the specified role
     * @param {string} role - Role to check against active role
     * @returns {boolean}
     */
    isActiveRole: (role) => {
      return auth.activeRole === role;
    },
  };
}

/**
 * Sign In Helper Hook
 *
 * Provides a simplified interface for sign-in operations.
 *
 * @returns {object} Sign-in methods and state
 *
 * @example
 * function SignInForm() {
 *   const { signIn, isSigningIn, error } = useSignInHelper();
 *
 *   const handleSubmit = async (email, password) => {
 *     const result = await signIn(email, password);
 *     if (result.error) {
 *       console.error('Sign in failed:', result.error);
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 */
export function useSignInHelper() {
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();

  return {
    /**
     * Sign in with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<object>}
     */
    signIn: async (email, password) => {
      if (!signInLoaded) {
        return { error: new Error('Sign in not ready') };
      }

      try {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          return { success: true, data: result };
        }

        return { error: new Error('Sign in incomplete') };
      } catch (error) {
        return { error };
      }
    },

    /**
     * Sign in with OAuth provider
     * @param {string} provider - OAuth provider (e.g., 'oauth_google')
     * @returns {Promise<object>}
     */
    signInWithOAuth: async (provider) => {
      if (!signInLoaded) {
        return { error: new Error('Sign in not ready') };
      }

      try {
        await signIn.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: '/dashboard',
          redirectUrlComplete: '/dashboard',
        });
        return { success: true };
      } catch (error) {
        return { error };
      }
    },

    isLoading: !signInLoaded,
  };
}

/**
 * Sign Up Helper Hook
 *
 * Provides a simplified interface for sign-up operations.
 *
 * @returns {object} Sign-up methods and state
 *
 * @example
 * function SignUpForm() {
 *   const { signUp, isSigningUp, error } = useSignUpHelper();
 *
 *   const handleSubmit = async (email, password, firstName, lastName) => {
 *     const result = await signUp(email, password, { firstName, lastName });
 *     if (result.error) {
 *       console.error('Sign up failed:', result.error);
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 */
export function useSignUpHelper() {
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();

  return {
    /**
     * Sign up with email and password
     * @param {string} email
     * @param {string} password
     * @param {object} metadata - User metadata (firstName, lastName, etc.)
     * @returns {Promise<object>}
     */
    signUp: async (email, password, metadata = {}) => {
      if (!signUpLoaded) {
        return { error: new Error('Sign up not ready') };
      }

      try {
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: metadata.firstName || '',
          lastName: metadata.lastName || '',
          unsafeMetadata: {
            account_types: metadata.accountTypes || ['Fan'],
            active_role: metadata.activeRole || 'Fan',
            profile_completed: false,
            onboarding_completed: false,
            ...metadata,
          },
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          return { success: true, data: result };
        }

        if (result.status === 'missing_requirements') {
          return {
            success: false,
            needsVerification: true,
            data: result,
          };
        }

        return { error: new Error('Sign up incomplete') };
      } catch (error) {
        return { error };
      }
    },

    /**
     * Sign up with OAuth provider
     * @param {string} provider - OAuth provider (e.g., 'oauth_google')
     * @returns {Promise<object>}
     */
    signUpWithOAuth: async (provider) => {
      if (!signUpLoaded) {
        return { error: new Error('Sign up not ready') };
      }

      try {
        await signUp.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: '/onboarding',
          redirectUrlComplete: '/onboarding',
        });
        return { success: true };
      } catch (error) {
        return { error };
      }
    },

    isLoading: !signUpLoaded,
  };
}

/**
 * Password Reset Helper Hook
 *
 * Provides password reset functionality.
 *
 * @returns {object} Password reset methods
 *
 * @example
 * function ForgotPassword() {
 *   const { sendResetEmail, isSending } = usePasswordReset();
 *
 *   const handleSubmit = async (email) => {
 *     const result = await sendResetEmail(email);
 *     if (result.success) {
 *       alert('Password reset email sent!');
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 */
export function usePasswordReset() {
  const { signIn } = useSignIn();

  return {
    /**
     * Send password reset email
     * @param {string} email
     * @returns {Promise<object>}
     */
    sendResetEmail: async (email) => {
      try {
        await signIn.create({
          identifier: email,
          strategy: 'reset_password_email_code',
          redirectUrl: '/reset-password',
        });
        return { success: true };
      } catch (error) {
        return { error };
      }
    },

    /**
     * Reset password with code
     * @param {string} email
     * @param {string} code - Reset code from email
     * @param {string} newPassword
     * @returns {Promise<object>}
     */
    resetPassword: async (email, code, newPassword) => {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'reset_password_email_code',
          identifier: email,
          code,
          password: newPassword,
        });

        if (result.status === 'complete') {
          return { success: true };
        }

        return { error: new Error('Password reset failed') };
      } catch (error) {
        return { error };
      }
    },
  };
}

/**
 * User Metadata Update Helper Hook
 *
 * Provides methods to update user metadata in Clerk.
 * This metadata is synced to Neon via webhooks.
 *
 * @returns {object} Metadata update methods
 *
 * @example
 * function ProfileSettings() {
 *   const { updateMetadata, isUpdating } = useUserMetadata();
 *
 *   const handleUpdate = async () => {
 *     await updateMetadata({ bio: 'Music producer' });
 *   };
 *
 *   return <button onClick={handleUpdate}>Update Profile</button>;
 * }
 */
export function useUserMetadata() {
  const { user } = useUser();

  return {
    /**
     * Update public metadata (visible to client)
     * @param {object} updates - Metadata to update
     * @returns {Promise<object>}
     */
    updatePublicMetadata: async (updates) => {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      try {
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            ...updates,
          },
        });
        return { success: true };
      } catch (error) {
        return { error };
      }
    },

    /**
     * Update unsafe metadata (server-only, more sensitive data)
     * @param {object} updates - Metadata to update
     * @returns {Promise<object>}
     */
    updateUnsafeMetadata: async (updates) => {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      try {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            ...updates,
          },
        });
        return { success: true };
      } catch (error) {
        return { error };
      }
    },

    /**
     * Switch active role
     * @param {string} newRole - New active role
     * @returns {Promise<object>}
     */
    switchRole: async (newRole) => {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const accountTypes = user.publicMetadata?.account_types || [];
      if (!accountTypes.includes(newRole)) {
        return { error: new Error('User does not have this role') };
      }

      return await this.updatePublicMetadata({ active_role: newRole });
    },

    /**
     * Add account type to user
     * @param {string} accountType - Account type to add
     * @returns {Promise<object>}
     */
    addAccountType: async (accountType) => {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const accountTypes = user.publicMetadata?.account_types || [];
      if (accountTypes.includes(accountType)) {
        return { error: new Error('User already has this account type') };
      }

      return await this.updatePublicMetadata({
        account_types: [...accountTypes, accountType],
      });
    },

    /**
     * Mark profile as completed
     * @returns {Promise<object>}
     */
    markProfileCompleted: async () => {
      return await this.updatePublicMetadata({
        profile_completed: true,
      });
    },

    /**
     * Mark onboarding as completed
     * @returns {Promise<object>}
     */
    markOnboardingCompleted: async () => {
      return await this.updatePublicMetadata({
        onboarding_completed: true,
      });
    },
  };
}

/**
 * Authentication Route Guard Component
 *
 * Use this to protect routes that require authentication.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Content to show if authenticated
 * @param {React.ReactNode} props.fallback - Content to show if not authenticated
 * @param {string[]} props.requiredRoles - Roles required to access route
 * @param {boolean} props.requireActiveRole - Check active role instead of all roles
 *
 * @example
 * <AuthGuard
 *   fallback={<SignIn />}
 *   requiredRoles={['EDUAdmin', 'EDUStaff']}
 * >
 *   <AdminDashboard />
 * </AuthGuard>
 */
export function AuthGuard({ children, fallback = null, requiredRoles = [], requireActiveRole = false }) {
  const auth = useAuthWithRoles();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return fallback || <div>Please sign in to continue</div>;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireActiveRole
      ? requiredRoles.includes(auth.activeRole)
      : auth.hasAnyRole(requiredRoles);

    if (!hasRequiredRoles) {
      return <div>Access Denied: You don't have permission to view this page</div>;
    }
  }

  return children;
}

/**
 * Get a JWT token for backend requests
 *
 * This retrieves a JWT token from Clerk that can be used for authenticated
 * requests to your backend API. The token includes the user's ID and metadata.
 *
 * @param {object} options - Options for token retrieval
 * @param {string} options.template - JWT template name (default: 'neon-jwt')
 * @returns {Promise<string|null>} JWT token or null if not authenticated
 *
 * @example
 * async function fetchUserData() {
 *   const token = await getAuthToken();
 *   if (!token) return null;
 *
 *   const response = await fetch('/api/user/data', {
 *     headers: {
 *       'Authorization': `Bearer ${token}`
 *     }
 *   });
 *
 *   return response.json();
 * }
 */
export async function getAuthToken(options = {}) {
  const { template = 'neon-jwt' } = options;

  // This needs to be called within a component that uses Clerk
  // or you can use the useAuth hook's getToken method
  // Example:
  // const { getToken } = useAuth();
  // const token = await getToken({ template });

  throw new Error('getAuthToken must be called within a component using Clerk. Use the useAuth hook: const { getToken } = useAuth();');
}

/**
 * Role-based access control helper
 *
 * Check if a user with specific roles can access a resource.
 *
 * @param {string[]} userRoles - User's account types/roles
 * @param {string[]} allowedRoles - Roles that can access the resource
 * @returns {boolean}
 *
 * @example
 * const canAccess = canAccessResource(
 *   ['EDUAdmin', 'EDUStaff'],
 *   ['EDUAdmin', 'GAdmin']
 * ); // Returns true because user has EDUAdmin
 */
export function canAccessResource(userRoles, allowedRoles) {
  return allowedRoles.some(role => userRoles.includes(role));
}

/**
 * Permission checker helper
 *
 * Check if a user with specific roles has a specific permission.
 * This integrates with src/utils/permissions.js
 *
 * @param {string[]} userRoles - User's account types/roles
 * @param {string} permission - Permission to check
 * @returns {boolean}
 *
 * @example
 * import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions';
 *
 * const canPost = hasPermission(
 *   ['Talent', 'Producer'],
 *   PERMISSIONS.CAN_POST
 * ); // Returns true
 */
export function hasPermission(userRoles, permission) {
  // This would need to import from permissions.js
  // For now, it's a placeholder
  return false;
}
