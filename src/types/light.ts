import type { PublicKey, AccountMeta } from '@solana/web3.js';
import type { DeliveryReceipt } from './accounts.js';
import type { CompressedProof } from './instructions.js';

/**
 * Response from the Light Protocol RPC `getValidityProof` call.
 * The SDK fetches this before building the write_receipt transaction.
 */
export interface LightProofResponse {
    proof: CompressedProof;
    outputTreeIndex: number;
    /** Remaining accounts that MUST be appended to the transaction. */
    remainingAccounts: AccountMeta[];
}

/**
 * Light Protocol RPC client configuration.
 */
export interface LightRpcConfig {
    /** Helius/QuickNode RPC endpoint — must support Light Protocol methods. */
    rpcUrl: string;
    /** Merkle tree address for receipt storage. Defaults to Herald's dedicated tree. */
    merkleTreeAddress?: string;
}

/** Result of fetching DeliveryReceipts from the Light Protocol Photon indexer. */
export interface LightReceiptResponse {
    receipts: DeliveryReceipt[];
    cursor?: string;  // pagination cursor
    total: number;
}
