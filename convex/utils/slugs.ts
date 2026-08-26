// Slug utility functions for SeshNx studio URLs

// Helper function to generate URL-friendly slugs
export function generateSlug(name: string): string {
  // Convert to lowercase
  let slug = name.toLowerCase();

  // Replace spaces and special characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Collapse consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Limit to 40 characters
  if (slug.length > 40) {
    slug = slug.substring(0, 40).replace(/-+$/, '');
  }

  // Ensure it starts and ends with alphanumeric
  slug = slug.replace(/^-/, '').replace(/-$/, '');

  // If the result is empty or too short, append random chars
  if (slug.length < 3) {
    slug = 'studio-' + Math.random().toString(36).substring(2, 6);
  }

  // Check if slug already exists, if so append random suffix
  // This will be checked at the database level
  return slug;
}

// Validate a slug according to our rules
export function validateSlug(slug: string): { valid: boolean; error?: string; requiresVerification?: boolean } {
  // Basic validation: 3-50 chars, regex: ^[a-z0-9][a-z0-9-]*[a-z0-9]$
  if (slug.length < 3 || slug.length > 50) {
    return {
      valid: false,
      error: "Slug must be between 3 and 50 characters"
    };
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return {
      valid: false,
      error: "Slug can only contain lowercase letters, numbers, and hyphens. Must start and end with alphanumeric."
    };
  }

  // Block reserved slugs
  const reserved = [
    'app', 'www', 'api', 'admin', 'media', 'kiosk',
    'studio', 'studios', 'feed', 'bookings', 'dashboard',
    'profile', 'login', 'signup', 'logout', 'account',
    'settings', 'messages', 'marketplace', 'tech', 'labels',
    'edu', 'education', 'school', 'schools'
  ];

  if (reserved.includes(slug)) {
    return {
      valid: false,
      error: "This slug is reserved and cannot be used"
    };
  }

  // Note: reservedSlugs check needs to be done at database level
  // since it requires a query

  return { valid: true };
}

// Generate a verification code for slug claims
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate cooldown expiration date (15 days after claim rejection)
export function getCooldownEndsAt(rejectedAt: number): number {
  return rejectedAt + (15 * 24 * 60 * 60 * 1000); // 15 days in milliseconds
}

// Check if a slug is in cooldown period
export function isInCooldown(rejectedAt: number, now: number = Date.now()): boolean {
  return now < getCooldownEndsAt(rejectedAt);
}

// Extract claimant Clerk ID from auth context
export function getClaimantClerkId(ctx: { auth: any }): string | null {
  if (!ctx.auth || !ctx.auth.userId) {
    return null;
  }
  return ctx.auth.userId;
}