import { PublicKey } from '@solana/web3.js';

/** Truncate a base58 address for display: "7xR4...BCD". */
export function truncateAddress(address: string, chars = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Check if a string is a valid Solana public key. */
export function isValidPubkey(value: string): boolean {
    try {
        new PublicKey(value);
        return true;
    } catch {
        return false;
    }
}
