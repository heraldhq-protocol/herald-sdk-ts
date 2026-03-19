import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { findProtocolPda } from '../../../pda/protocol.js';
import { HERALD_PROGRAM_ID } from '../../../constants.js';

describe('PDA - protocol', () => {
    it('should correctly derive the protocol registry PDA', () => {
        const protocolOwner = new PublicKey('11111111111111111111111111111111');
        const [pda, bump] = findProtocolPda(protocolOwner, HERALD_PROGRAM_ID);

        expect(pda).toBeInstanceOf(PublicKey);
        expect(bump).toBeGreaterThanOrEqual(0);
        expect(bump).toBeLessThanOrEqual(255);
    });

    it('should derive different PDAs for different protocols', () => {
        const p1 = new PublicKey('11111111111111111111111111111111');
        const p2 = new PublicKey(new Uint8Array(32).fill(2));

        const [pda1] = findProtocolPda(p1, HERALD_PROGRAM_ID);
        const [pda2] = findProtocolPda(p2, HERALD_PROGRAM_ID);

        expect(pda1.toBase58()).not.toBe(pda2.toBase58());
    });
});
