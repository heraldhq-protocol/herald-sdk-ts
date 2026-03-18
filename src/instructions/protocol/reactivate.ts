import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import type { ReactivateProtocolParams } from '../../types/instructions.js';

export async function buildReactivateProtocolIx(
    program: Program,
    params: ReactivateProtocolParams,
): Promise<TransactionInstruction> {
    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .reactivateProtocol()
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
        })
        .instruction();
}
