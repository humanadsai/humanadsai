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
 * Validate that text contains only allowed characters (English, Japanese, common symbols).
 * Returns an error message if invalid, or null if valid.
 */
export function validateLanguage(text: string, fieldName: string): string | null {
  // Allow: ASCII, Japanese (Hiragana, Katakana, CJK), common symbols, emoji
  // Block: Cyrillic, Arabic, Thai, etc. to prevent homoglyph attacks
  const allowed = /^[\x20-\x7E\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF\u2000-\u2BFF\uFE00-\uFE0F\u{1F000}-\u{1FFFF}\n\r\t]*$/u;
  if (!allowed.test(text)) {
    return `${fieldName} contains unsupported characters. Only English and Japanese text are currently supported.`;
  }
  return null;
}
