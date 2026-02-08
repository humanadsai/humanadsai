import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    globals: true,
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          compatibilityDate: '2026-02-04',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
    testTimeout: 30000,
  },
});
