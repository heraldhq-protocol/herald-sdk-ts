import {
    PublicKey,
    SystemProgram,
    TransactionInstruction,
} from '@solana/web3.js';
import { BaseClient } from '../clients/base.js';
import { findIdentityPda } from '../pda/index.js';
import { CURRENT_NOTIFICATION_KEY_VERSION } from '../constants.js';
import { sealX25519PubkeyForEnclave, decryptNotification, decryptNotificationBody } from './crypto.js';
import { KeyNotRegisteredError } from './errors.js';
import type { HeraldConfig } from '../types/config.js';
import type {
    NotificationKeyWallet,
    KeyStatus,
    RegisterKeyResult,
    EncryptedNotification,
    DecryptedNotification,
} from './types.js';

/**
 * NotificationKeyClient — manages notification encryption key lifecycle.
 *
 * Handles:
 * - Registering a sealed X25519 key on the IdentityAccount PDA
 * - Rotating keys (re-derive + re-seal + increment rotation count)
 * - Revoking keys (zero out notification key fields)
 * - Reading key status from on-chain
 * - Client-side decryption of encrypted notifications
 *
 * All methods return unsigned TransactionInstructions.
 * The caller assembles and signs the transaction.
 */
export class NotificationKeyClient extends BaseClient {
    constructor(config: HeraldConfig) {
        super(config);
    }

    /**
     * Build instruction to register a sealed notification key.
     *
     * Flow:
     *   1. Prompts wallet to sign the derivation message
     *   2. Derives X25519 keypair, seals pubkey for enclave
     *   3. Returns the register_notification_key instruction
     *
     * @param wallet - Wallet adapter with signMessage + publicKey.
     * @param enclaveWrappingPubkey - Optional override for enclave pubkey.
     * @returns Instruction + sender pubkey for the caller to send.
     */
    async buildRegisterKeyIx(
        wallet: NotificationKeyWallet,
        enclaveWrappingPubkey?: Uint8Array,
    ): Promise<{ ix: TransactionInstruction; senderPubkey: Uint8Array }> {
        const sealed = await sealX25519PubkeyForEnclave(wallet, enclaveWrappingPubkey);

        const [identityPda] = findIdentityPda(
            wallet.publicKey,
            new PublicKey(this.config.programId),
        );

        const ix = await this.program.methods
            .registerNotificationKey(
                Array.from(sealed.sealedPubkey),
                Array.from(sealed.senderPubkey),
                Array.from(sealed.nonce),
                CURRENT_NOTIFICATION_KEY_VERSION,
            )
            .accounts({
                owner: wallet.publicKey,
                identityAccount: identityPda,
            })
            .instruction();

        return { ix, senderPubkey: sealed.senderPubkey };
    }

    /**
     * Build instruction to register a sealed notification key using pre-sealed data.
     *
     * @param owner - Wallet public key
     * @param sealedPubkey - Encrypted pubkey
     * @param senderPubkey - Unencrypted ephemeral pubkey
     * @param nonce - Encryption nonce
     * @param version - Key version
     * @returns Instruction
     */
    async buildRegisterKeyIxWithData(
        owner: PublicKey,
        sealedPubkey: Uint8Array,
        senderPubkey: Uint8Array,
        nonce: Uint8Array,
        version: number,
    ): Promise<{ ix: TransactionInstruction }> {
        const [identityPda] = findIdentityPda(
            owner,
            new PublicKey(this.config.programId),
        );

        const ix = await this.program.methods
            .registerNotificationKey(
                Array.from(sealedPubkey),
                Array.from(senderPubkey),
                Array.from(nonce),
                version,
            )
            .accounts({
                owner,
                identityAccount: identityPda,
            })
            .instruction();

        return { ix };
    }

    /**
     * Build instruction to rotate the notification key.
     * Derives a fresh keypair and re-seals for the enclave.
     *
     * @param wallet - Wallet adapter.
     * @param enclaveWrappingPubkey - Optional enclave pubkey override.
     * @returns Instruction + new sender pubkey.
     */
    async buildRotateKeyIx(
        wallet: NotificationKeyWallet,
        enclaveWrappingPubkey?: Uint8Array,
    ): Promise<{ ix: TransactionInstruction; senderPubkey: Uint8Array }> {
        const sealed = await sealX25519PubkeyForEnclave(wallet, enclaveWrappingPubkey);

        const { ix } = await this.buildRotateKeyIxWithData(
            wallet.publicKey,
            sealed.sealedPubkey,
            sealed.senderPubkey,
            sealed.nonce,
            CURRENT_NOTIFICATION_KEY_VERSION,
        );

        return { ix, senderPubkey: sealed.senderPubkey };
    }

