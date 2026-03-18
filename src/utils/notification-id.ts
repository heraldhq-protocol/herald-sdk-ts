import { v4 as uuidv4, parse as parseUuid } from 'uuid';

/**
 * Generate a new UUID v4 notification ID as a 16-byte Uint8Array.
 * This is the off-chain idempotency key for write_receipt.
 */
export function generateNotificationId(): Uint8Array {
    return new Uint8Array(parseUuid(uuidv4()) as ArrayLike<number>);
}

/**
 * Convert a UUID string to 16-byte Uint8Array for on-chain storage.
 */
export function uuidToBytes(uuid: string): Uint8Array {
    return new Uint8Array(parseUuid(uuid) as ArrayLike<number>);
}

/**
 * Convert 16-byte Uint8Array back to UUID string for display.
 */
export function bytesToUuid(bytes: Uint8Array): string {
    const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-');
}
