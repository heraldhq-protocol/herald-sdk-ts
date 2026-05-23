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

// ── Notification list ───────────────────────────────────────────────────────

export interface NotificationListItem {
    notification_id: string;
    status: string;
    category: string;
    created_at: string;
    delivered_at: string | null;
    receipt_status: ReceiptStatus;
    receipt_tx: string | null;
    bounce: boolean;
}

export interface NotificationListResult {
    data: NotificationListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ── Preview ─────────────────────────────────────────────────────────────────

export interface PreviewResult {
    renderedHtml?: string;
    telegramText?: string;
    smsText?: string;
}

// ── Scheduled notifications ─────────────────────────────────────────────────

export type ScheduleStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';

export interface ScheduledNotification {
    id: string;
    protocolId: string;
    wallet: string | null;
    subject: string;
    body: string;
    category: string;
    channels: string[];
    scheduleType: 'ONE_TIME' | 'RECURRING';
    timezone: string;
    cronExpr: string | null;
    nextRunAt: string;
    lastRunAt: string | null;
    status: ScheduleStatus;
    templateId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleOnceParams {
    /** Recipient wallet address. Omit for broadcast-style scheduled sends. */
    wallet?: string;
    subject: string;
    body: string;
    category?: NotifyCategory;
    channels?: DeliveryChannel[];
    /** ISO 8601 datetime — when to send. */
    scheduledFor: string;
    /** IANA timezone identifier. @default 'UTC' */
    timezone?: string;
    templateId?: string;
}

export interface ScheduleRecurringParams {
    wallet?: string;
    subject: string;
    body: string;
    category?: NotifyCategory;
    channels?: DeliveryChannel[];
    /** Standard 5-field cron expression (evaluated in UTC). */
    cronExpr: string;
    /** IANA timezone identifier. @default 'UTC' */
    timezone?: string;
    templateId?: string;
}

export interface ScheduleListResult {
    items: ScheduledNotification[];
    total: number;
    page: number;
    limit: number;
}

// ── Webhooks ────────────────────────────────────────────────────────────────

export type WebhookEvent =
    | 'notification.delivered'
    | 'notification.failed'
    | 'notification.bounced'
    | 'notification.opted_out';

export interface WebhookResult {
    id: string;
    url: string;
    events: string[];
    /** Only present on creation — store this securely, it is shown once. */
    secret?: string;
    is_active: boolean;
    failure_count?: number;
    last_success_at: string | null;
    created_at: string;
}

export interface CreateWebhookParams {
    /** HTTPS URL Herald will POST events to. */
    url: string;
    /** Events to subscribe to. @default ['notification.delivered'] */
    events?: WebhookEvent[];
    name?: string;
}

export interface UpdateWebhookParams {
    url?: string;
    events?: WebhookEvent[];
    isActive?: boolean;
}

// ── Email templates ─────────────────────────────────────────────────────────

export type HeraldFooter = 'full' | 'small' | 'minimal' | 'none' | 'enterprise';

export interface EmailTemplate {
    id: string;
    name: string;
    category: string;
    subjectTemplate?: string;
    previewText?: string;
    heraldFooter: HeraldFooter;
    isDefault: boolean;
    isActive: boolean;
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmailTemplateParams {
    name: string;
    category: string;
    /** Handlebars/Liquid subject with template vars. */
    subjectTemplate?: string;
    /** Full HTML source. Max 51,200 chars. */
    htmlSource: string;
    /** Plain-text fallback. Max 5,000 chars. */
    textSource?: string;
    previewText?: string;
    heraldFooter?: HeraldFooter;
    isDefault?: boolean;
}

export interface UpdateEmailTemplateParams {
    name?: string;
    category?: string;
    subjectTemplate?: string;
    htmlSource?: string;
    textSource?: string;
    previewText?: string;
    heraldFooter?: HeraldFooter;
    isDefault?: boolean;
    isActive?: boolean;
}

// ── Analytics ───────────────────────────────────────────────────────────────

export type AnalyticsPeriod = '7d' | '30d' | '90d';

export interface AnalyticsResult {
    period: AnalyticsPeriod;
    total_sends: number;
    delivery_rate: number;
    bounce_rate: number;
    opted_out_rate: number;
    failure_rate: number;
    breakdown: {
        delivered: number;
        failed: number;
        opted_out: number;
        bounced: number;
    };
}

export interface EngagementResult {
    totalSends: number;
    opens: number;
    clicks: number;
    unsubscribes: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    period: { from: string; to: string };
}

export interface AudienceResult {
    totalRegistered: number;
    broadcastableSubscribers: number;
    activeLastThirtyDays: number;
    retentionRate: number;
    channelCoverage: { email: number; telegram: number; sms: number };
    bySource: Record<string, number>;
    registrationTrend: Array<{ date: string; count: number }>;
}

// ── API request log ─────────────────────────────────────────────────────────

export interface ApiRequestLogItem {
    id: string;
    apiKeyId: string;
    isTestKey: boolean;
    method: string;
    endpoint: string;
    statusCode: number;
    latencyMs: number;
    correlationId: string;
    createdAt: string;
}

export interface ApiRequestLogResult {
    items: ApiRequestLogItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// ── Protocol info ───────────────────────────────────────────────────────────

export interface ProtocolInfo {
    id: string;
    protocol_pubkey: string;
    tier: number;
    tier_name: string;
    is_active: boolean;
    is_suspended: boolean;
    sends_this_period: number;
    period_reset_at: string;
    subscription_expires_at: string | null;
    counts: { api_keys: number; webhooks: number; notifications: number };
    created_at: string;
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

