import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { HERALD_PROGRAM_ID } from '../../../index.js';
import { NotificationKeyClient } from '../../../notification-keys/client.js';

describe('Notification Key Instructions', () => {
    const owner = new PublicKey('11111111111111111111111111111111');
    const sealedPubkey = new Uint8Array(48).fill(1);
    const senderPubkey = new Uint8Array(32).fill(2);
    const nonce = new Uint8Array(24).fill(3);

    const client = new NotificationKeyClient({
        rpcUrl: 'http://localhost:8899',
        programId: HERALD_PROGRAM_ID.toBase58(),
    });

    it('buildRegisterKeyIxWithData builds instruction correctly', async () => {
        const { ix } = await client.buildRegisterKeyIxWithData(
            owner,
            sealedPubkey,
            senderPubkey,
            nonce,
            1
        );

        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
        expect(ix.keys.length).toBe(2); // owner, identityAccount
        expect(ix.keys[0].pubkey.toBase58()).toBe(owner.toBase58());
        expect(ix.keys[0].isSigner).toBe(true);
        expect(ix.keys[0].isWritable).toBe(true);
    });

    it('buildRotateKeyIxWithData builds instruction correctly', async () => {
        const { ix } = await client.buildRotateKeyIxWithData(
            owner,
            sealedPubkey,
            senderPubkey,
            nonce,
            2
        );

        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
        expect(ix.keys.length).toBe(2); // owner, identityAccount
        expect(ix.keys[0].pubkey.toBase58()).toBe(owner.toBase58());
        expect(ix.keys[0].isSigner).toBe(true);
        expect(ix.keys[0].isWritable).toBe(true);
    });

    it('buildRevokeKeyIx builds instruction correctly', async () => {
        const ix = await client.buildRevokeKeyIx(owner);

        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
        expect(ix.keys.length).toBe(2); // owner, identityAccount
        expect(ix.keys[0].pubkey.toBase58()).toBe(owner.toBase58());
        expect(ix.keys[0].isSigner).toBe(true);
        expect(ix.keys[0].isWritable).toBe(false);
    });

    it('buildMigrateSpaceIx builds instruction correctly', async () => {
        const ix = await client.buildMigrateSpaceIx(owner);

        expect(ix.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
        expect(ix.keys.length).toBe(3); // owner, identityAccount, systemProgram
        expect(ix.keys[0].pubkey.toBase58()).toBe(owner.toBase58());
        expect(ix.keys[0].isSigner).toBe(true);
        expect(ix.keys[0].isWritable).toBe(true);
    });
});
