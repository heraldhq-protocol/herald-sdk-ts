import { describe, it, expect } from 'vitest';
import { dateToUnix, unixToDate, nowUnix, isExpired } from '../../../utils/time.js';

describe('Utils - time', () => {
    describe('dateToUnix', () => {
        it('should convert Date to big integer unix timestamp', () => {
            const date = new Date('2026-01-01T00:00:00Z');
            const unix = dateToUnix(date);
            expect(unix).toBe(1767225600n);
            expect(typeof unix).toBe('bigint');
        });
    });

    describe('unixToDate', () => {
        it('should convert big integer unix timestamp to Date', () => {
            const unix = 1767225600n;
            const date = unixToDate(unix);
            expect(date.toISOString()).toBe('2026-01-01T00:00:00.000Z');
            expect(date).toBeInstanceOf(Date);
        });
    });

    describe('nowUnix', () => {
        it('should return current time as bigint', () => {
            const now = nowUnix();
            expect(typeof now).toBe('bigint');
            expect(now).toBeGreaterThan(1700000000n);
        });
    });

    describe('isExpired', () => {
        it('should return true for past dates', () => {
            const past = 1000n; // 1970
            expect(isExpired(past)).toBe(true);
        });

        it('should return false for future dates', () => {
            const future = 4102444800n; // 2100
            expect(isExpired(future)).toBe(false);
        });

        it('should return true if timestamp is 0 (uninitialized)', () => {
            expect(isExpired(0n)).toBe(true);
        });
    });
});
