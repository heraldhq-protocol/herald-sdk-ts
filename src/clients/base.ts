import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, type Idl } from '@coral-xyz/anchor';
import { HERALD_PROGRAM_ID } from '../constants.js';
import { HeraldIdl } from '../idl/herald_privacy_registry.js';
import type { HeraldConfig, Commitment } from '../types/config.js';

/** Resolved config with all defaults applied. */
export interface ResolvedHeraldConfig {
    rpcUrl: string;
    cluster: 'mainnet-beta' | 'devnet' | 'localnet';
    programId: string;
    commitment: Commitment;
    maxRetries: number;
    lightRpcUrl: string;
}

/**
 * Base class providing shared connection, program instance, and config.
 * All three client classes (`UserClient`, `AuthorityClient`, `ReadClient`) extend this.
 */
export abstract class BaseClient {
    readonly connection: Connection;
    readonly program: Program;
    readonly config: ResolvedHeraldConfig;

    /**
     * Builds the base client.
     * @param config - The Herald configuration object containing RPC URL, cluster, and commitment.
     */
    constructor(config: HeraldConfig) {
        const rpcUrl = config.rpcUrl || process.env.HERALD_SOLANA_RPC_URL;
        if (!rpcUrl) {
            throw new Error(
                'RPC URL is required. Provide rpcUrl in config or set HERALD_SOLANA_RPC_URL environment variable.'
            );
        }

        this.config = {
            cluster: config.cluster ?? 'mainnet-beta',
            commitment: config.commitment ?? 'confirmed',
            maxRetries: config.maxRetries ?? 3,
            rpcUrl,
            programId: config.programId ?? HERALD_PROGRAM_ID.toBase58(),
            lightRpcUrl: config.lightRpcUrl ?? process.env.HERALD_SOLANA_RPC_URL ?? rpcUrl,
        };

        this.connection = new Connection(this.config.rpcUrl, this.config.commitment);

        // Program uses a read-only provider (no default signer).
        // Signers are passed per-instruction call.
        const provider = new AnchorProvider(
            this.connection,
            {
                publicKey: PublicKey.default,
                signTransaction: async (tx: any) => tx,
                signAllTransactions: async (txs: any) => txs,
            } as any,
            { commitment: this.config.commitment },
        );

        // Use the real Anchor IDL generated from `anchor build`.
        // Anchor 0.30+ uses new Program(idl, provider) with address in IDL.
        this.program = new Program(
            HeraldIdl as unknown as Idl,
            provider,
        );
    }
}
