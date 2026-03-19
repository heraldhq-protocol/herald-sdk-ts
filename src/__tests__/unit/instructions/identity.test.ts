import { describe, it, expect, vi } from 'vitest';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { buildRegisterIdentityIx } from '../../../instructions/identity/register.js';
import { buildUpdateIdentityIx } from '../../../instructions/identity/update.js';
import { buildDeleteIdentityIx } from '../../../instructions/identity/delete.js';
import { findIdentityPda } from '../../../pda/identity.js';
import { HERALD_PROGRAM_ID } from '../../../constants.js';
import type { Program } from '@coral-xyz/anchor';

describe('Instructions - Identity', () => {
    // Mock anchor program interface for builder chaining
    const mockProgram = {
        programId: HERALD_PROGRAM_ID,
        methods: {
            registerIdentity: vi.fn().mockReturnThis(),
            updateIdentity: vi.fn().mockReturnThis(),
            deleteIdentity: vi.fn().mockReturnThis(),
            accounts: vi.fn().mockReturnThis(),
            instruction: vi.fn().mockResolvedValue({ keys: [], programId: HERALD_PROGRAM_ID, data: Buffer.alloc(0) }),
        }
    } as unknown as Program;

    const owner = new PublicKey('11111111111111111111111111111111');
    const [pda] = findIdentityPda(owner, HERALD_PROGRAM_ID);

    describe('register_identity', () => {
        it('should build correctly with valid params', async () => {
            const params = {
                owner,
                encryptedEmail: new Uint8Array(50).fill(1),
                emailHash: new Uint8Array(32).fill(2),
                nonce: new Uint8Array(24).fill(3),
                optIns: { optInAll: true, optInDefi: false, optInGovernance: true, optInMarketing: false },
                digestMode: true,
            };

            const ix = await buildRegisterIdentityIx(mockProgram, params);

            expect(mockProgram.methods.registerIdentity).toHaveBeenCalledWith(
                expect.any(Buffer),
                expect.any(Array),
                expect.any(Array),
                true, false, true, false, true
            );

            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                owner,
                identityAccount: pda,
                systemProgram: SystemProgram.programId,
            });

            expect(ix).toBeDefined();
        });

        it('should throw on validation failure', async () => {
            const params = {
                owner,
                encryptedEmail: new Uint8Array(0), // Too short
                emailHash: new Uint8Array(32).fill(2),
                nonce: new Uint8Array(24).fill(3),
                optIns: { optInAll: true, optInDefi: false, optInGovernance: true, optInMarketing: false },
                digestMode: true,
            };

            await expect(buildRegisterIdentityIx(mockProgram, params)).rejects.toThrow();
        });
    });

    describe('update_identity', () => {
        it('should build correctly with partial params', async () => {
            const params = {
                owner,
                digestMode: false
            };

            const ix = await buildUpdateIdentityIx(mockProgram, params);

            // Unprovided args should pass null to anchor
            expect(mockProgram.methods.updateIdentity).toHaveBeenCalledWith(
                null, null, null, null, null, null, null, false
            );

            expect(ix).toBeDefined();
        });

        it('should throw if no fields are provided', async () => {
            await expect(buildUpdateIdentityIx(mockProgram, { owner })).rejects.toThrow('Update must modify at least one field');
        });
    });

    describe('delete_identity', () => {
        it('should build correctly', async () => {
            const ix = await buildDeleteIdentityIx(mockProgram, { owner });

            expect(mockProgram.methods.deleteIdentity).toHaveBeenCalled();
            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                owner,
                identityAccount: pda,
            });

            expect(ix).toBeDefined();
        });
    });
});
