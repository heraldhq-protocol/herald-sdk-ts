/** Convert a Date to Unix timestamp (seconds). */
export function dateToUnix(date: Date): bigint {
    return BigInt(Math.floor(date.getTime() / 1000));
}

/** Convert a Unix timestamp (seconds) to Date. */
export function unixToDate(timestamp: bigint): Date {
    return new Date(Number(timestamp) * 1000);
}

/** Get current Unix timestamp in seconds. */
export function nowUnix(): bigint {
    return BigInt(Math.floor(Date.now() / 1000));
}

/** Check if a Unix timestamp is in the past. */
export function isExpired(timestamp: bigint): boolean {
    return timestamp <= nowUnix();
}
