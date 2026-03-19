import type { ProtocolTier, ProtocolRegistryAccount } from '../types/accounts.js';
import { PROTOCOL_TIERS, TIER_METADATA } from '../types/accounts.js';

/** Get human-readable tier name. */
export function getTierName(tier: ProtocolTier): string {
    return TIER_METADATA[tier]?.name || 'Unknown';
}

/** Get sends limit for a tier. */
export function getSendsLimit(tier: ProtocolTier): bigint {
    return TIER_METADATA[tier]?.sendsLimit || 0n;
}

/** Get remaining sends for a protocol account. */
export function getSendsRemaining(account: ProtocolRegistryAccount): bigint {
    const limit = getSendsLimit(account.tier);
    return limit > account.sendsThisPeriod ? limit - account.sendsThisPeriod : 0n;
}

/** Get tier from numeric value, or undefined if invalid. */
export function parseTier(value: number): ProtocolTier | undefined {
    if (value >= 0 && value <= 3) return value as ProtocolTier;
    return undefined;
}
