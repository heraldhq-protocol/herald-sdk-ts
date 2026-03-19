import { describe, it, expect, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { buildWriteReceiptIx } from '../../../instructions/receipt/write.js';
import { findProtocolPda } from '../../../pda/protocol.js';
import { HERALD_PROGRAM_ID, HERALD_AUTHORITY } from '../../../constants.js';
import { NOTIFICATION_CATEGORIES } from '../../../types/accounts.js';
import type { Program } from '@coral-xyz/anchor';

describe('Instructions - Receipt', () => {
    const mockProgram = {
        programId: HERALD_PROGRAM_ID,
        methods: {
            writeReceipt: vi.fn().mockReturnThis(),
            accounts: vi.fn().mockReturnThis(),
            remainingAccounts: vi.fn().mockReturnThis(),
            instruction: vi.fn().mockResolvedValue({ keys: [], programId: HERALD_PROGRAM_ID, data: Buffer.alloc(0) }),
        }
    } as unknown as Program;

    const protocolOwner = new PublicKey(new Uint8Array(32).fill(4));
    const [pda] = findProtocolPda(protocolOwner, HERALD_PROGRAM_ID);

    describe('write_receipt', () => {
        it('should build correctly with valid Light Protocol proof accounts', async () => {
            const params = {
                authority: HERALD_AUTHORITY,
                protocolOwner,
                proof: {
                    a: new Array(32).fill(0),
                    b: new Array(64).fill(0),
                    c: new Array(32).fill(0),
                },
                outputTreeIndex: 1,
                recipientHash: new Uint8Array(32).fill(8),
                notificationId: new Uint8Array(16).fill(9),
                category: NOTIFICATION_CATEGORIES.MARKETING,
                lightRemainingAccounts: [
                    { pubkey: new PublicKey(new Uint8Array(32).fill(5)), isSigner: false, isWritable: true }
                ]
            };

            const ix = await buildWriteReceiptIx(mockProgram, params);

            expect(mockProgram.methods.writeReceipt).toHaveBeenCalledWith(
                params.proof,
                params.outputTreeIndex,
                expect.any(Array), // recipientHash
                expect.any(Array), // notificationId
                params.category
            );

            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                authority: HERALD_AUTHORITY,
                protocolAccount: pda,
            });

            expect(mockProgram.methods.remainingAccounts).toHaveBeenCalledWith(params.lightRemainingAccounts);

            expect(ix).toBeDefined();
        });

        it('should throw on validation errors (invalid hash sizes)', async () => {
            const params = {
                authority: HERALD_AUTHORITY,
                protocolOwner,
                proof: { a: [], b: [], c: [] },
                outputTreeIndex: 1,
                recipientHash: new Uint8Array(31), // Invalid length (32 required)
                notificationId: new Uint8Array(16),
                category: NOTIFICATION_CATEGORIES.DEFI,
                lightRemainingAccounts: []
            };

            await expect(buildWriteReceiptIx(mockProgram, params)).rejects.toThrow('Recipient hash must be 32 bytes');

            // Fix recipientHash but break notificationId
            params.recipientHash = new Uint8Array(32);
            params.notificationId = new Uint8Array(15);
            await expect(buildWriteReceiptIx(mockProgram, params)).rejects.toThrow('Notification ID must be 16 bytes');
        });
    });
});
