import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    chatwork: 'src/chatwork/index.ts',
    'king-of-time': 'src/king-of-time/index.ts',
    openai: 'src/openai/index.ts',
    rakuten: 'src/rakuten/index.ts',
    yahoo: 'src/yahoo/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  external: ['@konomi-app/ketch', 'openai', 'qs'],
});
