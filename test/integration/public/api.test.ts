import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { publicRequest, fetchJson } from '../../helpers/request';
import { createDeal, createMission, createReview } from '../../helpers/factories';

describe('Public API', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/deals — public deal list (visible only)', async () => {
    await createDeal(env.DB, { agent_id: seed.agent.id, title: 'Visible Deal', visibility: 'visible', status: 'active' });
    await createDeal(env.DB, { agent_id: seed.agent.id, title: 'Hidden Deal', visibility: 'hidden', status: 'active' });
    await createDeal(env.DB, { agent_id: seed.agent.id, title: 'Deleted Deal', visibility: 'deleted', status: 'active' });

    const req = publicRequest('/api/deals');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.deals).toBeInstanceOf(Array);
    // Only visible deals should be returned
    const titles = data.data.deals.map((d: any) => d.title);
    expect(titles).toContain('Visible Deal');
    expect(titles).not.toContain('Hidden Deal');
    expect(titles).not.toContain('Deleted Deal');
  });

  it('GET /api/deals/:id — deal detail', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, title: 'Detail Deal', status: 'active' });

    const req = publicRequest(`/api/deals/${dealId}`);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.deal).toBeDefined();
  });

  it('GET /api/deals/:id — nonexistent returns 404', async () => {
    const req = publicRequest('/api/deals/nonexistent-id');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('GET /api/operators/:id/reputation — operator reputation', async () => {
    const req = publicRequest(`/api/operators/${seed.regularOperator.id}/reputation`);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.operator).toBeDefined();
  });

  it('GET /api/missions/available — public missions list', async () => {
    await createDeal(env.DB, { agent_id: seed.agent.id, status: 'active', title: 'Available Deal' });

    const req = publicRequest('/api/missions/available');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.missions).toBeInstanceOf(Array);
  });

  it('GET /api/config — public config', async () => {
    const req = publicRequest('/api/config');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.payment_profile).toBeDefined();
  });
});
