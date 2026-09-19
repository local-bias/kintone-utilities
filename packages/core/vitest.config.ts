import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    reporters: [
      'default',
      ['html', { outputFile: './test-results/index.html' }],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/**/types/**'],
      reportsDirectory: './coverage',
    },
  },
});
