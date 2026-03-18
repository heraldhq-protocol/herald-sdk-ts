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

## Usage

The SDK is organized into three primary clients:
1. `UserClient`: For end-users managing their identity.
2. `ReadClient`: For querying accounts and checking status without needing a wallet.
3. `AuthorityClient`: For protocols and the Herald backend to manage registries and billing.

### Initializing a Client

All clients inherit from a base configuration:

```typescript
import { UserClient, ReadClient } from '@herald-protocol/sdk';

const config = {
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  cluster: 'mainnet-beta', // 'mainnet-beta' | 'devnet' | 'localnet'
  commitment: 'confirmed',
};

const userClient = new UserClient(config);
const readClient = new ReadClient(config);
```

### 1. UserClient: Registering an Identity

To register a user, you need their plaintext email and their wallet. The SDK handles encryption and PDA derivation automatically.

```typescript
import { Keypair, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { encryptEmail, hashEmail } from '@herald-protocol/sdk';

async function register(userWallet: Keypair, rawEmail: string) {
  // 1. Prepare data
  const emailHash = await hashEmail(rawEmail);
  const { encryptedEmail, nonce } = encryptEmail(rawEmail);

  // 2. Build Instruction
  const ix = await userClient.buildRegisterIdentityIx({
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

  // 3. Send Transaction
  const tx = new Transaction().add(ix);
  const signature = await sendAndConfirmTransaction(
    userClient.connection,
    tx,
    [userWallet], // user signs
    { commitment: 'confirmed' }
  );

  console.log('Registered in tx:', signature);
}
```

### 2. ReadClient: Fetching Accounts

The `ReadClient` allows you to fetch fully deserialized accounts quickly.

```typescript
async function checkStatus(userPubkey: PublicKey) {
  // Fetch full account
  const account = await readClient.fetchIdentityAccount(userPubkey);
  
  if (account) {
    console.log('Registered since:', account.registeredAt);
    console.log('Subscribed to all:', account.optInAll);
  } else {
    // Fast boolean check if you don't need the data
    const isRegistered = await readClient.isRegistered(userPubkey);
    console.log('Is registered?', isRegistered);
  }
}
```

### 3. Events & Subscriptions

Listen to events dynamically emitted by the program:

```typescript
import { HeraldEventListener } from '@herald-protocol/sdk';

const listener = new HeraldEventListener(readClient.program);

// Listen to specific events
listener.on('NotificationDelivered', (event) => {
  console.log(`Notification sent in category ${event.category}`);
});

// Start listening
listener.start();

// Cleanup when done
await listener.stop();
```

## Architecture & Contributions

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on the SDK architecture, local development, and adding new instructions.

## License

MIT
