import { PublicKey } from "@solana/web3.js";

/** Production program ID. Matches on-chain: 2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf */
export const HERALD_PROGRAM_ID = new PublicKey(
  "2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf",
);

/**
 * HERALD_AUTHORITY public key.
 * Server-side signing key stored in AWS KMS.
 * Placeholder [0;32] — MUST be updated before mainnet deployment.
 */
export const HERALD_AUTHORITY = new PublicKey(
  "11111111111111111111111111111111",
);

/** Subscription period duration in seconds (30 days). */
export const SUBSCRIPTION_PERIOD_SECS = 2_592_000;

/** Maximum encrypted email length enforced by the program (bytes). */
export const MAX_ENCRYPTED_EMAIL_LEN = 200;

/** Maximum encrypted Telegram chat_id length enforced by the program (bytes). */
export const MAX_ENCRYPTED_TELEGRAM_ID_LEN = 80;

/** Maximum encrypted E.164 phone number length enforced by the program (bytes). */
export const MAX_ENCRYPTED_PHONE_LEN = 65;

/**
 * Maximum sends per billing period by tier index.
 *   Tier 0 (dev):        1,000 sends / month
 *   Tier 1 (growth):    50,000 sends / month
 *   Tier 2 (scale):    250,000 sends / month
 *   Tier 3 (enterprise): 1,000,000 sends / month
 */
export const TIER_SEND_LIMITS: readonly bigint[] = [
  1_000n,
  50_000n,
  250_000n,
  1_000_000n,
] as const;

/** Herald's dedicated Light Protocol Merkle tree for delivery receipts. */
export const HERALD_RECEIPT_MERKLE_TREE = new PublicKey(
  "11111111111111111111111111111111", // placeholder — set after tree creation
);

// ── Notification Key Constants  ─────────────────────────

/**
 * Herald Nitro Enclave's X25519 wrapping public key.
 * NOT secret — this is the enclave's PUBLIC key used for sealing.
 * Updated via governance when the enclave keypair rotates.
 *
 * ⚠️ Placeholder — TODO: populate after first enclave keygen ceremony.
 */
export const HERALD_ENCLAVE_WRAPPING_PUBKEY = new Uint8Array(32);

/**
 * Exact UTF-8 message users sign for notification key derivation.
 *
 * ⚠️ NEVER change after launch — changing it invalidates all registered keys.
 * The message is designed to be human-readable in wallet signing prompts.
 */
export const HERALD_DERIVATION_MESSAGE =
  "Herald Protocol: Notification Key Registration\n" +
  "This signature derives your encrypted notification keypair.\n" +
  "Only sign this on useherald.xyz or trusted Herald integrations.\n" +
  "Your private key is never exposed.";

/** Current notification key schema version. */
export const CURRENT_NOTIFICATION_KEY_VERSION = 1;

/** Maximum notification key rotations before revoke-and-re-register. */
export const MAX_NOTIFICATION_KEY_ROTATIONS = 1_000;
