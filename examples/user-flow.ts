import { Keypair, Connection, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { UserClient, ReadClient, encryptEmail, hashEmail } from '@herald-protocol/sdk';

/**
 * Example User Flow: Registering, Checking Status, and Updating
 * 
 * This example demonstrates how a frontend wallet application or an
 * end-user node script can interact with the Herald Privacy Registry.
 */
async function runUserFlow() {
    // 1. Setup Configuration & Wallet
    // Normally, this comes from their wallet provider (e.g., Phantom)
    const userWallet = Keypair.generate();
    const rawEmail = 'alice@example.com';

    console.log('User Wallet:', userWallet.publicKey.toBase58());

    // Initialize SDK Clients
    const config = {
        rpcUrl: 'https://api.devnet.solana.com',
        cluster: 'devnet' as const,
        commitment: 'confirmed' as const,
    };

    // UserClient builds transactions, ReadClient queries state
    const userClient = new UserClient(config);
    const readClient = new ReadClient(config);

    // Provide the connection instance with funds if localnet/devnet
    // await requestAirdrop(config.rpcUrl, userWallet.publicKey);

    console.log('\n--- 1. Registering Identity ---');
    try {
        // Enforce privacy: we NEVER send plaintext email on-chain.
        // We hash it for deduplication and encrypt it for notification delivery.
        const emailHash = await hashEmail(rawEmail);
        const { encryptedEmail, nonce } = encryptEmail(rawEmail, userWallet.publicKey);

        // Build the instruction
        const registerIx = await userClient.registerIdentity({
            owner: userWallet.publicKey,
            encryptedEmail,
            emailHash,
            nonce,
            optIns: {
                optInAll: true,           // Subscribed to everything
                optInDefi: true,
                optInGovernance: true,
                optInMarketing: true,
            },
            digestMode: false, // Wants instant notifications, not daily digests
        });

        // Send transaction
        const tx = new Transaction().add(registerIx);
        const sig = await sendAndConfirmTransaction(userClient.connection, tx, [userWallet]);
        console.log(`Successfully registered! Signature: ${sig}`);
    } catch (err: any) {
        console.error('Failed to register identity:', err.message);
        return;
    }

    console.log('\n--- 2. Checking Registration Status ---');
    // Fast check (does not deserialize data)
    const isRegistered = await readClient.isRegistered(userWallet.publicKey);
    console.log(`Is Registered? ${isRegistered}`);

    // Full fetch
    const identity = await readClient.fetchIdentityAccount(userWallet.publicKey);
    if (identity) {
        console.log(`Subscribed to Marketing? ${identity.optInMarketing}`);
    }

    console.log('\n--- 3. Updating Preferences ---');
    try {
        // User wants to unsubscribe from Marketing
        const updateIx = await userClient.updateIdentity({
            owner: userWallet.publicKey,
            optIns: {
                optInMarketing: false, // Update just this field
            }
        });

        const updateTx = new Transaction().add(updateIx);
        const updateSig = await sendAndConfirmTransaction(userClient.connection, updateTx, [userWallet]);
        console.log(`Preferences updated! Signature: ${updateSig}`);

        const updatedIdentity = await readClient.fetchIdentityAccount(userWallet.publicKey);
        console.log(`New Marketing status: ${updatedIdentity?.optInMarketing}`);
    } catch (err: any) {
        console.error('Failed to update identity:', err.message);
    }
}

// Execute if run directly
if (require.main === module) {
    runUserFlow().catch(console.error);
}
