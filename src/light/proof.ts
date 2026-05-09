/**
 * Light Protocol proof helpers for Herald delivery receipts.
 *
 * Uses the ZK Compression V2 API (@lightprotocol/stateless.js ^0.23.0):
 *   - deriveAddressSeedV2 / deriveAddressV2 for deterministic receipt addresses
 *   - getValidityProofV0 to prove non-existence of the new address
 *   - PackedAccounts + SystemAccountMetaConfig to assemble remaining accounts
 *
 * Docs: https://www.zkcompression.com/pda/compressed-pdas/guides/client-guide.md
 */

import type { PublicKey, AccountMeta } from '@solana/web3.js';
import {
    deriveAddressSeedV2,
    deriveAddressV2,
    PackedAccounts,
    SystemAccountMetaConfig,
    selectStateTreeInfo,
    bn,
} from '@lightprotocol/stateless.js';
import type { CompressedProof } from '../types/instructions.js';
import type { LightProofResponse } from '../types/light.js';

/**
 * Derives a deterministic compressed-account address for a Herald delivery receipt.
 *
 * Seeds: ["herald-receipt", notificationId (16 bytes), recipientHash (32 bytes)]
 * This guarantees each receipt has a unique, stable address so the on-chain program
 * can prevent duplicate receipt writes via the address tree.
 *
 * @param notificationId  UUID v4 as 16 bytes
 * @param recipientHash   SHA-256 of the recipient's wallet pubkey (32 bytes)
 * @param addressTree     Address Merkle tree pubkey (from rpc.getAddressTreeInfoV2())
 * @param programId       Herald on-chain program ID (included in address derivation)
 */
export function deriveReceiptAddress(
    notificationId: Uint8Array,
    recipientHash: Uint8Array,
    addressTree: PublicKey,
    programId: PublicKey,
): PublicKey {
    const seed = deriveAddressSeedV2([
        Buffer.from('herald-receipt'),
        Buffer.from(notificationId),
        Buffer.from(recipientHash),
    ]);
    return deriveAddressV2(seed, addressTree, programId);
}

/**
 * Fetches a ValidityProof for writing a new Herald delivery receipt.
 *
 * Flow (ZK Compression V2 Compressed PDA creation pattern):
 *   1. Query the live address tree via rpc.getAddressTreeInfoV2()
 *   2. Derive the receipt's unique compressed-account address
 *   3. Call getValidityProofV0([], [{ address, tree, queue }]) — non-existence proof
 *   4. Build PackedAccounts (Light System accounts + address tree + output state tree)
 *   5. Return proof + indices + remainingAccounts for the write_receipt instruction
 *
 * @param lightRpc        Rpc from @lightprotocol/stateless.js >=0.23.0
 * @param notificationId  UUID v4 as 16 bytes — seed for the unique receipt address
 * @param recipientHash   SHA-256 of recipient wallet pubkey (32 bytes) — seed for address
 * @param programId       Herald on-chain program ID — included in address derivation
 */
export async function fetchProofForReceipt(
    lightRpc: any, // Rpc from @lightprotocol/stateless.js >=0.23.0
    notificationId: Uint8Array,
    recipientHash: Uint8Array,
    programId: PublicKey,
): Promise<LightProofResponse> {
    // 1. Query the active V2 address tree for this cluster.
    //    Returns { tree: PublicKey, queue: PublicKey }
    const addressTreeInfo = await lightRpc.getAddressTreeInfoV2();

    // 2. Derive the deterministic receipt address.
    const receiptAddress = deriveReceiptAddress(
        notificationId,
        recipientHash,
        addressTreeInfo.tree,
        programId,
    );

    // 3. Fetch the validity proof (non-existence proof for the new address).
    //    Canonical V2 pattern for creating a new compressed account.
    const proofRpcResult = await lightRpc.getValidityProofV0(
        [],  // no existing account hashes (append-only, not consuming any compressed accounts)
        [
            {
                address: bn(receiptAddress.toBytes()),  // prove this address doesn't exist yet
                tree: addressTreeInfo.tree,             // address Merkle tree
                queue: addressTreeInfo.queue,           // address queue
            },
        ],
    );

    // 4. Pack accounts: Light System accounts + address tree + output state tree.
    //    PackedAccounts converts pubkeys → u8 indices, which is what the Light
    //    System Program expects via remaining_accounts in the CPI.
    const packedAccounts = new PackedAccounts();

    // 4a. Add the 6 required Light System accounts.
    const systemAccountConfig = SystemAccountMetaConfig.new(programId);
    packedAccounts.addSystemAccounts(systemAccountConfig);

    // 4b. Add address tree + queue (for the non-existence proof).
    const addressMerkleTreePubkeyIndex = packedAccounts.insertOrGet(addressTreeInfo.tree);
    const addressQueuePubkeyIndex = packedAccounts.insertOrGet(addressTreeInfo.queue);

    // 4c. Add output state tree (where the new compressed account leaf is appended).
    const stateTreeInfos = await lightRpc.getStateTreeInfos();
    const outputStateTreeInfo = selectStateTreeInfo(stateTreeInfos);
    const outputStateTreeIndex = packedAccounts.insertOrGet(outputStateTreeInfo.tree);

    // 5. Convert to AccountMeta[] for Anchor .remainingAccounts().
    const { remainingAccounts } = packedAccounts.toAccountMetas();

    return {
        proof: proofRpcResult.compressedProof as CompressedProof,
        outputTreeIndex: outputStateTreeIndex,
        remainingAccounts: remainingAccounts as AccountMeta[],
        packedAddressTreeInfo: {
            rootIndex: proofRpcResult.rootIndices[0] ?? 0,
            addressMerkleTreePubkeyIndex,
            addressQueuePubkeyIndex,
        },
        addressTree: addressTreeInfo.tree,
        receiptAddress,
    };
}