    // ── Notification list ───────────────────────────────────────────────────

    /**
     * List notifications sent by your protocol, newest first.
     */
    async listNotifications(params: { page?: number; limit?: number } = {}): Promise<NotificationListResult> {
        const qs = new URLSearchParams();
        if (params.page) qs.set('page', String(params.page));
        if (params.limit) qs.set('limit', String(params.limit));
        const query = qs.toString();
        return this.request<NotificationListResult>('GET', `/v1/notifications${query ? `?${query}` : ''}`);
    }

    // ── Preview ─────────────────────────────────────────────────────────────

    /**
     * Render a notification without sending it.
     * Returns the HTML, Telegram markdown, and SMS text that would be delivered.
     */
    async preview(params: NotifyParams): Promise<PreviewResult> {
        return this.request<PreviewResult>('POST', '/v1/preview', {
            wallet: params.wallet,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            priority: params.priority,
            preferred_channel: params.preferredChannel,
            receipt: params.receipt,
            idempotencyKey: params.idempotencyKey,
            templateId: params.templateId,
            telegramTemplateId: params.telegramTemplateId,
            templateVariables: params.templateVariables,
        });
    }

    // ── Scheduled notifications ─────────────────────────────────────────────

    /**
     * Schedule a one-time notification to be delivered at a specific time.
     */
    async scheduleOnce(params: ScheduleOnceParams): Promise<ScheduledNotification> {
        return this.request<ScheduledNotification>('POST', '/v1/schedule', {
            wallet: params.wallet,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            channels: params.channels,
            scheduledFor: params.scheduledFor,
            timezone: params.timezone ?? 'UTC',
            templateId: params.templateId,
        });
    }

    /**
     * Schedule a recurring notification using a cron expression.
     * The cron expression is evaluated in UTC unless timezone is specified.
     *
     * @example herald.scheduleRecurring({ cronExpr: '0 9 * * 1', subject: 'Weekly digest', ... })
     */
    async scheduleRecurring(params: ScheduleRecurringParams): Promise<ScheduledNotification> {
        return this.request<ScheduledNotification>('POST', '/v1/schedule/cron', {
            wallet: params.wallet,
            subject: params.subject,
            body: params.body,
            category: params.category ?? 'defi',
            channels: params.channels,
            cronExpr: params.cronExpr,
            timezone: params.timezone ?? 'UTC',
            templateId: params.templateId,
        });
    }

    /**
     * List all scheduled notifications for your protocol.
     */
    async listScheduled(params: { page?: number; limit?: number } = {}): Promise<ScheduleListResult> {
        const qs = new URLSearchParams();
        if (params.page) qs.set('page', String(params.page));
        if (params.limit) qs.set('limit', String(params.limit));
        const query = qs.toString();
        return this.request<ScheduleListResult>('GET', `/v1/schedule${query ? `?${query}` : ''}`);
    }

    /**
     * Cancel a scheduled notification. Has no effect if already sent.
     */
    async cancelScheduled(scheduleId: string): Promise<{ cancelled: boolean }> {
        return this.request<{ cancelled: boolean }>('DELETE', `/v1/schedule/${scheduleId}`);
    }

    // ── Webhooks ────────────────────────────────────────────────────────────

    /**
     * Register a new webhook endpoint.
     * The `secret` in the response is shown **once** — store it securely.
     * Use it with `Herald.verifyWebhookSignature()` to validate inbound events.
     */
    async createWebhook(params: CreateWebhookParams): Promise<WebhookResult> {
        return this.request<WebhookResult>('POST', '/v1/webhooks', {
            url: params.url,
            events: params.events ?? ['notification.delivered'],
            name: params.name,
        });
    }

    /**
     * List all registered webhook endpoints. Secrets are not included.
     */
    async listWebhooks(): Promise<WebhookResult[]> {
        return this.request<WebhookResult[]>('GET', '/v1/webhooks');
    }

