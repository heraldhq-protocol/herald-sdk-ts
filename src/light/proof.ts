import type { PublicKey, AccountMeta } from '@solana/web3.js';
import type { CompressedProof } from '../types/instructions.js';
import type { LightProofResponse } from '../types/light.js';

/**
 * Fetches a ValidityProof and remaining accounts from the Light RPC.
 * Must be called BEFORE building the write_receipt transaction.
 *
 * The Light RPC performs ZK proof generation server-side.
 */
export async function fetchProofForReceipt(
    lightRpc: any, // Rpc from @lightprotocol/stateless.js
    outputTreeAddress: PublicKey,
): Promise<LightProofResponse> {
    const proofResponse = await lightRpc.getValidityProof(
        [],                                          // no input compressed accounts (append-only)
        [{ merkleTree: outputTreeAddress }],          // output tree to append to
    );

    return {
        proof: proofResponse.compressedProof as CompressedProof,
        outputTreeIndex: proofResponse.outputTreeIndex ?? 0,
        remainingAccounts: (proofResponse.remainingAccounts ?? []) as AccountMeta[],
    };
}
