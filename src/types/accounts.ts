import type { PublicKey } from '@solana/web3.js';

// ── Enums ─────────────────────────────────────────────────────────

export const PROTOCOL_TIERS = {
    DEV: 0,
    GROWTH: 1,
    SCALE: 2,
    ENTERPRISE: 3,
} as const;
export type ProtocolTier = (typeof PROTOCOL_TIERS)[keyof typeof PROTOCOL_TIERS];

export const NOTIFICATION_CATEGORIES = {
    DEFI: 0,
    GOVERNANCE: 1,
    MARKETING: 2,
    OTHER: 3,
} as const;
export type NotificationCategory =
    (typeof NOTIFICATION_CATEGORIES)[keyof typeof NOTIFICATION_CATEGORIES];

/** Human-readable tier metadata. */
export const TIER_METADATA: Record<
    ProtocolTier,
    { name: string; sendsLimit: bigint; priceUsd: number | null }
> = {
    [PROTOCOL_TIERS.DEV]: { name: 'Developer', sendsLimit: 1_000n, priceUsd: null },
    [PROTOCOL_TIERS.GROWTH]: { name: 'Growth', sendsLimit: 50_000n, priceUsd: 99 },
    [PROTOCOL_TIERS.SCALE]: { name: 'Scale', sendsLimit: 250_000n, priceUsd: 299 },
    [PROTOCOL_TIERS.ENTERPRISE]: { name: 'Enterprise', sendsLimit: 1_000_000n, priceUsd: 999 },
};

// ── Account Types ─────────────────────────────────────────────────

/**
 * On-chain IdentityAccount — mirrors Rust struct exactly.
 * PDA seeds: ["identity", owner_pubkey]
 */
export interface IdentityAccount {
    /** Wallet pubkey that owns this identity. */
    owner: PublicKey;
    /** NaCl box-encrypted email. Max 200 bytes. Never store plaintext. */
    encryptedEmail: Uint8Array;
    /** SHA-256 of the plaintext email. Used for change detection. */
    emailHash: Uint8Array; // [u8; 32]
    /** NaCl encryption nonce. 24 bytes. */
    nonce: Uint8Array; // [u8; 24]
    /** Unix timestamp of first registration. */
    registeredAt: bigint;     // i64
    /** Global opt-in for all notification categories. */
    optInAll: boolean;
    /** DeFi category opt-in. */
    optInDefi: boolean;
    /** Governance category opt-in. */
    optInGovernance: boolean;
    /** Marketing category opt-in. */
    optInMarketing: boolean;
    /** If true, notifications are batched into daily digest. */
    digestMode: boolean;
    /** PDA canonical bump. */
    bump: number;

    // ── Channel fields (multi-channel extension) ──────────────────
    /** Email channel enabled (default true for all accounts). */
    channelEmail: boolean;
    /** Telegram channel enabled. */
    channelTelegram: boolean;
    /** SMS channel enabled. */
    channelSms: boolean;
    /** NaCl box encrypted Telegram chat_id. Empty = not registered. */
    encryptedTelegramId: Uint8Array;
    /** SHA-256 of the Telegram chat_id string. */
    telegramIdHash: Uint8Array; // [u8; 32]
    /** NaCl nonce for Telegram encryption. */
    nonceTelegram: Uint8Array; // [u8; 24]
    /** NaCl box encrypted E.164 phone number. Empty = not registered. */
    encryptedPhone: Uint8Array;
    /** SHA-256 of the E.164 phone number. */
    phoneHash: Uint8Array; // [u8; 32]
    /** NaCl nonce for phone encryption. */
    nonceSms: Uint8Array; // [u8; 24]

    // ── Notification Key (Option C: Sealed PDA + Enclave-Only Access) ──
    /** NaCl box ciphertext of user's X25519 pubkey. 48 bytes = 32 + 16 MAC. All zeros = not registered. */
    sealedX25519Pubkey: Uint8Array; // [u8; 48]
    /** User's X25519 public key in plaintext. Needed by enclave for box.open. */
    senderX25519Pubkey: Uint8Array; // [u8; 32]
    /** NaCl box nonce used during sealing. */
    notificationNonce: Uint8Array; // [u8; 24]
    /** Notification key schema version. */
    notificationKeyVersion: number; // u8
    /** Unix timestamp of last notification key registration or rotation. */
    notificationKeyUpdatedAt: bigint; // i64
    /** Number of times the notification key has been rotated. */
    notificationKeyRotationCount: number; // u32
}

/**
 * On-chain ProtocolRegistryAccount — mirrors Rust struct.
 * PDA seeds: ["protocol", protocol_pubkey]
 */
export interface ProtocolRegistryAccount {
    /** Protocol admin wallet. */
    owner: PublicKey;
    /** SHA-256 of protocol name. Name itself stored off-chain. */
    nameHash: Uint8Array; // [u8; 32]
    /** Tier: 0=dev, 1=growth, 2=scale, 3=enterprise. */
    tier: ProtocolTier;
    /** Unix timestamp of subscription expiry. 0 = never subscribed. */
    subscriptionExpiresAt: bigint;
    /** Unix timestamp of last renewal. */
    lastRenewedAt: bigint;
    /** Total completed billing periods. */
    periodsPaid: number;     // u32
    /** Sends used in the current billing period. */
    sendsThisPeriod: bigint;     // u64
    /** Whether protocol can currently send. */
    isActive: boolean;
    /** Hard-suspended by Herald authority (ToS violation). */
    isSuspended: boolean;
    /** Unix timestamp of registration. */
    registeredAt: bigint;
    /** PDA canonical bump. */
    bump: number;
}

/**
 * DeliveryReceipt — ZK-compressed account (Light Protocol).
 * NOT a standard PDA. Append-only to a Merkle tree.
 */
export interface DeliveryReceipt {
    /** The protocol that sent the notification. */
    protocolPubkey: PublicKey;
    /** SHA-256 of the recipient's wallet pubkey (privacy-preserving). */
    recipientHash: Uint8Array; // [u8; 32]
    /** UUID v4 — 16 bytes. Off-chain idempotency key. */
    notificationId: Uint8Array; // [u8; 16]
    /** Unix timestamp of delivery. */
    timestamp: bigint;
    /** Always true (presence in tree = proof of delivery). */
    delivered: boolean;
    /** 0=DeFi, 1=Governance, 2=Marketing, 3=Other. */
    category: NotificationCategory;
}
