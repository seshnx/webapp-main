/**
 * Development Bypass API Endpoint
 *
 * Allows testing org creation without full Clerk authentication.
 * This endpoint should ONLY be used in development and MUST be disabled in production.
 *
 * SECURITY WARNING: This endpoint bypasses Clerk authentication and authorization.
 * NEVER deploy this to production environments.
 */

export default async function handler(req, res) {
  // Security check: Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      error: 'Bypass endpoint is only available in development',
      environment: process.env.NODE_ENV,
    });
  }

  // Check for bypass header
  const bypassToken = req.headers['x-bypass-token'];
  if (!bypassToken) {
    return res.status(401).json({
      error: 'Bypass token required',
      hint: 'Add X-Bypass-Token header with development bypass token',
    });
  }

  // Additional security: Check for bypass enabled flag
  if (process.env.VITE_CLERK_BYPASS !== 'true') {
    return res.status(403).json({
      error: 'Clerk bypass is not enabled',
      hint: 'Set VITE_CLERK_BYPASS=true in .env.development',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orgType, orgName, slug, userId } = req.body;

    if (!orgType || !orgName || !slug || !userId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['orgType', 'orgName', 'slug', 'userId'],
      });
    }

    // Validate org type
    const validTypes = ['STUDIO', 'TECH', 'LABEL', 'EDU'];
    if (!validTypes.includes(orgType)) {
      return res.status(400).json({
        error: 'Invalid org type',
        validTypes,
      });
    }

    // Generate mock organization ID
    const orgId = `bypass_${orgType.toLowerCase()}_${Date.now()}`;

    console.log(`[DEV BYPASS] Creating mock ${orgType} org: ${orgName} (${slug})`);

    // Return mock organization data
    return res.status(200).json({
      success: true,
      organizationId: orgId,
      name: `${orgName} {[${orgType}]}`,
      slug: slug,
      type: orgType.toLowerCase(),
      tagged: true,
      bypassed: true,
      createdAt: Date.now(),
      privateMetadata: {
        type: orgType.toLowerCase(),
        tagged: true,
        bypassed: true,
      },
    });

  } catch (error) {
    console.error('[DEV BYPASS] Error:', error);
    return res.status(500).json({
      error: 'Bypass creation failed',
      message: error.message,
    });
  }
}
