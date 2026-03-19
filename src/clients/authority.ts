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
     * 
     * @example
     * ```typescript
     * const ix = await authorityClient.registerProtocol({
     *   authority: HERALD_AUTHORITY,
     *   protocolOwner: protocolDevWallet,
     *   nameHash: hashedName,
     *   tier: 1 // Example tier
     * });
     * ```
     */
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

    /**
     * Build instruction to deactivate a protocol.
     * 
     * Deactivating a protocol prevents it from sending new notifications,
     * though the data remains on-chain. Usually triggered by the protocol owner
     * closing their account or halting services.
     * 
     * @param params - Parameters required to deactivate a protocol.
     * @param params.authority - The Herald global authority public key.
     * @param params.protocolOwner - The public key of the protocol to deactivate.
     * 
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
     */
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

    /**
     * Build instruction to reactivate a formerly deactivated protocol.
     * 
     * @param params - Parameters required to reactivate a protocol.
     * @param params.authority - The Herald global authority public key.
     * @param params.protocolOwner - The public key of the protocol to reactivate.
     * 
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
     */
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

    /**
     * Build instruction to suspend a protocol.
     * 
     * A suspension is triggered unilaterally by Herald due to abuse
     * (e.g., spamming or violating terms of service).
     * Suspended protocols cannot send notifications and cannot be 
     * reactivated except by Herald staff intervention.
     * 
     * @param params - Parameters required to suspend a protocol.
     * @param params.authority - The Herald global authority public key.
     * @param params.protocolOwner - The public key of the protocol to suspend.
     * 
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
     */
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

    /**
     * Build instruction to renew a protocol's subscription for the next payment period.
     * Modifies the on-chain subscription expiration time.
     * 
     * @param params - Parameters required to renew a subscription.
     * @param params.authority - The Herald global authority public key.
     * @param params.protocolOwner - The public key of the protocol being renewed.
     * 
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
     */
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

    /**
     * Build instruction to reset a protocol's daily/monthly send counters.
     * Usually executed automatically by the backend CRON when billing periods roll over.
     * 
     * @param params - Parameters required to reset send counters.
     * @param params.authority - The Herald global authority public key.
     * @param params.protocolOwner - The public key of the protocol to reset.
     * 
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
     */
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
     * 
     * @param params - Parameters for writing the receipt.
     * @param params.authority - The Herald global authority public key.
     * @param params.protocolOwner - The public key of the protocol issuing the receipt.
     * @param params.proof - The compressed validity proof fetched from Light Protocol.
     * @param params.outputTreeIndex - Index of the output tree from the Light RPC.
     * @param params.recipientHash - SHA-256 hash of the intended recipient's wallet address.
     * @param params.notificationId - Bytes representing the unique ID of the notification.
     * @param params.category - Activity category (e.g. DeFi, Governance) of this notification.
     * @param params.lightRemainingAccounts - Extra accounts required by Light Protocol dynamically.
     * 
     * @returns A promise resolving to an unsigned `TransactionInstruction`.
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
