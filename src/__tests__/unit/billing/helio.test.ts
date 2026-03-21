import { describe, it, expect, vi } from 'vitest';
import { createHmac } from 'crypto';
import { HelioClient } from '../../../billing/helio/client.js';

describe('HelioClient', () => {
    const helio = new HelioClient({
        apiKey: 'test-api-key',
        webhookSecret: 'test-webhook-secret-32-chars-long',
        templates: {
            1: 'growth-tpl',
            2: 'scale-tpl',
            3: 'enterprise-tpl'
        }
    });

    it('verifyWebhookSignature: accepts valid HMAC signature', () => {
        const payload = { event: 'PAYMENT_SUCCESS', protocolId: 'test-id' };
        const rawBody = JSON.stringify(payload);
        const sig = `sha256=${createHmac('sha256', 'test-webhook-secret-32-chars-long').update(rawBody).digest('hex')}`;
        expect(helio.verifyWebhookSignature(payload, sig)).toBe(true);
    });

    it('verifyWebhookSignature: rejects tampered payload', () => {
        const payload = { event: 'PAYMENT_SUCCESS', protocolId: 'test-id' };
        const rawBody = JSON.stringify(payload);
        const validSig = `sha256=${createHmac('sha256', 'test-webhook-secret-32-chars-long').update(rawBody).digest('hex')}`;

        const tampered = { event: 'PAYMENT_SUCCESS', protocolId: 'different-id' };
        expect(helio.verifyWebhookSignature(tampered, validSig)).toBe(false);
    });

    it('parseWebhook: throws on invalid signature', () => {
        const payload = { event: 'PAYMENT_SUCCESS', protocolId: 'test-id' };
        const rawBody = JSON.stringify(payload);
        expect(() => helio.parseWebhook(rawBody, 'invalid')).toThrow('verification failed');
    });

    it('parseWebhook: succeeds on valid signature', () => {
        const payload = { event: 'PAYMENT_SUCCESS', protocolId: 'test-id' };
        const rawBody = JSON.stringify(payload);
        const validSig = `sha256=${createHmac('sha256', 'test-webhook-secret-32-chars-long').update(rawBody).digest('hex')}`;

        const res = helio.parseWebhook(rawBody, validSig);
        expect(res.event).toBe('PAYMENT_SUCCESS');
    });
});
