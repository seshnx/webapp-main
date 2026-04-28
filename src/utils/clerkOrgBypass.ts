/**
 * Clerk Org Bypass Utility
 *
 * Development/testing utility to bypass Clerk organization checks.
 * This should ONLY be used in development/testing environments.
 *
 * WARNING: This bypasses security controls and should NEVER be used in production.
 */

// Org type constants
export const ORG_TAGS = {
  STUDIO: '{[STUDIO]}',
  TECH: '{[TECH]}',
  LABEL: '{[LABEL]}',
  EDU: '{[EDU]}'
} as const;

export type OrgType = keyof typeof ORG_TAGS;

/**
 * Parse org name to extract display name and type
 * @param orgName - The organization name (with or without tag)
 * @returns Object with displayName and orgType
 */
export function parseOrgTag(orgName: string): {
  displayName: string;
  orgType: OrgType | null;
} {
  const tagMatch = orgName.match(/\{\[(\w+)\]\}$/);
  if (!tagMatch) {
    // No tag found - return original name (backward compatibility)
    return { displayName: orgName, orgType: null };
  }

  const tag = tagMatch[0]; // e.g., "{[STUDIO]}"
  const type = tagMatch[1] as OrgType; // e.g., "STUDIO"
  const displayName = orgName.replace(tag, '').trim();

  return { displayName, orgType: ORG_TAGS[type] ? type : null };
}

// Check if bypass is enabled via environment variable
export const BYPASS_ENABLED = import.meta.env.MODE === 'development' &&
                             import.meta.env.VITE_CLERK_BYPASS === 'true';

/**
 * Bypass Clerk organization check and return a mock organization
 * @param orgType - The type of organization to mock (STUDIO, TECH, LABEL, EDU)
 * @param orgName - The name for the mock organization
 * @returns A mock organization object
 */
export function bypassClerkOrg(orgType: string, orgName: string) {
  if (!BYPASS_ENABLED) {
    console.warn('Clerk Org Bypass is not enabled. Set VITE_CLERK_BYPASS=true in development.');
    return null;
  }

  console.log(`[CLERK BYPASS] Creating mock ${orgType} organization: ${orgName}`);

  return {
    id: `bypass_${orgType.toLowerCase()}_${Date.now()}`,
    name: `${orgName} {[${orgType}]}`,
    slug: `${orgName.toLowerCase().replace(/\s+/g, '-')}`,
    createdAt: Date.now(),
    members: [], // Mock empty members list
    privateMetadata: {
      type: orgType.toLowerCase(),
      tagged: true,
      bypassed: true, // Flag to indicate this is a bypassed org
    },
  };
}

/**
 * Bypass Clerk user check and return a mock user
 * @param userId - The user ID to mock
 * @param accountTypes - Array of account types to assign
 * @returns A mock user object
 */
export function bypassClerkUser(userId: string, accountTypes: string[] = []) {
  if (!BYPASS_ENABLED) {
    console.warn('Clerk Org Bypass is not enabled. Set VITE_CLERK_BYPASS=true in development.');
    return null;
  }

  console.log(`[CLERK BYPASS] Creating mock user: ${userId} with roles: ${accountTypes.join(', ')}`);

  return {
    id: userId,
    firstName: 'Bypass',
    lastName: 'User',
    username: 'bypass_user',
    imageUrl: null,
    publicMetadata: {
      accountTypes: accountTypes,
      bypassed: true,
    },
  };
}

/**
 * Simulate org creation bypass
 * @param orgType - The type of organization
 * @param orgName - The organization name
 * @returns Success response with mock org data
 */
export function bypassOrgCreation(orgType: string, orgName: string) {
  if (!BYPASS_ENABLED) {
    return {
      success: false,
      error: 'Clerk Org Bypass is not enabled',
    };
  }

  const mockOrg = bypassClerkOrg(orgType, orgName);

  return {
    success: true,
    organizationId: mockOrg?.id,
    name: mockOrg?.name,
    slug: mockOrg?.slug,
    bypassed: true,
  };
}

/**
 * Get bypass configuration status
 * @returns Object showing bypass status and configuration
 */
export function getBypassStatus() {
  return {
    enabled: BYPASS_ENABLED,
    environment: import.meta.env.MODE,
    bypassFlag: import.meta.env.VITE_CLERK_BYPASS,
    warning: BYPASS_ENABLED ? 'CLERK BYPASS IS ACTIVE - DO NOT USE IN PRODUCTION' : 'Bypass disabled',
  };
}

/**
 * Development-only hook to check if user has bypass access
 * @param userId - User ID to check
 * @returns Boolean indicating if user can use bypass
 */
export function canUseBypass(userId?: string): boolean {
  if (!BYPASS_ENABLED) {
    return false;
  }

  // In development, allow bypass for any user
  // In production, this would check against a whitelist
  return import.meta.env.MODE === 'development';
}

/**
 * Mock Clerk session token for API calls
 * @returns A mock session token
 */
export function getBypassSessionToken(): string {
  if (!BYPASS_ENABLED) {
    throw new Error('Clerk Org Bypass is not enabled');
  }

  return `bypass_token_${Date.now()}`;
}

/**
 * Simulate API call with bypass
 * @param url - API endpoint to call
 * @param options - Fetch options
 * @returns Promise with response
 */
export async function bypassApiCall(url: string, options: RequestInit = {}) {
  if (!BYPASS_ENABLED) {
    throw new Error('Clerk Org Bypass is not enabled');
  }

  // Add bypass headers
  const bypassedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'X-Clerk-Bypass': 'true',
      'X-Bypass-Token': getBypassSessionToken(),
    },
  };

  console.log(`[CLERK BYPASS] Making API call to ${url}`);

  const response = await fetch(url, bypassedOptions);

  // Handle bypass-specific responses
  if (response.status === 401 && response.headers.get('X-Bypass-Required')) {
    console.warn('[CLERK BYPASS] Server requires bypass, but bypass is already active');
  }

  return response;
}

/**
 * Console warning to remind developers about bypass
 */
export function logBypassWarning() {
  if (BYPASS_ENABLED) {
    console.warn(
      '%c⚠️ CLERK ORG BYPASS ACTIVE ⚠️',
      'background: #ff0000; color: white; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
    );
    console.warn(
      '%cDevelopment mode is bypassing Clerk organization checks.',
      'color: #ff6600; font-size: 12px;'
    );
    console.warn(
      '%cNEVER enable this in production!',
      'color: #ff0000; font-size: 12px; font-weight: bold;'
    );
  }
}

// Auto-log warning when module loads in development
if (BYPASS_ENABLED) {
  logBypassWarning();
}
