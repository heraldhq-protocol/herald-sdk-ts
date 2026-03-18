import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findIdentityPda } from '../../pda/index.js';
import type { DeleteIdentityParams } from '../../types/instructions.js';

/**
 * Build the delete_identity instruction.
 */
export async function buildDeleteIdentityIx(
    program: Program,
    params: DeleteIdentityParams,
): Promise<TransactionInstruction> {
    const [identityPda] = findIdentityPda(params.owner, program.programId);

    return await program.methods
        .deleteIdentity()
        .accounts({
            owner: params.owner,
            identityAccount: identityPda,
        })
        .instruction();
}
