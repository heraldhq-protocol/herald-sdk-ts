/**
 * Notification key errors.
 * These are thrown by the SDK when client-side crypto or on-chain operations fail.
 */

/** Base class for notification key errors. */
export class NotificationKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotificationKeyError';
    }
}

/** Thrown when the wallet fails to sign the derivation message. */
export class WalletSignError extends NotificationKeyError {
    constructor(message = 'Wallet rejected or failed to sign the derivation message') {
        super(message);
        this.name = 'WalletSignError';
    }
}

/** Thrown when key derivation (SHA-512 → X25519) fails. */
export class KeyDerivationError extends NotificationKeyError {
    constructor(message = 'Failed to derive X25519 keypair from wallet signature') {
        super(message);
        this.name = 'KeyDerivationError';
    }
}

/** Thrown when the notification key PDA does not exist or has no key registered. */
export class KeyNotRegisteredError extends NotificationKeyError {
    constructor(message = 'No notification key registered for this wallet') {
        super(message);
        this.name = 'KeyNotRegisteredError';
    }
}

/** Thrown when decryption of a notification payload fails. */
export class DecryptionError extends NotificationKeyError {
    constructor(message = 'Failed to decrypt notification — key mismatch or corrupted data') {
        super(message);
        this.name = 'DecryptionError';
    }
}

/** Thrown when the Herald Enclave wrapping pubkey is not configured or invalid. */
export class EnclaveKeyUnavailableError extends NotificationKeyError {
    constructor(message = 'Herald Enclave wrapping pubkey is not configured') {
        super(message);
        this.name = 'EnclaveKeyUnavailableError';
    }
}