    /**
     * Update a webhook's URL, subscribed events, or active status.
     */
    async updateWebhook(webhookId: string, params: UpdateWebhookParams): Promise<{ updated: boolean }> {
        return this.request<{ updated: boolean }>('PATCH', `/v1/webhooks/${webhookId}`, {
            url: params.url,
            events: params.events,
            isActive: params.isActive,
        });
    }

    /**
     * Delete a webhook endpoint.
     */
    async deleteWebhook(webhookId: string): Promise<void> {
        await this.request('DELETE', `/v1/webhooks/${webhookId}`);
    }

    /**
     * Send a test event to a webhook to verify connectivity.
     */
    async testWebhook(webhookId: string): Promise<{ message: string; webhook_id: string; url: string }> {
        return this.request<{ message: string; webhook_id: string; url: string }>(
            'POST',
            `/v1/webhooks/${webhookId}/test`,
        );
    }

    // ── Email templates ─────────────────────────────────────────────────────

    /**
     * Create a custom email template (Growth+ tier).
     * Returns the new template ID.
     */
    async createEmailTemplate(params: CreateEmailTemplateParams): Promise<{ success: boolean; templateId: string }> {
        return this.request<{ success: boolean; templateId: string }>('POST', '/v1/templates/email', {
            name: params.name,
            category: params.category,
            subjectTemplate: params.subjectTemplate,
            htmlSource: params.htmlSource,
            textSource: params.textSource,
            previewText: params.previewText,
            heraldFooter: params.heraldFooter,
            isDefault: params.isDefault,
        });
    }

    /**
     * List all custom email templates for your protocol.
     */
    async listEmailTemplates(): Promise<{ data: EmailTemplate[] }> {
        return this.request<{ data: EmailTemplate[] }>('GET', '/v1/templates/email');
    }

    /**
     * Get a single email template by ID.
     */
    async getEmailTemplate(templateId: string): Promise<EmailTemplate> {
        return this.request<EmailTemplate>('GET', `/v1/templates/email/${templateId}`);
    }

    /**
     * Update an email template. Creates a new version — previous version is preserved.
     */
    async updateEmailTemplate(templateId: string, params: UpdateEmailTemplateParams): Promise<EmailTemplate> {
        return this.request<EmailTemplate>('PUT', `/v1/templates/email/${templateId}`, params as Record<string, unknown>);
    }

    /**
     * Soft-delete an email template.
     */
    async deleteEmailTemplate(templateId: string): Promise<void> {
        await this.request('DELETE', `/v1/templates/email/${templateId}`);
    }

    // ── Analytics ───────────────────────────────────────────────────────────

    /**
     * Get delivery analytics for the specified period.
     */
    async getAnalytics(period: AnalyticsPeriod = '30d'): Promise<AnalyticsResult> {
        return this.request<AnalyticsResult>('GET', `/v1/analytics?period=${period}`);
    }

    /**
     * Get open, click, and unsubscribe rates for a date range.
     */
    async getEngagement(params: { startDate?: string; endDate?: string; templateId?: string } = {}): Promise<EngagementResult> {
        const qs = new URLSearchParams();
        if (params.startDate) qs.set('startDate', params.startDate);
        if (params.endDate) qs.set('endDate', params.endDate);
        if (params.templateId) qs.set('templateId', params.templateId);
        const query = qs.toString();
        return this.request<EngagementResult>('GET', `/v1/engagement${query ? `?${query}` : ''}`);
    }

    /**
     * Get subscriber counts, channel coverage, and registration trends.
     */
    async getAudience(): Promise<AudienceResult> {
        return this.request<AudienceResult>('GET', '/v1/audience');
    }

    // ── API request log ─────────────────────────────────────────────────────

    /**
     * Inspect recent API requests made with your API keys.
     * Useful for debugging delivery flows.
     */
    async getRequestLog(params: {
        page?: number;
        limit?: number;
        statusCode?: number;
        endpoint?: string;
        isTestKey?: boolean;
    } = {}): Promise<ApiRequestLogResult> {
        const qs = new URLSearchParams();
        if (params.page) qs.set('page', String(params.page));
        if (params.limit) qs.set('limit', String(params.limit));
        if (params.statusCode !== undefined) qs.set('statusCode', String(params.statusCode));
        if (params.endpoint) qs.set('endpoint', params.endpoint);
        if (params.isTestKey !== undefined) qs.set('isTestKey', String(params.isTestKey));
        const query = qs.toString();
        return this.request<ApiRequestLogResult>('GET', `/v1/requests${query ? `?${query}` : ''}`);
    }

    // ── Protocol info ───────────────────────────────────────────────────────

    /**
     * Get your protocol's current tier, usage, and subscription status.
     */
    async getProtocol(): Promise<ProtocolInfo> {
        return this.request<ProtocolInfo>('GET', '/v1/protocols/me');
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
