import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import type { ResetProtocolSendsParams } from '../../types/instructions.js';

export async function buildResetProtocolSendsIx(
    program: Program,
    params: ResetProtocolSendsParams,
): Promise<TransactionInstruction> {
    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .resetProtocolSends()
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
        })
        .instruction();
}
