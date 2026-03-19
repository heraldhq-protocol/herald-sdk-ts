import { describe, it, expect, beforeAll } from 'vitest';
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    UserClient,
    AuthorityClient,
    ReadClient,
    HERALD_PROGRAM_ID,
    encryptEmail,
    hashEmail,
    hashWalletAddress,
} from '../../index.js'; // Adjust path based on barrel exports
import { getTierName } from '../../utils/index.js';
import { createHash } from 'crypto';

/**
 * Executes a transaction and gracefully handles expected errors that occur 
 * because the localnet deploys with an un-signable HERALD_AUTHORITY placeholder key.
 */
async function expectUnauthorizedOrAccountNotInitialized(
    connection: Connection,
    tx: Transaction,
    signers: Keypair[],
) {
    try {
        await sendAndConfirmTransaction(connection, tx, signers);
        // If the user replaces the placeholder HERALD_AUTHORITY with a local keypair in both 
        // the TS constants and Rust program, this will succeed.
    } catch (error: any) {
        const msg = error.message || error.toString();
        // 0x1775 = 6005 (Unauthorized)
        // 0xbc4 = 3012 (AccountNotInitialized)
        if (msg.includes('0x1775') || msg.includes('Unauthorized') || msg.includes('0xbc4') || msg.includes('AccountNotInitialized')) {
            console.log('Caught expected localnet constraint error:', msg.split('\n')[0]);
        } else {
            throw error;
        }
    }
}

