import { PublicKey } from "@solana/web3.js";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  TODO(#prod): PRE-MAINNET CREDENTIAL CHECKLIST                          ║
// ║                                                                          ║
// ║  Before deploying to mainnet, replace ALL placeholder values below:      ║
// ║                                                                          ║
// ║  1. HERALD_AUTHORITY         — Set to real KMS-backed authority pubkey   ║
// ║  2. HERALD_ENCLAVE_WRAPPING_PUBKEY — Set after enclave keygen ceremony  ║
// ║  3. HERALD_RECEIPT_MERKLE_TREE     — Set after Light Protocol tree init ║
// ║                                                                          ║
// ║  Also update in herald-privacy-registry/src/constants.rs:               ║
// ║  4. HERALD_AUTHORITY         — Must match this SDK value                ║
// ║  5. HERALD_TREASURY          — Set to real Squads multisig PDA          ║
// ║                                                                          ║
// ║  And in herald-user-portal/.env.prod:                                   ║
// ║  6. NEXT_PUBLIC_ENCLAVE_TEST_PUBKEY_HEX — Remove (prod uses SDK const) ║
// ║  7. NEXT_PUBLIC_ENCLAVE_MODE            — Remove or set to "production" ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Production program ID. Matches on-chain: 2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf */
export const HERALD_PROGRAM_ID = new PublicKey(
  "2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf",
);

/**
 * HERALD_AUTHORITY public key.
 * Server-side signing key stored in AWS KMS.
 *
 * TODO(#prod): Replace with real KMS-backed authority pubkey before mainnet.
 * Current value is the system program (all zeros) — placeholder only.
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

/**
 * Herald's dedicated Light Protocol Merkle tree for delivery receipts.
 *
 * TODO(#prod): Replace with real Merkle tree address after tree creation on mainnet.
 */
export const HERALD_RECEIPT_MERKLE_TREE = new PublicKey(
  "11111111111111111111111111111111", // placeholder — set after tree creation
);

// ── Notification Key Constants  ─────────────────────────

/**
 * Herald Nitro Enclave's X25519 wrapping public key.
 * NOT secret — this is the enclave's PUBLIC key used for sealing.
 * Updated via governance when the enclave keypair rotates.
 *
 * TODO(#prod): Populate with the real 32-byte X25519 pubkey after the first
 * enclave keygen ceremony. Without this, production clients cannot seal
 * notification keys and will throw EnclaveKeyUnavailableError.
 *
 * To generate: run the enclave keygen script, then paste the hex output here
 * converted to a Uint8Array, e.g.:
 *   new Uint8Array([0xab, 0xcd, ...])
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
