import { describe, it, expect } from 'vitest';
import { deriveX25519FromEd25519, deriveX25519SecretFromEd25519 } from '../../../encryption/conversion.js';
import { HeraldError } from '../../../errors/index.js';
import ed2curve from 'ed2curve';
import nacl from 'tweetnacl';

describe('Encryption - key conversion', () => {
    // Generate an ed25519 keypair for testing
    const keypair = nacl.sign.keyPair();

    it('should derive an X25519 public key from an Ed25519 public key', () => {
        const x25519Pubkey = deriveX25519FromEd25519(keypair.publicKey);

        expect(x25519Pubkey).toBeDefined();
        expect(x25519Pubkey).toBeInstanceOf(Uint8Array);
        expect(x25519Pubkey.length).toBe(32);

        // Ensure it matches raw ed2curve output
        const expected = ed2curve.convertPublicKey(keypair.publicKey);
        expect(x25519Pubkey).toEqual(expected);
    });

    it('should derive an X25519 secret key from an Ed25519 secret key', () => {
        const x25519Secret = deriveX25519SecretFromEd25519(keypair.secretKey);

        expect(x25519Secret).toBeDefined();
        expect(x25519Secret).toBeInstanceOf(Uint8Array);
        expect(x25519Secret.length).toBe(32); // Converted secret is 32 bytes

        const expected = ed2curve.convertSecretKey(keypair.secretKey);
        expect(x25519Secret).toEqual(expected);
    });

    it('should throw when deriving from invalid public key length', () => {
        const invalidPubkey = new Uint8Array(31).fill(1); // Should be 32
        expect(() => deriveX25519FromEd25519(invalidPubkey)).toThrow(HeraldError);
    });
});
