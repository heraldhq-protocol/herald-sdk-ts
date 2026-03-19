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
     * 
     * @param params - The parameters required to register an identity.
     * @param params.owner - The wallet public key of the identity owner.
     * @param params.encryptedEmail - The NaCl-encrypted email bytes (typically created with `encryptEmail`).
     * @param params.emailHash - The SHA-256 hash of the plaintext email.
     * @param params.nonce - The 24-byte nonce used during NaCl encryption.
     * @param params.optIns - Flags determining what category of notifications the user wants to receive.
     * @param params.digestMode - Whether the user prefers batched daily digests instead of instant notifications.
     * 
     * @returns A promise that resolves to an unsigned `TransactionInstruction`.
     * 
     * @example
     * ```typescript
     * const txIx = await userClient.registerIdentity({
     *   owner: userWallet.publicKey,
     *   encryptedEmail: encryptedBytes,
     *   emailHash: hashedEmailBytes,
     *   nonce: encryptionNonce,
     *   optIns: { optInAll: true, optInDefi: false, optInGovernance: false, optInMarketing: false },
     *   digestMode: false
     * });
     * // Add to transaction and sign
     * ```
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
     * 
     * @param params - The parameters required to update an identity.
     * @param params.owner - The wallet public key of the identity owner.
     * @param params.encryptedEmail - (Optional) New NaCl-encrypted email bytes.
     * @param params.emailHash - (Optional) New SHA-256 hash of the plaintext email.
     * @param params.nonce - (Optional) New 24-byte nonce used during NaCl encryption.
     * @param params.optIns - (Optional) Updated notification preference flags.
     * @param params.digestMode - (Optional) Updated digest mode preference.
     * 
     * @returns A promise that resolves to an unsigned `TransactionInstruction`.
     * @throws {HeraldError} Validates that at least one update field is provided.
     * 
     * @example
     * ```typescript
     * const txIx = await userClient.updateIdentity({
     *   owner: userWallet.publicKey,
     *   optIns: { optInAll: false, optInDefi: true, optInGovernance: true, optInMarketing: false }
     * });
     * ```
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
     * 
     * @param params - Parameters required to delete an identity.
     * @param params.owner - The wallet public key of the identity owner holding the PDA.
     * 
     * @returns A promise that resolves to an unsigned `TransactionInstruction`.
     * 
     * @example
     * ```typescript
     * const txIx = await userClient.deleteIdentity({
     *   owner: userWallet.publicKey
     * });
     * ```
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
