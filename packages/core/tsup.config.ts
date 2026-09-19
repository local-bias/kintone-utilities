import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'character-width-conversion': 'src/character-width-conversion.ts',
    cybozu: 'src/cybozu.ts',
    'cybozu-api': 'src/cybozu-api/index.ts',
    date: 'src/date.ts',
    decorator: 'src/decorator.ts',
    'event-manager': 'src/event-manager.ts',
    plugin: 'src/plugin/index.ts',
    'rest-api': 'src/rest-api/index.ts',
    utilities: 'src/utilities.ts',
    'utility-types': 'src/utility-types.ts',
    xapp: 'src/xapp/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
});
