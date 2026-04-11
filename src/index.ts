/**
 * @herald-protocol/sdk — Root barrel export.
 *
 * Re-exports everything for consumers who import from '@herald-protocol/sdk'.
 * Sub-path exports (e.g. '@herald-protocol/sdk/user') provide narrower imports.
 */

// ── Constants ─────────────────────────────────────────────────────
export {
    HERALD_PROGRAM_ID,
    HERALD_AUTHORITY,
    SUBSCRIPTION_PERIOD_SECS,
    MAX_ENCRYPTED_EMAIL_LEN,
    MAX_ENCRYPTED_TELEGRAM_ID_LEN,
    MAX_ENCRYPTED_PHONE_LEN,
    TIER_SEND_LIMITS,
    HERALD_RECEIPT_MERKLE_TREE,
} from './constants.js';

// ── Types ─────────────────────────────────────────────────────────
export * from './types/index.js';

// ── Clients ───────────────────────────────────────────────────────
export { UserClient } from './clients/user.js';
export { AuthorityClient } from './clients/authority.js';
export { ReadClient } from './clients/read.js';
export { BaseClient } from './clients/base.js';

// ── Encryption ────────────────────────────────────────────────────
export {
    encryptEmail,
    decryptEmail,
    deriveX25519FromEd25519,
    deriveX25519SecretFromEd25519,
    hashEmail,
    validateEncryptedEmail,
    validateNonce,
    validateEmailHash,
    validateCategory,
    validateTier,
} from './encryption/index.js';

// ── PDA Utilities ─────────────────────────────────────────────────
export {
    findIdentityPda,
    createIdentityPda,
    findProtocolPda,
    deriveAllIdentityAddresses,
} from './pda/index.js';

// ── Errors ────────────────────────────────────────────────────────
export {
    HeraldError,
    parseAnchorError,
    withHeraldErrorHandling,
    isHeraldErrorCode,
    HERALD_ERROR_CODES,
} from './errors/index.js';

// ── Instructions ──────────────────────────────────────────────────
export {
    buildRegisterIdentityIx,
    buildUpdateIdentityIx,
    buildDeleteIdentityIx,
    buildRegisterProtocolIx,
    buildDeactivateProtocolIx,
    buildReactivateProtocolIx,
    buildSuspendProtocolIx,
    buildRenewSubscriptionIx,
    buildResetProtocolSendsIx,
    buildWriteReceiptIx,
} from './instructions/index.js';

// ── Events ────────────────────────────────────────────────────────
export {
    HeraldEventListener,
    parseHeraldEvent,
    matchesFilter,
} from './events/index.js';

// ── Light Protocol ────────────────────────────────────────────────
export {
    fetchProofForReceipt,
    buildLightRemainingAccounts,
    ReceiptBatchProcessor,
} from './light/index.js';

// ── Channels ──────────────────────────────────────────────────
export {
    ChannelUserClient,
    encryptTelegramId,
    encryptPhone,
    decryptTelegramId,
    decryptPhone,
} from './channels/index.js';

export type {
    ChannelType,
    ChannelSettings,
    ChannelConfig,
    ChannelStatus,
    TelegramChannelData,
    SmsChannelData,
    RegisterTelegramParams,
    RegisterSmsParams,
    UpdateChannelSettingsParams,
    RemoveChannelParams,
} from './channels/index.js';

// ── Herald Developer SDK ──────────────────────────────────────
export {
    Herald,
    type HeraldOptions,
    type HeraldEnvironment,
    type NotifyParams,
    type NotifyResult,
    type NotifyCategory,
    type NotificationStatusResult,
    type BulkNotifyParams,
    type BulkNotifyResult,
} from './herald.js';

// ── Helio Billing ─────────────────────────────────────────────
export {
    HelioBilling,
    type HelioBillingConfig,
    type HelioNetwork,
    type HeraldTier,
    type SubscriptionCheckoutParams,
    type OverageInvoiceParams,
    type CheckoutResult,
} from './billing/index.js';

// ── Utilities ─────────────────────────────────────────────────────
export {
    toHex, fromHex, toBase58, fromBase58,
    getTierName, getSendsLimit, getSendsRemaining, parseTier,
    dateToUnix, unixToDate, nowUnix, isExpired,
    truncateAddress, isValidPubkey,
    sendAndConfirmWithRetry,
    generateNotificationId, uuidToBytes, bytesToUuid,
    hashWalletAddress,
} from './utils/index.js';
