import React, { useEffect, useRef } from "react";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

/**
 * Interface representing a generic host wallet.
 * This is compatible with Privy, Dynamic, and standard Solana wallet adapters.
 */
export interface HeraldHostWallet {
    address?: string;
    publicKey?: { toBase58: () => string } | string;
    signTransaction?: (transaction: Uint8Array) => Promise<Uint8Array>;
    signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

export interface UseHeraldIframeListenerOptions {
    wallet: HeraldHostWallet | null | undefined;
    portalOrigin?: string; // e.g., 'https://notify.useherald.xyz'
    onRegistrationComplete?: (txSignature: string, alreadyRegistered: boolean) => void;
}

/**
 * A React hook that listens for `postMessage` requests from the embedded Herald Iframe
 * and routes them to the provided host wallet for signing and connection.
 */
export function useHeraldIframeListener({
    wallet,
    portalOrigin = "https://notify.useherald.xyz",
    onRegistrationComplete,
}: UseHeraldIframeListenerOptions) {
    const walletRef = useRef(wallet);
    walletRef.current = wallet;

    const onRegCompleteRef = useRef(onRegistrationComplete);
    onRegCompleteRef.current = onRegistrationComplete;

    const pubkey = wallet?.address || 
        (typeof wallet?.publicKey === 'string' ? wallet?.publicKey : wallet?.publicKey?.toBase58());

    // Broadcast host wallet switches/disconnects to the embedded iframe(s)
    useEffect(() => {
        const notifyIframesOfWalletChange = () => {
            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
                try {
                    const iframeUrl = new URL(iframe.src);
                    const expectedPortalUrl = new URL(portalOrigin);
                    // Match the origin of the iframe to ensure we only send to the portal iframe
                    if (iframeUrl.origin === expectedPortalUrl.origin || iframeUrl.origin === "http://localhost:3000") {
                        if (pubkey) {
                            iframe.contentWindow?.postMessage(
                                { source: "HERALD_HOST_APPLICATION", action: "hostWalletSwitch", params: { address: pubkey } },
                                iframeUrl.origin
                            );
                        } else {
                            iframe.contentWindow?.postMessage(
                                { source: "HERALD_HOST_APPLICATION", action: "hostDisconnect" },
                                iframeUrl.origin
                            );
                        }
                    }
                } catch {
                    // Ignore URL parsing or cross-origin errors
                }
            });
        };

        notifyIframesOfWalletChange();
    }, [pubkey, portalOrigin]);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            const data = event.data;
            if (!data || data.source !== "HERALD_PORTAL_IFRAME") return;
            
            // Allow localhost for testing, otherwise validate against the official portal origin
            if (event.origin !== portalOrigin && event.origin !== "http://localhost:3000") return;

            const { action, params, requestId } = data;
            const currentWallet = walletRef.current;

            const reply = (result: any = null, error: string | null = null) => {
                if (event.source) {
                    (event.source as Window).postMessage(
                        { target: "HERALD_PORTAL_IFRAME", requestId, result, error },
                        event.origin
                    );
                }
            };

            try {
                if (action === "onRegistrationComplete") {
                    if (onRegCompleteRef.current) {
                        onRegCompleteRef.current(params.txSignature, params.alreadyRegistered);
                    }
                    return;
                }

                if (!currentWallet) {
                    throw new Error("No wallet connected in the host application");
                }

                switch (action) {
                    case "connect": {
                        const pubkey = currentWallet.address || 
                            (typeof currentWallet.publicKey === 'string' ? currentWallet.publicKey : currentWallet.publicKey?.toBase58());
                        if (!pubkey) throw new Error("Wallet public key is not available");
                        
                        // Validate that the connected address is a valid Solana public key (cross-chain safeguard)
                        try {
                            new PublicKey(pubkey);
                        } catch {
                            throw new Error(`Invalid Solana wallet address: ${pubkey}. Please make sure your wallet is set to Solana.`);
                        }
                        
                        reply(pubkey);
                        break;
                    }

                    case "signTransaction": {
                        if (!currentWallet.signTransaction) {
                            throw new Error("signTransaction is not supported by the host wallet");
                        }
                        const txBytes = bs58.decode(params.transaction);
                        const signedBytes = await currentWallet.signTransaction(txBytes);
                        reply({ signedTransaction: bs58.encode(signedBytes) });
                        break;
                    }

                    case "signMessage": {
                        if (!currentWallet.signMessage) {
                            throw new Error("signMessage is not supported by the host wallet");
                        }
                        const msgBytes = bs58.decode(params.message);
                        const sigBytes = await currentWallet.signMessage(msgBytes);
                        reply({ signature: bs58.encode(sigBytes) });
                        break;
                    }

                    case "disconnect": {
                        reply(true);
                        break;
                    }

                    default:
                        reply(null, `Unsupported iframe action: ${action}`);
                }
            } catch (err: any) {
                console.error("Herald iframe adapter error:", err);
                reply(null, err.message || "Failed to process request");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [portalOrigin]);
}

export interface HeraldIframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
    /** Your protocol ID from the Herald Developer Dashboard */
    protocolId: string;
    /** The base URL of the Herald Portal. Defaults to production (https://notify.useherald.xyz) */
    portalUrl?: string;
}

/**
 * Renders the Herald User Portal safely embedded in an iframe.
 */
export function HeraldIframe({
    protocolId,
    portalUrl = "https://notify.useherald.xyz",
    ...props
}: HeraldIframeProps) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const src = `${portalUrl}/register?embed=true&protocolId=${protocolId}&parentOrigin=${encodeURIComponent(origin)}`;

    return (
        <iframe
            src={src}
            allow="clipboard-write"
            style={{ width: "100%", height: "600px", border: "none", ...props.style }}
            title="Herald Notification Preferences"
            {...props}
        />
    );
}
