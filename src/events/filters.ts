import type { PublicKey } from '@solana/web3.js';
import type { HeraldEvent, HeraldEventName, NotificationCategory } from '../types/index.js';

/** Filter type for event queries. */
export interface EventFilter {
    /** Only events matching these names. */
    eventNames?: HeraldEventName[];
    /** Only events for this wallet (identity) or protocol. */
    wallet?: PublicKey;
    /** Only events for this protocol. */
    protocol?: PublicKey;
    /** Only notification events with this category. */
    category?: NotificationCategory;
    /** Only events after this timestamp. */
    after?: bigint;
    /** Only events before this timestamp. */
    before?: bigint;
}

/** Apply a filter to a HeraldEvent. Returns true if the event passes. */
export function matchesFilter(event: HeraldEvent, filter: EventFilter): boolean {
    if (filter.eventNames && !filter.eventNames.includes(event.name)) {
        return false;
    }

    if (filter.wallet) {
        const walletKey = filter.wallet.toBase58();
        const evt = event as any;
        if (evt.wallet?.toBase58() !== walletKey && evt.protocol?.toBase58() !== walletKey) {
            return false;
        }
    }

    if (filter.protocol) {
        const protocolKey = filter.protocol.toBase58();
        const evt = event as any;
        if (evt.protocol?.toBase58() !== protocolKey) {
            return false;
        }
    }

    if (filter.category !== undefined && 'category' in event) {
        if ((event as any).category !== filter.category) return false;
    }

    const ts = (event as any).timestamp as bigint | undefined;
    if (ts !== undefined) {
        if (filter.after !== undefined && ts <= filter.after) return false;
        if (filter.before !== undefined && ts >= filter.before) return false;
    }

    return true;
}
