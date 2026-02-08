import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';
import { createDeal } from '../../helpers/factories';

describe('Admin Application Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('POST /api/admin/applications/seed — create application', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });

    const req = adminRequest('/api/admin/applications/seed', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        deal_id: dealId,
        operator_id: seed.regularOperator.id,
        proposed_angle: 'Will promote via thread',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.application).toBeDefined();
    expect(data.data.application.deal_id).toBe(dealId);
  });

  it('POST /api/admin/applications/seed — invalid deal_id', async () => {
    const req = adminRequest('/api/admin/applications/seed', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        deal_id: 'nonexistent-deal',
        operator_id: seed.regularOperator.id,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('POST /api/admin/applications/seed — invalid operator_id', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });

    const req = adminRequest('/api/admin/applications/seed', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        deal_id: dealId,
        operator_id: 'nonexistent-operator',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});
