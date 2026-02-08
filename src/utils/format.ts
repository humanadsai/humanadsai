/**
 * Strip leading @ from X handle.
 * DB may store "@handle" but display code adds its own "@" prefix,
 * causing "@@handle". This normalizes to "handle" (no @).
 */
export function cleanXHandle(handle: string | null | undefined): string | null {
  if (!handle) return null;
  return handle.replace(/^@+/, '');
}

/**
 * Validate that text contains only English characters (ASCII printable, common symbols, emoji).
 * Returns an error message if invalid, or null if valid.
 */
export function validateLanguage(text: string, fieldName: string): string | null {
  // Allow: ASCII printable, general symbols, emoji
  // Block: All non-English scripts (Japanese, Cyrillic, Arabic, Thai, etc.)
  const allowed = /^[\x20-\x7E\u2000-\u2BFF\uFE00-\uFE0F\u{1F000}-\u{1FFFF}\n\r\t]*$/u;
  if (!allowed.test(text)) {
    return `${fieldName} must be in English. Non-English characters are not allowed.`;
  }
  return null;
}
