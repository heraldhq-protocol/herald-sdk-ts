import type { PublicKey } from '@solana/web3.js';

/**
 * Compute the recipient_hash for write_receipt: SHA-256 of wallet pubkey bytes.
 * Privacy-preserving: the on-chain receipt stores the hash, not the pubkey.
 */
export async function hashWalletAddress(wallet: PublicKey): Promise<Uint8Array> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(wallet.toBuffer()));
    return new Uint8Array(hashBuffer);
}
