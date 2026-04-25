/**
 * @herald-protocol/sdk/notification-keys — Notification key management.
 *
 * Sub-path export for sealed X25519 notification key operations:
 * - Key derivation and sealing (client-side crypto)
 * - On-chain registration/rotation/revocation (Anchor instructions)
 * - Client-side notification decryption
 */

// ── Client ────────────────────────────────────────────────────────
export { NotificationKeyClient } from './client.js';

// ── Crypto Primitives ─────────────────────────────────────────────
export {
    deriveX25519Keypair,
    sealX25519PubkeyForEnclave,
    decryptNotification,
    decryptNotificationBody,
    zeroBytes,
} from './crypto.js';

// ── Types ─────────────────────────────────────────────────────────
export type {
    NotificationKeyWallet,
    SealedKeyMaterial,
    KeyStatus,
    RegisterKeyResult,
    EncryptedNotification,
    DecryptedNotification,
    NotificationBody,
} from './types.js';

// ── Errors ────────────────────────────────────────────────────────
export {
    NotificationKeyError,
    WalletSignError,
    KeyDerivationError,
    KeyNotRegisteredError,
    DecryptionError,
    EnclaveKeyUnavailableError,
} from './errors.js';
