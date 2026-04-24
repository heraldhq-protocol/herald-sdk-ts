import { PublicKey } from "@solana/web3.js";
import { BaseClient } from "./base.js";
import { findIdentityPda, findProtocolPda } from "../pda/index.js";
import { HeraldError } from "../errors/index.js";
import { hashWalletAddress } from "../utils/recipient-hash.js";
import { TIER_METADATA } from "../types/accounts.js";
import type {
  IdentityAccount,
  ProtocolRegistryAccount,
} from "../types/accounts.js";
import type { LightReceiptResponse } from "../types/light.js";
import type { HeraldConfig } from "../types/config.js";
import type { ChannelConfig } from "../channels/types.js";

/**
 * ReadClient — account fetching and event subscriptions.
 * No signing required. Safe for browser use.
 */
export class ReadClient extends BaseClient {
  constructor(config: HeraldConfig) {
    super(config);
  }

  /**
   * Fetch IdentityAccount for a given wallet pubkey.
   * Returns null if the account does not exist (wallet not registered).
   *
   * @param owner - The wallet public key to fetch the identity for.
   * @returns A promise resolving to the deserialized `IdentityAccount` or `null` if not found.
   *
   * @example
   * ```typescript
   * const identity = await readClient.fetchIdentityAccount(userWallet.publicKey);
   * if (identity) {
   *   console.log('User is subscribed to all:', identity.optInAll);
   * }
   * ```
   */
  async fetchIdentityAccount(
    owner: PublicKey,
  ): Promise<IdentityAccount | null> {
    const [pda] = findIdentityPda(owner, new PublicKey(this.config.programId));
    try {
      const raw = await (this.program.account as any).identityAccount.fetch(
        pda,
        this.config.commitment,
      );
      return deserializeIdentityAccount(raw);
    } catch (err) {
      if (isAccountNotFoundError(err)) return null;
      throw HeraldError.fromAnchorError(err);
    }
  }

  /**
   * Fetch ProtocolRegistryAccount for a given protocol wallet pubkey.
   *
   * @param protocolOwner - The public key of the protocol developer's wallet.
   * @returns A promise resolving to the deserialized `ProtocolRegistryAccount` or `null` if not found.
   */
  async fetchProtocolAccount(
    protocolOwner: PublicKey,
  ): Promise<ProtocolRegistryAccount | null> {
    const [pda] = findProtocolPda(
      protocolOwner,
      new PublicKey(this.config.programId),
    );
    try {
      const raw = await (
        this.program.account as any
      ).protocolRegistryAccount.fetch(pda, this.config.commitment);
      return deserializeProtocolAccount(raw);
    } catch (err) {
      if (isAccountNotFoundError(err)) return null;
      throw HeraldError.fromAnchorError(err);
    }
  }

  /**
   * Check if a wallet is registered in the Herald Privacy Registry.
   * Efficient: only checks account existence, does not deserialise.
   *
   * @param owner - The wallet public key to check for registration.
   * @returns A promise resolving to `true` if the wallet is registered, `false` otherwise.
   */
  async isRegistered(owner: PublicKey): Promise<boolean> {
    const [pda] = findIdentityPda(owner, new PublicKey(this.config.programId));
    const info = await this.connection.getAccountInfo(
      pda,
      this.config.commitment,
    );
    return info !== null;
  }

  /**
   * Fetch multiple IdentityAccounts in a single RPC call.
   * Returns a Map<base58_pubkey, IdentityAccount | null>.
   *
   * @param owners - An array of wallet public keys to fetch identities for.
   * @returns A Map where the key is the base58 string of the owner's pubkey and the value is the `IdentityAccount` or `null`.
   */
  async fetchIdentityAccountBatch(
    owners: PublicKey[],
  ): Promise<Map<string, IdentityAccount | null>> {
    const programId = new PublicKey(this.config.programId);
    const pdas = owners.map((o) => findIdentityPda(o, programId)[0]);

    const accounts = await (
      this.program.account as any
    ).identityAccount.fetchMultiple(pdas, this.config.commitment);

    return new Map(
      owners.map((owner, i) => [
        owner.toBase58(),
        accounts[i] ? deserializeIdentityAccount(accounts[i]!) : null,
      ]),
    );
  }

