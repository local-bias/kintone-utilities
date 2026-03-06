import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  jsx: 'automatic',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'recoil',
    '@dnd-kit/core',
    '@dnd-kit/modifiers',
    '@dnd-kit/sortable',
    '@konomi-app/kintone-utilities',
    '@mui/icons-material',
    '@mui/material',
    '@radix-ui/react-slot',
  ],
});
