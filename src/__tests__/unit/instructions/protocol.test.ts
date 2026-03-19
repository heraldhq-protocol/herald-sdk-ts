import { describe, it, expect, vi } from 'vitest';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { buildRegisterProtocolIx } from '../../../instructions/protocol/register.js';
import { buildDeactivateProtocolIx } from '../../../instructions/protocol/deactivate.js';
import { buildReactivateProtocolIx } from '../../../instructions/protocol/reactivate.js';
import { buildSuspendProtocolIx } from '../../../instructions/protocol/suspend.js';
import { findProtocolPda } from '../../../pda/protocol.js';
import { HERALD_PROGRAM_ID, HERALD_AUTHORITY } from '../../../constants.js';
import { ProtocolTier, PROTOCOL_TIERS } from '../../../types/accounts.js';
import type { Program } from '@coral-xyz/anchor';

describe('Instructions - Protocol', () => {
    const mockProgram = {
        programId: HERALD_PROGRAM_ID,
        methods: {
            registerProtocol: vi.fn().mockReturnThis(),
            deactivateProtocol: vi.fn().mockReturnThis(),
            reactivateProtocol: vi.fn().mockReturnThis(),
            suspendProtocol: vi.fn().mockReturnThis(),
            accounts: vi.fn().mockReturnThis(),
            instruction: vi.fn().mockResolvedValue({ keys: [], programId: HERALD_PROGRAM_ID, data: Buffer.alloc(0) }),
        }
    } as unknown as Program;

    const protocolOwner = new PublicKey(new Uint8Array(32).fill(2));
    const [pda] = findProtocolPda(protocolOwner, HERALD_PROGRAM_ID);

    describe('register_protocol', () => {
        it('should build correctly', async () => {
            const params = {
                authority: HERALD_AUTHORITY,
                protocolOwner,
                nameHash: new Uint8Array(32).fill(4),
                tier: PROTOCOL_TIERS.GROWTH,
            };

            const ix = await buildRegisterProtocolIx(mockProgram, params);

            expect(mockProgram.methods.registerProtocol).toHaveBeenCalledWith(
                expect.any(Array),
                PROTOCOL_TIERS.GROWTH
            );

            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                authority: HERALD_AUTHORITY,
                protocolAccount: pda,
                protocolPubkey: protocolOwner,
                systemProgram: SystemProgram.programId,
            });

            expect(ix).toBeDefined();
        });
    });

    describe('deactivate_protocol', () => {
        it('should build correctly', async () => {
            const ix = await buildDeactivateProtocolIx(mockProgram, { authority: HERALD_AUTHORITY, protocolOwner });

            expect(mockProgram.methods.deactivateProtocol).toHaveBeenCalled();
            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                authority: HERALD_AUTHORITY,
                protocolAccount: pda,
            });
            expect(ix).toBeDefined();
        });
    });

    describe('reactivate_protocol', () => {
        it('should build correctly', async () => {
            const ix = await buildReactivateProtocolIx(mockProgram, { authority: HERALD_AUTHORITY, protocolOwner });

            expect(mockProgram.methods.reactivateProtocol).toHaveBeenCalled();
            expect(ix).toBeDefined();
        });
    });

    describe('suspend_protocol', () => {
        it('should build correctly', async () => {
            const ix = await buildSuspendProtocolIx(mockProgram, { authority: HERALD_AUTHORITY, protocolOwner });

            expect(mockProgram.methods.suspendProtocol).toHaveBeenCalled();
            expect(ix).toBeDefined();
        });
    });
});
