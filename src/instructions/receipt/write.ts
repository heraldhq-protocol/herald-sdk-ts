import { TransactionInstruction } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { findProtocolPda } from '../../pda/index.js';
import { validateCategory } from '../../encryption/validation.js';
import { HeraldError } from '../../errors/index.js';
import type { WriteReceiptParams } from '../../types/instructions.js';

/**
 * Builds the write_receipt instruction (Light Protocol CPI).
 *
 * This is the most complex instruction — it uses Light Protocol CPI.
 * Before calling this, the caller must:
 *   1. Fetch ValidityProof from Light RPC
 *   2. Get remaining accounts from Light RPC response
 *   3. Construct notificationId (UUID v4 as 16 bytes)
 *
 * @see fetchProofForReceipt — simplifies steps 1+2
 */
export async function buildWriteReceiptIx(
    program: Program,
    params: WriteReceiptParams,
): Promise<TransactionInstruction> {
    validateCategory(params.category);

    if (params.recipientHash.length !== 32) {
        throw new HeraldError('Recipient hash must be 32 bytes', 6018);
    }
    if (params.notificationId.length !== 16) {
        throw new HeraldError('Notification ID must be 16 bytes', 6019);
    }

    const [protocolPda] = findProtocolPda(params.protocolOwner, program.programId);

    return await program.methods
        .writeReceipt(
            params.proof as any,
            params.outputTreeIndex,
            Array.from(params.recipientHash),
            Array.from(params.notificationId),
            params.category,
        )
        .accounts({
            authority: params.authority,
            protocolAccount: protocolPda,
        })
        .remainingAccounts(params.lightRemainingAccounts)
        .instruction();
}
