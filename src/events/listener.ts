import EventEmitter3 from 'eventemitter3';
import type { PublicKey } from '@solana/web3.js';
import type { Program } from '@coral-xyz/anchor';
import { parseHeraldEvent } from './parser.js';
import { HeraldError } from '../errors/index.js';
import type { HeraldEvent, HeraldEventName } from '../types/events.js';

type EventListenerMap = {
    [K in HeraldEventName]: (event: Extract<HeraldEvent, { name: K }>) => void;
} & {
    '*': (event: HeraldEvent) => void;
    error: (error: HeraldError) => void;
};

/**
 * Herald event listener — typed wrapper around Anchor's program.addEventListener.
 *
 * @example
 * ```typescript
 * const listener = new HeraldEventListener(program);
 *
 * listener.on('NotificationDelivered', (event) => {
 *   console.log('Delivered:', event.notificationId);
 * });
 *
 * listener.start();
 * // ... later ...
 * await listener.stop();
 * ```
 */
export class HeraldEventListener extends EventEmitter3<EventListenerMap> {
    private listenerIds: number[] = [];
    private readonly program: Program;

    constructor(program: Program) {
        super();
        this.program = program;
    }

    /** Begin WebSocket event subscription. */
    start(): void {
        // Subscribe to all known event types
        const eventNames = [
            'IdentityRegistered',
            'IdentityUpdated',
            'PreferencesUpdated',
            'IdentityDeleted',
            'ProtocolRegistered',
            'ProtocolTierUpdated',
            'ProtocolDeactivated',
            'ProtocolReactivated',
            'ProtocolSuspended',
            'SubscriptionRenewed',
            'SubscriptionExpiredEvent',
            'PeriodReset',
            'NotificationDelivered',
            'ProtocolSendRecorded',
        ];

        for (const eventName of eventNames) {
            const id = this.program.addEventListener(
                eventName,
                (event: Record<string, unknown>, _slot: number) => {
                    try {
                        const parsed = parseHeraldEvent({ ...event, name: eventName });
                        if (parsed) {
                            this.emit(parsed.name as HeraldEventName, parsed as any);
                            this.emit('*', parsed);
                        }
                    } catch (err) {
                        this.emit('error', HeraldError.fromAnchorError(err));
                    }
                },
            );
            this.listenerIds.push(id);
        }
    }

    /** Stop all event subscriptions. */
    async stop(): Promise<void> {
        const removals = this.listenerIds.map((id) =>
            this.program.removeEventListener(id),
        );
        await Promise.all(removals);
        this.listenerIds = [];
    }

    /** Subscribe to a specific wallet's identity events only. */
    onWalletEvents(
        wallet: PublicKey,
        handler: (event: HeraldEvent) => void,
    ): () => void {
        const walletKey = wallet.toBase58();

        const filterHandler = (event: HeraldEvent) => {
            const evt = event as any;
            if (
                evt.wallet?.toBase58() === walletKey ||
                evt.protocol?.toBase58() === walletKey
            ) {
                handler(event);
            }
        };

        this.on('*', filterHandler);
        return () => this.off('*', filterHandler);
    }
}
