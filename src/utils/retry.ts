import {
    Connection,
    Transaction,
    type Signer,
    type TransactionConfirmationStatus,
} from '@solana/web3.js';
import { HeraldError, parseAnchorError } from '../errors/index.js';
import type { Commitment, TransactionResult } from '../types/config.js';

/**
 * Sends and confirms a transaction with exponential backoff retry.
 * Handles blockhash expiry and network congestion.
 */
export async function sendAndConfirmWithRetry(
    connection: Connection,
    transaction: Transaction,
    signers: Signer[],
    options?: { maxRetries?: number; commitment?: Commitment },
): Promise<TransactionResult> {
    const maxRetries = options?.maxRetries ?? 3;
    const commitment = options?.commitment ?? 'confirmed';
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { blockhash, lastValidBlockHeight } =
                await connection.getLatestBlockhash(commitment);

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = signers[0].publicKey;
            transaction.sign(...signers);

            const rawTx = transaction.serialize();
            const sig = await connection.sendRawTransaction(rawTx, {
                skipPreflight: false,
            });

            const result = await connection.confirmTransaction(
                { signature: sig, blockhash, lastValidBlockHeight },
                commitment,
            );

            if (result.value.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
            }

            return {
                signature: sig,
                slot: result.context.slot,
                confirmation: commitment as TransactionConfirmationStatus,
            };
        } catch (err) {
            lastError = err;

            // Don't retry on program errors (they'll fail again)
            if (isProgramError(err)) throw parseAnchorError(err);

            // Exponential backoff for transient errors
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            await sleep(delay);
        }
    }

    throw parseAnchorError(lastError);
}

/** Check if an error is a deterministic program error (not worth retrying). */
function isProgramError(err: unknown): boolean {
    if (err && typeof err === 'object') {
        const logs = (err as any).logs as string[] | undefined;
        if (logs?.some((l: string) => l.includes('custom program error'))) return true;
        if ('code' in err && typeof (err as any).code === 'number') return true;
    }
    return false;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
