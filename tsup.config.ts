import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        'index': 'src/index.ts',
        'clients/user': 'src/clients/user.ts',
        'clients/authority': 'src/clients/authority.ts',
        'clients/read': 'src/clients/read.ts',
        'billing/index': 'src/billing/index.ts',
        'encryption/index': 'src/encryption/index.ts',
        'pda/index': 'src/pda/index.ts',
        'types/index': 'src/types/index.ts',
        'errors/index': 'src/errors/index.ts',
        'events/index': 'src/events/index.ts',
        'light/index': 'src/light/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: true,
    treeshake: true,
    external: [
        '@solana/web3.js',
        '@coral-xyz/anchor',
        '@lightprotocol/stateless.js',
    ],
    esbuildOptions(opts) {
        opts.target = 'es2022';
    },
});
