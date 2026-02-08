import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, operatorRequest, publicRequest, fetchJson } from '../../helpers/request';
import { createAgent, createDeal, createMission, createApplication } from '../../helpers/factories';

describe('Admin Dashboard', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/dashboard — returns stats', async () => {
    const req = adminRequest('/api/admin/dashboard', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.stats).toBeDefined();
    expect(data.data.stats.total_agents).toBeTypeOf('number');
    expect(data.data.stats.total_operators).toBeTypeOf('number');
    expect(data.data.fee_recipients).toBeDefined();
    expect(data.data.fee_recipients.evm).toBeTruthy();
    expect(data.data.fee_recipients.solana).toBeTruthy();
  });

  it('GET /api/admin/dashboard — unauthenticated returns 401', async () => {
    const req = publicRequest('/api/admin/dashboard');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('GET /api/admin/dashboard — non-admin returns 403', async () => {
    const req = adminRequest('/api/admin/dashboard', seed.regularOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('GET /api/admin/dashboard — correct counts after data insertion', async () => {
    // Create additional data
    const agentId = await createAgent(env.DB, { name: 'Extra Agent', email: 'extra@test.com' });
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, status: 'active' });
    await createApplication(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });
    await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });

    const req = adminRequest('/api/admin/dashboard', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    // 2 agents: seed + extra
    expect(data.data.stats.total_agents).toBe(2);
    // 2 operators: admin + regular
    expect(data.data.stats.total_operators).toBe(2);
    expect(data.data.stats.total_deals).toBe(1);
    expect(data.data.stats.total_missions).toBe(1);
    expect(data.data.stats.total_applications).toBe(1);
  });
});
