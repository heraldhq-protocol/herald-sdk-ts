import { HERALD_ERROR_CODES } from './codes.js';
import type { HeraldErrorCode } from '../types/errors.js';

/**
 * Typed error class for all Herald SDK errors.
 * Wraps raw Anchor/Solana errors with friendly messages and error code helpers.
 */
export class HeraldError extends Error {
    public readonly name = 'HeraldError';

    constructor(
        message: string,
        public readonly code?: HeraldErrorCode,
        public readonly logs?: string[],
        public readonly cause?: unknown,
    ) {
        super(message);
        // Restore prototype chain for instanceof checks
        Object.setPrototypeOf(this, HeraldError.prototype);
    }

    /** Create a HeraldError from any Anchor / Solana error. */
    static fromAnchorError(err: unknown): HeraldError {
        return parseAnchorError(err);
    }

    /** User-friendly error message derived from the error code. */
    get friendlyMessage(): string {
        if (this.code !== undefined && this.code in HERALD_ERROR_CODES) {
            return HERALD_ERROR_CODES[this.code];
        }
        return this.message;
    }

    // ── Convenience predicates ──────────────────────────────────────

    isSendsLimitExceeded(): boolean { return this.code === 6013; }
    isSubscriptionExpired(): boolean { return this.code === 6011; }
    isUnauthorized(): boolean { return this.code === 6005 || this.code === 6006; }
    isProtocolSuspended(): boolean { return this.code === 6010; }
    isProtocolInactive(): boolean { return this.code === 6008; }
    isEmptyUpdate(): boolean { return this.code === 6004; }
}

// ── Parsing Utilities ─────────────────────────────────────────────

/**
 * Parse any Anchor/Solana error into a typed HeraldError.
 * Handles: custom program errors, simulation errors, RPC errors.
 */
export function parseAnchorError(err: unknown): HeraldError {
    if (err instanceof HeraldError) return err;

    // Anchor ProgramError with error code
    if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as any).code as number;
        if (code in HERALD_ERROR_CODES) {
            return new HeraldError(
                HERALD_ERROR_CODES[code],
                code,
                (err as any).logs,
                err,
            );
        }
    }

    // Anchor error with error.error.errorCode
    if (err && typeof err === 'object' && 'error' in err) {
        const inner = (err as any).error;
        if (inner && typeof inner === 'object' && 'errorCode' in inner) {
            const code = inner.errorCode?.number ?? inner.errorCode?.code;
            if (typeof code === 'number' && code in HERALD_ERROR_CODES) {
                return new HeraldError(HERALD_ERROR_CODES[code], code, (err as any).logs, err);
            }
        }
    }

    // Solana SendTransactionError — parse custom program error from logs
    if (err && typeof err === 'object' && 'logs' in err) {
        const logs = (err as any).logs as string[] | undefined;
        if (logs) {
            const match = logs.join('\n').match(/custom program error: 0x([0-9a-fA-F]+)/);
            if (match) {
                const code = parseInt(match[1], 16);
                if (code in HERALD_ERROR_CODES) {
                    return new HeraldError(HERALD_ERROR_CODES[code], code, logs, err);
                }
            }
            return new HeraldError('Transaction failed', undefined, logs, err);
        }
    }

    // Generic Error
    if (err instanceof Error) {
        return new HeraldError(err.message, undefined, undefined, err);
    }

    return new HeraldError(String(err), undefined, undefined, err);
}

/**
 * Higher-order function that wraps any async operation
 * with standardised Herald error handling.
 */
export async function withHeraldErrorHandling<T>(
    fn: () => Promise<T>,
): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        throw parseAnchorError(err);
    }
}

/**
 * Type guard to check if an error is a specific Herald error code.
 */
export function isHeraldErrorCode(
    err: unknown,
    code: number,
): err is HeraldError {
    return err instanceof HeraldError && err.code === code;
}

// ── Re-exports ────────────────────────────────────────────────────
export { HERALD_ERROR_CODES } from './codes.js';
