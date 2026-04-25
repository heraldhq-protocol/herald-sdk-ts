# @herald-protocol/sdk

The official TypeScript SDK for the **Herald Privacy Registry** Solana program.

Herald is an on-chain registry for privacy-preserving email delivery, allowing users to register encrypted emails and manage notification preferences without revealing their plaintext address on-chain.

## Installation

```bash
npm install @herald-protocol/sdk
# or
yarn add @herald-protocol/sdk
# or
pnpm add @herald-protocol/sdk
```

## SDK Architecture

The SDK is organized into three primary clients tailored for different consumers:

1. **`UserClient`**: Used by frontend applications (React, Next.js, Vue) to let end-users register their identities, update notification preferences, or delete their accounts using their own wallet signature.
2. **`ReadClient`**: A signing-free client useful for quickly checking if wallets are registered, or validating if a protocol is eligible to send messages. Safe for both browsers and node backends.
3. **`AuthorityClient`**: Specialized client used EXCLUSIVELY by the Herald Node Backend. Requires the global `HERALD_AUTHORITY` signature to manage protocol lifecycle and append encrypted receipts.
4. **`NotificationKeyClient`**: Manages end-to-end encryption notification keys. Derives deterministic X25519 keypairs from wallet signatures, seals them for the Herald Enclave, and builds on-chain register/rotate/revoke instructions.
5. **`Billing Module`**: A dedicated suite of clients (`BillingReadClient`, `HelioClient`, `PaymentClient`) located under `@herald-protocol/sdk/billing` to manage protocol subscription tiers, check quotas, and execute on-chain usage payments.

---

## Configuration

All clients inherit from a shared `BaseClient` configuration:

```typescript
import { UserClient, ReadClient, AuthorityClient } from '@herald-protocol/sdk';
import { BillingReadClient } from '@herald-protocol/sdk/billing';

const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  cluster: 'mainnet-beta', // 'mainnet-beta' | 'devnet' | 'localnet'
  commitment: 'confirmed', 
};

const userClient = new UserClient(config);
const readClient = new ReadClient(config);
const billingClient = new BillingReadClient(config);
```

---

## Code Examples

We recommend reviewing the standalone executable examples in the `examples/` directory for full, runnable code:

- [`examples/user-flow.ts`](./examples/user-flow.ts) — Covers the end-user wallet flow (Registration, Preferences, Deletion).
- [`examples/protocol-flow.ts`](./examples/protocol-flow.ts) — Covers backend logic (Registering protocols, updating tiers, sending compressed receipts).

---

## Usage Guide

### 1. Registering a User (Frontend Wallet)

To register an identity, you must provide the user's plaintext email and their Solana Wallet. The SDK handles all necessary encryption (NaCl) and PDA derivation out of the box.

**IMPORTANT**: Emails are *never* stored in plaintext on chain. They are converted into a SHA-256 hash (for deduplication) and an encrypted payload.

```typescript
import { Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { UserClient, encryptEmail, hashEmail } from '@herald-protocol/sdk';

async function registerUser(userWallet: Keypair, rawEmail: string) {
  // 1. Prepare secure data
  const emailHash = await hashEmail(rawEmail);
  const { encryptedEmail, nonce } = encryptEmail(rawEmail, userWallet.publicKey);

  // 2. Build the Instruction
  const ix = await userClient.registerIdentity({
    owner: userWallet.publicKey,
    encryptedEmail,
    emailHash,
    nonce,
    optIns: {
      optInAll: true,
      optInDefi: false,
      optInGovernance: false,
      optInMarketing: false,
    },
    digestMode: false,
  });

  // 3. Dispatch the Transaction
  const tx = new Transaction().add(ix);
  const signature = await sendAndConfirmTransaction(
    userClient.connection,
    tx,
    [userWallet] // User wallet signature required!
  );

  console.log('Identity registered at tx:', signature);
}
```

### 2. Updating User Preferences

Users can modify their settings to turn marketing emails off, or switch to daily digests. The `updateIdentity` instruction requires ONLY the fields that are changing.

```typescript
// Turn off Marketing
const ix = await userClient.updateIdentity({
  owner: userWallet.publicKey,
  optIns: {
    optInMarketing: false
  }
});
```

