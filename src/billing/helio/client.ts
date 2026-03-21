import axios from 'axios';
import { createHmac } from 'crypto';
import type {
    HelioCheckoutConfig,
    HelioCheckoutResult,
    HelioWebhookPayload,
    HelioSubscriptionTemplate,
} from '../types.js';
import { HERALD_TIER_INFO } from '../utils.js';
import type { ProtocolTier } from '../../types/accounts.js';

export interface HelioClientConfig {
    apiKey: string;
    webhookSecret: string;
    /** Map of ProtocolTier (1–3) → Helio templateId. Tier 0 (Dev) is free, no template needed. */
    templates: Record<number, string>;
}

export interface HelioSubscriptionDetails {
    id: string;
    status: 'active' | 'cancelled' | 'paused' | 'expired';
    protocolPubkey: string | undefined;
    tier: number;
    nextRenewalAt: Date | null;
    amountUsdc: string;
}

/**
 * HelioClient — manages Helio subscription checkout and webhook verification.
 *
 * Helio is Herald's Phase 1 billing provider.
 * It handles USDC recurring payments on Solana with no custom smart contracts.
 */
export class HelioClient {
    private static readonly API_BASE = 'https://api.hel.io/v1';

    private readonly apiKey: string;
    private readonly webhookSecret: string;
    private readonly templates: Record<number, string>; // tier → templateId

    constructor(config: HelioClientConfig) {
        this.apiKey = config.apiKey;
        this.webhookSecret = config.webhookSecret;
        this.templates = config.templates;
    }

    /**
     * Generate a Helio checkout URL for a protocol to subscribe.
     * Redirect the protocol admin to the returned URL.
     */
    async createCheckoutUrl(config: HelioCheckoutConfig): Promise<HelioCheckoutResult> {
        const templateId = this.templates[config.tier];
        if (!templateId) {
            throw new Error(`No Helio template configured for tier ${config.tier}`);
        }

        const response = await axios.post(
            `${HelioClient.API_BASE}/pay-link/${templateId}/checkout`,
            {
                customerDetails: {
                    walletAddress: config.protocolPubkey,
                },
                metadata: {
                    protocol_id: config.protocolId,
                    protocol_pubkey: config.protocolPubkey,
                    tier: config.tier.toString(),
                    months: (config.months ?? 1).toString(),
                },
                successUrl: config.successUrl,
                cancelUrl: config.cancelUrl,
                ...(config.couponCode && { couponCode: config.couponCode }),
            },
            {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return {
            checkoutUrl: response.data.url,
            helioTransactionId: response.data.id,
            expiresAt: new Date(response.data.expiresAt),
        };
    }

    /**
     * Verify a Helio webhook signature using HMAC-SHA256.
     * MUST be called before processing any webhook payload.
     */
    verifyWebhookSignature(payload: unknown, signature: string): boolean {
        const expected = createHmac('sha256', this.webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return this.safeCompare(`sha256=${expected}`, signature);
    }

    /**
     * Parse and validate a raw Helio webhook payload.
     * Returns typed HelioWebhookPayload or throws on invalid signature.
     */
    parseWebhook(rawBody: string, signature: string): HelioWebhookPayload {
        let payload: HelioWebhookPayload;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            throw new Error('Invalid JSON in Helio webhook body');
        }

        if (!this.verifyWebhookSignature(payload, signature)) {
            throw new Error('Helio webhook signature verification failed');
        }

        return payload as HelioWebhookPayload;
    }

    /**
     * Fetch all configured subscription templates from Helio.
     */
    async fetchSubscriptionTemplates(): Promise<HelioSubscriptionTemplate[]> {
        const tierIds = Object.values(this.templates);
        const templates = await Promise.all(
            tierIds.map(async (id) => {
                const res = await axios.get(`${HelioClient.API_BASE}/pay-link/${id}`, {
                    headers: { Authorization: `Bearer ${this.apiKey}` },
                });
                return res.data;
            }),
        );

        return templates.map((t, i) => {
            const tier = Number(Object.keys(this.templates)[i]) as ProtocolTier;
            return {
                templateId: t.id,
                tier,
                name: HERALD_TIER_INFO[tier].name,
                priceUsdc: HERALD_TIER_INFO[tier].priceUsdMonthly,
                billingPeriod: 'monthly' as const,
                features: this.getTierFeatures(tier),
            };
        });
    }

    /**
     * Cancel a protocol's Helio subscription.
     */
    async cancelSubscription(helioSubscriptionId: string): Promise<void> {
        await axios.post(
            `${HelioClient.API_BASE}/subscriptions/${helioSubscriptionId}/cancel`,
            {},
            { headers: { Authorization: `Bearer ${this.apiKey}` } },
        );
    }

    /**
     * Retrieve Helio subscription details for a protocol.
     */
    async getSubscription(helioSubscriptionId: string): Promise<HelioSubscriptionDetails> {
        const res = await axios.get(
            `${HelioClient.API_BASE}/subscriptions/${helioSubscriptionId}`,
            { headers: { Authorization: `Bearer ${this.apiKey}` } },
        );
        return {
            id: res.data.id,
            status: res.data.status,
            protocolPubkey: res.data.metadata?.protocol_pubkey,
            tier: Number(res.data.metadata?.tier),
            nextRenewalAt: res.data.nextPaymentDate ? new Date(res.data.nextPaymentDate) : null,
            amountUsdc: res.data.amount,
        };
    }

    private getTierFeatures(tier: ProtocolTier): string[] {
        const baseFeatures = ['API access', 'Privacy registry', 'Webhooks'];
        const tierFeatures: Record<number, string[]> = {
            1: [...baseFeatures, 'On-chain receipts', '99.9% SLA'],
            2: [...baseFeatures, 'On-chain receipts', 'Batch sends (100)', 'Custom domain DKIM', '99.9% SLA'],
            3: [...baseFeatures, 'On-chain receipts', 'Batch sends (1,000)', 'Custom domain DKIM', 'Dedicated CSM', '99.99% SLA'],
        };
        return tierFeatures[tier] ?? baseFeatures;
    }

    private safeCompare(a: string, b: string): boolean {
        if (a.length !== b.length) return false;
        let diff = 0;
        for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
        return diff === 0;
    }
}
