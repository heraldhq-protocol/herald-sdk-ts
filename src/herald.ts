/**
 * Herald Developer SDK — the primary entry point for protocol developers.
 *
 * Provides a clean, minimal API for sending notifications.
 * Handles API key authentication, request signing, and error handling.
 *
 * @example
 * ```typescript
 * import { Herald } from '@herald-protocol/sdk';
 *
 * const herald = new Herald({
 *   apiKey: process.env.HERALD_API_KEY, // hrld_live_xxx
 * });
 *
 * const result = await herald.notify({
 *   wallet: '7xR4mKp2nQ...',
 *   subject: 'Liquidation Warning — Action Required',
 *   body: 'Your health factor on Drift is 1.05. Add collateral.',
 *   category: 'defi',
 *   receipt: true,
 *   idempotencyKey: `liq_${userId}_${Date.now()}`,
 * });
 *
 * console.log(result.notificationId); // UUID
 * console.log(result.status);         // 'queued'
 * ```
 */

export type HeraldEnvironment = 'production' | 'development';
export type NotifyCategory = 'defi' | 'governance' | 'system' | 'marketing';

export interface HeraldOptions {
    /** API key prefixed with `hrld_live_` (production) or `hrld_test_` (development). */
    apiKey: string;
    /** Override the gateway base URL. Auto-detected from API key prefix by default. */
    baseUrl?: string;
    /** Environment override. Auto-detected from API key prefix if not provided. */
    environment?: HeraldEnvironment;
    /** Request timeout in milliseconds. @default 10000 */
    timeout?: number;
}

export interface NotifyParams {
    /** Recipient's Solana wallet address (base58). */
    wallet: string;
    /** Notification subject line. Max 200 chars. */
    subject: string;
    /** Notification body text or markdown. Max 10,000 chars. */
    body: string;
    /** Notification category — determines which opt-in flag is checked. @default 'defi' */
    category?: NotifyCategory;
    /** Write an on-chain ZK receipt for proof of delivery. @default true */
    receipt?: boolean;
    /** Idempotency key — prevents duplicate sends. Max 128 chars. */
    idempotencyKey?: string;
    /** Custom email template ID (Growth+ tier). */
    templateId?: string;
    /** Custom Telegram template ID (Scale+ tier). */
    telegramTemplateId?: string;
    /** Variables injected into custom templates. */
    templateVariables?: Record<string, string>;
}

export interface NotifyResult {
    /** Unique notification ID (UUID). */
    notificationId: string;
    /** Current status — 'queued' on initial send. */
    status: 'queued' | 'processing' | 'delivered' | 'failed';
    /** Timestamp of when the notification was queued. */
    queuedAt: string;
}

export interface NotificationStatusResult {
    notificationId: string;
    status: string;
    category: string;
    queuedAt: string;
    deliveredAt?: string;
    receiptTx?: string;
    channels?: {
        email?: { success: boolean; messageId?: string };
        telegram?: { success: boolean; messageId?: string };
        sms?: { success: boolean; messageId?: string };
    };
}

export interface BulkNotifyParams {
    /** Array of wallet addresses. Max 1000 per call. */
    wallets: string[];
    /** Notification subject line. */
    subject: string;
    /** Notification body text or markdown. */
    body: string;
    /** Notification category. @default 'defi' */
    category?: NotifyCategory;
    /** Write on-chain ZK receipts. @default true */
    receipt?: boolean;
    /** Idempotency prefix — each wallet gets `{prefix}:{wallet}`. */
    idempotencyPrefix?: string;
    /** Custom email template ID (Growth+ tier). */
    templateId?: string;
    /** Custom Telegram template ID (Scale+ tier). */
    telegramTemplateId?: string;
    /** Variables injected into custom templates. */
    templateVariables?: Record<string, string>;
}

export interface BulkNotifyResult {
    /** Total notifications queued. */
    queued: number;
    /** Wallet addresses that were skipped (not registered). */
    skipped: string[];
    /** Batch ID for tracking. */
    batchId: string;
}

const GATEWAY_URLS: Record<HeraldEnvironment, string> = {
    production: 'https://api.useherald.xyz',
    development: 'http://localhost:3000',
};

export class HeraldError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly code?: string | number,
        public readonly headers?: Record<string, string>,
    ) {
        super(message);
        this.name = 'HeraldError';
    }
}

export class Herald {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly timeout: number;
    private readonly environment: HeraldEnvironment;

    constructor(options: HeraldOptions) {
        if (!options.apiKey) {
            throw new Error('Herald: apiKey is required');
        }

        this.apiKey = options.apiKey;
        this.environment = options.environment ?? this.detectEnvironment();
        this.baseUrl = options.baseUrl ?? GATEWAY_URLS[this.environment];
        this.timeout = options.timeout ?? 10_000;
    }

    /**
     * Send a notification to a single wallet.
     * The wallet owner must be registered in the Herald Privacy Registry.
     * Their notification preferences (opt-in flags) are checked automatically.
     */
    async notify(params: NotifyParams): Promise<NotifyResult> {
        return this.request<NotifyResult>('POST', '/v1/notifications', {
            wallet: params.wallet,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            writeReceipt: params.receipt ?? true,
            idempotencyKey: params.idempotencyKey,
            templateId: params.templateId,
            telegramTemplateId: params.telegramTemplateId,
            templateVariables: params.templateVariables,
        });
    }

