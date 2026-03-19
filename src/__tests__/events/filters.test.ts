import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { matchesFilter } from '../../events/filters.js';
import { ProtocolTier, NOTIFICATION_CATEGORIES } from '../../types/accounts.js';

describe('Events - filters', () => {
    const mockIdentityEvent: any = {
        name: 'IdentityRegistered',
        wallet: new PublicKey('11111111111111111111111111111111'),
        timestamp: 100n,
    };

    const mockDeliveredEvent: any = {
        name: 'NotificationDelivered',
        protocol: new PublicKey(new Uint8Array(32).fill(2)),
        category: NOTIFICATION_CATEGORIES.DEFI,
        timestamp: 200n,
    };

    it('should filter by event name', () => {
        expect(matchesFilter(mockIdentityEvent, { eventNames: ['IdentityRegistered'] })).toBe(true);
        expect(matchesFilter(mockIdentityEvent, { eventNames: ['ProtocolRegistered'] })).toBe(false);
    });

    it('should filter by wallet', () => {
        const validWallet = new PublicKey('11111111111111111111111111111111');
        const invalidWallet = new PublicKey(new Uint8Array(32).fill(3));

        expect(matchesFilter(mockIdentityEvent, { wallet: validWallet })).toBe(true);
        expect(matchesFilter(mockIdentityEvent, { wallet: invalidWallet })).toBe(false);

        // Protocol fields should not match a wallet filter unless they are literally the same key
        expect(matchesFilter(mockDeliveredEvent, { wallet: new PublicKey(new Uint8Array(32).fill(2)) })).toBe(true);
    });

    it('should filter by protocol', () => {
        const validProtocol = new PublicKey(new Uint8Array(32).fill(2));
        expect(matchesFilter(mockDeliveredEvent, { protocol: validProtocol })).toBe(true);
        expect(matchesFilter(mockIdentityEvent, { protocol: validProtocol })).toBe(false);
    });

    it('should filter by category', () => {
        expect(matchesFilter(mockDeliveredEvent, { category: NOTIFICATION_CATEGORIES.DEFI })).toBe(true);
        expect(matchesFilter(mockDeliveredEvent, { category: NOTIFICATION_CATEGORIES.MARKETING })).toBe(false);

        // Identity events don't have a category field so they skip this check
        expect(matchesFilter(mockIdentityEvent, { category: NOTIFICATION_CATEGORIES.DEFI })).toBe(false);
    });

    it('should filter by time bounds', () => {
        expect(matchesFilter(mockIdentityEvent, { after: 50n })).toBe(true);
        expect(matchesFilter(mockIdentityEvent, { after: 150n })).toBe(false);

        expect(matchesFilter(mockDeliveredEvent, { before: 250n })).toBe(true);
        expect(matchesFilter(mockDeliveredEvent, { before: 150n })).toBe(false);

        expect(matchesFilter(mockIdentityEvent, { after: 50n, before: 150n })).toBe(true);
    });
});
