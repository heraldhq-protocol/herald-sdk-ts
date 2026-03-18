import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findIdentityPda } from '../../pda/index.js';
import { validateEncryptedEmail, validateNonce, validateEmailHash } from '../../encryption/validation.js';
import { HeraldError } from '../../errors/index.js';
import type { UpdateIdentityParams } from '../../types/instructions.js';

/**
 * Build the update_identity instruction.
 */
export async function buildUpdateIdentityIx(
    program: Program,
    params: UpdateIdentityParams,
): Promise<TransactionInstruction> {
    if (params.encryptedEmail) validateEncryptedEmail(params.encryptedEmail);
    if (params.nonce) validateNonce(params.nonce);
    if (params.emailHash) validateEmailHash(params.emailHash);

    const hasUpdate =
        params.encryptedEmail !== undefined ||
        params.emailHash !== undefined ||
        params.nonce !== undefined ||
        params.optIns !== undefined ||
        params.digestMode !== undefined;

    if (!hasUpdate) {
        throw new HeraldError('Update must modify at least one field', 6004);
    }

    const [identityPda] = findIdentityPda(params.owner, program.programId);

    return await program.methods
        .updateIdentity(
            params.encryptedEmail ? Buffer.from(params.encryptedEmail) : null,
            params.emailHash ? Array.from(params.emailHash) : null,
            params.nonce ? Array.from(params.nonce) : null,
            params.optIns?.optInAll ?? null,
            params.optIns?.optInDefi ?? null,
            params.optIns?.optInGovernance ?? null,
            params.optIns?.optInMarketing ?? null,
            params.digestMode ?? null,
        )
        .accounts({
            owner: params.owner,
            identityAccount: identityPda,
        })
        .instruction();
}
