import { describe, it, expect } from 'vitest';
import { Keypair } from '@solana/web3.js';
import { encryptEmail, decryptEmail } from '../../encryption/nacl.js';
import { HeraldError } from '../../errors/index.js';
import nacl from 'tweetnacl';

describe('Encryption - email encryption (nacl)', () => {
    it('should successfully encrypt and decrypt an email using the same wallet', () => {
        const wallet = Keypair.generate();
        const email = 'alice@crypto.com';

        const { encryptedEmail, nonce } = encryptEmail(email, wallet.publicKey);

        expect(encryptedEmail).toBeInstanceOf(Uint8Array);
        expect(nonce.length).toBe(24);

        const decrypted = decryptEmail(encryptedEmail, nonce, wallet.secretKey);
        expect(decrypted).toBe(email);
    });

    it('should fail to decrypt with the wrong wallet', () => {
        const walletA = Keypair.generate();
        const walletB = Keypair.generate();
        const email = 'bob@crypto.com';

        const { encryptedEmail, nonce } = encryptEmail(email, walletA.publicKey);

        expect(() => decryptEmail(encryptedEmail, nonce, walletB.secretKey)).toThrowError(HeraldError);
    });

    it('should fail to decrypt with wrong nonce', () => {
        const wallet = Keypair.generate();
        const email = 'charlie@crypto.com';

        const { encryptedEmail } = encryptEmail(email, wallet.publicKey);
        const wrongNonce = nacl.randomBytes(24);

        expect(() => decryptEmail(encryptedEmail, wrongNonce, wallet.secretKey)).toThrowError(HeraldError);
    });

    it('should fail to decrypt tampered data', () => {
        const wallet = Keypair.generate();
        const email = 'charlie@crypto.com';

        const { encryptedEmail, nonce } = encryptEmail(email, wallet.publicKey);

        const tampered = new Uint8Array(encryptedEmail);
        tampered[tampered.length - 1] ^= 1; // Flip a bit at the end

        expect(() => decryptEmail(tampered, nonce, wallet.secretKey)).toThrowError(HeraldError);
    });

    it('should handle zero length strings gracefully on encrypt (though length validated later)', () => {
        const wallet = Keypair.generate();
        const { encryptedEmail, nonce } = encryptEmail('', wallet.publicKey);
        const decrypted = decryptEmail(encryptedEmail, nonce, wallet.secretKey);
        expect(decrypted).toBe('');
    });
});
