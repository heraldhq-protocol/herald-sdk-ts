/**
 * Encryption module — browser-safe NaCl box encryption for Herald identity emails.
 *
 * SECURITY: All functions in this module operate on plaintext data
 * and must ONLY be called client-side (in the user's browser).
 */

export { encryptEmail, decryptEmail, type EncryptEmailResult } from './nacl.js';
export { deriveX25519FromEd25519, deriveX25519SecretFromEd25519 } from './conversion.js';
export { hashEmail, type EmailHashResult } from './hashing.js';
export {
    validateEncryptedEmail,
    validateNonce,
    validateEmailHash,
    validateCategory,
    validateTier,
} from './validation.js';
