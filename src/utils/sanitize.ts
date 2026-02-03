// src/utils/sanitize.ts
// Placeholder for sanitize utility
// TODO: Implement sanitization functionality

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Strip HTML tags from string
 */
export const stripHTML = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};
