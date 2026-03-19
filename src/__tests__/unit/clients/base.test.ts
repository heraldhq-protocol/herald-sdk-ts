import { describe, it, expect } from 'vitest';
import { BaseClient, ResolvedHeraldConfig } from '../../../clients/base.js';
import { HERALD_PROGRAM_ID } from '../../../constants.js';

// Simple concrete implementation to test the abstract BaseClient
class TestClient extends BaseClient { }

describe('Clients - BaseClient', () => {
    it('should apply default configuration correctly', () => {
        const client = new TestClient({
            rpcUrl: 'https://api.devnet.solana.com'
        });

        expect(client.config.rpcUrl).toBe('https://api.devnet.solana.com');
        expect(client.config.cluster).toBe('mainnet-beta'); // Default fallback
        expect(client.config.commitment).toBe('confirmed');
        expect(client.config.lightRpcUrl).toBe('https://api.devnet.solana.com');
        expect(client.config.programId).toBe(HERALD_PROGRAM_ID.toBase58());
        expect(client.config.maxRetries).toBe(3);
    });

    it('should initialize connection and program instances', () => {
        const client = new TestClient({ rpcUrl: 'http://localhost:8899', cluster: 'localnet' });

        expect(client.connection).toBeDefined();
        expect(client.program).toBeDefined();

        // Ensures the programmatic anchor Client was constructed
        expect(client.program.programId.toBase58()).toBe(HERALD_PROGRAM_ID.toBase58());
    });

    it('should allow overriding all config fields', () => {
        const client = new TestClient({
            rpcUrl: 'http://url1',
            lightRpcUrl: 'http://url2',
            cluster: 'devnet',
            commitment: 'processed',
            programId: '22222222222222222222222222222222222222222222',
            maxRetries: 5
        });

        expect(client.config.lightRpcUrl).toBe('http://url2');
        expect(client.config.cluster).toBe('devnet');
        expect(client.config.commitment).toBe('processed');
        expect(client.config.programId).toBe('22222222222222222222222222222222222222222222');
        expect(client.config.maxRetries).toBe(5);
    });
});