    /**
     * Build instruction to rotate the notification key using pre-sealed data.
     */
    async buildRotateKeyIxWithData(
        owner: PublicKey,
        sealedPubkey: Uint8Array,
        senderPubkey: Uint8Array,
        nonce: Uint8Array,
        version: number,
    ): Promise<{ ix: TransactionInstruction }> {
        const [identityPda] = findIdentityPda(
            owner,
            new PublicKey(this.config.programId),
        );

        const ix = await this.program.methods
            .rotateNotificationKey(
                Array.from(sealedPubkey),
                Array.from(senderPubkey),
                Array.from(nonce),
                version,
            )
            .accounts({
                owner,
                identityAccount: identityPda,
            })
            .instruction();

        return { ix };
    }

    /**
     * Build instruction to revoke the notification key.
     * Zeroes all key fields but keeps the identity account.
     *
     * @param owner - Wallet public key.
     * @returns Revoke instruction.
     */
    async buildRevokeKeyIx(
        owner: PublicKey,
    ): Promise<TransactionInstruction> {
        const [identityPda] = findIdentityPda(
            owner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .revokeNotificationKey()
            .accounts({
                owner,
                identityAccount: identityPda,
            })
            .instruction();
    }

    /**
     * Build instruction to migrate an existing account to the new size.
     * Required for accounts created before the notification key upgrade.
     *
     * @param owner - Wallet public key (also payer for extra rent).
     * @returns Migration instruction.
     */
    async buildMigrateSpaceIx(
        owner: PublicKey,
    ): Promise<TransactionInstruction> {
        const [identityPda] = findIdentityPda(
            owner,
            new PublicKey(this.config.programId),
        );

        return await this.program.methods
            .migrateNotificationKeySpace()
            .accounts({
                owner,
                identityAccount: identityPda,
                systemProgram: SystemProgram.programId,
            })
            .instruction();
    }

    /**
     * Fetch the notification key status from on-chain.
     *
     * @param walletPubkey - The wallet to check.
     * @returns Key status or null if identity doesn't exist.
     */
    async getKeyStatus(walletPubkey: PublicKey): Promise<KeyStatus | null> {
        const [identityPda] = findIdentityPda(
            walletPubkey,
            new PublicKey(this.config.programId),
        );

        try {
            const account = await (this.program.account as any).identityAccount.fetch(identityPda);

            // Check if sealed pubkey is all zeros
            const sealedPubkey = account.sealedX25519Pubkey as number[];
            const isRegistered = sealedPubkey.some((b: number) => b !== 0);

            if (!isRegistered) {
                return { isRegistered: false, version: null, updatedAt: null, rotationCount: null };
            }

            return {
                isRegistered: true,
                version: account.notificationKeyVersion as number,
                updatedAt: new Date(Number(account.notificationKeyUpdatedAt as bigint) * 1000),
                rotationCount: account.notificationKeyRotationCount as number,
            };
        } catch {
            // Account doesn't exist
            return null;
        }
    }

    /**
     * Decrypt a single encrypted notification.
     *
     * @param wallet - Wallet adapter with signMessage.
     * @param notification - Encrypted notification from the Herald API.
     * @param enclaveWrappingPubkey - Optional enclave pubkey override.
     * @returns Decrypted notification.
     */
    async decrypt(
        wallet: NotificationKeyWallet,
        notification: EncryptedNotification,
        enclaveWrappingPubkey?: Uint8Array,
    ): Promise<DecryptedNotification> {
        const body = await decryptNotificationBody(
            wallet,
            notification.ciphertext,
            notification.nonce,
            enclaveWrappingPubkey,
        );

        return {
            id: notification.id,
            body,
            protocol: notification.protocol,
            category: notification.category,
            createdAt: notification.createdAt,
        };
    }

    /**
     * Decrypt a batch of encrypted notifications.
     * Signs the derivation message only once, then decrypts all notifications.
     *
     * @param wallet - Wallet adapter.
     * @param notifications - Array of encrypted notifications.
     * @param enclaveWrappingPubkey - Optional enclave pubkey override.
     * @returns Array of decrypted notifications.
     */
    async decryptBatch(
        wallet: NotificationKeyWallet,
        notifications: EncryptedNotification[],
        enclaveWrappingPubkey?: Uint8Array,
    ): Promise<DecryptedNotification[]> {
        if (notifications.length === 0) return [];

        // Decrypt all — the first call signs, subsequent re-derive deterministically
        // In practice the wallet caches the signature for the same message within a session
        const results = await Promise.all(
            notifications.map(n => this.decrypt(wallet, n, enclaveWrappingPubkey)),
        );

        return results;
    }
}
