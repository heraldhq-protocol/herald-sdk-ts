import type { TransactionConfirmationStatus } from '@solana/web3.js';

export type SolanaCluster = 'mainnet-beta' | 'devnet' | 'localnet';

export type Commitment = 'processed' | 'confirmed' | 'finalized';

export interface HeraldConfig {
    /** Solana RPC endpoint. MUST support Light Protocol methods for receipt ops. */
    rpcUrl: string;
    /** Cluster — determines default program ID and Light tree addresses. */
    cluster?: SolanaCluster;
    /** Override program ID (useful for devnet testing). Default: production ID. */
    programId?: string;
    /** Commitment level for read operations. @default 'confirmed' */
    commitment?: Commitment;
    /** Max retries for transaction confirmation. @default 3 */
    maxRetries?: number;
    /** Custom Light Protocol RPC URL if different from primary rpcUrl. */
    lightRpcUrl?: string;
}

export interface TransactionResult {
    signature: string;
    slot: number;
    confirmation: TransactionConfirmationStatus;
}
