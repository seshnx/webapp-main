/**
 * API Authentication Utility for Clerk
 *
 * This module provides server-side authentication helpers for API routes.
 * It validates Clerk JWT tokens and extracts user information.
 *
 * Usage in API routes:
 * import { authenticateUser, requireAuth } from '@/utils/apiAuth';
 *
 * const user = await authenticateUser(req);
 * if (!user) {
 *   return res.status(401).json({ error: 'Unauthorized' });
 * }
 */

import { createClerkClient } from '@clerk/backend';
import type { AccountType } from '../types';

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Authenticated user object from Clerk token
 */
export interface AuthenticatedUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  accountTypes: AccountType[];
  activeRole: AccountType;
  metadata: Record<string, any>;
}

/**
 * Request interface for API routes
 */
interface Request {
  headers?: {
    authorization?: string;
    Authorization?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Response interface for API routes
 */
interface Response {
  status: (code: number) => Response;
  json: (data: any) => any;
  [key: string]: any;
}

/**
 * Authenticate user from request
 * Validates Clerk JWT token and returns user data
 *
 * @param req - Express/Vercel request object
 * @returns User object or null if not authenticated
 *
 * @example
 * const user = await authenticateUser(req);
 * if (!user) {
 *   return res.status(401).json({ error: 'Unauthorized' });
 * }
 */
export async function authenticateUser(req: Request): Promise<AuthenticatedUser | null> {
  try {
    // Get Authorization header
    const authHeader = req.headers?.authorization || req.headers?.Authorization;

    if (!authHeader) {
      console.warn('No Authorization header found');
      return null;
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      console.warn('No token found in Authorization header');
      return null;
    }

    // Verify token with Clerk
    try {
      const verifiedToken = await (clerkClient as any).verifyToken(token);

      if (!verifiedToken || !verifiedToken.sub) {
        console.warn('Invalid token: no subject found');
        return null;
      }

      // Get full user data from Clerk
      const user = await clerkClient.users.getUser(verifiedToken.sub);

      return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.imageUrl,
        accountTypes: (user.publicMetadata?.account_types as AccountType[]) || ['Fan'],
        activeRole: (user.publicMetadata?.active_role as AccountType) || 'Fan',
        metadata: user.publicMetadata || {},
      };
    } catch (tokenError: any) {
      console.error('Token verification failed:', tokenError.message);
      return null;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Returns 401 response if user is not authenticated
 *
 * @param req - Express/Vercel request object
 * @param res - Express/Vercel response object
 * @returns User object or null
 *
 * @example
 * const user = await requireAuth(req, res);
 * if (!user) return; // Response already sent
 */
export async function requireAuth(req: Request, res: Response): Promise<AuthenticatedUser | null> {
  const user = await authenticateUser(req);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
    return null;
  }

  return user;
}

/**
 * Check if user has specific role/account type
 *
 * @param user - User object from authenticateUser
 * @param role - Role to check
 * @returns True if user has the role
 *
 * @example
 * const user = await authenticateUser(req);
 * if (!hasRole(user, 'EDUAdmin')) {
 *   return res.status(403).json({ error: 'Forbidden' });
 * }
 */
export function hasRole(user: AuthenticatedUser | null, role: AccountType): boolean {
  if (!user || !user.accountTypes) {
    return false;
  }
  return user.accountTypes.includes(role);
}

/**
 * Check if user has any of the specified roles
 *
 * @param user - User object from authenticateUser
 * @param roles - Array of roles to check
 * @returns True if user has any of the roles
 */
export function hasAnyRole(user: AuthenticatedUser | null, roles: AccountType[]): boolean {
  if (!user || !user.accountTypes) {
    return false;
  }
  return roles.some(role => user.accountTypes.includes(role));
}

/**
 * Middleware function for requiring specific role
 */
type RoleMiddleware = (req: Request, res: Response) => Promise<AuthenticatedUser | null>;

/**
 * Require specific role middleware
 * Returns 403 response if user doesn't have the required role
 *
 * @param role - Required role
 * @returns Middleware function
 *
 * @example
 * const requireAdmin = requireRole('EDUAdmin');
 * const user = await requireAdmin(req, res);
 * if (!user) return; // Response already sent
 */
export function requireRole(role: AccountType): RoleMiddleware {
  return async (req: Request, res: Response): Promise<AuthenticatedUser | null> => {
    const user = await requireAuth(req, res);

    if (!user) {
      return null; // 401 already sent
    }

    if (!hasRole(user, role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Role '${role}' required`
      });
      return null;
    }

    return user;
  };
}

/**
 * Extract user ID from Authorization header
 * Lightweight version that only returns the user ID
 *
 * @param req - Express/Vercel request object
 * @returns User ID or null
 */
export async function getUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;

    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const verifiedToken = await (clerkClient as any).verifyToken(token);
    return verifiedToken?.sub || null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}
