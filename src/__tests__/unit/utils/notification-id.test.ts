import { describe, it, expect } from 'vitest';
import { generateNotificationId, uuidToBytes, bytesToUuid } from '../../../utils/notification-id.js';

describe('Utils - notification-id', () => {
    describe('generateNotificationId', () => {
        it('should generate a 16-byte random identifier', () => {
            const id = generateNotificationId();
            expect(id).toBeInstanceOf(Uint8Array);
            expect(id.length).toBe(16);

            const id2 = generateNotificationId();
            expect(id).not.toEqual(id2);
        });
    });

    describe('uuid conversions', () => {
        it('should properly convert between string UUIDs and 16-byte arrays', () => {
            const uuidStr = '123e4567-e89b-12d3-a456-426614174000';
            const bytes = uuidToBytes(uuidStr);

            expect(bytes).toBeInstanceOf(Uint8Array);
            expect(bytes.length).toBe(16);

            const convertedBack = bytesToUuid(bytes);
            expect(convertedBack).toBe(uuidStr);
        });

        it('should throw on invalid UUID strings', () => {
            expect(() => uuidToBytes('invalid-uuid')).toThrow();
        });
    });
});
