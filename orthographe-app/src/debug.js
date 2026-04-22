/**
 * Debug mode — active automatically on localhost.
 * No URL param needed, no localStorage flag needed.
 */

export function isLocalhost() {
  try {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  } catch {
    return false;
  }
}