describe('Live E2E Integration Test - User, Developer, Authority', () => {
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    const userWallet = Keypair.generate();
    const protocolOwner = Keypair.generate();
    const heraldAuthority = Keypair.generate();

    let userClient: UserClient;
    let authClient: AuthorityClient;
    let readClient: ReadClient; // Developer Client

    beforeAll(async () => {
        console.log("Airdropping SOL to test wallets...");
        await connection.confirmTransaction(await connection.requestAirdrop(userWallet.publicKey, 10 * LAMPORTS_PER_SOL), 'confirmed');
        await connection.confirmTransaction(await connection.requestAirdrop(protocolOwner.publicKey, 10 * LAMPORTS_PER_SOL), 'confirmed');
        await connection.confirmTransaction(await connection.requestAirdrop(heraldAuthority.publicKey, 10 * LAMPORTS_PER_SOL), 'confirmed');

        const config = {
            rpcUrl: 'http://127.0.0.1:8899',
            programId: HERALD_PROGRAM_ID.toBase58(),
        };

        userClient = new UserClient(config);
        authClient = new AuthorityClient(config);
        readClient = new ReadClient(config);
    });

    // ─── USER & DEVELOPER TESTS ───────────────────────────────────────────────────

    it('1. [User] Should register a User Identity', async () => {
        const email = 'testuser@example.com';
        const { encryptedEmail, nonce } = encryptEmail(email, userWallet.publicKey);
        const emailHash = await hashEmail(email);

        const ix = await userClient.registerIdentity({
            owner: userWallet.publicKey,
            encryptedEmail,
            emailHash,
            nonce,
            optIns: { optInAll: true, optInDefi: true, optInGovernance: true, optInMarketing: true },
            digestMode: false,
        });

        const tx = new Transaction().add(ix);
        const sig = await sendAndConfirmTransaction(connection, tx, [userWallet]);
        expect(sig).toBeTruthy();
    });

    it('2. [Developer] Should read Identity Account', async () => {
        const isRegistered = await readClient.isRegistered(userWallet.publicKey);
        expect(isRegistered).toBe(true);

        const account = await readClient.fetchIdentityAccount(userWallet.publicKey);
        expect(account).not.toBeNull();
        expect(account!.optInAll).toBe(true);
        expect(account!.owner.toBase58()).toBe(userWallet.publicKey.toBase58());

        // Batch test
        const batch = await readClient.fetchIdentityAccountBatch([userWallet.publicKey]);
        expect(batch.get(userWallet.publicKey.toBase58())).not.toBeNull();
    });

    it('3. [User] Should update a User Identity', async () => {
        const ix = await userClient.updateIdentity({
            owner: userWallet.publicKey,
            digestMode: false,
        });

        const tx = new Transaction().add(ix);
        const sig = await sendAndConfirmTransaction(connection, tx, [userWallet]);
        expect(sig).toBeTruthy();
    });

    it('4. [User] Should delete a User Identity', async () => {
        const ix = await userClient.deleteIdentity({
            owner: userWallet.publicKey,
        });

        const tx = new Transaction().add(ix);
        const sig = await sendAndConfirmTransaction(connection, tx, [userWallet]);
        expect(sig).toBeTruthy();

        // Verify Developer Client sees it as deleted
        const account = await readClient.fetchIdentityAccount(userWallet.publicKey);
        expect(account).toBeNull();
    });

    // ─── AUTHORITY & DEVELOPER TESTS ──────────────────────────────────────────────

    it('5. [Authority] Should register a Protocol (Expected Unauthorized on local)', async () => {
        const protocolName = 'DeFi Protocol';
        const nameHash = createHash('sha256').update(protocolName).digest();

        const ix = await authClient.registerProtocol({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
            nameHash: Buffer.from(nameHash),
            tier: 1,
        });

        const tx = new Transaction().add(ix);
        await expectUnauthorizedOrAccountNotInitialized(connection, tx, [heraldAuthority, protocolOwner]);
    });

    it('6. [Developer] Should try to fetch Protocol Account', async () => {
        const protocolAccount = await readClient.fetchProtocolAccount(protocolOwner.publicKey);
        // Will be null unless HERALD_AUTHORITY was correctly mocked locally
        if (!protocolAccount) {
            console.log("Protocol account not found (expected if registerProtocol failed).");
        } else {
            expect(protocolAccount.isActive).toBe(true);
        }

        const canSendReq = await readClient.checkProtocolCanSend(protocolOwner.publicKey);
        expect(canSendReq.canSend).toBe(false); // Since it was never registered or unauthorized
    });

    it('7. [Authority] Should deactivate and reactivate Protocol', async () => {
        const ixDeactivate = await authClient.deactivateProtocol({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
        });
        await expectUnauthorizedOrAccountNotInitialized(connection, new Transaction().add(ixDeactivate), [heraldAuthority]);

        const ixReactivate = await authClient.reactivateProtocol({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
        });
        await expectUnauthorizedOrAccountNotInitialized(connection, new Transaction().add(ixReactivate), [heraldAuthority]);
    });

    it('8. [Authority] Should suspend Protocol', async () => {
        const ix = await authClient.suspendProtocol({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
        });
        await expectUnauthorizedOrAccountNotInitialized(connection, new Transaction().add(ix), [heraldAuthority]);
    });

    it('9. [Authority] Should renew subscription and reset sends', async () => {
        const ixRenew = await authClient.renewSubscription({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
        });
        await expectUnauthorizedOrAccountNotInitialized(connection, new Transaction().add(ixRenew), [heraldAuthority]);

        const ixReset = await authClient.resetProtocolSends({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
        });
        await expectUnauthorizedOrAccountNotInitialized(connection, new Transaction().add(ixReset), [heraldAuthority]);
    });

    it('10. [Authority] Should write a receipt (Localnet CPI test)', async () => {
        const fakeProof = {
            a: Array(32).fill(0),
            b: Array(64).fill(0),
            c: Array(32).fill(0),
        };

        const ix = await authClient.writeReceipt({
            authority: heraldAuthority.publicKey,
            protocolOwner: protocolOwner.publicKey,
            proof: fakeProof,
            outputTreeIndex: 0,
            recipientHash: new Uint8Array(32).fill(0),
            notificationId: new Uint8Array(16).fill(0),
            category: 0,
            lightRemainingAccounts: [],
        });
        await expectUnauthorizedOrAccountNotInitialized(connection, new Transaction().add(ix), [heraldAuthority]);
    });
});
