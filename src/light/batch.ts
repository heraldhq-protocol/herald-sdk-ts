import {
    Transaction,
    type Keypair,
    type PublicKey,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { buildWriteReceiptIx } from '../instructions/receipt/write.js';
import { fetchProofForReceipt } from './proof.js';
import { HeraldError } from '../errors/index.js';
import type { WriteReceiptParams } from '../types/instructions.js';

/**
 * Receipt batch processor — accumulates receipts and flushes them
 * as a single Solana transaction (batching up to 10 receipts per tx
 * to amortise the base fee).
 *
 * Uses the ZK Compression V2 API internally via fetchProofForReceipt.
 */
export class ReceiptBatchProcessor {
    private queue: Omit<WriteReceiptParams, 'proof' | 'outputTreeIndex' | 'lightRemainingAccounts'>[] = [];
    private timer: ReturnType<typeof setTimeout> | null = null;
    private readonly MAX_BATCH_SIZE = 10;
    private readonly FLUSH_INTERVAL_MS = 2_000;

    constructor(
        private readonly program: Program,
        private readonly authorityKey: Keypair,
        private readonly lightRpc: any, // Rpc from @lightprotocol/stateless.js >=0.23.0
        private readonly programId: PublicKey, // Herald on-chain program ID for address derivation
        private readonly onFlush?: (signatures: string[]) => void,
        private readonly onError?: (err: HeraldError) => void,
    ) { }

    /**
     * Add a receipt to the batch. Triggers immediate flush if batch is full.
     */
    add(
        params: Omit<WriteReceiptParams, 'proof' | 'outputTreeIndex' | 'lightRemainingAccounts'>,
    ): void {
        this.queue.push(params);

        if (this.queue.length >= this.MAX_BATCH_SIZE) {
            void this.flush();
        } else if (!this.timer) {
            this.timer = setTimeout(() => void this.flush(), this.FLUSH_INTERVAL_MS);
        }
    }

    /**
     * Force flush current queue as a single transaction.
     *
     * Each receipt gets its own proof (proofs are per derived address).
     * All instructions are packed into one transaction to minimise fees.
     */
    async flush(): Promise<string[]> {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.queue.length === 0) return [];

        const batch = this.queue.splice(0, this.MAX_BATCH_SIZE);
        const signatures: string[] = [];

        try {
            // Fetch one proof per receipt (each has a unique derived address).
            // Fetched in parallel for performance.
            const proofResults = await Promise.all(
                batch.map((params) =>
                    fetchProofForReceipt(
                        this.lightRpc,
                        params.notificationId,
                        params.recipientHash,
                        this.programId,
                    ),
                ),
            );

            // Build all instructions
            const instructions = await Promise.all(
                batch.map((params, i) =>
                    buildWriteReceiptIx(this.program, {
                        ...params,
                        proof: proofResults[i].proof,
                        outputTreeIndex: proofResults[i].outputTreeIndex,
                        lightRemainingAccounts: proofResults[i].remainingAccounts,
                    }),
                ),
            );

            const tx = new Transaction().add(...instructions);
            const { blockhash } = await this.program.provider.connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = this.authorityKey.publicKey;

            const sig = await sendAndConfirmTransaction(
                this.program.provider.connection,
                tx,
                [this.authorityKey],
                { commitment: 'confirmed' },
            );

            signatures.push(sig);
            this.onFlush?.(signatures);
        } catch (err) {
            const heraldErr = HeraldError.fromAnchorError(err);
            this.onError?.(heraldErr);
        }

        return signatures;
    }

    /** Stop the batch processor and flush any remaining items. */
    async shutdown(): Promise<void> {
        while (this.queue.length > 0) {
            await this.flush();
        }
    }
}
