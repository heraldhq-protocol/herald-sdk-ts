import bs58 from 'bs58';

/** Convert Uint8Array to hex string. */
export function toHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/** Convert hex string to Uint8Array. */
export function fromHex(hex: string): Uint8Array {
    let paddedHex = hex;
    if (paddedHex.length % 2 !== 0) {
        paddedHex = '0' + paddedHex;
    }

    const bytes = new Uint8Array(paddedHex.length / 2);
    for (let i = 0; i < paddedHex.length; i += 2) {
        bytes[i / 2] = parseInt(paddedHex.substring(i, i + 2), 16);
    }
    return bytes;
}

/** Convert Uint8Array to base58 string. */
export function toBase58(bytes: Uint8Array): string {
    return bs58.encode(bytes);
}

/** Convert base58 string to Uint8Array. */
export function fromBase58(str: string): Uint8Array {
    return bs58.decode(str);
}
