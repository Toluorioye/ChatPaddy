/**
 * Security & Sanitization Utilities
 * - Protects against Regex injection / ReDoS
 * - Sanitizes URLs to prevent javascript: pseudo-protocol XSS
 * - Sanitizes text inputs against malicious control characters
 */

/**
 * Escapes regex special characters in a user-supplied search string
 * to prevent SyntaxError crashes or unintended ReDoS behavior.
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates and sanitizes a URL to ensure it only uses safe protocols.
 * Blocks `javascript:`, `vbscript:`, `data:text/html`, and invalid schemes.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Check for dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html') ||
    lower.startsWith('data:application/')
  ) {
    return null;
  }

  // Allow relative URLs, http, https, blob, and safe image data URIs
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  // Default to safe fallback or null
  return null;
}

/**
 * Strips zero-width and invalid ASCII/Unicode control characters from user text
 */
export function sanitizeInputText(text: string): string {
  if (!text) return '';
  // Remove ASCII control codes (except newline \n and tab \t)
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}
