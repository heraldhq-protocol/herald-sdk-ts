import EventEmitter3 from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import type { ProtocolTier } from '../../types/accounts.js';
import type {
    SubscriptionRenewedEvent,
    PeriodResetEvent,
    ProtocolSuspendedEvent,
} from '../../types/events.js';

// Replicating PaymentReceivedEvent because it might not be exported from events.ts yet based on the plan instructions.
export interface PaymentReceivedEvent {
    name: 'PaymentReceived';
    protocol: PublicKey;
    amountUsdc: bigint;
    tokenMint: PublicKey;
    tier: ProtocolTier;
    months: number;
    newExpiry: bigint;
    timestamp: bigint;
}

type BillingEventMap = {
    subscriptionRenewed: (event: SubscriptionRenewedEvent) => void;
    paymentReceived: (event: PaymentReceivedEvent) => void;
    protocolSuspended: (event: ProtocolSuspendedEvent) => void;
    periodReset: (event: PeriodResetEvent) => void;
    error: (error: Error) => void;
};

/**
 * Listens for billing-related on-chain events.
 */
export class SubscriptionEventListener extends EventEmitter3<BillingEventMap> {
    private listenerId?: number;

    constructor(private readonly program: Program) {
        super();
    }

    start(): void {
        this.listenerId = this.program.addEventListener('*', (rawEvent: any) => {
            try {
                switch (rawEvent.name) {
                    case 'SubscriptionRenewed':
                        this.emit('subscriptionRenewed', this.parseSubscriptionRenewed(rawEvent.data));
                        break;
                    case 'PaymentReceived':
                        this.emit('paymentReceived', this.parsePaymentReceived(rawEvent.data));
                        break;
                    case 'ProtocolSuspended':
                        this.emit('protocolSuspended', { ...rawEvent.data, name: 'ProtocolSuspended' });
                        break;
                    case 'PeriodReset':
                        this.emit('periodReset', { ...rawEvent.data, name: 'PeriodReset' });
                        break;
                }
            } catch (err) {
                this.emit('error', err as Error);
            }
        });
    }

    async stop(): Promise<void> {
        if (this.listenerId !== undefined) {
            await this.program.removeEventListener(this.listenerId);
            this.listenerId = undefined;
        }
    }

    private parseSubscriptionRenewed(raw: any): SubscriptionRenewedEvent {
        return {
            name: 'SubscriptionRenewed',
            protocol: new PublicKey(raw.protocol),
            tier: raw.tier as ProtocolTier,
            newExpiry: BigInt(raw.newExpiry),
            periodsPaid: raw.periodsPaid,
            usdcPaid: BigInt(raw.usdcPaid ?? 0),
            paymentSource: raw.paymentSource ? Buffer.from(raw.paymentSource).toString('utf8').replace(/\0/g, '') : '',
            timestamp: BigInt(raw.timestamp),
        };
    }

    private parsePaymentReceived(raw: any): PaymentReceivedEvent {
        return {
            name: 'PaymentReceived',
            protocol: new PublicKey(raw.protocol),
            amountUsdc: BigInt(raw.amountUsdc),
            tokenMint: new PublicKey(raw.tokenMint),
            tier: raw.tier as ProtocolTier,
            months: raw.months,
            newExpiry: BigInt(raw.newExpiry),
            timestamp: BigInt(raw.timestamp),
        };
    }
}
