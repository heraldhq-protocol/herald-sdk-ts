import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
const { decodeUTF8, encodeUTF8 } = naclUtil;
import { sha512 } from '@noble/hashes/sha512';
import {
    HERALD_DERIVATION_MESSAGE,
    HERALD_ENCLAVE_WRAPPING_PUBKEY,
} from '../constants.js';
import {
    WalletSignError,
    KeyDerivationError,
    DecryptionError,
    EnclaveKeyUnavailableError,
} from './errors.js';
import type { NotificationKeyWallet, SealedKeyMaterial } from './types.js';

/**
 * Derives a deterministic X25519 keypair from the user's wallet.
 *
 * Flow:
 *   1. wallet.signMessage(HERALD_DERIVATION_MESSAGE)
 *   2. SHA-512(signature)[0..32] → X25519 scalar (clamped by nacl)
 *   3. nacl.box.keyPair.fromSecretKey(scalar) → { publicKey, secretKey }
 *
 * The private key is deterministic: the same wallet + same message = same keypair.
 * This allows the user to re-derive their key for decryption without storing it.
 *
 * @security The private key MUST be zeroed after use. Use `zeroPrivateKey()`.
 * @security This function MUST only be called in the user's browser.
 */
export async function deriveX25519Keypair(
    wallet: NotificationKeyWallet,
): Promise<nacl.BoxKeyPair> {
    let signature: Uint8Array;
    try {
        const messageBytes = decodeUTF8(HERALD_DERIVATION_MESSAGE);
        signature = await wallet.signMessage(messageBytes);
    } catch (err) {
        throw new WalletSignError(
            `Wallet signing failed: ${err instanceof Error ? err.message : String(err)}`,
        );
    }

    // SHA-512(signature) → first 32 bytes as X25519 scalar
    const hash = sha512(signature);
    const scalar = hash.slice(0, 32);

    // Zero the full hash immediately — we only need the scalar
    hash.fill(0);
    // Zero the signature — no longer needed
    signature.fill(0);

    try {
        const keypair = nacl.box.keyPair.fromSecretKey(scalar);
        return keypair;
    } catch {
        throw new KeyDerivationError();
    } finally {
        // Zero the scalar copy (nacl.box.keyPair.fromSecretKey keeps its own copy)
        scalar.fill(0);
    }
}

/**
 * Seals the user's X25519 public key for the Herald Enclave.
 *
 * Flow:
 *   1. Derive X25519 keypair from wallet signature
 *   2. Generate random nonce (24 bytes)
 *   3. nacl.box(userPubkey, nonce, enclavePubkey, userSecretKey) → sealed blob (48 bytes)
 *   4. Return { sealedPubkey, senderPubkey, nonce }
 *   5. Zero private key
 *
 * @param wallet - Wallet adapter with signMessage support.
 * @param enclaveWrappingPubkey - Optional override for the enclave's X25519 pubkey.
 *   Defaults to HERALD_ENCLAVE_WRAPPING_PUBKEY from constants.
 * @returns Sealed key material ready for on-chain registration.
 */
export async function sealX25519PubkeyForEnclave(
    wallet: NotificationKeyWallet,
    enclaveWrappingPubkey?: Uint8Array,
): Promise<SealedKeyMaterial> {
    const enclavePub = enclaveWrappingPubkey ?? HERALD_ENCLAVE_WRAPPING_PUBKEY;
    if (enclavePub.length !== 32 || enclavePub.every(b => b === 0)) {
        throw new EnclaveKeyUnavailableError();
    }

    const keypair = await deriveX25519Keypair(wallet);

    try {
        const nonce = nacl.randomBytes(nacl.box.nonceLength); // 24 bytes

        // Seal the user's X25519 pubkey for the enclave
        const sealed = nacl.box(
            keypair.publicKey,      // plaintext: user's X25519 pubkey (32 bytes)
            nonce,                  // random nonce
            enclavePub,             // recipient: enclave's X25519 pubkey
            keypair.secretKey,      // sender: user's X25519 secret key
        );

        if (!sealed) {
            throw new KeyDerivationError('NaCl box sealing failed');
        }

        // sealed = 32 (plaintext) + 16 (Poly1305 MAC) = 48 bytes
        return {
            sealedPubkey: sealed,                    // [u8; 48]
            senderPubkey: keypair.publicKey,          // [u8; 32]
            nonce,                                    // [u8; 24]
        };
    } finally {
        // CRITICAL: Zero private key material
        keypair.secretKey.fill(0);
    }
}

/**
 * Decrypts a notification payload that was encrypted by the Herald Enclave.
 *
 * Flow:
 *   1. Re-derive X25519 keypair from wallet signature
 *   2. nacl.box.open(ciphertext, nonce, enclavePubkey, userSecretKey)
 *   3. Return plaintext
 *   4. Zero private key
 *
 * @param wallet - Wallet adapter with signMessage support.
 * @param ciphertext - NaCl box ciphertext from the enclave.
 * @param nonce - 24-byte nonce used during encryption.
 * @param enclaveWrappingPubkey - Optional override for the enclave's X25519 pubkey.
 * @returns Decrypted plaintext bytes.
 */
export async function decryptNotification(
    wallet: NotificationKeyWallet,
    ciphertext: Uint8Array,
    nonce: Uint8Array,
    enclaveWrappingPubkey?: Uint8Array,
): Promise<Uint8Array> {
    const enclavePub = enclaveWrappingPubkey ?? HERALD_ENCLAVE_WRAPPING_PUBKEY;
    if (enclavePub.length !== 32 || enclavePub.every(b => b === 0)) {
        throw new EnclaveKeyUnavailableError();
    }

    const keypair = await deriveX25519Keypair(wallet);

    try {
        const plaintext = nacl.box.open(
            ciphertext,
            nonce,
            enclavePub,           // sender: enclave's X25519 pubkey
            keypair.secretKey,    // recipient: user's X25519 secret key
        );

        if (!plaintext) {
            throw new DecryptionError();
        }

        return plaintext;
    } finally {
        // CRITICAL: Zero private key material
        keypair.secretKey.fill(0);
    }
}

/**
 * Decrypts a notification payload and parses it as a JSON NotificationBody.
 *
 * @param wallet - Wallet adapter with signMessage support.
 * @param ciphertext - NaCl box ciphertext.
 * @param nonce - 24-byte nonce.
 * @param enclaveWrappingPubkey - Optional enclave pubkey override.
 * @returns Parsed notification body.
 */
export async function decryptNotificationBody(
    wallet: NotificationKeyWallet,
    ciphertext: Uint8Array,
    nonce: Uint8Array,
    enclaveWrappingPubkey?: Uint8Array,
): Promise<{ subject: string; message: string; actionUrl?: string; metadata?: Record<string, string> }> {
    const plaintext = await decryptNotification(wallet, ciphertext, nonce, enclaveWrappingPubkey);
    try {
        const json = encodeUTF8(plaintext);
        return JSON.parse(json);
    } catch {
        throw new DecryptionError('Failed to parse decrypted notification as JSON');
    }
}

/**
 * Helper to zero out a Uint8Array. Use this on any private key material
 * that you've extracted from a function return value.
 */
export function zeroBytes(arr: Uint8Array): void {
    arr.fill(0);
}
