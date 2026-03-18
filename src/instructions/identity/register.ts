import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findIdentityPda } from '../../pda/index.js';
import { validateEncryptedEmail, validateNonce, validateEmailHash } from '../../encryption/validation.js';
import type { RegisterIdentityParams } from '../../types/instructions.js';

/**
 * Build the register_identity instruction.
 * Standalone builder — can be used without a client class.
 */
export async function buildRegisterIdentityIx(
    program: Program,
    params: RegisterIdentityParams,
): Promise<TransactionInstruction> {
    validateEncryptedEmail(params.encryptedEmail);
    validateNonce(params.nonce);
    validateEmailHash(params.emailHash);

    const [identityPda] = findIdentityPda(params.owner, program.programId);

    return await program.methods
        .registerIdentity(
            Buffer.from(params.encryptedEmail),
            Array.from(params.emailHash),
            Array.from(params.nonce),
            params.optIns.optInAll,
            params.optIns.optInDefi,
            params.optIns.optInGovernance,
            params.optIns.optInMarketing,
            params.digestMode,
        )
        .accounts({
            owner: params.owner,
            identityAccount: identityPda,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}
