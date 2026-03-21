import { createHmac, timingSafeEqual } from 'crypto';
import type { TierInfo } from './types.js';
import { type ProtocolTier, PROTOCOL_TIERS } from '../types/accounts.js';

/**
 * Verify a Helio webhook signature.
 * Standalone function — usable outside of HelioClient.
 *
 * @param rawBody   - Raw request body string (NOT parsed JSON)
 * @param signature - Value of X-Helio-Signature header
 * @param secret    - Your HELIO_WEBHOOK_SECRET
 */
export function verifyHelioWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string,
): boolean {
    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    const actual = Buffer.from(signature);
    const exp = Buffer.from(expected);
    if (actual.length !== exp.length) return false;
    return timingSafeEqual(actual, exp);
}

/** Convert USDC base units (6 decimals) to human-readable string. */
export function formatUsdcAmount(baseUnits: bigint): string {
    const whole = baseUnits / 1_000_000n;
    const frac = (baseUnits % 1_000_000n).toString().padStart(6, '0').slice(0, 2);
    return `$${whole}.${frac} USDC`;
}

/** Convert human-readable USDC amount to base units. */
export function parseUsdcAmount(display: string): bigint {
    const num = parseFloat(display.replace(/[$, USDC]/g, ''));
    return BigInt(Math.round(num * 1_000_000));
}

/** Complete tier information for all Herald tiers. */
export const HERALD_TIER_INFO: Record<ProtocolTier, TierInfo> = {
    [PROTOCOL_TIERS.DEV]: {
        tier: 0, name: 'Developer',
        priceUsdMonthly: 0, priceUsdcMonthly: 0n, sendsPerMonth: 1_000n,
        features: { batchSend: false, customDomain: false, dedicatedCsm: false, slaUptime: 'best-effort', maxBatchSize: 0 },
    },
    [PROTOCOL_TIERS.GROWTH]: {
        tier: 1, name: 'Growth',
        priceUsdMonthly: 99, priceUsdcMonthly: 99_000_000n, sendsPerMonth: 50_000n,
        features: { batchSend: true, customDomain: false, dedicatedCsm: false, slaUptime: '99.9%', maxBatchSize: 100 },
    },
    [PROTOCOL_TIERS.SCALE]: {
        tier: 2, name: 'Scale',
        priceUsdMonthly: 299, priceUsdcMonthly: 299_000_000n, sendsPerMonth: 250_000n,
        features: { batchSend: true, customDomain: true, dedicatedCsm: false, slaUptime: '99.9%', maxBatchSize: 100 },
    },
    [PROTOCOL_TIERS.ENTERPRISE]: {
        tier: 3, name: 'Enterprise',
        priceUsdMonthly: 999, priceUsdcMonthly: 999_000_000n, sendsPerMonth: 1_000_000n,
        features: { batchSend: true, customDomain: true, dedicatedCsm: true, slaUptime: '99.99%', maxBatchSize: 1000 },
    },
};

export const SUPPORTED_PAYMENT_TOKENS = {
    USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, symbol: 'USDC' },
    USDT: { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, symbol: 'USDT' },
} as const;
