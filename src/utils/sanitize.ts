// src/utils/sanitize.ts
// Sanitization utilities to prevent XSS and injection attacks

/**
 * Sanitize user input to prevent XSS attacks
 * Uses browser's built-in textContent to escape HTML
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Strip HTML tags from string
 * Returns plain text without any HTML markup
 */
export const stripHTML = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Sanitize HTML to allow only safe tags
 * Allows basic formatting tags but removes scripts and dangerous attributes
 */
export const sanitizeHTML = (html: string, allowedTags: string[] = ['p', 'br', 'strong', 'em', 'u', 'a']): string => {
  if (!html) return '';

  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove all elements that aren't in allowed tags
  const elements = div.querySelectorAll('*');
  elements.forEach(element => {
    const tagName = element.tagName.toLowerCase();
    if (!allowedTags.includes(tagName)) {
      element.replaceWith(...element.childNodes);
    } else {
      // Remove all attributes except href for links
      Array.from(element.attributes).forEach(attr => {
        if (tagName === 'a' && attr.name === 'href') {
          // Validate href is a safe URL
          const href = attr.value;
          if (!isSafeURL(href)) {
            element.removeAttribute('href');
          }
        } else {
          element.removeAttribute(attr.name);
        }
      });
    }
  });

  return div.innerHTML;
};

/**
 * Check if a URL is safe (not javascript: or data: scheme)
 */
function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize string for use in SQL queries
 * NOTE: This should NOT replace parameterized queries!
 * This is a defense-in-depth measure for special cases
 */
export const sanitizeForSQL = (input: string): string => {
  if (!input) return '';
  // Escape single quotes by doubling them (SQL standard)
  return input.replace(/'/g, "''");
};

/**
 * Sanitize filename to prevent path traversal
 * Removes directory separators and special characters
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize user object by removing sensitive fields
 */
export const sanitizeUser = (user: any): any => {
  if (!user) return null;

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];
  const sanitized = { ...user };

  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });

  return sanitized;
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};
