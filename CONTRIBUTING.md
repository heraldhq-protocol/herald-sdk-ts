# Contributing to Herald SDK

Welcome! This document provides an overview of the SDK's architecture, development workflow, and how to contribute to the codebase.

## Project Structure

The SDK is written in TypeScript and uses `pnpm` as its package manager. It interacts heavily with `@coral-xyz/anchor` and `@lightprotocol/stateless.js`.

```text
src/
├── clients/          # High-level OOP clients (User, Read, Authority)
├── encryption/       # TweetNaCl, Ed25519->X25519 conversion, email hashing
├── errors/           # Custom error mapping, HeraldError wrapper class
├── events/           # Typed Event listeners and parsers for Anchor
├── idl/              # The raw JSON IDL provided by Anchor
├── instructions/     # Low-level instruction builders (one per file)
├── light/            # CPI and stateless proof integration
├── pda/              # PDA derivation utilities
├── types/            # Centralized TypeScript interfaces
└── utils/            # General helpers (time, bytes, retry logic)
```

## Architecture Overview

For a detailed visual breakdown of the SDK, including Component Architecture, Identity Registration Flows, and Notification Delivery State Machines, please see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Core Principles

1. **Transaction Building over Execution**
   Methods in `UserClient` and `AuthorityClient` return a `TransactionInstruction` instead of sending the transaction directly. This allows integrators (especially frontend wallets) to compose multiple instructions or handle signing and sending themselves.

2. **Heavy Use of Barrels**
   Every folder has an `index.ts` file acting as a barrel export. The root `src/index.ts` re-exports everything, allowing developers to import directly from `@herald-protocol/sdk`.

3. **Runtime Account Names**
   Due to Anchor's typing limitations with a supplied JSON IDL, the generic `Program<Idl>` does not strictly type the `.account.<name>` namespace. In `ReadClient`, we cast `this.program.account as any` to bypass TS2339 when fetching accounts.

4. **Client-Side Encryption Only**
   All encryption/decryption of emails happens exclusively client-side using a derived `X25519` key from the user's `Ed25519` wallet key. Plaintext emails never touch the blockchain.

## Development Workflow

### Prerequisites

- Node.js `^18.0.0`
- `pnpm`

### Setup

```bash
git clone <repository>
cd herald-sdk-ts
pnpm install
```

### Build

We use `tsup` to bundle the SDK into ECMAScript Modules (ESM), CommonJS (CJS), and TypeScript declaration files (`.d.ts`).

```bash
pnpm build
```

The output will be generated in the `dist/` directory.

### Local Testing

To verify compilation and check for TypeScript errors without emitting files:

```bash
npx tsc --noEmit
```

### Adding a New Instruction

If a new instruction is added to the Rust program:
1. Update `src/idl/herald_privacy_registry.ts` with the new JSON definition from `anchor build`.
2. Add the corresponding parameter interface in `src/types/instructions.ts`.
3. Create a new builder file in `src/instructions/<category>/<name>.ts`.
4. Export the builder from `src/instructions/index.ts`.
5. Integrate the builder into the relevant Client (e.g., `UserClient.ts`).

### Updating Events

When modifying events:
1. Add the enum/TypeScript type definition to `src/types/events.ts`.
2. Ensure the IDL JSON in `src/idl/` contains the new event structure.
3. Update the `parseHeraldEvent` switch statement in `src/events/parser.ts`.
4. The `HeraldEventListener` class will automatically emit it if the string name is registered in `start()`.
