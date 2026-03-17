/**
 * Environment Variable Utilities
 *
 * Provides utilities to clean and validate environment variables,
 * handling common issues like extra quotes, newlines, and whitespace.
 */

/**
 * Clean an environment variable value by removing:
 * - Extra quotes at the beginning/end
 * - Escaped newlines (\n)
 * - Trailing whitespace
 * - Carriage returns
 *
 * @param value - The raw environment variable value
 * @returns Cleaned environment variable value
 *
 * @example
 * const key = cleanEnv(process.env.VITE_CLERK_KEY);
 * // Removes quotes, newlines, and whitespace
 */
export function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;

  let cleaned = value;

  // Remove leading/trailing quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');

  // Remove escaped newlines
  cleaned = cleaned.replace(/\\n/g, '');

  // Remove literal newlines
  cleaned = cleaned.replace(/\n/g, '');

  // Remove trailing whitespace
  cleaned = cleaned.trim();

  // Remove carriage returns
  cleaned = cleaned.replace(/\r/g, '');

  return cleaned || undefined;
}

/**
 * Get a cleaned environment variable
 *
 * @param key - Environment variable key
 * @returns Cleaned environment variable value or undefined
 *
 * @example
 * const clerkKey = getCleanEnv('VITE_CLERK_PUBLISHABLE_KEY');
 */
export function getCleanEnv(key: string): string | undefined {
  // Try import.meta.env first (browser/Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (value !== undefined) return cleanEnv(value);
  }
  // Fall back to process.env (Node.js/serverless)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value !== undefined) return cleanEnv(value);
  }
  return undefined;
}

/**
 * Validate that a required environment variable is present and non-empty
 *
 * @param key - Environment variable key
 * @returns The cleaned environment variable value
 * @throws Error if the variable is missing or empty
 *
 * @example
 * const clerkKey = requireEnv('VITE_CLERK_PUBLISHABLE_KEY');
 */
export function requireEnv(key: string): string {
  const value = getCleanEnv(key);

  if (!value) {
    throw new Error(`Required environment variable ${key} is missing or empty`);
  }

  return value;
}

/**
 * Check if an environment variable is present and valid
 *
 * @param key - Environment variable key
 * @returns True if the variable exists and is non-empty
 *
 * @example
 * if (hasEnv('VITE_CLERK_PUBLISHABLE_KEY')) {
 *   // Initialize Clerk
 * }
 */
export function hasEnv(key: string): boolean {
  const value = getCleanEnv(key);
  return !!value && value.length > 0;
}

/**
 * Parse a boolean environment variable
 * Accepts: 'true', '1', 'yes' (case-insensitive)
 *
 * @param key - Environment variable key
 * @param defaultValue - Default value if variable is missing
 * @returns Boolean value
 *
 * @example
 * const debug = parseBooleanEnv('VITE_DEBUG', false);
 */
export function parseBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = getCleanEnv(key);
  if (!value) return defaultValue;

  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

/**
 * Parse a numeric environment variable
 *
 * @param key - Environment variable key
 * @param defaultValue - Default value if variable is missing or invalid
 * @returns Numeric value
 *
 * @example
 * const timeout = parseNumericEnv('VITE_TIMEOUT_MS', 5000);
 */
export function parseNumericEnv(key: string, defaultValue: number): number {
  const value = getCleanEnv(key);
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get all environment variables matching a prefix
 *
 * @param prefix - Environment variable prefix (e.g., 'VITE_')
 * @returns Object with key-value pairs
 *
 * @example
 * const viteVars = getEnvByPrefix('VITE_');
 * // Returns { VITE_CLERK_KEY: '...', VITE_API_URL: '...' }
 */
export function getEnvByPrefix(prefix: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in import.meta.env) {
    if (key.startsWith(prefix)) {
      const value = getCleanEnv(key);
      if (value) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Validate multiple environment variables at once
 *
 * @param requiredVars - Array of required environment variable keys
 * @throws Error if any required variable is missing
 *
 * @example
 * validateEnv(['VITE_CLERK_KEY', 'VITE_API_URL']);
 */
export function validateEnv(requiredVars: string[]): void {
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!hasEnv(key)) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}`
    );
  }
}
