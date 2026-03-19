import { describe, it, expect } from 'vitest';
import {
    validateEncryptedEmail,
    validateNonce,
    validateEmailHash,
    validateCategory,
    validateTier
} from '../../encryption/validation.js';
import { HeraldError } from '../../errors/index.js';
import { PROTOCOL_TIERS, NOTIFICATION_CATEGORIES } from '../../types/accounts.js';

describe('Encryption - validation', () => {
    describe('validateEncryptedEmail', () => {
        it('should pass for valid lengths', () => {
            expect(() => validateEncryptedEmail(new Uint8Array(1))).not.toThrow();
            expect(() => validateEncryptedEmail(new Uint8Array(200))).not.toThrow();
        });

        it('should fail for empty array', () => {
            try {
                validateEncryptedEmail(new Uint8Array(0));
            } catch (err: any) {
                expect(err).toBeInstanceOf(HeraldError);
                expect(err.code).toBe(6001);
            }
        });

        it('should fail for too large arrays', () => {
            try {
                validateEncryptedEmail(new Uint8Array(201));
            } catch (err: any) {
                expect(err.code).toBe(6000);
            }
        });
    });

    describe('validateNonce', () => {
        it('should pass for exact 24 bytes', () => {
            expect(() => validateNonce(new Uint8Array(24))).not.toThrow();
        });

        it('should fail for non-24 byte arrays', () => {
            expect(() => validateNonce(new Uint8Array(23))).toThrow(HeraldError);
            expect(() => validateNonce(new Uint8Array(25))).toThrow(HeraldError);

            try {
                validateNonce(new Uint8Array(23));
            } catch (err: any) {
                expect(err.code).toBe(6003);
            }
        });
    });

    describe('validateEmailHash', () => {
        it('should pass for exact 32 bytes', () => {
            expect(() => validateEmailHash(new Uint8Array(32))).not.toThrow();
        });

        it('should fail for non-32 byte arrays', () => {
            expect(() => validateEmailHash(new Uint8Array(31))).toThrow(HeraldError);

            try {
                validateEmailHash(new Uint8Array(33));
            } catch (err: any) {
                expect(err.code).toBe(6002);
            }
        });
    });

    describe('validateCategory', () => {
        it('should pass for valid enum values', () => {
            expect(() => validateCategory(NOTIFICATION_CATEGORIES.DEFI)).not.toThrow();
            expect(() => validateCategory(NOTIFICATION_CATEGORIES.OTHER)).not.toThrow();
        });

        it('should fail for out of bounds values', () => {
            expect(() => validateCategory(4)).toThrow(HeraldError);
            expect(() => validateCategory(-1)).toThrow(HeraldError);

            try {
                validateCategory(99 as any);
            } catch (err: any) {
                expect(err.code).toBe(6017);
            }
        });
    });

    describe('validateTier', () => {
        it('should pass for valid tiers', () => {
            expect(() => validateTier(PROTOCOL_TIERS.DEV)).not.toThrow();
            expect(() => validateTier(PROTOCOL_TIERS.ENTERPRISE)).not.toThrow();
        });

        it('should fail for out of bounds tiers', () => {
            expect(() => validateTier(4)).toThrow(HeraldError);

            try {
                validateTier(5 as any);
            } catch (err: any) {
                expect(err.code).toBe(6007);
            }
        });
    });
});
