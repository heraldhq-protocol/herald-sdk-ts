import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadClient } from '../../clients/read.js';
import { PublicKey } from '@solana/web3.js';
import { ProtocolTier, PROTOCOL_TIERS } from '../../types/accounts.js';

describe('Clients - ReadClient', () => {
    let client: ReadClient;

    beforeEach(() => {
        client = new ReadClient({ rpcUrl: 'http://localhost:8899' });
    });

    it('should handle isRegistered check based on account info existence', async () => {
        const spy = vi.spyOn(client.connection, 'getAccountInfo').mockResolvedValueOnce({
            data: Buffer.alloc(0), executable: false, lamports: 0, owner: PublicKey.default
        });

        const registered = await client.isRegistered(new PublicKey('11111111111111111111111111111111'));
        expect(registered).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should fetch and deserialize an IdentityAccount', async () => {
        const mockRaw = {
            owner: new PublicKey('11111111111111111111111111111111'),
            encryptedEmail: new Array(50).fill(1),
            emailHash: new Array(32).fill(2),
            nonce: new Array(24).fill(3),
            registeredAt: { toString: () => '1700000000' },
            optInAll: true,
            optInDefi: false,
            optInGovernance: false,
            optInMarketing: false,
            digestMode: false,
            bump: 255
        };

        (client.program.account as any).identityAccount = {
            fetch: vi.fn().mockResolvedValue(mockRaw)
        };

        const result = await client.fetchIdentityAccount(new PublicKey('11111111111111111111111111111111'));

        expect(result).toBeDefined();
        expect(result?.owner.toBase58()).toBe('11111111111111111111111111111111');
        expect(result?.optInAll).toBe(true);
        expect(result?.registeredAt).toBe(1700000000n);
        expect(result?.emailHash).toBeInstanceOf(Uint8Array);
    });

    describe('checkProtocolCanSend', () => {
        it('should deny sending if protocol not found', async () => {
            vi.spyOn(client, 'fetchProtocolAccount').mockResolvedValue(null);

            const result = await client.checkProtocolCanSend(PublicKey.default);
            expect(result.canSend).toBe(false);
            expect(result.reason).toContain('Protocol not registered');
        });

        it('should allow sending with valid metadata', async () => {
            vi.spyOn(client, 'fetchProtocolAccount').mockResolvedValue({
                isActive: true,
                isSuspended: false,
                subscriptionExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 10000), // Future
                tier: PROTOCOL_TIERS.GROWTH,
                sendsThisPeriod: 10n,
            } as any);

            const result = await client.checkProtocolCanSend(PublicKey.default);
            expect(result.canSend).toBe(true);
            expect(result.sendsRemaining).toBe(49990n); // 50,000 - 10
        });

        it('should deny sending if over new tier limits', async () => {
            vi.spyOn(client, 'fetchProtocolAccount').mockResolvedValue({
                isActive: true,
                isSuspended: false,
                subscriptionExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 10000), // Future
                tier: PROTOCOL_TIERS.GROWTH,
                sendsThisPeriod: 50_000n, // At new limit
            } as any);

            const result = await client.checkProtocolCanSend(PublicKey.default);
            expect(result.canSend).toBe(false);
            expect(result.reason).toContain('Send limit reached');
        });
    });
});
