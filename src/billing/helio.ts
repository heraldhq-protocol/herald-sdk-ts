/**
 * Helio billing integration for Herald.
 *
 * Wraps the @heliofi/sdk to handle Herald-specific billing operations:
 *   - Subscription checkout creation
 *   - Overage invoice payments
 *   - Environment-aware configuration (mainnet/devnet)
 *
 * @example
 * ```typescript
 * import { HelioBilling } from '@herald-protocol/sdk';
 *
 * const billing = new HelioBilling({
 *   apiKey: process.env.HELIO_API_KEY!,
 *   secretKey: process.env.HELIO_SECRET_KEY!,
 *   network: 'mainnet',
 * });
 *
 * const checkout = await billing.createSubscriptionCheckout({
 *   tier: 'growth',
 *   walletAddress: '7xR4mKp2nQ...',
 *   successUrl: 'https://app.useherald.xyz/billing/success',
 *   cancelUrl: 'https://app.useherald.xyz/billing',
 * });
 * ```
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
    /** Price per send in USD (converted to SOL/USDC at checkout). */
    pricePerSend: number;
    /** Invoice description. */
    description?: string;
}

export interface CheckoutResult {
    /** Helio checkout URL — redirect user here. */
    checkoutUrl: string;
    /** Helio transaction ID for tracking. */
    transactionId: string;
}

/** Tier pricing in USDC (monthly). */
const TIER_PRICING: Record<HeraldTier, { name: string; priceUsdc: number; sends: number }> = {
    growth: { name: 'Growth', priceUsdc: 49, sends: 10_000 },
    scale: { name: 'Scale', priceUsdc: 199, sends: 100_000 },
    enterprise: { name: 'Enterprise', priceUsdc: 499, sends: 500_000 },
};

/**
 * HelioBilling — Herald-specific wrapper around the Helio SDK.
 *
 * This class provides environment-aware billing operations.
 * It lazy-loads @heliofi/sdk to avoid hard dependency for users
 * who don't need billing features.
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

    /**
     * Lazily initialize the Helio SDK.
     * This allows the billing module to be imported without requiring
     * @heliofi/sdk to be installed unless actually used.
     */
    private async getSDK(): Promise<any> {
        if (this.sdkInstance) return this.sdkInstance;

        try {
            const helioMod = await import('@heliofi/sdk');
            const HelioSDKClass: any = (helioMod as any).HelioSDK || (helioMod as any).default || helioMod;
            this.sdkInstance = new HelioSDKClass({
                apiKey: this.config.apiKey,
                secretKey: this.config.secretKey,
                network: this.config.network,
            });
            return this.sdkInstance;
        } catch (err) {
            throw new Error(
                'HelioBilling requires @heliofi/sdk. Install it: pnpm add @heliofi/sdk',
            );
        }
    }

    /**
     * Create a subscription checkout for a Herald tier.
     * Returns a URL to redirect the user to for payment.
     */
    async createSubscriptionCheckout(
        params: SubscriptionCheckoutParams,
    ): Promise<CheckoutResult> {
        const sdk = await this.getSDK();
        const tier = TIER_PRICING[params.tier];

        if (!tier) {
            throw new Error(`Invalid tier: ${params.tier}. Use 'growth', 'scale', or 'enterprise'.`);
        }

        const paylink = await sdk.paylink.create({
            name: `Herald ${tier.name} Subscription`,
            price: tier.priceUsdc,
            currency: 'USDC',
            description: `Herald ${tier.name} — ${tier.sends.toLocaleString()} sends/month`,
            successUrl: params.successUrl,
            cancelUrl: params.cancelUrl,
            features: {
                requireWalletAddress: true,
            },
            metadata: {
                herald_tier: params.tier,
                herald_wallet: params.walletAddress,
                ...params.metadata,
            },
        });

        return {
            checkoutUrl: paylink.url,
            transactionId: paylink.id,
        };
    }

    /**
     * Create an overage invoice for sends beyond the tier limit.
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
            },
            metadata: {
                herald_type: 'overage',
                herald_wallet: params.walletAddress,
                herald_overage_sends: String(params.overageSends),
                herald_price_per_send: String(params.pricePerSend),
            },
        });

        return {
            checkoutUrl: paylink.url,
            transactionId: paylink.id,
        };
    }

    /**
     * Get pricing info for a tier.
     */
    static getTierPricing(tier: HeraldTier) {
        return TIER_PRICING[tier] ?? null;
    }

    /**
     * Get all available tiers.
     */
    static getAllTiers() {
        return Object.entries(TIER_PRICING).map(([key, value]) => ({
            id: key as HeraldTier,
            ...value,
        }));
    }

    /**
     * Get the current network.
     */
    getNetwork(): HelioNetwork {
        return this.config.network;
    }
}
