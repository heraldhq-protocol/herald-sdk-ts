# @herald-protocol/sdk

The official TypeScript SDK for the **Herald Privacy Registry** Solana program.

Herald is an on-chain registry for privacy-preserving email delivery, allowing users to register encrypted emails and manage notification preferences without revealing their plaintext address on-chain.

## Installation

```bash
npm install @herald-protocol/sdk @solana/web3.js @coral-xyz/anchor @lightprotocol/stateless.js
# or
yarn add @herald-protocol/sdk @solana/web3.js @coral-xyz/anchor @lightprotocol/stateless.js
# or
pnpm add @herald-protocol/sdk @solana/web3.js @coral-xyz/anchor @lightprotocol/stateless.js
```

## SDK Architecture

The SDK is organized into three primary clients tailored for different consumers:

1. **`UserClient`**: Used by frontend applications (React, Next.js, Vue) to let end-users register their identities, update notification preferences, or delete their accounts using their own wallet signature.
2. **`ReadClient`**: A signing-free client useful for quickly checking if wallets are registered, or validating if a protocol is eligible to send messages. Safe for both browsers and node backends.
3. **`AuthorityClient`**: Specialized client used EXCLUSIVELY by the Herald Node Backend. Requires the global `HERALD_AUTHORITY` signature to manage protocol lifecycle and append encrypted receipts.

---

## Configuration

All clients inherit from a shared `BaseClient` configuration:

```typescript
import { UserClient, ReadClient, AuthorityClient } from '@herald-protocol/sdk';

const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  cluster: 'mainnet-beta', // 'mainnet-beta' | 'devnet' | 'localnet'
  commitment: 'confirmed', 
};

const userClient = new UserClient(config);
const readClient = new ReadClient(config);
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

### 4. Listening for Events dynamically

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

## Architecture & Contributions

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Internal SDK architecture
- Local Development Setup
- Adding bindings for new Rust Program Instructions

## License

MIT
