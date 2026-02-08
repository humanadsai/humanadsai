import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, publicRequest, fetchJson } from '../../helpers/request';

describe('Admin Config Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/env-check — environment status', async () => {
    const req = adminRequest('/api/admin/env-check', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it('GET /api/admin/config/payment-profile — current profile', async () => {
    const req = adminRequest('/api/admin/config/payment-profile', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.current).toBeDefined();
    expect(data.data.available_profiles).toBeInstanceOf(Array);
  });

  it('GET /api/config — public config (no auth required)', async () => {
    const req = publicRequest('/api/config');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.payment_profile).toBeDefined();
  });
});
