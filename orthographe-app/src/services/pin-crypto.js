/**
 * PIN hashing with SHA-256 + per-user salt.
 * Uses the native Web Crypto API — zero dependencies.
 */

function generateSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a PIN with a new random salt.
 * @param {string} pin - The 4-digit PIN
 * @returns {Promise<{ salt: string, hash: string }>}
 */
export async function hashPin(pin) {
  const salt = generateSalt();
  const hash = await sha256(salt + pin);
  return { salt, hash };
}

/**
 * Verify a PIN against a stored salt+hash.
 * @param {string} pin - The entered PIN
 * @param {string} salt - The stored salt
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin, salt, hash) {
  const computed = await sha256(salt + pin);
  return computed === hash;
}
