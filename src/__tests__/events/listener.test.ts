import { describe, it, expect, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { HeraldEventListener } from '../../events/listener.js';
import type { Program } from '@coral-xyz/anchor';

describe('Events - listener', () => {
    it('should subscribe and parse valid events correctly', async () => {
        // Mock Program
        const mockCallbacks: Record<string, Function> = {};

        const mockProgram = {
            addEventListener: vi.fn((eventName, cb) => {
                mockCallbacks[eventName] = cb;
                return Math.floor(Math.random() * 1000);
            }),
            removeEventListener: vi.fn(async () => { }),
        } as unknown as Program;

        const listener = new HeraldEventListener(mockProgram);
        listener.start();

        expect(mockProgram.addEventListener).toHaveBeenCalledTimes(14); // All 14 known event types

        // Simulate an incoming valid event from Anchor
        const spy = vi.fn();
        listener.on('IdentityDeleted', spy);

        const rawEvent = {
            wallet: '11111111111111111111111111111111',
            timestamp: { toString: () => '1700000000' },
        };

        // Trigger Anchor callback
        mockCallbacks['IdentityDeleted'](rawEvent, 123);

        expect(spy).toHaveBeenCalledTimes(1);
        const parsedEvent = spy.mock.calls[0][0];

        expect(parsedEvent.name).toBe('IdentityDeleted');
        expect(parsedEvent.wallet).toBeInstanceOf(PublicKey);

        await listener.stop();
        expect(mockProgram.removeEventListener).toHaveBeenCalledTimes(14);
    });

    it('should emit error event on parsing failure', async () => {
        const mockCallbacks: Record<string, Function> = {};

        const mockProgram = {
            addEventListener: vi.fn((eventName, cb) => {
                mockCallbacks[eventName] = cb;
                return 1;
            }),
            removeEventListener: vi.fn(async () => { }),
        } as unknown as Program;

        const listener = new HeraldEventListener(mockProgram);
        listener.start();

        const errSpy = vi.fn();
        listener.on('error', errSpy);

        // Trigger Anchor callback with invalid data that causes throw in parser
        // e.g. invalid base58 string for PublicKey
        const rawEvent = {
            wallet: 'not a base58 key',
            timestamp: { toString: () => '1700000000' },
        };

        mockCallbacks['IdentityDeleted'](rawEvent, 123);

        expect(errSpy).toHaveBeenCalledTimes(1);
        expect(errSpy.mock.calls[0][0]).toBeInstanceOf(Error);
    });
});
