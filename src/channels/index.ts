/**
 * Channels module — multi-channel registration and encryption for Herald identities.
 *
 * Sub-path: `@herald-protocol/sdk/channels`
 *
 * SECURITY: Encryption functions in this module operate on plaintext data
 * and must ONLY be called client-side (in the user's browser).
 */

// ── Types ─────────────────────────────────────────────────────────
export type {
    ChannelType,
    ChannelSettings,
    TelegramChannelData,
    SmsChannelData,
    RegisterTelegramParams,
    RegisterSmsParams,
    UpdateChannelSettingsParams,
    RemoveChannelParams,
    ChannelConfig,
    ChannelStatus,
} from './types.js';

export {
    MAX_ENCRYPTED_TELEGRAM_ID_LEN,
    MAX_ENCRYPTED_PHONE_LEN,
    CHANNEL_NAMES,
} from './types.js';

// ── Encryption ────────────────────────────────────────────────────
export {
    encryptTelegramId,
    encryptPhone,
    decryptTelegramId,
    decryptPhone,
    type EncryptChannelResult,
} from './encryption.js';

// ── Client ────────────────────────────────────────────────────────
export { ChannelUserClient } from './client.js';
