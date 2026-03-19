import { Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AuthorityClient, ReadClient, HERALD_AUTHORITY, hashEmail } from '@herald-protocol/sdk';
import crypto from 'crypto';

/**
 * Example Protocol Flow: Emulating the Herald Node Backend
 * 
 * This example demonstrates how the Herald backend interacts with the authority client
 * to manage protocols and issue notification receipts.
 */
async function runProtocolFlow() {
    // 1. Setup Environment
    // The HERALD authority key is required to register and manage protocols.
    // In production, this uses an AWS KMS signer. For testing, we generate one.
    // NOTE: This will fail against mainnet/devnet unless we use the true HERALD_AUTHORITY.
    const mockAuthority = Keypair.generate();

    // A sample protocol developer wallet
    const protocolDevWallet = Keypair.generate();

    const config = {
        rpcUrl: 'https://api.devnet.solana.com',
        cluster: 'devnet' as const,
        commitment: 'confirmed' as const,
        // Override program ID for local testing if necessary
    };

    const authorityClient = new AuthorityClient(config);
    const readClient = new ReadClient(config);

    console.log('\n--- 1. Registering a New Protocol ---');
    try {
        const protocolName = 'Jupiter Exchange';
        const nameHash = await hashEmail(protocolName); // We reuse the SHA256 hashing util

        const tier = 2; // e.g., Pro Tier

        const registerIx = await authorityClient.registerProtocol({
            authority: mockAuthority.publicKey, // Note: must match the on-chain authority
            protocolOwner: protocolDevWallet.publicKey,
            nameHash,
            tier,
        });

        const tx = new Transaction().add(registerIx);

        // This transaction would normally be signed by the authority key
        console.log(`Instruction built! To execute, sign with HERALD_AUTHORITY.`);
        // await sendAndConfirmTransaction(authorityClient.connection, tx, [mockAuthority]);
    } catch (err: any) {
        console.error('Registration failed:', err.message);
    }

    console.log('\n--- 2. Checking Protocol Status ---');
    // Fetch the protocol state
    const protocolAccount = await readClient.fetchProtocolAccount(protocolDevWallet.publicKey);
    if (protocolAccount) {
        console.log('Tier:', protocolAccount.tier);
        console.log('Is Active:', protocolAccount.isActive);
    } else {
        console.log('Protocol account not found (expected if tx was not sent).');
    }

    console.log('\n--- 3. Emitting a Delivery Receipt ---');
    // Example: Protocol wants to notify user wallet about a DeFi liquidation
    const userWalletPubkey = Keypair.generate().publicKey;

    try {
        // We hash the user wallet to link the receipt privately
        const recipientHashPath = crypto.createHash('sha256').update(userWalletPubkey.toBuffer()).digest();

        // Generate a 16-byte UUID for the notification ID
        const notificationId = crypto.randomBytes(16);

        // Before building this instruction, the backend must fetch a Light Protocol Validity Proof via RPC.
        // This mock represents the compressed proof returned by Light RPC.
        const mockCompressedProof = {
            a: Array(32).fill(0),
            b: Array(64).fill(0),
            c: Array(32).fill(0)
        };

        const receiptIx = await authorityClient.writeReceipt({
            authority: mockAuthority.publicKey,
            protocolOwner: protocolDevWallet.publicKey,
            proof: mockCompressedProof,
            outputTreeIndex: 0,
            recipientHash: recipientHashPath,
            notificationId: notificationId,
            category: 1, // DeFi category
            lightRemainingAccounts: [] // Fetched dynamically from Light RPC normally
        });

        console.log('Built writeReceipt transaction! Ready for Light Protocol state compression.');
    } catch (err: any) {
        console.error('Failed to build receipt:', err.message);
    }
}

// Execute if run directly
if (require.main === module) {
    runProtocolFlow().catch(console.error);
}
