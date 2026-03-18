/**
 * Complete mapping of Anchor error codes → human-readable messages.
 * Custom program errors start at offset 6000 (Anchor convention).
 * Order matches the on-chain HeraldError enum in errors.rs.
 */
export const HERALD_ERROR_CODES: Record<number, string> = {
    // Identity errors (6000–6004)
    6000: 'Encrypted email exceeds maximum length of 200 bytes',
    6001: 'Encrypted email must not be empty',
    6002: 'Email hash must be exactly 32 bytes (SHA-256)',
    6003: 'Nonce must be exactly 24 bytes',
    6004: 'Update must modify at least one field',
    // Authorization errors (6005–6006)
    6005: 'Unauthorized: signer does not match required authority',
    6006: 'Unauthorized: signer does not own this identity account',
    // Protocol lifecycle errors (6007–6010)
    6007: 'Invalid tier: must be 0 (dev), 1 (growth), 2 (scale), or 3 (enterprise)',
    6008: 'Protocol is not active',
    6009: 'Protocol is already deactivated',
    6010: 'Protocol has been suspended by Herald and cannot send notifications',
    // Subscription/billing errors (6011–6016)
    6011: 'Protocol subscription has expired; renew to continue sending',
    6012: 'Protocol has not yet subscribed; subscription_expires_at is zero',
    6013: 'Protocol has reached the maximum sends for this billing period',
    6014: 'Protocol sends counter would overflow',
    6015: 'New subscription expiry must be in the future',
    6016: 'Protocol is already active; no need to reactivate',
    // Receipt/notification errors (6017–6019)
    6017: 'Invalid category: must be 0 (DeFi), 1 (Governance), 2 (Marketing), or 3 (Other)',
    6018: 'Recipient hash must be exactly 32 bytes (SHA-256)',
    6019: 'Notification ID must be exactly 16 bytes (UUID v4)',
    // Light Protocol errors (6020–6022)
    6020: 'Failed to initialise Light Protocol CPI accounts',
    6021: 'Failed to attach compressed account to Light CPI',
    6022: 'Light Protocol CPI invocation failed',
    // General errors (6023–6024)
    6023: 'Arithmetic overflow',
    6024: 'Clock sysvar unavailable',
};
