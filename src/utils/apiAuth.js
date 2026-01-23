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

import { ClerkExpressRequireAuth, ClerkExpressWithAuth, createClerkClient } from '@clerk/backend';

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Authenticate user from request
 * Validates Clerk JWT token and returns user data
 *
 * @param {object} req - Express/Vercel request object
 * @returns {Promise<object|null>} User object or null if not authenticated
 *
 * @example
 * const user = await authenticateUser(req);
 * if (!user) {
 *   return res.status(401).json({ error: 'Unauthorized' });
 * }
 */
export async function authenticateUser(req) {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

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
      const verifiedToken = await clerkClient.verifyToken(token);

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
        accountTypes: user.publicMetadata?.account_types || ['Fan'],
        activeRole: user.publicMetadata?.active_role || 'Fan',
        metadata: user.publicMetadata || {},
      };
    } catch (tokenError) {
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
 * @param {object} req - Express/Vercel request object
 * @param {object} res - Express/Vercel response object
 * @returns {Promise<object|null>} User object or null
 *
 * @example
 * const user = await requireAuth(req, res);
 * if (!user) return; // Response already sent
 */
export async function requireAuth(req, res) {
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
 * @param {object} user - User object from authenticateUser
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 *
 * @example
 * const user = await authenticateUser(req);
 * if (!hasRole(user, 'EDUAdmin')) {
 *   return res.status(403).json({ error: 'Forbidden' });
 * }
 */
export function hasRole(user, role) {
  if (!user || !user.accountTypes) {
    return false;
  }
  return user.accountTypes.includes(role);
}

/**
 * Check if user has any of the specified roles
 *
 * @param {object} user - User object from authenticateUser
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles
 */
export function hasAnyRole(user, roles) {
  if (!user || !user.accountTypes) {
    return false;
  }
  return roles.some(role => user.accountTypes.includes(role));
}

/**
 * Require specific role middleware
 * Returns 403 response if user doesn't have the required role
 *
 * @param {string} role - Required role
 * @returns {Function} Middleware function
 *
 * @example
 * const requireAdmin = requireRole('EDUAdmin');
 * const user = await requireAdmin(req, res);
 * if (!user) return; // Response already sent
 */
export function requireRole(role) {
  return async (req, res) => {
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
 * @param {object} req - Express/Vercel request object
 * @returns {Promise<string|null>} User ID or null
 */
export async function getUserId(req) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const verifiedToken = await clerkClient.verifyToken(token);
    return verifiedToken?.sub || null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
}
