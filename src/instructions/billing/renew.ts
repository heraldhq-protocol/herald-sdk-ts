import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import type { RenewSubscriptionParams } from '../../types/instructions.js';

export async function buildRenewSubscriptionIx(
    program: Program,
    params: RenewSubscriptionParams,
): Promise<TransactionInstruction> {
    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .renewSubscription()
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
        })
        .instruction();
}
