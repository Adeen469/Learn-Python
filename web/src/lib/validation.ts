// Pure input validators shared by the API routes. Kept free of Next.js
// imports so they can be unit-tested with the inline .mjs pattern.

/** PyPI package names: 1-100 chars, alphanumerics plus - . _, never
 *  starting or ending with - . or _. */
export function isValidPackageName(name: string): boolean {
  if (name.length < 1 || name.length > 100) return false;
  if (!/^[a-zA-Z0-9_.\-]+$/.test(name)) return false;
  if (/^[-._]/.test(name) || /[-._]$/.test(name)) return false;
  return true;
}
