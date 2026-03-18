# Herald SDK Architecture & Flows

This document details the internal architecture of the `@herald-protocol/sdk` and outlines the key user and system flows using Mermaid diagrams.

## 1. SDK Component Architecture

The SDK is organized modularly. The base layer handles Anchor interactions and deserialization, while the high-level clients provide interfaces for distinct user personas (Users, Authorities, Readers).

```mermaid
graph TD
    %% Core Module definition
    SDK["@herald-protocol/sdk (Entrypoint)"]

    %% Clients
    subgraph Clients["High-Level Clients"]
        UC[UserClient]
        AC[AuthorityClient]
        RC[ReadClient]
    end

    %% Providers & Config
    BC[BaseClient]
    CONFIG[Resolved Config & Anchor Provider]

    %% Internal Modules
    subgraph Modules["Internal Modules"]
        IX[Instruction Builders]
        EV[Event Listener & Parsers]
        ENC[Encryption <br/> TweetNaCl/Crypto]
        PDA[PDA Utils]
        LIGHT[Light Protocol CPI]
        DESER[Account Deserializers]
    end

    %% Wiring
    SDK --> UC
    SDK --> AC
    SDK --> RC
    SDK --> EV

    UC --> BC
    AC --> BC
    RC --> BC
    BC --> CONFIG

    UC --> IX
    AC --> IX
    AC --> LIGHT

    RC --> DESER
    RC --> PDA

    IX --> PDA
    IX --> ENC

    EV --> DESER
```

## 2. Identity Registration Flow

This flow illustrates how an end-user registers their email address on-chain without exposing the plaintext email. The encryption happens entirely client-side.

```mermaid
sequenceDiagram
    participant User as End User (Wallet)
    participant SDK as @herald-protocol/sdk
    participant Solana as Solana Network

    User->>SDK: registerIdentity("alice@example.com")
    
    rect rgb(30, 40, 60)
        Note over SDK: Client-Side Encryption
        SDK->>SDK: hashEmail("alice@example.com") -> emailHash
        SDK->>SDK: deriveX25519(User_Ed25519_Key)
        SDK->>SDK: generateEphemeralKeypair()
        SDK->>SDK: encrypt("alice@example.com") -> encryptedEmail + nonce
    end

    SDK->>SDK: findIdentityPda(User.publicKey)
    SDK->>SDK: buildRegisterIdentityIx(...)
    SDK->>Solana: Send Transaction (Instruction)
    
    Solana-->>SDK: Transaction Signature
    
    rect rgb(30, 60, 40)
        Note over Solana: On-Chain Execution
        Solana->>Solana: Initialize Identity PDA
        Solana->>Solana: Store encryptedEmail, emailHash, nonce
        Solana->>Solana: Emit IdentityRegistered Event
    end

    SDK-->>User: Success (Tx Signature)
```

## 3. Notification Delivery & Write Receipt Flow

When a protocol triggers a notification, the Herald Backend uses the SDK to compress the delivery receipt using Light Protocol, saving significant rent costs.

```mermaid
sequenceDiagram
    participant Protocol
    participant Backend as Herald Backend
    participant SDK as AuthorityClient
    participant Light as Light RPC (Photon)
    participant Solana as Solana Network

    Protocol->>Backend: Trigger Event (e.g., Liquidation Warning)
    Backend->>Backend: Evaluate user preferences & limits
    Backend->>Backend: Deliver Email (Off-chain)
    
    Note over Backend, Light: Prepare ZK Compressed Receipt
    Backend->>SDK: writeReceipt(protocol, user)
    SDK->>Light: fetchProofForReceipt(OutputTree)
    Light-->>SDK: ValidityProof & RemainingAccounts
    
    SDK->>SDK: buildWriteReceiptIx(Proof, Accounts)
    SDK->>Solana: Send Transaction (Authority signs)
    
    Note over Solana: On-Chain Execution (Light Protocol CPI)
    Solana->>Solana: Increment Protocol Sends Counter
    Solana->>Solana: Verify ZK Proof via Account Compression
    Solana->>Solana: Emit NotificationDelivered Event
    Solana->>Solana: Append Leaf to Merkle Tree

    Solana-->>SDK: Transaction Signature
    SDK-->>Backend: Success
```

## 4. Receipt Batching Flow

To amortise the fixed costs of Solana transactions and ZK verification, the SDK includes a `ReceiptBatchProcessor` that groups multiple receipt writes into a single transaction.

```mermaid
flowchart TD
    A[Backend Requests Receipt Write] --> B{Batch Full? <br/> size == 10}
    B -- Yes --> C[Flush Batch]
    B -- No --> D{Timer Expired? <br/> 2 seconds}
    D -- Yes --> C
    D -- No --> E[Add to Queue]
    
    C --> F[Fetch SINGLE ValidityProof from Light RPC]
    F --> G[Build 1-10 Instructions]
    G --> H[Pack into Single Transaction]
    H --> I[Send to Solana]
    I --> J[Clear Queue & Timer]
```

## 5. Protocol Lifecycle State Machine

Protocols have subscriptions and tiers. The on-chain state restricts sending capabilities based on these states.

```mermaid
stateDiagram-v2
    [*] --> Unregistered

    Unregistered --> Registered : register_protocol
    
    state ActiveSession {
        [*] --> Active
        Active --> Renewed : renew_subscription
        Renewed --> Active
    }

    Registered --> ActiveSession : renew_subscription (Initial Payment)
    
    ActiveSession --> Expired : Time > subscription_expires_at
    Expired --> ActiveSession : renew_subscription
    
    ActiveSession --> Deactivated : deactivate_protocol (Soft Pause)
    Deactivated --> ActiveSession : reactivate_protocol
    
    ActiveSession --> Suspended : suspend_protocol (Hard Ban)
    Suspended --> ActiveSession : Authority manually unsuspends (Future Ix)

    Expired --> Deactivated : deactivate_protocol
```

These diagrams should provide a clear mental model of how data and control flows through the Herald Privacy Registry SDK and the corresponding Solana program.