### 3. Fetching Accounts (Read-only)

The `ReadClient` allows you to fetch fully deserialized accounts quickly. Use this when you do not need to alter state.

```typescript
async function checkStatus(userPubkey: PublicKey) {
  // Fetch full account details
  const account = await readClient.fetchIdentityAccount(userPubkey);
  
  if (account) {
    console.log('Registered since:', account.registeredAt);
    console.log('Subscribed to all:', account.optInAll);
  } else {
    // Fast boolean check if you don't need the object data
    const isRegistered = await readClient.isRegistered(userPubkey);
    console.log('Is registered?', isRegistered);
  }
}
```

### 4. Billing & Subscriptions (Protocol Admin)

Protocols must maintain an active subscription to send notifications. The billing module provides methods to check quotas, calculate upgrade costs, and perform on-chain payments in USDC.

```typescript
import { Keypair } from '@solana/web3.js';
import { PaymentClient, BillingReadClient } from '@herald-protocol/sdk/billing';

const billingRead = new BillingReadClient(config);
const paymentClient = new PaymentClient(config);

async function manageSubscription(protocolWallet: Keypair) {
  // Check remaining messaging quota
  const status = await billingRead.getSubscriptionStatus(protocolWallet.publicKey);
  console.log(`Sends remaining: ${status?.sendsRemaining}`);

  // Calculate cost for 12 months on the Growth Tier
  const cost = await paymentClient.calculateCost(protocolWallet.publicKey, 12, 'USDC');
  console.log(`Total cost: $${cost.total} USDC (Discount: ${cost.discountApplied})`);

  // Build and execute the payment transaction
  const txSignature = await paymentClient.paySubscription(
    protocolWallet.publicKey, 
    12, 
    'USDC',
    protocolWallet // Signer
  );
  console.log('Subscription fully renewed:', txSignature);
}
```

### 5. Listening for Events dynamically

The SDK can bind to the Anchor program instance to stream real-time events, such as when a user is registered or when a delivery occurs.

```typescript
import { HeraldEventListener } from '@herald-protocol/sdk';

const listener = new HeraldEventListener(readClient.program);

// Hook into specific events
listener.on('NotificationDelivered', (event) => {
  console.log(`Notification sent in category ${event.category}`);
});

// Start listening WebSocket streams
listener.start();

// Cleanup when component unmounts
await listener.stop();
```

---

### 6. Notification Key Lifecycle (End-to-End Encryption)

The `NotificationKeyClient` manages X25519 keypairs that enable end-to-end encrypted notifications. The user's private key is derived deterministically from a wallet signature and never leaves the browser.

```typescript
import { NotificationKeyClient } from '@herald-protocol/sdk';

const keyClient = new NotificationKeyClient(config);

// Register a new notification key (derives keypair, seals for enclave, submits tx)
const { ix } = await keyClient.buildRegisterKeyIx(walletAdapter);

// Rotate an existing key (generates new keypair, re-seals)
const { ix: rotateIx } = await keyClient.buildRotateKeyIx(walletAdapter);

// Revoke key (zeroes on-chain data)
const revokeIx = await keyClient.buildRevokeKeyIx(ownerPubkey);

// Migrate old accounts to support notification keys
const migrateIx = await keyClient.buildMigrateSpaceIx(ownerPubkey);
```

#### Crypto Primitives (Browser-Only)

```typescript
import {
  deriveX25519Keypair,
  sealX25519PubkeyForEnclave,
  decryptNotification,
  decryptNotificationBody,
} from '@herald-protocol/sdk';

// Derive deterministic X25519 keypair from wallet signature
const keypair = await deriveX25519Keypair(walletAdapter);

// Seal user's pubkey for the Herald Enclave
const { sealedPubkey, senderPubkey, nonce } = await sealX25519PubkeyForEnclave(walletAdapter);

// Decrypt an incoming notification
const body = await decryptNotificationBody(walletAdapter, ciphertext, nonce);
console.log(body.subject, body.message);
```

---

## Architecture & Contributions

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Internal SDK architecture
- Local Development Setup
- Adding bindings for new Rust Program Instructions

## License

MIT
