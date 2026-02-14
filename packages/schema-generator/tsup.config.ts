import { defineConfig } from 'tsup';

export default defineConfig([
  // Library entries (no shebang)
  {
    entry: {
      index: 'src/index.ts',
      client: 'src/client/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    shims: true,
  },
  // CLI entry (with shebang)
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
