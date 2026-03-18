import type { PublicKey, AccountMeta } from '@solana/web3.js';
import type { ProtocolTier, NotificationCategory } from './accounts.js';

/** Notification opt-in flags. */
export interface OptInFlags {
    optInAll: boolean;
    optInDefi: boolean;
    optInGovernance: boolean;
    optInMarketing: boolean;
}

/** Parameters for register_identity instruction. */
export interface RegisterIdentityParams {
    /** Ed25519 wallet PublicKey of the identity owner (also the payer). */
    owner: PublicKey;
    /** NaCl-encrypted email bytes. Must be 1–200 bytes. NEVER plaintext. */
    encryptedEmail: Uint8Array;
    /** SHA-256 of plaintext email. */
    emailHash: Uint8Array;
    /** NaCl 24-byte nonce used for encryption. */
    nonce: Uint8Array;
    /** Opt-in preferences. */
    optIns: OptInFlags;
    /** Delivery mode. */
    digestMode: boolean;
}

/** All fields are optional — at least one must be provided. */
export interface UpdateIdentityParams {
    owner: PublicKey;
    encryptedEmail?: Uint8Array;
    emailHash?: Uint8Array;
    nonce?: Uint8Array;
    optIns?: Partial<OptInFlags>;
    digestMode?: boolean;
}

export interface DeleteIdentityParams {
    owner: PublicKey;
}

export interface RegisterProtocolParams {
    /** Herald authority PublicKey (must match HERALD_AUTHORITY constant). */
    authority: PublicKey;
    /** Protocol's wallet pubkey — used as PDA seed. */
    protocolOwner: PublicKey;
    /** SHA-256 of the protocol name. */
    nameHash: Uint8Array;
    /** Initial tier. */
    tier: ProtocolTier;
}

export interface DeactivateProtocolParams {
    authority: PublicKey;
    protocolOwner: PublicKey;
}

export interface ReactivateProtocolParams {
    authority: PublicKey;
    protocolOwner: PublicKey;
}

export interface SuspendProtocolParams {
    authority: PublicKey;
    protocolOwner: PublicKey;
}

export interface RenewSubscriptionParams {
    authority: PublicKey;
    protocolOwner: PublicKey;
}

export interface ResetProtocolSendsParams {
    authority: PublicKey;
    protocolOwner: PublicKey;
}

/**
 * Parameters for write_receipt (Light Protocol CPI).
 * The `proof` and `lightRemainingAccounts` are obtained from the
 * Light Protocol RPC before calling this instruction.
 */
export interface WriteReceiptParams {
    authority: PublicKey;
    protocolOwner: PublicKey;
    proof: CompressedProof;
    outputTreeIndex: number;
    recipientHash: Uint8Array;   // SHA-256 of recipient wallet pubkey
    notificationId: Uint8Array;   // UUID v4 as 16 bytes
    category: NotificationCategory;
    lightRemainingAccounts: AccountMeta[];
}

/** Compressed proof from Light Protocol RPC, matching on-chain AnchorCompressedProof. */
export interface CompressedProof {
    a: number[];  // [u8; 32]
    b: number[];  // [u8; 64]
    c: number[];  // [u8; 32]
}
