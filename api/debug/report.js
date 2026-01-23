import { authenticateUser } from '../../src/utils/apiAuth.js';

/**
 * Debug Report API
 * GET /api/debug/report
 *
 * Generates a debug report for troubleshooting
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user with Clerk
    const user = await authenticateUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate debug report
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isDev: process.env.NODE_ENV === 'development',
        isProd: process.env.NODE_ENV === 'production',
        neonUrl: process.env.VITE_NEON_DATABASE_URL ? 'Set' : 'Missing',
        clerkKey: process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
      },
      browser: {
        userAgent: req.headers['user-agent'],
        platform: req.headers['user-platform'] || 'Unknown',
        language: req.headers['accept-language'] || 'Unknown',
        cookieEnabled: req.headers.cookie ? 'Set' : 'Not Set',
        onLine: true,
        storage: {
          localStorage: 'N/A',
          sessionStorage: 'N/A',
        }
      },
      authentication: {
        userExists: !!user,
        userId: user?.id || 'N/A',
        userEmail: user?.email || 'N/A',
        accountTypes: user?.accountTypes || [],
        activeRole: user?.activeRole || 'N/A',
      },
      userData: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        accountTypes: user.accountTypes,
        activeRole: user.activeRole,
        metadata: user.metadata || {},
      },
      backend: {
        initialized: true,
        authProvider: 'Clerk',
        database: 'Neon PostgreSQL',
        realtime: 'Convex',
      }
    };

    return res.status(200).json({
      success: true,
      data: report,
      message: 'Debug report generated successfully'
    });
  } catch (error) {
    console.error('Generate debug report error:', error);
    return res.status(500).json({ error: error.message });
  }
}