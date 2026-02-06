/**
 * Strip leading @ from X handle.
 * DB may store "@handle" but display code adds its own "@" prefix,
 * causing "@@handle". This normalizes to "handle" (no @).
 */
export function cleanXHandle(handle: string | null | undefined): string | null {
  if (!handle) return null;
  return handle.replace(/^@+/, '');
}
