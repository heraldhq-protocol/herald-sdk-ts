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
 * console.log(result.receiptStatus);  // 'pending' → 'confirmed' once on-chain
 * ```
 */

export type HeraldEnvironment = 'production' | 'development';
export type NotifyCategory = 'defi' | 'governance' | 'system' | 'marketing' | 'security';
export type NotifyPriority = 'normal' | 'important' | 'critical';
export type DeliveryChannel = 'email' | 'telegram' | 'sms';
export type ReceiptStatus = 'pending' | 'confirmed' | 'failed' | 'disabled';

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
    /** Notification subject line. Max 150 chars. */
    subject: string;
    /** Notification body text or markdown. Max 10,000 chars. */
    body: string;
    /** Notification category — determines which opt-in flag is checked. @default 'defi' */
    category?: NotifyCategory;
    /**
     * Delivery priority. 'critical' adds SMS as a fallback channel.
     * @default 'normal'
     */
    priority?: NotifyPriority;
    /** Express a preferred delivery channel. Falls back if unavailable. */
    preferredChannel?: DeliveryChannel;
    /** Write an on-chain ZK receipt for proof of delivery. @default true */
    receipt?: boolean;
    /** Idempotency key — prevents duplicate sends within 24h. Max 128 chars. */
    idempotencyKey?: string;
    /** Custom email template ID (Growth+ tier). */
    templateId?: string;
    /** Custom Telegram template ID (Scale+ tier). */
    telegramTemplateId?: string;
    /** Variables injected into custom templates. */
    templateVariables?: Record<string, string>;
}

export interface NotifyResult {
    /** Unique notification ID (UUID). Use with getStatus() to poll. */
    notificationId: string;
    /** Initial status — always 'queued' on success. */
    status: 'queued' | 'opted_out' | 'duplicate' | 'failed' | 'blocked';
    /** Whether the recipient is registered in Herald. null = cache miss. */
    recipientRegistered: boolean | null;
    /** Estimated delivery time in milliseconds. */
    estimatedDeliveryMs: number;
    /** ZK receipt tx — null at queue time, populated after on-chain confirmation. */
    receiptTx: string | null;
    /** Resolved delivery channel. */
    deliveryChannel: DeliveryChannel | null;
    /** Environment the notification was sent in. */
    environment: 'production' | 'sandbox';
    /** Machine-readable error code when status is 'failed'. */
    errorCode?: string;
}

export interface NotificationStatusResult {
    notificationId: string;
    /** Delivery status. */
    status: string;
    category: string;
    /** ISO datetime when the notification was queued. */
    createdAt: string;
    /** ISO datetime when the notification was delivered. null if not yet. */
    deliveredAt: string | null;
    /**
     * ZK on-chain receipt status.
     * - pending   — delivery confirmed, receipt not yet written
     * - confirmed — receipt tx landed on Solana
     * - failed    — on-chain write failed (see receiptFailureReason)
     * - disabled  — receipt was not requested for this notification
     */
    receiptStatus: ReceiptStatus;
    /** Solana transaction signature of the ZK receipt. null until confirmed. */
    receiptTx: string | null;
    /** Human-readable reason why the receipt failed, if status is 'failed'. */
    receiptFailureReason: string | null;
    /** ISO datetime of the last receipt write attempt. */
    lastReceiptAttemptAt: string | null;
    /** Whether a ZK receipt was requested for this notification. */
    writeReceipt: boolean;
    /** Email provider used (e.g. 'ses', 'resend'). */
    emailProvider: string | null;
    /** Whether the notification bounced. */
    bounce: boolean;
}

export interface BulkNotifyParams {
    /** Recipient wallet addresses. Max 100 per call. */
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
    /** Per-notification results in the same order as params.wallets. */
    results: NotifyResult[];
}

export interface SubscribeParams {
    /** Wallet address to subscribe (base58). */
    walletAddress: string;
    /** Channels to subscribe on. @default ['email'] */
    channels?: DeliveryChannel[];
}

export interface SubscriptionStatus {
    /** Whether the wallet is currently subscribed. */
    subscribed: boolean;
    channels: string[];
    subscribedAt: string | null;
}

export interface BroadcastParams {
    /** Notification subject line. Max 150 chars. */
    subject: string;
    /** Notification body text or markdown. Max 10,000 chars. */
    body: string;
    /** Notification category. @default 'defi' */
    category?: NotifyCategory;
    /** Write on-chain ZK receipts. @default false for broadcasts. */
    receipt?: boolean;
    /** Custom email template ID (Growth+ tier). */
    templateId?: string;
}

export interface BroadcastResult {
    broadcast_id: string;
    queued_count: number;
    total_subscribers: number;
    skipped_count: number;
    estimated_delivery_s: number;
}

export interface UsageResult {
    tier: number;
    limit: number;
    usage: number;
    remaining: number;
    overageEnabled: boolean;
    resetAt: number;
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
        const raw = await this.request<Record<string, unknown>>('POST', '/v1/notify', {
            wallet: params.wallet,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            priority: params.priority,
            preferred_channel: params.preferredChannel,
            receipt: params.receipt ?? true,
            idempotencyKey: params.idempotencyKey,
            templateId: params.templateId,
            telegramTemplateId: params.telegramTemplateId,
            templateVariables: params.templateVariables,
        });
        return {
            notificationId: raw.notification_id as string,
            status: raw.status as NotifyResult['status'],
            recipientRegistered: (raw.recipient_registered ?? null) as boolean | null,
            estimatedDeliveryMs: (raw.estimated_delivery_ms ?? 0) as number,
            receiptTx: (raw.receipt_tx ?? null) as string | null,
            deliveryChannel: (raw.delivery_channel ?? null) as DeliveryChannel | null,
            environment: (raw.environment ?? 'production') as 'production' | 'sandbox',
            errorCode: raw.error_code as string | undefined,
        };
    }

    /**
     * Send notifications to multiple wallets in a single API call.
     * Each wallet receives the same subject and body. Max 100 wallets per call.
     */
    async notifyBulk(params: BulkNotifyParams): Promise<BulkNotifyResult> {
        if (params.wallets.length > 100) {
            throw new HeraldError('Herald: Max 100 wallets per bulk request', 400, 'PAYLOAD_TOO_LARGE');
        }

        const notifications = params.wallets.map((wallet, i) => ({
            wallet,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            receipt: params.receipt ?? true,
            idempotencyKey: params.idempotencyPrefix
                ? `${params.idempotencyPrefix}:${wallet}`
                : undefined,
            templateId: params.templateId,
            telegramTemplateId: params.telegramTemplateId,
            templateVariables: params.templateVariables,
        }));

        const raw = await this.request<Record<string, unknown>[]>('POST', '/v1/notify/batch', {
            notifications,
        });

        const results: NotifyResult[] = (raw as Record<string, unknown>[]).map((r) => ({
            notificationId: r.notification_id as string,
            status: r.status as NotifyResult['status'],
            recipientRegistered: (r.recipient_registered ?? null) as boolean | null,
            estimatedDeliveryMs: (r.estimated_delivery_ms ?? 0) as number,
            receiptTx: (r.receipt_tx ?? null) as string | null,
            deliveryChannel: (r.delivery_channel ?? null) as DeliveryChannel | null,
            environment: (r.environment ?? 'production') as 'production' | 'sandbox',
            errorCode: r.error_code as string | undefined,
        }));

        return { results };
    }

    /**
     * Check the delivery and ZK receipt status of a notification.
     */
    async getStatus(notificationId: string): Promise<NotificationStatusResult> {
        const raw = await this.request<Record<string, unknown>>(
            'GET',
            `/v1/notifications/${notificationId}`,
        );
        return {
            notificationId: raw.notification_id as string,
            status: raw.status as string,
            category: raw.category as string,
            createdAt: raw.created_at as string,
            deliveredAt: (raw.delivered_at ?? null) as string | null,
            receiptStatus: (raw.receipt_status ?? 'pending') as ReceiptStatus,
            receiptTx: (raw.receipt_tx ?? null) as string | null,
            receiptFailureReason: (raw.receipt_failure_reason ?? null) as string | null,
            lastReceiptAttemptAt: (raw.last_receipt_attempt_at ?? null) as string | null,
            writeReceipt: (raw.write_receipt ?? false) as boolean,
            emailProvider: (raw.email_provider ?? null) as string | null,
            bounce: (raw.bounce ?? false) as boolean,
        };
    }

    /**
     * Poll until a notification reaches a terminal delivery state.
     * @param notificationId - The ID returned from notify()
     * @param timeoutMs - Max time to wait. @default 30000
     * @param pollIntervalMs - Polling interval. @default 2000
     */
    async waitForDelivery(
        notificationId: string,
        timeoutMs = 30_000,
        pollIntervalMs = 2_000,
    ): Promise<NotificationStatusResult> {
        const TERMINAL = new Set(['delivered', 'failed', 'opted_out', 'blocked', 'duplicate']);
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            const status = await this.getStatus(notificationId);
            if (TERMINAL.has(status.status)) return status;
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }
        throw new HeraldError('Timeout waiting for terminal delivery state', 408, 'TIMEOUT');
    }

    /**
     * Get real-time usage metrics and quota limits for the current period.
     */
    async getUsage(): Promise<UsageResult> {
        return this.request<UsageResult>('GET', '/v1/usage');
    }

    /**
     * Subscribe a wallet to your protocol's notifications.
     * Idempotent — safe to call on every user login.
     */
    async subscribe(params: SubscribeParams): Promise<{ subscribed: boolean }> {
        const raw = await this.request<Record<string, unknown>>('POST', '/v1/subscriptions', {
            walletAddress: params.walletAddress,
            channels: params.channels ?? ['email'],
        });
        // Gateway returns a subscription object; normalise to a simple flag.
        return { subscribed: true };
    }

    /**
     * Unsubscribe a wallet from your protocol's notifications.
     */
    async unsubscribe(walletAddress: string): Promise<{ unsubscribed: boolean }> {
        await this.request('DELETE', `/v1/subscriptions/${walletAddress}`);
        return { unsubscribed: true };
    }

    /**
     * Check if a wallet is currently subscribed to your protocol.
     */
    async checkSubscription(walletAddress: string): Promise<SubscriptionStatus> {
        const raw = await this.request<Record<string, unknown>>(
            'GET',
            `/v1/subscriptions/${walletAddress}`,
        );
        return {
            subscribed: (raw.isSubscribed ?? raw.subscribed) as boolean,
            channels: (raw.channels ?? []) as string[],
            subscribedAt: (raw.subscribedAt ?? raw.subscribed_at ?? null) as string | null,
        };
    }

    /**
     * Broadcast a notification to all subscribers of your protocol.
     * Requires Growth tier or above.
     */
    async broadcast(params: BroadcastParams): Promise<BroadcastResult> {
        return this.request<BroadcastResult>('POST', '/v1/notify/broadcast', {
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            receipt: params.receipt ?? false,
            templateId: params.templateId,
        });
    }

    /**
     * Verify the HMAC-SHA256 signature on an inbound Herald webhook.
     * Call this in your webhook handler before processing the payload.
     *
     * @param payload   - Raw request body (string or Buffer)
     * @param signature - Value of the X-Herald-Signature header
     * @param secret    - Your webhook secret (shown once at registration)
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

        const sig = await globalThis.crypto.subtle.sign('HMAC', key, dataToSign);
        const expected = Buffer.from(sig).toString('hex');
        return expected === signature;
    }

    // ── Internal request helper ─────────────────────────────────

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        path: string,
        body?: Record<string, unknown>,
        retries = 3,
        backoffMs = 500,
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const headers: Record<string, string> = {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'herald-sdk-ts/1.6.0',
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
                if (retries > 0 && (response.status >= 500 || response.status === 429)) {
                    clearTimeout(timeoutId);

                    let retryDelay = backoffMs;
                    if (response.status === 429) {
                        const retryAfter = response.headers.get('Retry-After');
                        if (retryAfter) retryDelay = parseInt(retryAfter, 10) * 1000 || retryDelay;
                    }

                    await new Promise((res) => setTimeout(res, retryDelay));
                    return this.request<T>(method, path, body, retries - 1, backoffMs * 2);
                }

                const errorBody = await response.text().catch(() => '');
                let errorMessage = `Herald API error: ${response.status}`;
                let errorCode: string | number = response.status;
                const errorHeaders: Record<string, string> = {};
                response.headers.forEach((value, key) => { errorHeaders[key] = value; });

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
