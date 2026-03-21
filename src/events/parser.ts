import { PublicKey } from '@solana/web3.js';
import type {
    HeraldEvent,
    IdentityRegisteredEvent,
    IdentityUpdatedEvent,
    PreferencesUpdatedEvent,
    IdentityDeletedEvent,
    ProtocolRegisteredEvent,
    ProtocolTierUpdatedEvent,
    ProtocolDeactivatedEvent,
    ProtocolReactivatedEvent,
    ProtocolSuspendedEvent,
    SubscriptionRenewedEvent,
    SubscriptionExpiredEvent,
    PeriodResetEvent,
    NotificationDeliveredEvent,
    ProtocolSendRecordedEvent,
} from '../types/events.js';

/**
 * Parse a raw Anchor event into a typed HeraldEvent.
 * Returns null if the event name is not recognized.
 */
export function parseHeraldEvent(
    raw: Record<string, unknown>,
): HeraldEvent | null {
    const name = raw.name as string;
    if (!name) return null;

    switch (name) {
        case 'IdentityRegistered':
            return {
                name: 'IdentityRegistered',
                wallet: new PublicKey(raw.wallet as string),
                emailHash: Uint8Array.from(raw.emailHash as number[]),
                optInAll: raw.optInAll as boolean,
                optInDefi: raw.optInDefi as boolean,
                optInGovernance: raw.optInGovernance as boolean,
                optInMarketing: raw.optInMarketing as boolean,
                digestMode: raw.digestMode as boolean,
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies IdentityRegisteredEvent;

        case 'IdentityUpdated':
            return {
                name: 'IdentityUpdated',
                wallet: new PublicKey(raw.wallet as string),
                emailChanged: raw.emailChanged as boolean,
                preferencesChanged: raw.preferencesChanged as boolean,
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies IdentityUpdatedEvent;

        case 'PreferencesUpdated':
            return {
                name: 'PreferencesUpdated',
                wallet: new PublicKey(raw.wallet as string),
                optInAll: raw.optInAll as boolean,
                optInDefi: raw.optInDefi as boolean,
                optInGovernance: raw.optInGovernance as boolean,
                optInMarketing: raw.optInMarketing as boolean,
                digestMode: raw.digestMode as boolean,
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies PreferencesUpdatedEvent;

        case 'IdentityDeleted':
            return {
                name: 'IdentityDeleted',
                wallet: new PublicKey(raw.wallet as string),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies IdentityDeletedEvent;

        case 'ProtocolRegistered':
            return {
                name: 'ProtocolRegistered',
                protocol: new PublicKey(raw.protocol as string),
                nameHash: Uint8Array.from(raw.nameHash as number[]),
                tier: raw.tier as any,
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies ProtocolRegisteredEvent;

        case 'ProtocolTierUpdated':
            return {
                name: 'ProtocolTierUpdated',
                protocol: new PublicKey(raw.protocol as string),
                oldTier: raw.oldTier as any,
                newTier: raw.newTier as any,
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies ProtocolTierUpdatedEvent;

        case 'ProtocolDeactivated':
            return {
                name: 'ProtocolDeactivated',
                protocol: new PublicKey(raw.protocol as string),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies ProtocolDeactivatedEvent;

        case 'ProtocolReactivated':
            return {
                name: 'ProtocolReactivated',
                protocol: new PublicKey(raw.protocol as string),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies ProtocolReactivatedEvent;

        case 'ProtocolSuspended':
            return {
                name: 'ProtocolSuspended',
                protocol: new PublicKey(raw.protocol as string),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies ProtocolSuspendedEvent;

        case 'SubscriptionRenewed':
            return {
                name: 'SubscriptionRenewed',
                protocol: new PublicKey(raw.protocol as string),
                tier: raw.tier as any,
                newExpiry: BigInt((raw.newExpiry as any).toString()),
                periodsPaid: raw.periodsPaid as number,
                usdcPaid: BigInt((raw.usdcPaid as any)?.toString() || '0'),
                paymentSource: raw.paymentSource ? Buffer.from(raw.paymentSource as any[]).toString('utf8').replace(/\0/g, '') : '',
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies SubscriptionRenewedEvent;

        case 'SubscriptionExpiredEvent':
        case 'SubscriptionExpired':
            return {
                name: 'SubscriptionExpired',
                protocol: new PublicKey(raw.protocol as string),
                expiredAt: BigInt((raw.expiredAt as any).toString()),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies SubscriptionExpiredEvent;

        case 'PeriodReset':
            return {
                name: 'PeriodReset',
                protocol: new PublicKey(raw.protocol as string),
                sendsLastPeriod: BigInt((raw.sendsLastPeriod as any).toString()),
                tier: raw.tier as any,
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies PeriodResetEvent;

        case 'NotificationDelivered':
            return {
                name: 'NotificationDelivered',
                protocol: new PublicKey(raw.protocol as string),
                recipientHash: Uint8Array.from(raw.recipientHash as number[]),
                notificationId: Uint8Array.from(raw.notificationId as number[]),
                category: raw.category as any,
                sendsThisPeriod: BigInt((raw.sendsThisPeriod as any).toString()),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies NotificationDeliveredEvent;

        case 'ProtocolSendRecorded':
            return {
                name: 'ProtocolSendRecorded',
                protocol: new PublicKey(raw.protocol as string),
                sendsThisPeriod: BigInt((raw.sendsThisPeriod as any).toString()),
                sendsLimit: BigInt((raw.sendsLimit as any).toString()),
                timestamp: BigInt((raw.timestamp as any).toString()),
            } satisfies ProtocolSendRecordedEvent;

        default:
            return null;
    }
}
