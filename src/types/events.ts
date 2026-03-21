import type { PublicKey } from '@solana/web3.js';
import type { ProtocolTier, NotificationCategory } from './accounts.js';

/**
 * Discriminated union of all Herald program events.
 * Includes all 14 events from the on-chain program.
 */
export type HeraldEvent =
    | IdentityRegisteredEvent
    | IdentityUpdatedEvent
    | PreferencesUpdatedEvent
    | IdentityDeletedEvent
    | ProtocolRegisteredEvent
    | ProtocolTierUpdatedEvent
    | ProtocolDeactivatedEvent
    | ProtocolReactivatedEvent
    | ProtocolSuspendedEvent
    | SubscriptionRenewedEvent
    | SubscriptionExpiredEvent
    | PeriodResetEvent
    | NotificationDeliveredEvent
    | ProtocolSendRecordedEvent;

export type HeraldEventName = HeraldEvent['name'];

// ── Identity Events ──────────────────────────────────────────────

export interface IdentityRegisteredEvent {
    name: 'IdentityRegistered';
    wallet: PublicKey;
    emailHash: Uint8Array;
    optInAll: boolean;
    optInDefi: boolean;
    optInGovernance: boolean;
    optInMarketing: boolean;
    digestMode: boolean;
    timestamp: bigint;
}

export interface IdentityUpdatedEvent {
    name: 'IdentityUpdated';
    wallet: PublicKey;
    emailChanged: boolean;
    preferencesChanged: boolean;
    timestamp: bigint;
}

export interface PreferencesUpdatedEvent {
    name: 'PreferencesUpdated';
    wallet: PublicKey;
    optInAll: boolean;
    optInDefi: boolean;
    optInGovernance: boolean;
    optInMarketing: boolean;
    digestMode: boolean;
    timestamp: bigint;
}

export interface IdentityDeletedEvent {
    name: 'IdentityDeleted';
    wallet: PublicKey;
    timestamp: bigint;
}

// ── Protocol Lifecycle Events ────────────────────────────────────

export interface ProtocolRegisteredEvent {
    name: 'ProtocolRegistered';
    protocol: PublicKey;
    nameHash: Uint8Array;
    tier: ProtocolTier;
    timestamp: bigint;
}

export interface ProtocolTierUpdatedEvent {
    name: 'ProtocolTierUpdated';
    protocol: PublicKey;
    oldTier: ProtocolTier;
    newTier: ProtocolTier;
    timestamp: bigint;
}

export interface ProtocolDeactivatedEvent {
    name: 'ProtocolDeactivated';
    protocol: PublicKey;
    timestamp: bigint;
}

export interface ProtocolReactivatedEvent {
    name: 'ProtocolReactivated';
    protocol: PublicKey;
    timestamp: bigint;
}

export interface ProtocolSuspendedEvent {
    name: 'ProtocolSuspended';
    protocol: PublicKey;
    timestamp: bigint;
}

// ── Billing Events ───────────────────────────────────────────────

export interface SubscriptionRenewedEvent {
    name: 'SubscriptionRenewed';
    protocol: PublicKey;
    tier: ProtocolTier;
    newExpiry: bigint;
    periodsPaid: number;
    usdcPaid: bigint;
    paymentSource: string;
    timestamp: bigint;
}

export interface SubscriptionExpiredEvent {
    name: 'SubscriptionExpired';
    protocol: PublicKey;
    expiredAt: bigint;
    timestamp: bigint;
}

export interface PeriodResetEvent {
    name: 'PeriodReset';
    protocol: PublicKey;
    sendsLastPeriod: bigint;
    tier: ProtocolTier;
    timestamp: bigint;
}

// ── Receipt / Notification Events ───────────────────────────────

export interface NotificationDeliveredEvent {
    name: 'NotificationDelivered';
    protocol: PublicKey;
    recipientHash: Uint8Array;
    notificationId: Uint8Array;
    category: NotificationCategory;
    sendsThisPeriod: bigint;
    timestamp: bigint;
}

export interface ProtocolSendRecordedEvent {
    name: 'ProtocolSendRecorded';
    protocol: PublicKey;
    sendsThisPeriod: bigint;
    sendsLimit: bigint;
    timestamp: bigint;
}
