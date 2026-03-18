import { HeraldError } from '../errors/index.js';

/** Validate encrypted email blob length. */
export function validateEncryptedEmail(bytes: Uint8Array): void {
    if (bytes.length === 0) {
        throw new HeraldError('Encrypted email is empty', 6001);
    }
    if (bytes.length > 200) {
        throw new HeraldError(
            `Encrypted email (${bytes.length} bytes) exceeds 200 byte maximum`,
            6000,
        );
    }
}

/** Validate NaCl nonce is exactly 24 bytes. */
export function validateNonce(nonce: Uint8Array): void {
    if (nonce.length !== 24) {
        throw new HeraldError('Nonce must be exactly 24 bytes', 6003);
    }
}

/** Validate email hash is exactly 32 bytes (SHA-256). */
export function validateEmailHash(hash: Uint8Array): void {
    if (hash.length !== 32) {
        throw new HeraldError('Email hash must be exactly 32 bytes', 6002);
    }
}

/** Validate category is 0–3. */
export function validateCategory(category: number): void {
    if (category < 0 || category > 3) {
        throw new HeraldError(
            'Invalid category: must be 0 (DeFi), 1 (Governance), 2 (Marketing), or 3 (Other)',
            6017,
        );
    }
}

/** Validate tier is 0–3. */
export function validateTier(tier: number): void {
    if (tier < 0 || tier > 3) {
        throw new HeraldError(
            'Invalid tier: must be 0 (dev), 1 (growth), 2 (scale), or 3 (enterprise)',
            6007,
        );
    }
}
