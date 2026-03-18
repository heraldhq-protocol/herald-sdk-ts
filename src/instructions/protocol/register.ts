import { SystemProgram, TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import { validateTier } from '../../encryption/validation.js';
import type { RegisterProtocolParams } from '../../types/instructions.js';

export async function buildRegisterProtocolIx(
    program: Program,
    params: RegisterProtocolParams,
): Promise<TransactionInstruction> {
    validateTier(params.tier);
    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .registerProtocol(Array.from(params.nameHash), params.tier)
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
            protocolPubkey: params.protocolOwner,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
