import {
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js';
import { BaseClient } from './base.js';
import { findProtocolPda } from '../pda/index.js';
import { validateTier, validateCategory } from '../encryption/validation.js';
import { HeraldError } from '../errors/index.js';
import type {
    RegisterProtocolParams,
    DeactivateProtocolParams,
    ReactivateProtocolParams,
    SuspendProtocolParams,
    RenewSubscriptionParams,
    ResetProtocolSendsParams,
    WriteReceiptParams,
} from '../types/instructions.js';
import type { HeraldConfig } from '../types/config.js';

/**
 * AuthorityClient — methods that require HERALD_AUTHORITY signature.
 * Used exclusively by the Herald NestJS backend.
 *
 * Methods return unsigned instructions.
 * The caller must sign with the HERALD_AUTHORITY keypair (from AWS KMS).
 */
export class AuthorityClient extends BaseClient {
    constructor(config: HeraldConfig) {
        super(config);
    }

    // ── Protocol Lifecycle ──────────────────────────────────────────

    async registerProtocol(
        params: RegisterProtocolParams,
    ): Promise<TransactionInstruction> {
        validateTier(params.tier);

        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .registerProtocol(Array.from(params.nameHash), params.tier)
            .accounts({
                authority: params.authority,
                protocolAccount: protocolPda,
                protocolPubkey: params.protocolOwner,
                systemProgram: SystemProgram.programId,
            })
            .instruction();
    }

    async deactivateProtocol(
        params: DeactivateProtocolParams,
    ): Promise<TransactionInstruction> {
        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .deactivateProtocol()
            .accounts({
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    async reactivateProtocol(
        params: ReactivateProtocolParams,
    ): Promise<TransactionInstruction> {
        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .reactivateProtocol()
            .accounts({
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    async suspendProtocol(
        params: SuspendProtocolParams,
    ): Promise<TransactionInstruction> {
        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .suspendProtocol()
            .accounts({
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    // ── Billing ─────────────────────────────────────────────────────

    async renewSubscription(
        params: RenewSubscriptionParams,
    ): Promise<TransactionInstruction> {
        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .renewSubscription()
            .accounts({
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    async resetProtocolSends(
        params: ResetProtocolSendsParams,
    ): Promise<TransactionInstruction> {
        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .resetProtocolSends()
            .accounts({
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    // ── Receipts ────────────────────────────────────────────────────

    /**
     * Build the write_receipt instruction (Light Protocol CPI).
     *
     * Before calling this, the caller must:
     *   1. Fetch ValidityProof from Light RPC
     *   2. Get remaining accounts from Light RPC response
     *   3. Construct notificationId (UUID v4 as 16 bytes)
     */
    async writeReceipt(
        params: WriteReceiptParams,
    ): Promise<TransactionInstruction> {
        validateCategory(params.category);
        if (params.recipientHash.length !== 32) {
            throw new HeraldError('Recipient hash must be 32 bytes', 6018);
        }
        if (params.notificationId.length !== 16) {
            throw new HeraldError('Notification ID must be 16 bytes', 6019);
        }

        const [protocolPda] = findProtocolPda(
            params.protocolOwner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
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
}
