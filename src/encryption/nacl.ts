import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
const { decodeUTF8, encodeUTF8 } = naclUtil;
import type { PublicKey } from '@solana/web3.js';
import { deriveX25519FromEd25519, deriveX25519SecretFromEd25519 } from './conversion.js';
import { HeraldError } from '../errors/index.js';

export interface EncryptEmailResult {
    /**
     * Combined blob: [ephemeral_pubkey(32 bytes) || nacl_box_ciphertext].
     * This is what gets stored in IdentityAccount.encrypted_email.
     * Max 200 bytes total (enforced on-chain).
     */
    encryptedEmail: Uint8Array;
    /**
     * 24-byte random NaCl nonce.
     * Stored separately in IdentityAccount.nonce.
     */
    nonce: Uint8Array;
}

/**
 * Encrypts an email address using the wallet's public key.
 *
 * Flow:
 *   1. Convert Ed25519 wallet pubkey → X25519 (Curve25519) pubkey
 *   2. Generate random ephemeral NaCl keypair
 *   3. Generate random 24-byte nonce
 *   4. nacl.box(email_bytes, nonce, recipient_x25519, ephemeral_secret_key)
 *   5. Prepend ephemeral pubkey (32 bytes) to ciphertext
 *
 * @param email - Plaintext email address.
 * @param walletPubkey - The user's Solana Ed25519 public key.
 * @returns Encrypted blob + nonce for on-chain storage.
 *
 * @security This function MUST only be called in the user's browser.
 * @security The plaintext email and ephemeral secret key never leave this function.
 */
export function encryptEmail(
    email: string,
    walletPubkey: PublicKey,
): EncryptEmailResult {
    // 1. Ed25519 → X25519 conversion
    const x25519Pubkey = deriveX25519FromEd25519(walletPubkey.toBytes());

    // 2. Generate ephemeral keypair — used as sender in nacl.box
    const ephemeral = nacl.box.keyPair();

    // 3. Random 24-byte nonce
    const nonce = nacl.randomBytes(nacl.box.nonceLength); // 24 bytes

    // 4. Encode email as UTF-8 and encrypt
    const emailBytes = decodeUTF8(email);
    const ciphertext = nacl.box(emailBytes, nonce, x25519Pubkey, ephemeral.secretKey);

    if (!ciphertext) {
        throw new HeraldError('NaCl box encryption failed — check recipient key');
    }

    // 5. Combine: ephemeral_pubkey (32) || ciphertext
    const encryptedEmail = new Uint8Array(32 + ciphertext.length);
    encryptedEmail.set(ephemeral.publicKey, 0);
    encryptedEmail.set(ciphertext, 32);

    // Validate final size constraint
    if (encryptedEmail.length > 200) {
        throw new HeraldError(
            `Encrypted email (${encryptedEmail.length} bytes) exceeds 200 byte maximum. ` +
            `Email address is too long.`,
            6000,
        );
    }

    // Zero out ephemeral secret key from memory (best-effort in JS)
    ephemeral.secretKey.fill(0);

    return { encryptedEmail, nonce };
}

/**
 * Decrypts an email address using the wallet's private key.
 * Called in the user's browser when they want to read their stored email.
 *
 * @param encryptedEmail - Combined blob from IdentityAccount.encrypted_email.
 * @param nonce - 24-byte nonce from IdentityAccount.nonce.
 * @param walletSecretKey - The user's Ed25519 secret key (64 bytes from wallet).
 */
export function decryptEmail(
    encryptedEmail: Uint8Array,
    nonce: Uint8Array,
    walletSecretKey: Uint8Array,
): string {
    if (encryptedEmail.length < 33) {
        throw new HeraldError('Invalid encrypted email: too short (missing ephemeral pubkey)');
    }

    // Extract ephemeral pubkey (first 32 bytes)
    const ephemeralPubkey = encryptedEmail.slice(0, 32);
    const ciphertext = encryptedEmail.slice(32);

    // Convert Ed25519 secret key → X25519 for nacl.box.open
    const x25519Secret = deriveX25519SecretFromEd25519(walletSecretKey);

    const decrypted = nacl.box.open(ciphertext, nonce, ephemeralPubkey, x25519Secret);

    if (!decrypted) {
        throw new HeraldError('Decryption failed — wrong key or corrupted data');
    }

    return encodeUTF8(decrypted);
}
