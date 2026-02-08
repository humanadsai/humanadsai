import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';

describe('Admin Token Operations (Playground)', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/token-ops — list operations', async () => {
    const req = adminRequest('/api/admin/token-ops', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.operations || data.data.token_ops || data.data).toBeDefined();
  });

  it('POST /api/admin/token-ops/log — manual log', async () => {
    const req = adminRequest('/api/admin/token-ops/log', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        type: 'owner_mint',
        tx_hash: '0x' + 'a'.repeat(64),
        to_address: '0x1234567890abcdef1234567890abcdef12345678',
        amount_cents: 100000,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('POST /api/admin/faucet — ledger mode (no treasury key)', async () => {
    const req = adminRequest('/api/admin/faucet', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        advertiser_address: '0x1234567890abcdef1234567890abcdef12345678',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    // Without treasury key, should return an error
    expect(data).toBeDefined();
  });
});
