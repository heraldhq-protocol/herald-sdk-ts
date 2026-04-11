import type { PublicKey } from '@solana/web3.js';

// ── Channel Types ─────────────────────────────────────────────────

export type ChannelType = 'email' | 'telegram' | 'sms';

export interface ChannelSettings {
    email: boolean;
    telegram: boolean;
    sms: boolean;
}

export interface TelegramChannelData {
    /** NaCl box encrypted Telegram chat_id. */
    encryptedTelegramId: Uint8Array;
    /** SHA-256 of the plaintext Telegram chat_id string. */
    telegramIdHash: Uint8Array; // [u8; 32]
    /** NaCl 24-byte nonce for Telegram encryption. */
    nonceTelegram: Uint8Array; // [u8; 24]
}

export interface SmsChannelData {
    /** NaCl box encrypted E.164 phone number. */
    encryptedPhone: Uint8Array;
    /** SHA-256 of the plaintext E.164 phone number. */
    phoneHash: Uint8Array; // [u8; 32]
    /** NaCl 24-byte nonce for phone encryption. */
    nonceSms: Uint8Array; // [u8; 24]
}

// ── Instruction Parameters ────────────────────────────────────────

export interface RegisterTelegramParams {
    /** Wallet owner who already has an IdentityAccount. */
    owner: PublicKey;
    /** Encrypted Telegram channel data. */
    data: TelegramChannelData;
}

export interface RegisterSmsParams {
    /** Wallet owner who already has an IdentityAccount. */
    owner: PublicKey;
    /** Encrypted SMS channel data. */
    data: SmsChannelData;
}

export interface UpdateChannelSettingsParams {
    owner: PublicKey;
    channelEmail?: boolean;
    channelTelegram?: boolean;
    channelSms?: boolean;
}

export interface RemoveChannelParams {
    owner: PublicKey;
    /** Telegram or SMS — email cannot be removed via this instruction. */
    channel: 'telegram' | 'sms';
}

// ── Channel Config (read-only) ───────────────────────────────────

export interface ChannelStatus {
    enabled: boolean;
    registered: boolean;
}

export interface ChannelConfig {
    email: ChannelStatus;
    telegram: ChannelStatus;
    sms: ChannelStatus;
    activeCount: number;
}

// ── Constants ─────────────────────────────────────────────────────

export const MAX_ENCRYPTED_TELEGRAM_ID_LEN = 80;
export const MAX_ENCRYPTED_PHONE_LEN = 65;

export const CHANNEL_NAMES: Record<ChannelType, string> = {
    email: 'Email',
    telegram: 'Telegram',
    sms: 'SMS',
};
