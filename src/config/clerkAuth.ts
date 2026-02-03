/**
 * Clerk Authentication Helpers
 *
 * This module provides higher-level authentication utilities that make it easier
 * to work with Clerk throughout the application. These helpers wrap common Clerk
 * operations and provide additional functionality specific to SeshNx.
 *
 * Dependencies: @clerk/clerk-react
 */

import { useAuth, useUser, useSignIn, useSignUp } from '@clerk/clerk-react';
import { getClerkUserMetadata, getUserDisplayName } from './clerk';
import type { AccountType } from '../types';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  user: any;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  email: string | null;
  username: string | null;
  photoUrl: string | null;
  metadata: ClerkUserMetadata;
  accountTypes: AccountType[];
  activeRole: AccountType;
  signOut: () => Promise<void>;
}

/**
 * Authentication state with role checking
 */
export interface AuthWithRolesState extends AuthState {
  hasRole: (role: AccountType) => boolean;
  hasAnyRole: (roles: AccountType[]) => boolean;
  hasAllRoles: (roles: AccountType[]) => boolean;
  isActiveRole: (role: AccountType) => boolean;
}

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
 * Sign in result interface
 */
export interface SignInResult {
  success?: boolean;
  data?: any;
  error?: Error;
}

/**
 * Sign up result interface
 */
export interface SignUpResult extends SignInResult {
  needsVerification?: boolean;
}

/**
 * Authentication Hook
 *
 * This is a convenience hook that combines multiple Clerk hooks into one.
 * Use this in components that need access to authentication state and user data.
 *
 * @returns Authentication state and helpers
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
export function useAuthHelper(): AuthState {
  const auth = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  // Note: useSignOut hook is not available in newer Clerk versions
  // Use signOut from Clerk's SignOutButton or redirect to sign-out URL
  const signOut = async () => {
    window.location.href = '/sign-out';
  };

  return {
    // Authentication state
    isAuthenticated: auth.isLoaded && auth.isSignedIn,
    isLoading: !auth.isLoaded || !userLoaded,
    userId: auth.userId || null,

    // User data
    user,
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    fullName: getUserDisplayName(user),
    email: user?.primaryEmailAddress?.emailAddress || null,
    username: user?.username || null,
    photoUrl: user?.imageUrl || null,

    // User metadata
    metadata: getClerkUserMetadata(user),
    accountTypes: (user?.publicMetadata?.account_types as AccountType[]) || ['Fan'],
    activeRole: (user?.publicMetadata?.active_role as AccountType) || 'Fan',

    // Actions
    signOut: signOut,
  };
}

/**
 * Authentication Hook with Role Checking
 *
 * This hook extends useAuthHelper to include role-based access control helpers.
 *
 * @returns Authentication state with role checking helpers
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
export function useAuthWithRoles(): AuthWithRolesState {
  const auth = useAuthHelper();

  return {
    ...auth,

    /**
     * Check if user has a specific account type/role
     * @param role - Role to check
     * @returns True if user has the role
     */
    hasRole: (role: AccountType) => {
      return auth.accountTypes.includes(role);
    },

    /**
     * Check if user has any of the specified roles
     * @param roles - Array of roles to check
     * @returns True if user has any of the roles
     */
    hasAnyRole: (roles: AccountType[]) => {
      return roles.some(role => auth.accountTypes.includes(role));
    },

    /**
     * Check if user has all of the specified roles
     * @param roles - Array of roles to check
     * @returns True if user has all of the roles
     */
    hasAllRoles: (roles: AccountType[]) => {
      return roles.every(role => auth.accountTypes.includes(role));
    },

    /**
     * Check if user's active role matches the specified role
     * @param role - Role to check against active role
     * @returns True if active role matches
     */
    isActiveRole: (role: AccountType) => {
      return auth.activeRole === role;
    },
  };
}

