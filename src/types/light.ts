import type { PublicKey, AccountMeta } from '@solana/web3.js';
import type { DeliveryReceipt } from './accounts.js';
import type { CompressedProof } from './instructions.js';

/**
 * Packed address tree info returned alongside the validity proof.
 * Passed into the Light System Program CPI via the write_receipt instruction.
 */
export interface PackedAddressTreeInfo {
    /** Index into the address Merkle tree's root history. */
    rootIndex: number;
    /** u8 index of the address tree pubkey in the instruction's accounts list. */
    addressMerkleTreePubkeyIndex: number;
    /** u8 index of the address queue pubkey in the instruction's accounts list. */
    addressQueuePubkeyIndex: number;
}

/**
 * Response from the Light Protocol RPC getValidityProofV0 call.
 * The SDK fetches this before building the write_receipt transaction.
 */
export interface LightProofResponse {
    proof: CompressedProof;
    /** u8 index of the output state tree in the instruction's accounts list. */
    outputTreeIndex: number;
    /** Remaining accounts (packed) that MUST be appended to the transaction. */
    remainingAccounts: AccountMeta[];
    /** Packed address tree metadata for the Light System Program CPI. */
    packedAddressTreeInfo?: PackedAddressTreeInfo;
    /** The address Merkle tree pubkey used for this proof. */
    addressTree?: PublicKey;
    /** The derived compressed-account address for this receipt. */
    receiptAddress?: PublicKey;
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