  /**
   * Check protocol eligibility to send notifications.
   * Mirrors the on-chain can_send() helper method.
   *
   * @param protocolOwner - The public key of the protocol.
   * @returns An object indicating if the protocol can send, the reason for failure, remaining sends, and expiration.
   */
  async checkProtocolCanSend(protocolOwner: PublicKey): Promise<{
    canSend: boolean;
    reason?: string;
    sendsRemaining?: bigint;
    expiresAt?: Date;
  }> {
    const account = await this.fetchProtocolAccount(protocolOwner);

    if (!account) return { canSend: false, reason: "Protocol not registered" };
    if (account.isSuspended)
      return { canSend: false, reason: "Protocol suspended by Herald" };
    if (!account.isActive)
      return { canSend: false, reason: "Protocol is not active" };

    const now = BigInt(Math.floor(Date.now() / 1000));

    if (account.subscriptionExpiresAt === 0n) {
      return { canSend: false, reason: "No active subscription" };
    }
    if (account.subscriptionExpiresAt <= now) {
      return {
        canSend: false,
        reason: "Subscription expired",
        expiresAt: new Date(Number(account.subscriptionExpiresAt) * 1000),
      };
    }

    const limit = TIER_METADATA[account.tier].sendsLimit;
    const remaining = limit - account.sendsThisPeriod;

    if (remaining <= 0n) {
      return {
        canSend: false,
        reason: `Send limit reached (${limit.toString()} sends/period for ${TIER_METADATA[account.tier].name} tier)`,
        sendsRemaining: 0n,
      };
    }

    return {
      canSend: true,
      sendsRemaining: remaining,
      expiresAt: new Date(Number(account.subscriptionExpiresAt) * 1000),
    };
  }

  /**
   * Fetch delivery receipts for a recipient wallet from the
   * Light Protocol Photon indexer.
   *
   * @param recipientWallet - The wallet public key of the recipient.
   * @param _options - Pagination options.
   * @returns A promise resolving to a `LightReceiptResponse`.
   */
  async fetchReceiptsForWallet(
    recipientWallet: PublicKey,
    _options?: { limit?: number; cursor?: string },
  ): Promise<LightReceiptResponse> {
    const _recipientHash = await hashWalletAddress(recipientWallet);
    // Light Protocol receipt fetching via Photon indexer.
    // Implementation depends on the @lightprotocol/stateless.js Rpc API.
    // Placeholder — returns empty until Light RPC integration is complete.
    return { receipts: [], total: 0 };
  }

  /**
   * Fetch all receipts sent by a specific protocol.
   *
   * @param _protocolOwner - The public key of the protocol developer's wallet.
   * @param _options - Pagination options.
   * @returns A promise resolving to a `LightReceiptResponse`.
   */
  async fetchReceiptsByProtocol(
    _protocolOwner: PublicKey,
    _options?: { limit?: number; cursor?: string },
  ): Promise<LightReceiptResponse> {
    // Light Protocol receipt fetching via Photon indexer.
    // Placeholder — returns empty until Light RPC integration is complete.
    return { receipts: [], total: 0 };
  }
  /**
   * Fetch channel configuration for an identity.
   * Returns which channels are enabled, which are registered, and total active count.
   *
   * @param owner - The wallet public key to check channel status for.
   * @returns ChannelConfig or null if identity not found.
   */
  async fetchChannelConfig(owner: PublicKey): Promise<ChannelConfig | null> {
    const identity = await this.fetchIdentityAccount(owner);
    if (!identity) return null;

    const email = {
      enabled: identity.channelEmail,
      registered: identity.encryptedEmail.length > 0,
    };
    const telegram = {
      enabled: identity.channelTelegram,
      registered: identity.encryptedTelegramId.length > 0,
    };
    const sms = {
      enabled: identity.channelSms,
      registered: identity.encryptedPhone.length > 0,
    };

    let activeCount = 0;
    if (email.enabled && email.registered) activeCount++;
    if (telegram.enabled && telegram.registered) activeCount++;
    if (sms.enabled && sms.registered) activeCount++;

    return { email, telegram, sms, activeCount };
  }
}

// ── Account Deserialization Helpers ───────────────────────────────