/**
 * Sign In Helper Hook
 *
 * Provides a simplified interface for sign-in operations.
 *
 * @returns Sign-in methods and state
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
     * @param email - User email
     * @param password - User password
     * @returns Sign-in result
     */
    signIn: async (email: string, password: string): Promise<SignInResult> => {
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
      } catch (error: any) {
        return { error };
      }
    },

    /**
     * Sign in with OAuth provider
     * @param provider - OAuth provider (e.g., 'oauth_google')
     * @returns Sign-in result
     */
    signInWithOAuth: async (provider: string): Promise<SignInResult> => {
      if (!signInLoaded) {
        return { error: new Error('Sign in not ready') };
      }

      try {
        await signIn.authenticateWithRedirect({
          strategy: provider as any, // Type cast for OAuth strategy
          redirectUrl: '/dashboard',
          redirectUrlComplete: '/dashboard',
        });
        return { success: true };
      } catch (error: any) {
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
 * @returns Sign-up methods and state
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
     * @param email - User email
     * @param password - User password
     * @param metadata - User metadata (firstName, lastName, etc.)
     * @returns Sign-up result
     */
    signUp: async (
      email: string,
      password: string,
      metadata: Record<string, any> = {}
    ): Promise<SignUpResult> => {
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
      } catch (error: any) {
        return { error };
      }
    },

    /**
     * Sign up with OAuth provider
     * @param provider - OAuth provider (e.g., 'oauth_google')
     * @returns Sign-up result
     */
    signUpWithOAuth: async (provider: string): Promise<SignUpResult> => {
      if (!signUpLoaded) {
        return { error: new Error('Sign up not ready') };
      }

      try {
        await signUp.authenticateWithRedirect({
          strategy: provider as any, // Type cast for OAuth strategy
          redirectUrl: '/onboarding',
          redirectUrlComplete: '/onboarding',
        });
        return { success: true };
      } catch (error: any) {
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
 * @returns Password reset methods
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
     * @param email - User email
     * @returns Result
     */
    sendResetEmail: async (email: string): Promise<SignInResult> => {
      try {
        await signIn.create({
          identifier: email,
          strategy: 'reset_password_email_code' as any,
        });
        return { success: true };
      } catch (error: any) {
        return { error };
      }
    },

    /**
     * Reset password with code
     * @param email - User email
     * @param code - Reset code from email
     * @param newPassword - New password
     * @returns Result
     */
    resetPassword: async (
      email: string,
      code: string,
      newPassword: string
    ): Promise<SignInResult> => {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'reset_password_email_code' as any,
          code,
          password: newPassword,
        });

        if (result.status === 'complete') {
          return { success: true };
        }

        return { error: new Error('Password reset failed') };
      } catch (error: any) {
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
 * @returns Metadata update methods
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
     * @param updates - Metadata to update
     * @returns Result
     */
    updatePublicMetadata: async (updates: Record<string, any>): Promise<SignInResult> => {
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
      } catch (error: any) {
        return { error };
      }
    },

    /**
     * Update unsafe metadata (server-only, more sensitive data)
     * @param updates - Metadata to update
     * @returns Result
     */
    updateUnsafeMetadata: async (updates: Record<string, any>): Promise<SignInResult> => {
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
      } catch (error: any) {
        return { error };
      }
    },

    /**
     * Switch active role
     * @param newRole - New active role
     * @returns Result
     */
    switchRole: async (newRole: AccountType): Promise<SignInResult> => {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const accountTypes = (user.publicMetadata?.account_types as AccountType[]) || [];
      if (!accountTypes.includes(newRole)) {
        return { error: new Error('User does not have this role') };
      }

      return await this.updatePublicMetadata({ active_role: newRole });
    },

    /**
     * Add account type to user
     * @param accountType - Account type to add
     * @returns Result
     */
    addAccountType: async (accountType: AccountType): Promise<SignInResult> => {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const accountTypes = (user.publicMetadata?.account_types as AccountType[]) || [];
      if (accountTypes.includes(accountType)) {
        return { error: new Error('User already has this account type') };
      }

      return await this.updatePublicMetadata({
        account_types: [...accountTypes, accountType],
      });
    },

    /**
     * Mark profile as completed
     * @returns Result
     */
    markProfileCompleted: async (): Promise<SignInResult> => {
      return await this.updatePublicMetadata({
        profile_completed: true,
      });
    },

    /**
     * Mark onboarding as completed
     * @returns Result
     */
    markOnboardingCompleted: async (): Promise<SignInResult> => {
      return await this.updatePublicMetadata({
        onboarding_completed: true,
      });
    },
  };
}

/**
 * Authentication Route Guard Component Props
 * Note: AuthGuard component should be implemented in a .tsx file
 * This file only exports the interfaces and utility functions
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: AccountType[];
  requireActiveRole?: boolean;
}

/**
 * Role-based access control helper
 *
 * Check if a user with specific roles can access a resource.
 *
 * @param userRoles - User's account types/roles
 * @param allowedRoles - Roles that can access the resource
 * @returns True if user can access
 *
 * @example
 * const canAccess = canAccessResource(
 *   ['EDUAdmin', 'EDUStaff'],
 *   ['EDUAdmin', 'GAdmin']
 * ); // Returns true because user has EDUAdmin
 */
export function canAccessResource(userRoles: AccountType[], allowedRoles: AccountType[]): boolean {
  return allowedRoles.some(role => userRoles.includes(role));
}

/**
 * Permission checker helper
 *
 * Check if a user with specific roles has a specific permission.
 * This integrates with src/utils/permissions.ts
 *
 * @param userRoles - User's account types/roles
 * @param permission - Permission to check
 * @returns True if user has permission
 *
 * @example
 * import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions';
 *
 * const canPost = hasPermission(
 *   ['Talent', 'Producer'],
 *   PERMISSIONS.CAN_POST
 * ); // Returns true
 */
export function hasPermission(userRoles: AccountType[], permission: string): boolean {
  // This would need to import from permissions.ts
  // For now, it's a placeholder
  return false;
}
