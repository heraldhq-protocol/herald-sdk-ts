import type { PublicKey } from '@solana/web3.js';

// ── Wallet adapter interface ─────────────────────────────────────

/** Minimal wallet adapter interface for notification key operations. */
export interface NotificationKeyWallet {
    /** The wallet's Ed25519 public key. */
    publicKey: PublicKey;
    /** Sign an arbitrary message. Returns the Ed25519 signature. */
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}

// ── Sealed key material ──────────────────────────────────────────

/** Result of sealing the user's X25519 pubkey for the enclave. */
export interface SealedKeyMaterial {
    /** NaCl box ciphertext of the user's X25519 pubkey (48 bytes). */
    sealedPubkey: Uint8Array;
    /** User's X25519 public key in plaintext (32 bytes). */
    senderPubkey: Uint8Array;
    /** NaCl box nonce used during sealing (24 bytes). */
    nonce: Uint8Array;
}

// ── Key status ───────────────────────────────────────────────────

/** On-chain notification key status read from the IdentityAccount PDA. */
export interface KeyStatus {
    /** Whether a notification key is registered (sealed pubkey is non-zero). */
    isRegistered: boolean;
    /** Key schema version. Null if not registered. */
    version: number | null;
    /** Unix timestamp of last key update. Null if not registered. */
    updatedAt: Date | null;
    /** Number of times the key has been rotated. Null if not registered. */
    rotationCount: number | null;
}

// ── Registration result ──────────────────────────────────────────

/** Result of registering or rotating a notification key. */
export interface RegisterKeyResult {
    /** Transaction signature. */
    signature: string;
    /** The user's X25519 public key that was registered. */
    senderPubkey: Uint8Array;
}

// ── Encrypted notification ───────────────────────────────────────

/** An encrypted notification payload from the Herald API. */
export interface EncryptedNotification {
    /** Notification ID. */
    id: string;
    /** NaCl box ciphertext of the notification body. */
    ciphertext: Uint8Array;
    /** NaCl box nonce used during encryption. */
    nonce: Uint8Array;
    /** Protocol that sent the notification. */
    protocol: string;
    /** Notification category (defi, governance, marketing, system). */
    category: string;
    /** ISO 8601 timestamp. */
    createdAt: string;
}

/** A decrypted notification. */
export interface DecryptedNotification {
    /** Notification ID. */
    id: string;
    /** Decrypted notification body. */
    body: NotificationBody;
    /** Protocol that sent the notification. */
    protocol: string;
    /** Notification category. */
    category: string;
    /** ISO 8601 timestamp. */
    createdAt: string;
}

/** Structure of a decrypted notification body. */
export interface NotificationBody {
    /** Notification subject/title. */
    subject: string;
    /** Notification message content. */
    message: string;
    /** Optional URL for a call-to-action. */
    actionUrl?: string;
    /** Optional metadata key-value pairs. */
    metadata?: Record<string, string>;
}
