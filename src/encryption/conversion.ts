import { convertPublicKey, convertSecretKey } from 'ed2curve';
import { HeraldError } from '../errors/index.js';

/**
 * Converts an Ed25519 public key (Solana wallet key) to X25519 (Curve25519).
 * Required because NaCl box uses X25519 key exchange, not Ed25519.
 */
export function deriveX25519FromEd25519(ed25519Pubkey: Uint8Array): Uint8Array {
    const x25519 = convertPublicKey(ed25519Pubkey);
    if (!x25519) {
        throw new HeraldError(
            'Ed25519 → X25519 key conversion failed. ' +
            'Ensure the input is a valid 32-byte Ed25519 public key.',
        );
    }
    return x25519;
}

/**
 * Converts an Ed25519 secret key to X25519.
 * Used for decryption — the user's wallet secret key is Ed25519.
 */
export function deriveX25519SecretFromEd25519(ed25519Secret: Uint8Array): Uint8Array {
    const x25519 = convertSecretKey(ed25519Secret);
    if (!x25519) {
        throw new HeraldError('Ed25519 → X25519 secret key conversion failed');
    }
    return x25519;
}
