import { describe, it, expect } from 'vitest';
import { hashEmail } from '../../../encryption/hashing.js';
import { toHex } from '../../../utils/bytes.js';

describe('Encryption - hashing', () => {
    it('should correctly hash an email using SHA-256', async () => {
        const email = 'test@example.com';
        const hashBytes = await hashEmail(email);

        expect(hashBytes).toBeInstanceOf(Uint8Array);
        expect(hashBytes.length).toBe(32);

        // Pre-computed SHA-256 for 'test@example.com'
        const expectedHex = '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b';
        expect(toHex(hashBytes)).toBe(expectedHex);
    });

    it('should produce different hashes for different emails', async () => {
        const hash1 = await hashEmail('alice@test.com');
        const hash2 = await hashEmail('bob@test.com');

        expect(toHex(hash1)).not.toBe(toHex(hash2));
    });

    it('should handle empty strings', async () => {
        const hash = await hashEmail('');
        const expectedHex = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        expect(toHex(hash)).toBe(expectedHex);
    });
});
