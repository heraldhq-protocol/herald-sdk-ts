import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import type { SuspendProtocolParams } from '../../types/instructions.js';

export async function buildSuspendProtocolIx(
    program: Program,
    params: SuspendProtocolParams,
): Promise<TransactionInstruction> {
    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .suspendProtocol()
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
        })
        .instruction();
}
