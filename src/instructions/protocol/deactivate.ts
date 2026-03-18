import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import type { DeactivateProtocolParams } from '../../types/instructions.js';

export async function buildDeactivateProtocolIx(
    program: Program,
    params: DeactivateProtocolParams,
): Promise<TransactionInstruction> {
    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .deactivateProtocol()
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
        })
        .instruction();
}
