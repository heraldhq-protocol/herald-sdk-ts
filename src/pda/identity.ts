import { PublicKey } from '@solana/web3.js';

/**
 * Derives the IdentityAccount PDA for a given wallet owner.
 * Seeds: ["identity", owner_pubkey (32 bytes)]
 *
 * @returns [pda, bump]
 */
export function findIdentityPda(
    owner: PublicKey,
    programId: PublicKey,
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('identity'), owner.toBuffer()],
        programId,
    );
}

/**
 * Synchronous version — useful when bump is already known (avoids recomputation).
 */
export function createIdentityPda(
    owner: PublicKey,
    bump: number,
    programId: PublicKey,
): PublicKey {
    return PublicKey.createProgramAddressSync(
        [Buffer.from('identity'), owner.toBuffer(), Buffer.from([bump])],
        programId,
    );
}
