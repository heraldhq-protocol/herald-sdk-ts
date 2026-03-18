/**
 * Computes SHA-256 of the plaintext email.
 * Used for IdentityAccount.email_hash.
 * The hash is stored on-chain; it does NOT reveal the email.
 * It allows change detection without re-decrypting the encrypted blob.
 */
export async function hashEmail(email: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());

    // SubtleCrypto in browser; crypto.subtle in Node 18+
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
}

export interface EmailHashResult {
    emailHash: Uint8Array;
}
