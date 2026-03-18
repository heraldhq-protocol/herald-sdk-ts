import { PublicKey } from '@solana/web3.js';

/**
 * Derives the ProtocolRegistryAccount PDA.
 * Seeds: ["protocol", protocol_pubkey (32 bytes)]
 *
 * @returns [pda, bump]
 */
export function findProtocolPda(
    protocolOwner: PublicKey,
    programId: PublicKey,
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('protocol'), protocolOwner.toBuffer()],
        programId,
    );
}
