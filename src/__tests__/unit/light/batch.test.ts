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

// Mock the heavy stateless.js imports used by proof.ts
vi.mock('@lightprotocol/stateless.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@lightprotocol/stateless.js')>();
    return {
        ...actual,
        deriveAddressSeedV2: vi.fn().mockReturnValue(new Uint8Array(32)),
        deriveAddressV2: vi.fn().mockReturnValue(new PublicKey('11111111111111111111111111111111')),
        PackedAccounts: vi.fn().mockImplementation(() => ({
            addSystemAccounts: vi.fn(),
            insertOrGet: vi.fn().mockReturnValue(0),
            toAccountMetas: vi.fn().mockReturnValue({ remainingAccounts: [] }),
        })),
        SystemAccountMetaConfig: { new: vi.fn().mockReturnValue({}) },
        selectStateTreeInfo: vi.fn().mockReturnValue({ tree: new PublicKey('11111111111111111111111111111111') }),
        bn: vi.fn().mockReturnValue({}),
    };
});

const MOCK_PROGRAM_ID = new PublicKey('2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf');

describe('Light Protocol - batching', () => {
    let mockProgram: any;
    let mockLightRpc: any;
    let authority: Keypair;

    beforeEach(() => {
        vi.useFakeTimers();
        authority = Keypair.generate();

        mockProgram = {
            programId: MOCK_PROGRAM_ID,
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
                instruction: vi.fn().mockResolvedValue({ keys: [], programId: MOCK_PROGRAM_ID, data: Buffer.alloc(0) }),
            }
        };

        // V2 Rpc mock — uses getValidityProofV0, getAddressTreeInfoV2, getStateTreeInfos
        mockLightRpc = {
            getAddressTreeInfoV2: vi.fn().mockResolvedValue({
                tree: new PublicKey('11111111111111111111111111111111'),
                queue: new PublicKey('11111111111111111111111111111111'),
            }),
            getValidityProofV0: vi.fn().mockResolvedValue({
                compressedProof: { a: Array(32).fill(0), b: Array(64).fill(0), c: Array(32).fill(0) },
                rootIndices: [0],
            }),
            getStateTreeInfos: vi.fn().mockResolvedValue([{
                tree: new PublicKey('11111111111111111111111111111111'),
                queue: new PublicKey('11111111111111111111111111111111'),
            }]),
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should queue receipts and flush when batch size is reached', async () => {
        const onFlushMock = vi.fn();
        const processor = new ReceiptBatchProcessor(mockProgram, authority, mockLightRpc, MOCK_PROGRAM_ID, onFlushMock);

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

        expect(mockLightRpc.getValidityProofV0).not.toHaveBeenCalled();

        // Add 10th receipt -> should trigger immediate synchronous flush
        processor.add({
            authority: authority.publicKey,
            protocolOwner: authority.publicKey,
            recipientHash: new Uint8Array(32),
            notificationId: new Uint8Array(16),
            category: NOTIFICATION_CATEGORIES.OTHER
        });

        await vi.runAllTimersAsync();

        expect(mockLightRpc.getValidityProofV0).toHaveBeenCalledTimes(10);
        expect(onFlushMock).toHaveBeenCalled();
    });

    it('should flush after the 2-second interval if queue is not full', async () => {
        const onFlushMock = vi.fn();
        const processor = new ReceiptBatchProcessor(mockProgram, authority, mockLightRpc, MOCK_PROGRAM_ID, onFlushMock);

        processor.add({
            authority: authority.publicKey,
            protocolOwner: authority.publicKey,
            recipientHash: new Uint8Array(32),
            notificationId: new Uint8Array(16),
            category: NOTIFICATION_CATEGORIES.DEFI
        });

        expect(mockLightRpc.getValidityProofV0).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(2000);

        expect(mockLightRpc.getValidityProofV0).toHaveBeenCalledTimes(1);
        expect(onFlushMock).toHaveBeenCalled();
    });
});
