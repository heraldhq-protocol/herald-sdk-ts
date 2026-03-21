import { PublicKey } from '@solana/web3.js';
import { BaseClient } from '../../clients/base.js';
import { findProtocolPda } from '../../pda/index.js';
import { TIER_SEND_LIMITS } from '../../constants.js';
import type { SubscriptionStatus, UsageStats, TierInfo } from '../types.js';
import { HERALD_TIER_INFO } from '../utils.js';
import type { ProtocolTier } from '../../types/accounts.js';

/**
 * BillingReadClient — all read-only subscription and billing queries.
 */
export class BillingReadClient extends BaseClient {

    /**
     * Get complete subscription status for a protocol.
     * Includes tier, expiry, usage, and quota information.
     */
    async getSubscriptionStatus(protocolOwner: PublicKey): Promise<SubscriptionStatus | null> {
        const [pda] = findProtocolPda(protocolOwner, new PublicKey(this.config.programId));
        const account = await this.fetchProtocolAccountRaw(pda);
        if (!account) return null;

        const expiresAt = account.subscriptionExpiresAt > 0n
            ? new Date(Number(account.subscriptionExpiresAt) * 1000)
            : null;
        const daysRemaining = expiresAt
            ? Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000)
            : null;

        const sendsLimit = BigInt(TIER_SEND_LIMITS[account.tier]);
        const sendsRemaining = sendsLimit > account.sendsThisPeriod
            ? sendsLimit - account.sendsThisPeriod
            : 0n;
        const usagePercent = Number(account.sendsThisPeriod * 100n / sendsLimit);

        return {
            protocolPubkey: protocolOwner.toBase58(),
            tier: account.tier as ProtocolTier,
            tierName: HERALD_TIER_INFO[account.tier as ProtocolTier].name,
            isActive: account.isActive,
            isSuspended: account.isSuspended,
            subscriptionExpiresAt: expiresAt,
            daysRemaining,
            isExpired: expiresAt !== null && expiresAt < new Date(),
            sendsThisPeriod: account.sendsThisPeriod,
            sendsLimit,
            sendsRemaining,
            usagePercent: Math.min(100, usagePercent),
            lifetimeUsdcPaid: account.lifetimeUsdcPaid ?? 0n,
            lifetimeUsdcDisplay: this.formatUsdc(account.lifetimeUsdcPaid ?? 0n),
            periodsPaid: account.periodsPaid,
        };
    }

    /**
     * Get current period usage statistics.
     */
    async getUsageStats(protocolOwner: PublicKey): Promise<UsageStats | null> {
        const status = await this.getSubscriptionStatus(protocolOwner);
        if (!status) return null;

        const overage = status.sendsRemaining === 0n
            ? 'Quota exceeded — upgrade your plan'
            : 'No overage';

        return {
            sendsThisPeriod: status.sendsThisPeriod,
            sendsLimit: status.sendsLimit,
            sendsRemaining: status.sendsRemaining,
            usagePercent: status.usagePercent,
            estimatedOverage: overage,
            periodResetAt: null, // Herald backend knows this; not on-chain
        };
    }

    /**
     * Check if a protocol can send a notification right now.
     * Fast path for the Herald gateway — reads from on-chain state.
     */
    async canSend(protocolOwner: PublicKey): Promise<{
        allowed: boolean;
        reason?: string;
        remaining?: bigint;
    }> {
        const status = await this.getSubscriptionStatus(protocolOwner);

        if (!status) return { allowed: false, reason: 'Protocol not registered' };
        if (status.isSuspended) return { allowed: false, reason: 'Protocol suspended' };
        if (!status.isActive) return { allowed: false, reason: 'Subscription inactive' };
        if (status.isExpired) return { allowed: false, reason: 'Subscription expired' };
        if (status.sendsRemaining === 0n) {
            return {
                allowed: false,
                reason: `Send limit reached (${status.sendsLimit} sends/period for ${status.tierName} tier)`,
            };
        }

        return { allowed: true, remaining: status.sendsRemaining };
    }

    /**
     * Get detailed tier information for all tiers.
     * Used to display plan comparison tables.
     */
    getAllTierInfo(): TierInfo[] {
        return Object.values(HERALD_TIER_INFO);
    }

    /**
     * Get tier information for the upgrade path (next tier up).
     */
    async getUpgradePath(protocolOwner: PublicKey): Promise<{
        currentTier: TierInfo;
        nextTier: TierInfo | null;
        additionalCost: string | null;
    }> {
        const status = await this.getSubscriptionStatus(protocolOwner);
        const tier = status?.tier ?? 0;
        const tiers = Object.values(HERALD_TIER_INFO);

        return {
            currentTier: tiers[tier as number],
            nextTier: tier < 3 ? tiers[(tier + 1) as number] : null,
            additionalCost: tier < 3
                ? `$${HERALD_TIER_INFO[(tier + 1) as ProtocolTier].priceUsdMonthly - HERALD_TIER_INFO[tier as ProtocolTier].priceUsdMonthly}/mo more`
                : null,
        };
    }

    private async fetchProtocolAccountRaw(pda: PublicKey) {
        try {
            return await (this.program.account as any).protocolRegistryAccount.fetch(pda);
        } catch {
            return null;
        }
    }

    private formatUsdc(amount: bigint): string {
        return `$${(Number(amount) / 1_000_000).toFixed(2)}`;
    }
}
