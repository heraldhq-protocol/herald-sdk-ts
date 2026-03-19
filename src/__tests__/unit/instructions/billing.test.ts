import { describe, it, expect, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { buildRenewSubscriptionIx } from '../../../instructions/billing/renew.js';
import { buildResetProtocolSendsIx } from '../../../instructions/billing/reset-sends.js';
import { findProtocolPda } from '../../../pda/protocol.js';
import { HERALD_PROGRAM_ID, HERALD_AUTHORITY } from '../../../constants.js';
import type { Program } from '@coral-xyz/anchor';

describe('Instructions - Billing', () => {
    const mockProgram = {
        programId: HERALD_PROGRAM_ID,
        methods: {
            renewSubscription: vi.fn().mockReturnThis(),
            resetProtocolSends: vi.fn().mockReturnThis(),
            accounts: vi.fn().mockReturnThis(),
            instruction: vi.fn().mockResolvedValue({ keys: [], programId: HERALD_PROGRAM_ID, data: Buffer.alloc(0) }),
        }
    } as unknown as Program;

    const protocolOwner = new PublicKey(new Uint8Array(32).fill(3));
    const [pda] = findProtocolPda(protocolOwner, HERALD_PROGRAM_ID);

    describe('renew_subscription', () => {
        it('should build correctly', async () => {
            const ix = await buildRenewSubscriptionIx(mockProgram, { authority: HERALD_AUTHORITY, protocolOwner });

            expect(mockProgram.methods.renewSubscription).toHaveBeenCalled();
            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                authority: HERALD_AUTHORITY,
                protocolAccount: pda,
            });
            expect(ix).toBeDefined();
        });
    });

    describe('reset_protocol_sends', () => {
        it('should build correctly', async () => {
            const ix = await buildResetProtocolSendsIx(mockProgram, { authority: HERALD_AUTHORITY, protocolOwner });

            expect(mockProgram.methods.resetProtocolSends).toHaveBeenCalled();
            expect(mockProgram.methods.accounts).toHaveBeenCalledWith({
                authority: HERALD_AUTHORITY,
                protocolAccount: pda,
            });
            expect(ix).toBeDefined();
        });
    });
});
