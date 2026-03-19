import { describe, it, expect } from 'vitest';
import { toHex, fromHex, toBase58, fromBase58 } from '../../utils/bytes.js';
import bs58 from 'bs58';

describe('Utils - bytes', () => {
    const vectors = [
        { bytes: new Uint8Array([0, 1, 2, 255]), hex: '000102ff', base58: bs58.encode(new Uint8Array([0, 1, 2, 255])) },
        { bytes: new Uint8Array([]), hex: '', base58: '' },
        { bytes: new Uint8Array([10, 20, 30]), hex: '0a141e', base58: bs58.encode(new Uint8Array([10, 20, 30])) },
    ];

    describe('Hex Conversion', () => {
        it('should correctly convert Uint8Array to hex', () => {
            vectors.forEach((v) => {
                expect(toHex(v.bytes)).toBe(v.hex);
            });
        });

        it('should correctly convert hex to Uint8Array', () => {
            vectors.forEach((v) => {
                expect(fromHex(v.hex)).toEqual(v.bytes);
            });
        });

        it('should gracefully handle odd-length hex strings', () => {
            // padding or throwing - in our impl it pads 0 if length is odd
            const res = fromHex('a');
            expect(res).toEqual(new Uint8Array([10]));
        });
    });

    describe('Base58 Conversion', () => {
        it('should correctly convert Uint8Array to base58', () => {
            vectors.forEach((v) => {
                expect(toBase58(v.bytes)).toBe(v.base58);
            });
        });

        it('should correctly convert base58 to Uint8Array', () => {
            vectors.forEach((v) => {
                expect(fromBase58(v.base58)).toEqual(v.bytes);
            });
        });
    });
});
