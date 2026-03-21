import type { PublicKey, TransactionInstruction } from '@solana/web3.js';
import type { ProtocolTier } from '../types/accounts';

// ── Helio Types ──────────────────────────────────────────────────────

export interface HelioCheckoutConfig {
    /** Herald Helio template ID (configured in Helio dashboard per tier). */
    templateId: string;
    /** Protocol's wallet pubkey — pre-fills the checkout form. */
    protocolPubkey: string;
    /** Your Herald protocol ID (UUID from PostgreSQL). */
    protocolId: string;
    /** Tier being purchased. */
    tier: ProtocolTier;
    /** Number of billing periods (default: 1). Helio supports 1–12. */
    months?: number;
    /** Where to send the user after successful payment. */
    successUrl: string;
    /** Where to send the user if they cancel. */
    cancelUrl: string;
    /** Optional coupon/discount code. */
    couponCode?: string;
}

export interface HelioCheckoutResult {
    /** URL to redirect the protocol admin to. */
    checkoutUrl: string;
    /** Helio transaction ID (for correlation). */
    helioTransactionId: string;
    /** When this checkout session expires. */
    expiresAt: Date;
}

export type HelioWebhookEvent =
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'SUBSCRIPTION_RENEWED'
    | 'SUBSCRIPTION_CANCELLED'
    | 'SUBSCRIPTION_PAUSED'
    | 'REFUND_ISSUED';

export interface HelioWebhookPayload {
    event: HelioWebhookEvent;
    transactionId: string;
    /** Protocol's wallet pubkey from checkout metadata. */
    protocolPubkey: string;
    protocolId: string;
    tier: number;
    months: number;
    /** Amount paid in USDC (human-readable, e.g. "99.00"). */
    amountUsdc: string;
    /** Solana transaction signature of the USDC transfer. */
    solanaTxSignature: string;
    /** ISO 8601 */
    createdAt: string;
    /** Raw signature from Helio for HMAC-SHA256 verification. */
    signature: string;
}

export interface HelioSubscriptionTemplate {
    templateId: string;
    tier: ProtocolTier;
    name: string;
    priceUsdc: number;
    billingPeriod: 'monthly';
    features: string[];
}

// ── On-Chain Payment Types (Phase 2) ────────────────────────────────

export type SupportedPaymentToken = 'USDC' | 'USDT';

export interface PaySubscriptionParams {
    /** Protocol admin wallet (signs the transaction). */
    protocolOwner: PublicKey;
    /** Number of billing periods to purchase (1–12). */
    months: number;
    /** Token to pay with. Default: 'USDC'. */
    token?: SupportedPaymentToken;
}

export interface PaySubscriptionResult {
    /** Signed transaction instructions to include in the caller's transaction. */
    instructions: TransactionInstruction[];
    /** Expected USDC amount (6-decimal base units). */
    expectedAmount: bigint;
    /** Human-readable expected amount (e.g. "$99.00 USDC"). */
    expectedAmountDisplay: string;
    /** New subscription expiry after payment. */
    newExpiryEstimate: Date;
}

// ── Subscription / Usage Read Types ──────────────────────────────────

export interface SubscriptionStatus {
    protocolPubkey: string;
    tier: ProtocolTier;
    tierName: string;
    isActive: boolean;
    isSuspended: boolean;
    subscriptionExpiresAt: Date | null;
    daysRemaining: number | null;
    isExpired: boolean;
    sendsThisPeriod: bigint;
    sendsLimit: bigint;
    sendsRemaining: bigint;
    usagePercent: number;
    lifetimeUsdcPaid: bigint;
    lifetimeUsdcDisplay: string;
    periodsPaid: number;
}

export interface UsageStats {
    sendsThisPeriod: bigint;
    sendsLimit: bigint;
    sendsRemaining: bigint;
    usagePercent: number;
    /** Estimated overage cost if sends_limit exceeded. */
    estimatedOverage: string;
    periodResetAt: Date | null;
}

export interface TierInfo {
    tier: ProtocolTier;
    name: string;
    priceUsdMonthly: number;
    priceUsdcMonthly: bigint;
    sendsPerMonth: bigint;
    features: {
        batchSend: boolean;
        customDomain: boolean;
        dedicatedCsm: boolean;
        slaUptime: string;
        maxBatchSize: number;
    };
}

export interface PaymentRecord {
    source: 'helio' | 'on_chain_usdc' | 'on_chain_usdt';
    amountUsdc: bigint;
    months: number;
    paidAt: Date;
    txSignature: string;
    newExpiry: Date;
}

export type BillingHistory = PaymentRecord[];
