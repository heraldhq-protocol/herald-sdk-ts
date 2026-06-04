import {
    PublicKey,
    TransactionInstruction,
} from '@solana/web3.js';
import { BaseClient } from '../clients/base.js';
import { findIdentityPda } from '../pda/index.js';
import { HeraldError } from '../errors/index.js';
import type {
    RegisterTelegramParams,
    RegisterSmsParams,
    UpdateChannelSettingsParams,
    RemoveChannelParams,
} from './types.js';
import { MAX_ENCRYPTED_TELEGRAM_ID_LEN, MAX_ENCRYPTED_PHONE_LEN } from './types.js';
import type { HeraldConfig } from '../types/config.js';

/**
 * ChannelUserClient — manages Telegram and SMS channel registration.
 *
 * All methods return unsigned TransactionInstructions.
 * Caller (browser wallet) signs and sends.
 *
 * @example
 * ```typescript
 * import { ChannelUserClient } from '@herald-protocol/sdk/channels';
 *
 * const channelClient = new ChannelUserClient({ rpcUrl: '...' });
 *
 * // After user starts @HeraldBot in Telegram and gets their chat_id:
 * // Seal to the GATEWAY's X25519 pubkey so it can decrypt and deliver.
 * const { instructions } = await channelClient.buildTelegramRegistrationTx(
 *   wallet.publicKey,
 *   chatId,                // e.g. "123456789"
 *   gatewayX25519Pubkey,   // 32-byte gateway key (same one the email path uses)
 * );
 *
 * const tx = new Transaction().add(...instructions);
 * await wallet.signAndSendTransaction(tx);
 * ```
 */
export class ChannelUserClient extends BaseClient {
    constructor(config: HeraldConfig) {
        super(config);
    }

    /**
     * Build instruction to register or update the Telegram channel.
     */
    async registerTelegram(params: RegisterTelegramParams): Promise<TransactionInstruction> {
        const { owner, data } = params;

        if (data.encryptedTelegramId.length === 0) {
            throw new HeraldError('Encrypted Telegram ID is empty', 6027);
        }
        if (data.encryptedTelegramId.length > MAX_ENCRYPTED_TELEGRAM_ID_LEN) {
            throw new HeraldError('Encrypted Telegram ID too long', 6028);
        }

        const [identityPda] = findIdentityPda(owner, new PublicKey(this.config.programId));

        return await this.program.methods
            .registerTelegram(
                Buffer.from(data.encryptedTelegramId),
                Array.from(data.telegramIdHash),
                Array.from(data.nonceTelegram),
            )
            .accounts({
                owner,
                identityAccount: identityPda,
            })
            .instruction();
    }

    /**
     * Build instruction to register or update the SMS channel.
     */
    async registerSms(params: RegisterSmsParams): Promise<TransactionInstruction> {
        const { owner, data } = params;

        if (data.encryptedPhone.length === 0) {
            throw new HeraldError('Encrypted phone is empty', 6030);
        }
        if (data.encryptedPhone.length > MAX_ENCRYPTED_PHONE_LEN) {
            throw new HeraldError('Encrypted phone too long', 6031);
        }

        const [identityPda] = findIdentityPda(owner, new PublicKey(this.config.programId));

        return await this.program.methods
            .registerSms(
                Buffer.from(data.encryptedPhone),
                Array.from(data.phoneHash),
                Array.from(data.nonceSms),
            )
            .accounts({
                owner,
                identityAccount: identityPda,
            })
            .instruction();
    }

    /**
     * Build instruction to toggle channel flags on/off.
     * Only provided fields are updated — pass undefined to leave unchanged.
     */
    async updateChannelSettings(
        params: UpdateChannelSettingsParams,
    ): Promise<TransactionInstruction> {
        const [identityPda] = findIdentityPda(params.owner, new PublicKey(this.config.programId));

        return await this.program.methods
            .updateChannelSettings(
                params.channelEmail ?? null,
                params.channelTelegram ?? null,
                params.channelSms ?? null,
            )
            .accounts({
                owner: params.owner,
                identityAccount: identityPda,
            })
            .instruction();
    }

    /**
     * Build instruction to permanently remove a channel's encrypted data.
     * Only supports 'telegram' and 'sms' — email is the primary channel.
     */
    async removeChannel(params: RemoveChannelParams): Promise<TransactionInstruction> {
        const [identityPda] = findIdentityPda(params.owner, new PublicKey(this.config.programId));

        // Anchor enum: { telegram: {} } or { sms: {} }
        const channelEnum = params.channel === 'telegram'
            ? { telegram: {} }
            : { sms: {} };

        return await this.program.methods
            .removeChannel(channelEnum)
            .accounts({
                owner: params.owner,
                identityAccount: identityPda,
            })
            .instruction();
    }

    /**
     * Build a complete "register telegram" transaction.
     * Encrypts the chat_id and returns the instruction + expected hash.
     * Single transaction: user doesn't need to sign twice.
     *
     * The chat_id is sealed to the Herald Gateway's X25519 public key so the
     * gateway can decrypt it to deliver notifications. It MUST NOT be sealed to
     * the user's wallet key — the gateway could never open that.
     *
     * @param gatewayX25519Pubkey - Gateway's 32-byte X25519 public key (same key the email path uses).
     */
    async buildTelegramRegistrationTx(
        owner: PublicKey,
        chatId: string,
        gatewayX25519Pubkey: Uint8Array,
    ): Promise<{ instructions: TransactionInstruction[]; expectedHash: Uint8Array }> {
        const { encryptTelegramIdForGateway } = await import('./encryption.js');
        const { encrypted, hash, nonce } = await encryptTelegramIdForGateway(chatId, gatewayX25519Pubkey);

        const ix = await this.registerTelegram({
            owner,
            data: { encryptedTelegramId: encrypted, telegramIdHash: hash, nonceTelegram: nonce },
        });

        return { instructions: [ix], expectedHash: hash };
    }

    /**
     * Build a complete "register sms" transaction.
     * Encrypts the phone and returns the instruction + expected hash.
     *
     * The phone is sealed to the Herald Gateway's X25519 public key so the
     * gateway can decrypt it to deliver notifications — not to the user's wallet.
     *
     * @param gatewayX25519Pubkey - Gateway's 32-byte X25519 public key (same key the email path uses).
     */
    async buildSmsRegistrationTx(
        owner: PublicKey,
        phoneE164: string,
        gatewayX25519Pubkey: Uint8Array,
    ): Promise<{ instructions: TransactionInstruction[]; expectedHash: Uint8Array }> {
        const { encryptPhoneForGateway } = await import('./encryption.js');
        const { encrypted, hash, nonce } = await encryptPhoneForGateway(phoneE164, gatewayX25519Pubkey);

        const ix = await this.registerSms({
            owner,
            data: { encryptedPhone: encrypted, phoneHash: hash, nonceSms: nonce },
        });

        return { instructions: [ix], expectedHash: hash };
    }
}
