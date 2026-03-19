import { describe, it, expect } from 'vitest';
import { UserClient } from '../../clients/user.js';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { HERALD_PROGRAM_ID } from '../../constants.js';

describe('Clients - UserClient', () => {
    const config = { rpcUrl: 'http://localhost:8899' };
    const client = new UserClient(config);
    const owner = new PublicKey('11111111111111111111111111111111');

    it('should expose registerIdentity', async () => {
        const ix = await client.registerIdentity({
            owner,
            encryptedEmail: new Uint8Array(50),
            emailHash: new Uint8Array(32),
            nonce: new Uint8Array(24),
            optIns: { optInAll: true, optInDefi: false, optInGovernance: false, optInMarketing: false },
            digestMode: false
        });

        expect(ix).toBeInstanceOf(TransactionInstruction);
        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
    });

    it('should expose updateIdentity', async () => {
        const ix = await client.updateIdentity({
            owner,
            digestMode: true
        });

        expect(ix).toBeInstanceOf(TransactionInstruction);
        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
    });

    it('should expose deleteIdentity', async () => {
        const ix = await client.deleteIdentity({ owner });

        expect(ix).toBeInstanceOf(TransactionInstruction);
        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
    });
});
