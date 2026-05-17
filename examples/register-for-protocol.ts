import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import {
  UserClient,
  ReadClient,
  encryptEmail,
  hashEmail,
} from '@herald-protocol/sdk';

/**
 * dApp Integration Example: Let users subscribe to your protocol's notifications
 *
 * Drop this pattern into your dApp's "Enable Notifications" flow.
 * The user signs one Solana transaction — Herald handles delivery routing.
 *
 * Required: user's connected wallet (e.g. from Phantom/Backpack), their email.
 * The protocol ID is YOUR protocol's pubkey (from the Herald dashboard → Settings).
 */

const RPC_URL = 'https://api.devnet.solana.com';
const CLUSTER = 'devnet' as const;

/**
 * Call this when the user clicks "Enable Notifications" in your dApp.
 *
 * @param wallet - The user's connected wallet (PublicKey)
 * @param signTransaction - Wallet adapter's signTransaction fn
 * @param email - Email address the user wants notifications sent to
 * @param categories - Which notification categories to opt-in to
 */
export async function enableNotificationsForUser(
  wallet: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  email: string,
  categories: {
    optInDefi?: boolean;
    optInGovernance?: boolean;
    optInMarketing?: boolean;
    optInSystem?: boolean;
  } = { optInDefi: true },
): Promise<{ signature: string; alreadyRegistered: boolean }> {
  const connection = new Connection(RPC_URL, 'confirmed');
  const userClient = new UserClient({ rpcUrl: RPC_URL, cluster: CLUSTER });
  const readClient = new ReadClient({ rpcUrl: RPC_URL, cluster: CLUSTER });

  const alreadyRegistered = await readClient.isRegistered(wallet);

  if (alreadyRegistered) {
    // User is already registered — update their opt-ins instead
    const updateIx = await userClient.updateIdentity({
      owner: wallet,
      optIns: categories,
    });

    const tx = new Transaction().add(updateIx);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet;

    const signed = await signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    return { signature, alreadyRegistered: true };
  }

  // First-time registration
  const emailHash = await hashEmail(email);
  const { encryptedEmail, nonce } = encryptEmail(email, wallet);

  const registerIx = await userClient.registerIdentity({
    owner: wallet,
    encryptedEmail,
    emailHash,
    nonce,
    optIns: {
      optInAll: false,
      ...categories,
    },
    digestMode: false,
  });

  const tx = new Transaction().add(registerIx);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = wallet;

  const signed = await signTransaction(tx);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature, 'confirmed');

  return { signature, alreadyRegistered: false };
}

// ── React / Wallet-Adapter usage example ────────────────────────────────────
//
// import { useWallet } from '@solana/wallet-adapter-react';
// import { enableNotificationsForUser } from './register-for-protocol';
//
// function EnableNotificationsButton() {
//   const { publicKey, signTransaction } = useWallet();
//   const [email, setEmail] = useState('');
//
//   const handleEnable = async () => {
//     if (!publicKey || !signTransaction) return;
//     const result = await enableNotificationsForUser(
//       publicKey,
//       signTransaction,
//       email,
//       { optInDefi: true, optInGovernance: true },
//     );
//     console.log('Subscribed! Tx:', result.signature);
//   };
//
//   return (
//     <div>
//       <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
//       <button onClick={handleEnable}>Enable Notifications</button>
//     </div>
//   );
// }
// ────────────────────────────────────────────────────────────────────────────

// Standalone test (devnet only — uses generated keypair)
async function runExample() {
  const mockWallet = Keypair.generate();
  const mockEmail = 'user@example.com';

  console.log('User wallet:', mockWallet.publicKey.toBase58());

  const result = await enableNotificationsForUser(
    mockWallet.publicKey,
    async (tx) => {
      tx.sign(mockWallet);
      return tx;
    },
    mockEmail,
    { optInDefi: true, optInGovernance: true },
  );

  console.log('Subscription result:', result);
}

if (require.main === module) {
  runExample().catch(console.error);
}
