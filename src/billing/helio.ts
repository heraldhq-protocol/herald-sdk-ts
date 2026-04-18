/**
 * Helio billing integration for Herald.
 *
 * Wraps the @heliofi/sdk to handle Herald-specific billing operations:
 *   - Subscription checkout creation (using existing Paylink templates or dynamic)
 *   - Overage invoice payments
 *   - Environment-aware configuration (mainnet/devnet)
 */

export type HelioNetwork = 'mainnet' | 'devnet';
export type HeraldTier = 'growth' | 'scale' | 'enterprise';

export interface HelioBillingConfig {
    /** Helio public API key. */
    apiKey: string;
    /** Helio secret key. */
    secretKey: string;
    /** Solana network. @default 'mainnet' */
    network?: HelioNetwork;
}

export interface SubscriptionCheckoutParams {
    /** Herald subscription tier. */
    tier: HeraldTier;
    /** Subscriber's Solana wallet address. */
    walletAddress: string;
    /** Optional specific Paylink ID (template) for this tier. */
    templateId?: string;
    /** Redirect URL on successful payment. */
    successUrl: string;
    /** Redirect URL on cancelled payment. */
    cancelUrl: string;
    /** Optional metadata to attach to the payment. */
    metadata?: Record<string, string>;
}

export interface OverageInvoiceParams {
    /** Protocol owner's Solana wallet address. */
    walletAddress: string;
    /** Number of overage sends to invoice. */
    overageSends: number;
    /** Price per send in USD. */
    pricePerSend: number;
    /** Invoice description. */
    description?: string;
}

export interface CheckoutResult {
    /** Helio checkout URL — redirect user here. */
    checkoutUrl: string;
    /** Helio Paylink ID for tracking. */
    paylinkId: string;
    /** Helio transaction/payment ID for tracking (alias for paylinkId). */
    transactionId: string;
}

/** Tier details for dynamic fallback. */
const TIER_PRICING: Record<HeraldTier, { name: string; priceUsdc: number; sends: number }> = {
    growth: { name: 'Growth', priceUsdc: 49, sends: 10_000 },
    scale: { name: 'Scale', priceUsdc: 199, sends: 100_000 },
    enterprise: { name: 'Enterprise', priceUsdc: 499, sends: 500_000 },
};

/**
 * HelioBilling — Herald-specific wrapper around the Helio SDK.
 */
export class HelioBilling {
    private readonly config: Required<HelioBillingConfig>;
    private sdkInstance: any | null = null;

    constructor(config: HelioBillingConfig) {
        this.config = {
            apiKey: config.apiKey,
            secretKey: config.secretKey,
            network: config.network ?? 'mainnet',
        };
    }

    private async getSDK(): Promise<any> {
        if (this.sdkInstance) return this.sdkInstance;

        try {
            const helioMod = await import('@heliofi/sdk');
            const HelioSDKClass: any = (helioMod as any).HelioSDK || (helioMod as any).default || helioMod;
            this.sdkInstance = new HelioSDKClass({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                network: this.config.network === 'devnet' ? 'test' : 'mainnet',
            });
            return this.sdkInstance;
        } catch (err) {
            throw new Error(
                'HelioBilling requires @heliofi/sdk. Install it: pnpm add @heliofi/sdk',
            );
        }
    }

    /**
     * Create a subscription checkout.
     * If templateId is provided, Helio will use it as a base.
     */
    async createSubscriptionCheckout(
        params: SubscriptionCheckoutParams,
    ): Promise<CheckoutResult> {
        const sdk = await this.getSDK();
        const tier = TIER_PRICING[params.tier];

        if (!tier) {
            throw new Error(`Invalid tier: ${params.tier}`);
        }

        const paylink = await sdk.paylink.create({
            // If templateId provided, Helio Dashboard settings for that ID are used as base
            templateId: params.templateId,
            name: `Herald ${tier.name} Subscription`,
            price: tier.priceUsdc,
            currency: 'USDC',
            description: `Herald ${tier.name} — ${tier.sends.toLocaleString()} sends/month`,
            successUrl: params.successUrl,
            cancelUrl: params.cancelUrl,
            features: {
                requireWalletAddress: true,
                isSubscription: true,
            },
            subscriptionDetails: {
                interval: 'monthly',
                intervalCount: 1,
            },
            metadata: {
                herald_tier: params.tier,
                herald_wallet: params.walletAddress,
                ...params.metadata,
            },
        });

        return {
            checkoutUrl: paylink.url,
            paylinkId: paylink.id,
            transactionId: paylink.id,
        };
    }

    /**
     * Create an overage invoice (one-time payment).
     */
    async createOverageInvoice(
        params: OverageInvoiceParams,
    ): Promise<CheckoutResult> {
        const sdk = await this.getSDK();
        const totalAmount = params.overageSends * params.pricePerSend;

        const paylink = await sdk.paylink.create({
            name: `Herald Overage Invoice`,
            price: totalAmount,
            currency: 'USDC',
            description: params.description ??
                `Overage: ${params.overageSends.toLocaleString()} additional sends at $${params.pricePerSend}/send`,
            features: {
                requireWalletAddress: true,
                isSubscription: false,
            },
            metadata: {
                herald_type: 'overage',
                herald_wallet: params.walletAddress,
                herald_overage_sends: String(params.overageSends),
            },
        });

        return {
            checkoutUrl: paylink.url,
            paylinkId: paylink.id,
            transactionId: paylink.id,
        };
    }

    /**
     * Cancel an active Helio subscription or paylink using its paylinkId / transactionId.
     * Fallbacks to REST API if the SDK does not natively expose deletion.
     */
    async cancelSubscription(paylinkId: string): Promise<boolean> {
        const sdk = await this.getSDK();
        try {
            // Attempt to use native SDK deletion if it exists
            if (sdk.paylink && typeof sdk.paylink.delete === 'function') {
                await sdk.paylink.delete(paylinkId);
                return true;
            }

            // Fallback to fetch API
            const baseUrl = this.config.network === 'devnet' ? 'https://dev.api.hel.io/v1' : 'https://api.hel.io/v1';
            const response = await fetch(`${baseUrl}/paylink/${paylinkId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.config.secretKey}`,
                }
            });

            if (!response.ok) {
                console.warn(`Failed to cancel Helio paylink ${paylinkId} via API: ${response.statusText}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error(`Error cancelling Helio subscription:`, error);
            return false;
        }
    }

    static getAllTiers() {
        return Object.entries(TIER_PRICING).map(([key, value]) => ({
            id: key as HeraldTier,
            ...value,
        }));
    }
}

