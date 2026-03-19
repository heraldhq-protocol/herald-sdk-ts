import { describe, it, expect } from 'vitest';
import { truncateAddress, isValidPubkey } from '../../../utils/address.js';
import { PublicKey, Keypair } from '@solana/web3.js';

describe('Utils - address', () => {
    describe('truncateAddress', () => {
        it('should truncate a normal base58 address', () => {
            const address = 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2';
            expect(truncateAddress(address)).toBe('A1b2...U1v2');
            expect(truncateAddress(address, 6)).toBe('A1b2C3...t0U1v2');
        });

        it('should return the original string if it is too short', () => {
            expect(truncateAddress('Short')).toBe('Short');
            expect(truncateAddress('12345678')).toBe('12345678');
        });
    });

    describe('isValidPubkey', () => {
        it('should return true for valid base58 public keys', () => {
            const kp = Keypair.generate();
            expect(isValidPubkey(kp.publicKey.toBase58())).toBe(true);
            expect(isValidPubkey(new PublicKey('11111111111111111111111111111111').toBase58())).toBe(true);
        });

        it('should return false for invalid strings', () => {
            expect(isValidPubkey('')).toBe(false);
            expect(isValidPubkey('NotABase58StringOflength___')).toBe(false);
            expect(isValidPubkey('123')).toBe(false);
        });
    });
});
