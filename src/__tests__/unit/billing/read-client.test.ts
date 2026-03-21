import { describe, it, expect, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { BillingReadClient } from '../../../billing/read/client.js';

describe('BillingReadClient', () => {
    const billing = new BillingReadClient({ rpcUrl: 'http://localhost:8899' });
    const owner = new PublicKey('11111111111111111111111111111111');

    it('canSend: returns false if not registered', async () => {
        vi.spyOn(billing as any, 'fetchProtocolAccountRaw').mockResolvedValue(null);
        const result = await billing.canSend(owner);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('not registered');
    });

    it('canSend: returns false if expired', async () => {
        const past = BigInt(Math.floor(Date.now() / 1000) - 86400);
        vi.spyOn(billing as any, 'fetchProtocolAccountRaw').mockResolvedValue({
            subscriptionExpiresAt: past,
            isActive: true,
            isSuspended: false,
            tier: 1,
            sendsThisPeriod: 0n,
            lifetimeUsdcPaid: 0n
        });
        const result = await billing.canSend(owner);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('expired');
    });

    it('getSubscriptionStatus: correctly calculates sendsRemaining', async () => {
        vi.spyOn(billing as any, 'fetchProtocolAccountRaw').mockResolvedValue({
            subscriptionExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400),
            isActive: true,
            isSuspended: false,
            tier: 1, // Limit 50,000
            sendsThisPeriod: 38_000n,
            lifetimeUsdcPaid: 0n
        });
        const status = await billing.getSubscriptionStatus(owner);
        expect(status!.sendsRemaining).toBe(12_000n);
        expect(status!.usagePercent).toBe(76); // 38000 / 50000
    });

    it('getAllTierInfo: returns complete info for all 4 tiers', () => {
        const tiers = billing.getAllTierInfo();
        expect(tiers).toHaveLength(4);
        expect(tiers[0].name).toBe('Developer');
        expect(tiers[3].priceUsdMonthly).toBe(999);
    });
});
