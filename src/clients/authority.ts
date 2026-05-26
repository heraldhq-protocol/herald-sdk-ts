import {
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js';
import { BaseClient } from './base.js';
import { findProtocolPda, findGlobalConfigPda } from '../pda/index.js';
import { validateTier, validateCategory } from '../encryption/validation.js';
import { HeraldError } from '../errors/index.js';
import type {
    RegisterProtocolParams,
    DeactivateProtocolParams,
    ReactivateProtocolParams,
    SuspendProtocolParams,
    RenewSubscriptionParams,
    ResetProtocolSendsParams,
    UpdateProtocolTierParams,
    WriteReceiptParams,
    InitializeConfigParams,
    UpdateAuthorityParams,
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

    // ── GlobalConfig ────────────────────────────────────────────────

    /**
     * Build instruction to initialize the GlobalConfig PDA.
     * Call once after first program deployment. Stores the authority on-chain
     * so it can be rotated without a future program upgrade.
     */
    async initializeConfig(
        params: InitializeConfigParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);

        return await this.program.methods
            .initializeConfig(params.initialAuthority)
            .accounts({
                payer: params.payer,
                globalConfig: globalConfigPda,
                systemProgram: SystemProgram.programId,
            })
            .instruction();
    }

    /**
     * Build instruction to rotate the Herald authority stored in GlobalConfig.
     * The current authority must sign. Takes effect immediately on-chain.
     */
    async updateAuthority(
        params: UpdateAuthorityParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);

        return await this.program.methods
            .updateAuthority(params.newAuthority)
            .accounts({
                authority: params.authority,
                globalConfig: globalConfigPda,
            })
            .instruction();
    }

    // ── Protocol Lifecycle ──────────────────────────────────────────

    /**
     * Build instruction to register a brand new protocol on the registry.
     *
     * @param params - Parameters required to register a protocol.
     * @param params.authority - The Herald global authority public key (authorized signer).
     * @param params.protocolOwner - The public key of the protocol's developer wallet.
     * @param params.nameHash - SHA-256 hash of the protocol's plaintext name.
     * @param params.tier - Initial protocol usage tier (e.g., Free, Essential, Pro, Enterprise).
     *
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
     */
    async registerProtocol(
        params: RegisterProtocolParams,
    ): Promise<TransactionInstruction> {
        validateTier(params.tier);

        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .registerProtocol(Array.from(params.nameHash), params.tier)
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
                protocolPubkey: params.protocolOwner,
                systemProgram: SystemProgram.programId,
            })
            .instruction();
    }

    /**
     * Build instruction to deactivate a protocol.
     */
    async deactivateProtocol(
        params: DeactivateProtocolParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .deactivateProtocol()
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    /**
     * Build instruction to reactivate a formerly deactivated protocol.
     */
    async reactivateProtocol(
        params: ReactivateProtocolParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .reactivateProtocol()
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    /**
     * Build instruction to suspend a protocol (ToS violation).
     */
    async suspendProtocol(
        params: SuspendProtocolParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .suspendProtocol()
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    /**
     * Build instruction to update a protocol's tier level.
     */
    async updateProtocolTier(
        params: UpdateProtocolTierParams,
    ): Promise<TransactionInstruction> {
        validateTier(params.newTier);

        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .updateProtocolTier(params.newTier)
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    // ── Billing ─────────────────────────────────────────────────────

    /**
     * Build instruction to renew a protocol's subscription.
     */
    async renewSubscription(
        params: RenewSubscriptionParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .renewSubscription()
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .instruction();
    }

    /**
     * Build instruction to reset a protocol's send counters.
     */
    async resetProtocolSends(
        params: ResetProtocolSendsParams,
    ): Promise<TransactionInstruction> {
        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .resetProtocolSends()
            .accounts({
                globalConfig: globalConfigPda,
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

        const programId = new PublicKey(this.config.programId);
        const [globalConfigPda] = findGlobalConfigPda(programId);
        const [protocolPda] = findProtocolPda(params.protocolOwner, programId);

        return await this.program.methods
            .writeReceipt(
                params.proof as any,
                params.outputTreeIndex,
                Array.from(params.recipientHash),
                Array.from(params.notificationId),
                params.category,
            )
            .accounts({
                globalConfig: globalConfigPda,
                authority: params.authority,
                protocolAccount: protocolPda,
            })
            .remainingAccounts(params.lightRemainingAccounts)
            .instruction();
    }
}
