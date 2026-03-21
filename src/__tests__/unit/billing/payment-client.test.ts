import { describe, it, expect, vi } from 'vitest';
import { PublicKey, Transaction } from '@solana/web3.js';
import { PaymentClient } from '../../../billing/payment/client.js';
import { HeraldError } from '../../../errors/index.js';

vi.mock('../../../clients/read', () => {
    return {
        ReadClient: vi.fn().mockImplementation(() => {
            return {
                fetchProtocolAccount: vi.fn().mockResolvedValue({
                    tier: 1,
                    subscriptionExpiresAt: BigInt(Math.floor(Date.now() / 1000) + 1000000),
                    isSuspended: false
                })
            };
        })
    };
});

describe('PaymentClient', () => {
    const protocolOwner = new PublicKey('11111111111111111111111111111111');
    const payment = new PaymentClient({ rpcUrl: 'http://localhost:8899' });

    // Mock checking balance
    vi.spyOn(payment as any, 'getTokenBalance').mockResolvedValue(100_000_000n);

    it('buildPaySubscription: throws if invalid months', async () => {
        await expect(payment.buildPaySubscription({ protocolOwner, months: 0 }))
            .rejects.toThrow('Months must be between 1 and 12');
    });

    it('calculateCost: applies 10% discount for 12 months', async () => {
        const cost = await payment.calculateCost(protocolOwner, 12, 'USDC');
        expect(cost.discountApplied).toBe('10% annual discount');
    });

    it('calculateCost: calculates total properly for non-discount', async () => {
        const cost = await payment.calculateCost(protocolOwner, 1, 'USDC');
        expect(cost.discountApplied).toBeNull();
        // Growth Tier = $99
        expect(cost.total).toBe('99.00');
    });
});
