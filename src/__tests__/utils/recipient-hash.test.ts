import { describe, it, expect } from 'vitest';
import { hashWalletAddress } from '../../utils/recipient-hash.js';
import { Keypair } from '@solana/web3.js';

describe('Utils - recipient-hash', () => {
    it('should hash a wallet address deterministically', async () => {
        const kp = Keypair.generate();
        const hash1 = await hashWalletAddress(kp.publicKey);
        const hash2 = await hashWalletAddress(kp.publicKey);

        expect(hash1).toEqual(hash2);
        expect(hash1.length).toBe(32);
        expect(hash1).toBeInstanceOf(Uint8Array);
    });

    it('should produce different hashes for different wallets', async () => {
        const kp1 = Keypair.generate();
        const kp2 = Keypair.generate();

        const hash1 = await hashWalletAddress(kp1.publicKey);
        const hash2 = await hashWalletAddress(kp2.publicKey);

        expect(hash1).not.toEqual(hash2);
    });
});
