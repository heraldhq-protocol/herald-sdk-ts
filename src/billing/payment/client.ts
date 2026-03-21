import {
    PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY,
    Transaction, TransactionInstruction,
} from '@solana/web3.js';
import {
    getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import type { PaySubscriptionParams, PaySubscriptionResult } from '../types.js';
import { BaseClient } from '../../clients/base.js';
import { findProtocolPda } from '../../pda/index.js';
import {
    SUBSCRIPTION_PERIOD_SECS,
} from '../../constants.js';
import { HeraldError } from '../../errors/index.js';

import { SUPPORTED_PAYMENT_TOKENS, HERALD_TIER_INFO } from '../utils.js';

export interface CostBreakdown {
    pricePerPeriod: string;
    months: number;
    subtotal: string;
    discountApplied: string | null;
    discountAmount: string | null;
    total: string;
    totalBaseUnits: bigint;
    token: string;
    tierName: string;
}

// Ensure vault seed logic works identically to what was specified in instructions
const VAULT_SEED = 'vault';

/**
 * PaymentClient — builds on-chain USDC/USDT pay_subscription transactions.
 * Phase 2 only. Phase 1 uses HelioClient for off-chain payments.
 */
export class PaymentClient extends BaseClient {

    /**
     * Build the pay_subscription instruction set.
     * Returns unsigned instructions — caller signs with their wallet.
     */
    async buildPaySubscription(
        params: PaySubscriptionParams,
    ): Promise<PaySubscriptionResult> {
        const { protocolOwner, months = 1, token = 'USDC' } = params;

        if (months < 1 || months > 12) {
            throw new HeraldError('Months must be between 1 and 12');
        }

        const { ReadClient } = await import('../../clients/read.js');
        const readClient = new ReadClient(this.config);
        const protocolAccount = await readClient.fetchProtocolAccount(protocolOwner);

        if (!protocolAccount) {
            throw new HeraldError('Protocol not registered in Herald');
        }
        if (protocolAccount.tier === 0) {
            throw new HeraldError('Developer tier is free — no payment required', 6017);
        }
        if (protocolAccount.isSuspended) {
            throw new HeraldError('Protocol is suspended — cannot renew', 6010);
        }

        const paymentMint = new PublicKey(SUPPORTED_PAYMENT_TOKENS[token].mint);
        const pricePerPeriod = HERALD_TIER_INFO[protocolAccount.tier].priceUsdcMonthly;
        const totalAmount = BigInt(pricePerPeriod) * BigInt(months);

        // Derive accounts
        const [protocolPda] = findProtocolPda(protocolOwner, this.programId);
        const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from(VAULT_SEED)], this.programId);

        // getAssociatedTokenAddress allows the token program ID to be overridden if needed, but defaults are fine
        const payerAta = await getAssociatedTokenAddress(paymentMint, protocolOwner);
        const vaultAta = await getAssociatedTokenAddress(paymentMint, vaultPda, true);

        // Check payer has sufficient balance
        const payerBalance = await this.getTokenBalance(payerAta);
        if (payerBalance < totalAmount) {
            const needed = this.formatUsdc(totalAmount);
            const has = this.formatUsdc(payerBalance);
            throw new HeraldError(
                `Insufficient ${token} balance. Need ${needed}, have ${has}.`
            );
        }

        const ix = await this.program.methods
            .paySubscription(months)
            .accounts({
                payer: protocolOwner,
                protocolAccount: protocolPda,
                paymentMint,
                payerTokenAccount: payerAta,
                vaultTokenAccount: vaultAta,
                vaultAccount: vaultPda,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .instruction();

        // Estimate new expiry
        const now = Math.floor(Date.now() / 1000);
        const currentExpiry = Number(protocolAccount.subscriptionExpiresAt);
        const base = currentExpiry > now ? currentExpiry : now;
        const newExpiryTs = base + SUBSCRIPTION_PERIOD_SECS * months;

        return {
            instructions: [ix],
            expectedAmount: totalAmount,
            expectedAmountDisplay: `$${this.formatUsdc(totalAmount)} ${token}`,
            newExpiryEstimate: new Date(newExpiryTs * 1000),
        };
    }

    /**
     * Convenience method: build + sign + send in one call.
     */
    async paySubscription(
        params: PaySubscriptionParams,
        signTransaction: (tx: Transaction) => Promise<Transaction>,
    ): Promise<{ signature: string; newExpiry: Date }> {
        const { instructions, newExpiryEstimate } = await this.buildPaySubscription(params);

        const { blockhash } = await this.connection.getLatestBlockhash();
        const tx = new Transaction({ recentBlockhash: blockhash, feePayer: params.protocolOwner });
        tx.add(...instructions);

        const signed = await signTransaction(tx);
        const signature = await this.connection.sendRawTransaction(signed.serialize());
        await this.connection.confirmTransaction(signature, 'confirmed');

        return { signature, newExpiry: newExpiryEstimate };
    }

    /**
     * Calculate the cost breakdown for a subscription purchase.
     */
    async calculateCost(
        protocolOwner: PublicKey,
        months: number,
        token: 'USDC' | 'USDT' = 'USDC',
    ): Promise<CostBreakdown> {
        const readClient = new (await import('../../clients/read.js')).ReadClient(this.config);
        const account = await readClient.fetchProtocolAccount(protocolOwner);
        if (!account) throw new HeraldError('Protocol not registered');

        const pricePerPeriod = BigInt(HERALD_TIER_INFO[account.tier].priceUsdcMonthly);
        const total = pricePerPeriod * BigInt(months);
        const discount = months >= 12 ? total / 10n : 0n; // 10% annual discount
        const finalAmount = total - discount;

        return {
            pricePerPeriod: this.formatUsdc(pricePerPeriod),
            months,
            subtotal: this.formatUsdc(total),
            discountApplied: months >= 12 ? '10% annual discount' : null,
            discountAmount: discount > 0n ? this.formatUsdc(discount) : null,
            total: this.formatUsdc(finalAmount),
            totalBaseUnits: finalAmount,
            token,
            tierName: this.getTierName(account.tier),
        };
    }

    private async getTokenBalance(ata: PublicKey): Promise<bigint> {
        try {
            const info = await this.connection.getTokenAccountBalance(ata);
            return BigInt(info.value.amount);
        } catch {
            return 0n;
        }
    }

    private formatUsdc(amount: bigint): string {
        const whole = amount / 1_000_000n;
        const frac = (amount % 1_000_000n).toString().padStart(6, '0').slice(0, 2);
        return `${whole}.${frac}`;
    }

    private getTierName(tier: number): string {
        return ['Developer', 'Growth', 'Scale', 'Enterprise'][tier] ?? 'Unknown';
    }

    private get programId(): PublicKey {
        return new PublicKey(this.config.programId);
    }
}