function deserializeIdentityAccount(raw: any): IdentityAccount {
  return {
    owner: raw.owner as PublicKey,
    encryptedEmail: Uint8Array.from(
      raw.encryptedEmail ?? raw.encrypted_email ?? [],
    ),
    emailHash: Uint8Array.from(raw.emailHash ?? raw.email_hash ?? []),
    nonce: Uint8Array.from(raw.nonce ?? []),
    registeredAt: BigInt(raw.registeredAt ?? raw.registered_at ?? 0),
    optInAll: raw.optInAll ?? raw.opt_in_all ?? false,
    optInDefi: raw.optInDefi ?? raw.opt_in_defi ?? false,
    optInGovernance: raw.optInGovernance ?? raw.opt_in_governance ?? false,
    optInMarketing: raw.optInMarketing ?? raw.opt_in_marketing ?? false,
    digestMode: raw.digestMode ?? raw.digest_mode ?? false,
    bump: raw.bump ?? 0,
    // Channel fields
    channelEmail: raw.channelEmail ?? raw.channel_email ?? false,
    channelTelegram: raw.channelTelegram ?? raw.channel_telegram ?? false,
    channelSms: raw.channelSms ?? raw.channel_sms ?? false,
    encryptedTelegramId: Uint8Array.from(
      raw.encryptedTelegramId ?? raw.encrypted_telegram_id ?? [],
    ),
    telegramIdHash: Uint8Array.from(
      raw.telegramIdHash ?? raw.telegram_id_hash ?? new Array(32).fill(0),
    ),
    nonceTelegram: Uint8Array.from(
      raw.nonceTelegram ?? raw.nonce_telegram ?? new Array(24).fill(0),
    ),
    encryptedPhone: Uint8Array.from(
      raw.encryptedPhone ?? raw.encrypted_phone ?? [],
    ),
    phoneHash: Uint8Array.from(
      raw.phoneHash ?? raw.phone_hash ?? new Array(32).fill(0),
    ),
    nonceSms: Uint8Array.from(
      raw.nonceSms ?? raw.nonce_sms ?? new Array(24).fill(0),
    ),
    // Notification key fields
    sealedX25519Pubkey: Uint8Array.from(
      raw.sealedX25519Pubkey ??
        raw.sealed_x25519_pubkey ??
        new Array(48).fill(0),
    ),
    senderX25519Pubkey: Uint8Array.from(
      raw.senderX25519Pubkey ??
        raw.sender_x25519_pubkey ??
        new Array(32).fill(0),
    ),
    notificationNonce: Uint8Array.from(
      raw.notificationNonce ?? raw.notification_nonce ?? new Array(24).fill(0),
    ),
    notificationKeyVersion:
      raw.notificationKeyVersion ?? raw.notification_key_version ?? 0,
    notificationKeyUpdatedAt: BigInt(
      raw.notificationKeyUpdatedAt ?? raw.notification_key_updated_at ?? 0,
    ),
    notificationKeyRotationCount:
      raw.notificationKeyRotationCount ??
      raw.notification_key_rotation_count ??
      0,
  };
}

function deserializeProtocolAccount(raw: any): ProtocolRegistryAccount {
  return {
    owner: raw.owner as PublicKey,
    nameHash: Uint8Array.from(raw.nameHash ?? raw.name_hash ?? []),
    tier: raw.tier ?? 0,
    subscriptionExpiresAt: BigInt(
      raw.subscriptionExpiresAt ?? raw.subscription_expires_at ?? 0,
    ),
    lastRenewedAt: BigInt(raw.lastRenewedAt ?? raw.last_renewed_at ?? 0),
    periodsPaid: raw.periodsPaid ?? raw.periods_paid ?? 0,
    sendsThisPeriod: BigInt(raw.sendsThisPeriod ?? raw.sends_this_period ?? 0),
    isActive: raw.isActive ?? raw.is_active ?? false,
    isSuspended: raw.isSuspended ?? raw.is_suspended ?? false,
    registeredAt: BigInt(raw.registeredAt ?? raw.registered_at ?? 0),
    bump: raw.bump ?? 0,
  };
}

/** Check if an error is an "Account does not exist" error from Anchor. */
function isAccountNotFoundError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("account does not exist") ||
      msg.includes("could not find") ||
      msg.includes("has not been found") ||
      msg.includes("account not found")
    );
  }
  return false;
}
