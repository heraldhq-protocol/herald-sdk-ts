import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { parseHeraldEvent } from '../../events/parser.js';

describe('Events - parser', () => {
    it('should parse IdentityRegistered event correctly', () => {
        const raw = {
            name: 'IdentityRegistered',
            wallet: '11111111111111111111111111111111',
            emailHash: new Array(32).fill(1),
            optInAll: true,
            optInDefi: false,
            optInGovernance: true,
            optInMarketing: false,
            digestMode: false,
            timestamp: { toString: () => '1700000000' }
        };

        const parsed = parseHeraldEvent(raw) as any;
        expect(parsed).toBeDefined();
        expect(parsed.name).toBe('IdentityRegistered');
        expect(parsed.wallet).toBeInstanceOf(PublicKey);
        expect(parsed.emailHash).toBeInstanceOf(Uint8Array);
        expect(parsed.optInAll).toBe(true);
        expect(parsed.optInDefi).toBe(false);
        expect(parsed.timestamp).toBe(1700000000n);
    });

    it('should parse ProtocolSendRecorded event correctly', () => {
        const raw = {
            name: 'ProtocolSendRecorded',
            protocol: '11111111111111111111111111111111',
            sendsThisPeriod: { toString: () => '150' },
            sendsLimit: { toString: () => '1000' },
            timestamp: { toString: () => '1700000000' }
        };

        const parsed = parseHeraldEvent(raw) as any;
        expect(parsed).toBeDefined();
        expect(parsed.name).toBe('ProtocolSendRecorded');
        expect(parsed.protocol).toBeInstanceOf(PublicKey);
        expect(parsed.sendsThisPeriod).toBe(150n);
        expect(parsed.sendsLimit).toBe(1000n);
    });

    it('should handle unrecognised events gracefully', () => {
        const raw = {
            name: 'UnknownEvent',
            someField: 123
        };

        const parsed = parseHeraldEvent(raw);
        expect(parsed).toBeNull();
    });

    it('should handle raw events without a name', () => {
        const raw = {
            someField: 123
        };

        const parsed = parseHeraldEvent(raw);
        expect(parsed).toBeNull();
    });
});
