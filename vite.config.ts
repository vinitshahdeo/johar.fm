import { defineConfig } from 'vitest/config';
import { htmlPlugin } from './build/htmlPlugin';

export default defineConfig({
  plugins: [htmlPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: { input: { main: 'index.html' } },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
