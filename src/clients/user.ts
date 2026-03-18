import {
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js';
import { BaseClient } from './base.js';
import { findIdentityPda } from '../pda/index.js';
import {
    validateEncryptedEmail,
    validateNonce,
    validateEmailHash,
} from '../encryption/validation.js';
import { HeraldError } from '../errors/index.js';
import type {
    RegisterIdentityParams,
    UpdateIdentityParams,
    DeleteIdentityParams,
} from '../types/instructions.js';
import type { HeraldConfig } from '../types/config.js';

/**
 * UserClient — methods callable by any wallet holder.
 * All methods return unsigned TransactionInstruction arrays.
 * The caller assembles and signs the transaction.
 */
export class UserClient extends BaseClient {
    constructor(config: HeraldConfig) {
        super(config);
    }

    /**
     * Build instruction to register a new identity.
     *
     * IMPORTANT: The caller must encrypt the email BEFORE calling this.
     * Use the encryption module: `encryptEmail(email, walletPubkey)`
     */
    async registerIdentity(
        params: RegisterIdentityParams,
    ): Promise<TransactionInstruction> {
        validateEncryptedEmail(params.encryptedEmail);
        validateNonce(params.nonce);
        validateEmailHash(params.emailHash);

        const [identityPda] = findIdentityPda(
            params.owner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
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

    /**
     * Build instruction to update an existing identity.
     * All fields are optional — only provided fields are updated on-chain.
     * At least one field must be provided (enforced by program).
     */
    async updateIdentity(
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

        const [identityPda] = findIdentityPda(
            params.owner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
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

    /**
     * Build instruction to delete an identity (GDPR right to erasure).
     * Closes the PDA and returns rent lamports to owner.
     */
    async deleteIdentity(
        params: DeleteIdentityParams,
    ): Promise<TransactionInstruction> {
        const [identityPda] = findIdentityPda(
            params.owner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .deleteIdentity()
            .accounts({
                owner: params.owner,
                identityAccount: identityPda,
            })
            .instruction();
    }
}
