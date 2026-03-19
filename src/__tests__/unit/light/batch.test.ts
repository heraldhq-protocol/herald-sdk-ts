import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Keypair, PublicKey } from '@solana/web3.js';
import { ReceiptBatchProcessor } from '../../../light/batch.js';
import { NOTIFICATION_CATEGORIES } from '../../../types/accounts.js';

vi.mock('@solana/web3.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@solana/web3.js')>();
    return {
        ...actual,
        sendAndConfirmTransaction: vi.fn().mockResolvedValue('mock_signature'),
    };
});

describe('Light Protocol - batching', () => {
    let mockProgram: any;
    let mockLightRpc: any;
    let authority: Keypair;

    beforeEach(() => {
        vi.useFakeTimers();
        authority = Keypair.generate();

        mockProgram = {
            programId: new PublicKey('11111111111111111111111111111111'),
            provider: {
                connection: {
                    getLatestBlockhash: vi.fn().mockResolvedValue({ blockhash: 'bh', lastValidBlockHeight: 100 }),
                    sendTransaction: vi.fn().mockResolvedValue('sig'),
                    confirmTransaction: vi.fn(),
                }
            },
            methods: {
                writeReceipt: vi.fn().mockReturnThis(),
                accounts: vi.fn().mockReturnThis(),
                remainingAccounts: vi.fn().mockReturnThis(),
                instruction: vi.fn().mockResolvedValue({ keys: [], programId: new PublicKey('11111111111111111111111111111111'), data: Buffer.alloc(0) }),
            }
        };

        mockLightRpc = {
            getValidityProof: vi.fn().mockResolvedValue({
                compressedProof: { a: [], b: [], c: [] },
                outputTreeIndex: 0,
                remainingAccounts: []
            })
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should queue receipts and flush when batch size is reached', async () => {
        const onFlushMock = vi.fn();
        const processor = new ReceiptBatchProcessor(mockProgram, authority, mockLightRpc, onFlushMock);

        // Add 9 receipts (below limit)
        for (let i = 0; i < 9; i++) {
            processor.add({
                authority: authority.publicKey,
                protocolOwner: authority.publicKey,
                recipientHash: new Uint8Array(32),
                notificationId: new Uint8Array(16),
                category: NOTIFICATION_CATEGORIES.DEFI
            });
        }

        expect(mockLightRpc.getValidityProof).not.toHaveBeenCalled();

        // Add 10th receipt -> should trigger immediate synchronous flush
        processor.add({
            authority: authority.publicKey,
            protocolOwner: authority.publicKey,
            recipientHash: new Uint8Array(32),
            notificationId: new Uint8Array(16),
            category: NOTIFICATION_CATEGORIES.OTHER
        });

        // Because flush is async, we use runAllTimersAsync to let the promise chain complete
        await vi.runAllTimersAsync();

        expect(mockLightRpc.getValidityProof).toHaveBeenCalledTimes(1);
        expect(onFlushMock).toHaveBeenCalled();
    });

    it('should flush after the 2-second interval if queue is not full', async () => {
        const onFlushMock = vi.fn();
        const processor = new ReceiptBatchProcessor(mockProgram, authority, mockLightRpc, onFlushMock);

        processor.add({
            authority: authority.publicKey,
            protocolOwner: authority.publicKey,
            recipientHash: new Uint8Array(32),
            notificationId: new Uint8Array(16),
            category: NOTIFICATION_CATEGORIES.DEFI
        });

        expect(mockLightRpc.getValidityProof).not.toHaveBeenCalled();

        // Advance timer
        await vi.advanceTimersByTimeAsync(2000);

        expect(mockLightRpc.getValidityProof).toHaveBeenCalledTimes(1);
        expect(onFlushMock).toHaveBeenCalled();
    });
});
