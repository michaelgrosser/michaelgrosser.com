import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // Only the Workers runtime provides this module; tests use a local stand-in.
      'cloudflare:email': fileURLToPath(
        new URL('./tests/stubs/cloudflare-email.ts', import.meta.url),
      ),
    },
  },
});
