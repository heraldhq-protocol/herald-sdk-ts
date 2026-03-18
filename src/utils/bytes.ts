import bs58 from 'bs58';

/** Convert Uint8Array to hex string. */
export function toHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/** Convert hex string to Uint8Array. */
export function fromHex(hex: string): Uint8Array {
    const length = hex.length / 2;
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return result;
}

/** Convert Uint8Array to base58 string. */
export function toBase58(bytes: Uint8Array): string {
    return bs58.encode(bytes);
}

/** Convert base58 string to Uint8Array. */
export function fromBase58(str: string): Uint8Array {
    return bs58.decode(str);
}
