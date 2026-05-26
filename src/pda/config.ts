import { PublicKey } from '@solana/web3.js';

/**
 * Derives the GlobalConfig PDA.
 * Seeds: ["global_config"]
 *
 * This PDA stores the Herald authority pubkey on-chain so it can be
 * rotated via `update_authority` without a program upgrade.
 *
 * @returns [pda, bump]
 */
export function findGlobalConfigPda(programId: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('global_config')],
        programId,
    );
}
