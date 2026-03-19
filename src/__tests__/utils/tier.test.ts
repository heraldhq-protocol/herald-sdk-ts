import { describe, it, expect } from 'vitest';
import { getTierName, getSendsLimit, getSendsRemaining, parseTier } from '../../utils/tier.js';
import { PROTOCOL_TIERS } from '../../types/accounts.js';
import { HeraldError } from '../../errors/index.js';

describe('Utils - tier', () => {
    describe('getTierName', () => {
        it('should return correct names for defined tiers', () => {
            expect(getTierName(PROTOCOL_TIERS.DEV)).toBe('Developer');
            expect(getTierName(PROTOCOL_TIERS.GROWTH)).toBe('Growth');
            expect(getTierName(PROTOCOL_TIERS.SCALE)).toBe('Scale');
            expect(getTierName(PROTOCOL_TIERS.ENTERPRISE)).toBe('Enterprise');
        });

        it('should return Unknown for undefined tiers', () => {
            expect(getTierName(999 as any)).toBe('Unknown');
        });
    });

    describe('getSendsLimit', () => {
        it('should return correct limits', () => {
            expect(getSendsLimit(PROTOCOL_TIERS.DEV)).toBe(1_000n);
            expect(getSendsLimit(PROTOCOL_TIERS.GROWTH)).toBe(50_000n);
            expect(getSendsLimit(PROTOCOL_TIERS.SCALE)).toBe(250_000n);
            expect(getSendsLimit(PROTOCOL_TIERS.ENTERPRISE)).toBe(1_000_000n);
        });

        it('should return 0 for unknown tiers', () => {
            expect(getSendsLimit(999 as any)).toBe(0n);
        });
    });

    describe('getSendsRemaining', () => {
        it('should calculate remaining sends correctly', () => {
            expect(getSendsRemaining({ tier: PROTOCOL_TIERS.DEV, sendsThisPeriod: 100n } as any)).toBe(900n);
            expect(getSendsRemaining({ tier: PROTOCOL_TIERS.GROWTH, sendsThisPeriod: 50_000n } as any)).toBe(0n);
        });

        it('should cap remaining at 0 if sends exceed limit', () => {
            expect(getSendsRemaining({ tier: PROTOCOL_TIERS.DEV, sendsThisPeriod: 2_000n } as any)).toBe(0n);
        });
    });

    describe('parseTier', () => {
        it('should parse valid tier numbers', () => {
            expect(parseTier(0)).toBe(PROTOCOL_TIERS.DEV);
            expect(parseTier(1)).toBe(PROTOCOL_TIERS.GROWTH);
            expect(parseTier(2)).toBe(PROTOCOL_TIERS.SCALE);
            expect(parseTier(3)).toBe(PROTOCOL_TIERS.ENTERPRISE);
        });

        it('should return undefined for invalid tiers', () => {
            expect(parseTier(4)).toBeUndefined();
            expect(parseTier(-1)).toBeUndefined();
        });
    });
});
