import type { PublicKey } from '@solana/web3.js';

export { findIdentityPda, createIdentityPda } from './identity.js';
export { findProtocolPda } from './protocol.js';

// Re-import for convenience function
import { findIdentityPda } from './identity.js';

/**
 * Given a wallet address, compute the complete set of PDAs
 * that Herald creates for that identity.
 */
export function deriveAllIdentityAddresses(
    owner: PublicKey,
    programId: PublicKey,
) {
    const [identityPda, identityBump] = findIdentityPda(owner, programId);
    return { identityPda, identityBump };
}
