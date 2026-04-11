import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
const { decodeUTF8, encodeUTF8 } = naclUtil;
import type { PublicKey } from '@solana/web3.js';
import { deriveX25519FromEd25519, deriveX25519SecretFromEd25519 } from '../encryption/conversion.js';
import { HeraldError } from '../errors/index.js';
import { MAX_ENCRYPTED_TELEGRAM_ID_LEN, MAX_ENCRYPTED_PHONE_LEN } from './types.js';

export interface EncryptChannelResult {
    /** Combined blob: [ephemeral_pubkey(32 bytes) || nacl_box_ciphertext]. */
    encrypted: Uint8Array;
    /** SHA-256 of the plaintext identifier. */
    hash: Uint8Array; // 32 bytes
    /** 24-byte NaCl nonce. */
    nonce: Uint8Array;
}

/**
 * Encrypts a Telegram chat_id for on-chain storage.
 *
 * The Telegram chat_id is an int64, stored as its decimal string representation.
 * Example: "-1001234567890" (group) or "123456789" (user)
 *
 * SECURITY: Must run client-side (browser/portal) only.
 * The plaintext chat_id MUST NOT be sent to Herald servers.
 *
 * @param telegramChatId - Telegram chat ID as a string (decimal integer)
 * @param walletPubkey   - User's Solana wallet public key
 */
export async function encryptTelegramId(
    telegramChatId: string,
    walletPubkey: PublicKey,
): Promise<EncryptChannelResult> {
    // Validate: Telegram chat IDs are integers (positive for users, negative for groups)
    if (!/^-?\d+$/.test(telegramChatId)) {
        throw new HeraldError('Invalid Telegram chat ID format — must be a decimal integer');
    }
    if (telegramChatId.length > 15) {
        throw new HeraldError('Telegram chat ID too long');
    }

    return encryptChannelData(telegramChatId, walletPubkey, MAX_ENCRYPTED_TELEGRAM_ID_LEN);
}

/**
 * Encrypts an E.164 phone number for on-chain storage.
 *
 * Format: "+14155552671" — country code + number, no spaces, no dashes.
 * The Admin API verifies OTP BEFORE the user calls this — the number
 * is pre-validated at the point of encryption.
 *
 * SECURITY: Must run client-side only. Never send plaintext phone to Herald.
 *
 * @param phoneE164    - E.164 formatted phone ("+14155552671")
 * @param walletPubkey - User's Solana wallet public key
 */
export async function encryptPhone(
    phoneE164: string,
    walletPubkey: PublicKey,
): Promise<EncryptChannelResult> {
    // Validate E.164 format: + followed by 7–15 digits
    if (!/^\+[1-9]\d{6,14}$/.test(phoneE164)) {
        throw new HeraldError(
            'Invalid phone number format. Use E.164 format: +14155552671',
        );
    }

    return encryptChannelData(phoneE164, walletPubkey, MAX_ENCRYPTED_PHONE_LEN);
}

/**
 * Core encryption function for any channel identifier.
 * Identical pattern to encryptEmail — same NaCl box scheme.
 */
async function encryptChannelData(
    plaintext: string,
    walletPubkey: PublicKey,
    maxBytes: number,
): Promise<EncryptChannelResult> {
    const x25519Pubkey = deriveX25519FromEd25519(walletPubkey.toBytes());
    const ephemeral = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const plaintextBytes = decodeUTF8(plaintext);
    const ciphertext = nacl.box(plaintextBytes, nonce, x25519Pubkey, ephemeral.secretKey);

    if (!ciphertext) throw new HeraldError('Encryption failed');

    const encrypted = new Uint8Array(32 + ciphertext.length);
    encrypted.set(ephemeral.publicKey, 0);
    encrypted.set(ciphertext, 32);

    if (encrypted.length > maxBytes) {
        throw new HeraldError(`Encrypted data (${encrypted.length}B) exceeds ${maxBytes}B limit`);
    }

    // Compute SHA-256 hash for change detection
    const hash = new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plaintext)),
    );

    // Zero secret key from memory (best-effort in JS)
    ephemeral.secretKey.fill(0);

    return { encrypted, hash, nonce };
}

/**
 * Decrypt Telegram chat_id in the user's browser (for "My Settings" page).
 * Uses the wallet's private key — never runs on Herald servers.
 */
export function decryptTelegramId(
    encryptedData: Uint8Array,
    nonce: Uint8Array,
    walletSecretKey: Uint8Array,
): string {
    return decryptChannelData(encryptedData, nonce, walletSecretKey);
}

/**
 * Decrypt phone number in the user's browser.
 * Uses the wallet's private key — never runs on Herald servers.
 */
export function decryptPhone(
    encryptedData: Uint8Array,
    nonce: Uint8Array,
    walletSecretKey: Uint8Array,
): string {
    return decryptChannelData(encryptedData, nonce, walletSecretKey);
}

function decryptChannelData(
    encryptedData: Uint8Array,
    nonce: Uint8Array,
    walletSecretKey: Uint8Array,
): string {
    if (encryptedData.length < 33) {
        throw new HeraldError('Invalid encrypted data: too short (missing ephemeral pubkey)');
    }

    const ephemeralPubkey = encryptedData.slice(0, 32);
    const ciphertext = encryptedData.slice(32);
    const x25519Secret = deriveX25519SecretFromEd25519(walletSecretKey);
    const decrypted = nacl.box.open(ciphertext, nonce, ephemeralPubkey, x25519Secret);

    if (!decrypted) throw new HeraldError('Decryption failed — wrong key or corrupted data');

    return encodeUTF8(decrypted);
}
