declare module 'ed2curve' {
    export function convertPublicKey(ed25519Pubkey: Uint8Array): Uint8Array | null;
    export function convertSecretKey(ed25519SecretKey: Uint8Array): Uint8Array;
}