    /**
     * Send a notification to multiple wallets in a single API call.
     * Max 1000 wallets per request. Uses batch processing internally.
     */
    async notifyBulk(params: BulkNotifyParams): Promise<BulkNotifyResult> {
        if (params.wallets.length > 1000) {
            throw new HeraldError('Herald: Max 1000 wallets per bulk request', 400, 'PAYLOAD_TOO_LARGE');
        }
        return this.request<BulkNotifyResult>('POST', '/v1/notifications/bulk', {
            wallets: params.wallets,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            writeReceipt: params.receipt ?? true,
            idempotencyPrefix: params.idempotencyPrefix,
            templateId: params.templateId,
            telegramTemplateId: params.telegramTemplateId,
            templateVariables: params.templateVariables,
        });
    }

    /**
     * Check the delivery status of a notification.
     * Includes per-channel delivery details when available.
     */
    async getStatus(notificationId: string): Promise<NotificationStatusResult> {
        return this.request<NotificationStatusResult>(
            'GET',
            `/v1/notifications/${notificationId}`,
        );
    }

    /**
     * Poll until a notification reaches a terminal state (delivered, failed).
     * @param notificationId - The ID returned from notify()
     * @param timeoutMs - Max time to wait (default 30000ms)
     * @param pollIntervalMs - Polling interval (default 2000ms)
     */
    async waitForDelivery(
        notificationId: string,
        timeoutMs = 30000,
        pollIntervalMs = 2000,
    ): Promise<NotificationStatusResult> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeoutMs) {
            const status = await this.getStatus(notificationId);
            if (status.status === 'delivered' || status.status === 'failed') {
                return status;
            }
            // Sleep
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }
        throw new HeraldError('Timeout waiting for terminal delivery state', 408, 'TIMEOUT');
    }

    /**
     * Check if a specific wallet is currently registered with Herald.
     */
    async isRegistered(wallet: string): Promise<boolean> {
        try {
           const res: any = await this.request('GET', `/v1/wallets/${wallet}/status`);
           return res.registered;
        } catch (e: any) {
           if (e.status === 404) return false;
           throw e;
        }
    }

    /**
     * Get real-time usage metrics and quota limits.
     */
    async getUsage(): Promise<{ limit: number; remaining: number; resetAt: number }> {
        return this.request('GET', `/v1/usage`);
    }

    /**
     * Verify the webhook signature from Herald.
     * Use this in your webhook handler to ensure authenticity.
     *
     * @param payload - Raw request body (string or Buffer)
     * @param signature - X-Herald-Signature header value
     * @param secret - Your webhook secret
     */
    static async verifyWebhookSignature(
        payload: string | Uint8Array | unknown,
        signature: string,
        secret: string,
    ): Promise<boolean> {
        const encoder = new TextEncoder();
        const key = await globalThis.crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign'],
        );
        
        const dataToSign = typeof payload === 'string' 
            ? encoder.encode(payload) 
            : new Uint8Array(payload as ArrayLike<number> | ArrayBuffer);

        const sig = await globalThis.crypto.subtle.sign(
            'HMAC',
            key,
            dataToSign,
        );
        const expected = Buffer.from(sig).toString('hex');
        return expected === signature;
    }

    // ── Internal request helper ─────────────────────────────────

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        path: string,
        body?: Record<string, unknown>,
        retries = 3,
        backoffMs = 500
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const headers: Record<string, string> = {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'herald-sdk-ts/1.2.0',
            };

            const fetchOptions: RequestInit = {
                method,
                headers,
                signal: controller.signal,
            };

            if (body && method !== 'GET') {
                fetchOptions.body = JSON.stringify(body);
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                // Retry logic for 5xx and 429
                if (retries > 0 && (response.status >= 500 || response.status === 429)) {
                    clearTimeout(timeoutId);
                    
                    let retryDelay = backoffMs;
                    if (response.status === 429) {
                        const retryAfter = response.headers.get('Retry-After');
                        if (retryAfter) {
                            retryDelay = parseInt(retryAfter, 10) * 1000 || retryDelay;
                        }
                    }
                    
                    await new Promise(res => setTimeout(res, retryDelay));
                    return this.request<T>(method, path, body, retries - 1, backoffMs * 2);
                }

                const errorBody = await response.text().catch(() => '');
                let errorMessage = `Herald API error: ${response.status}`;
                let errorCode: string | number = response.status;
                const errorHeaders: Record<string, string> = {};
                response.headers.forEach((value, key) => errorHeaders[key] = value);

                try {
                    const parsed = JSON.parse(errorBody);
                    errorMessage = parsed.message || parsed.error || errorMessage;
                    errorCode = parsed.code || errorCode;
                } catch {
                    if (errorBody) errorMessage = errorBody;
                }
                throw new HeraldError(errorMessage, response.status, errorCode, errorHeaders);
            }

            return (await response.json()) as T;
        } catch (e: any) {
            if (e.name === 'AbortError') {
                 throw new HeraldError(`Request timeout after ${this.timeout}ms`, 408, 'TIMEOUT');
            }
            throw e;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private detectEnvironment(): HeraldEnvironment {
        if (this.apiKey.startsWith('hrld_test_')) return 'development';
        return 'production';
    }
}
