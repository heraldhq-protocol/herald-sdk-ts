import type { AccountMeta, PublicKey } from '@solana/web3.js';

/**
 * Build the remaining accounts list for Light Protocol CPI.
 * These accounts must be appended to the write_receipt transaction
 * using `.remainingAccounts()`.
 *
 * The accounts come from the Light RPC proof response and typically include:
 * - Light System Program
 * - Account Compression Program
 * - Registered Program PDA
 * - Noop program
 * - CPI authority PDA
 * - Merkle tree account(s)
 */
export function buildLightRemainingAccounts(
    proofAccounts: AccountMeta[],
): AccountMeta[] {
    // The proof response from Light RPC provides these pre-built.
    // This function serves as a passthrough with validation.
    return proofAccounts.map((account) => ({
        pubkey: account.pubkey,
        isSigner: account.isSigner,
        isWritable: account.isWritable,
    }));
}
