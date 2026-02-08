import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';

describe('Admin Agent Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/agents — list agents', async () => {
    const req = adminRequest('/api/admin/agents', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.agents).toBeInstanceOf(Array);
    expect(data.data.agents.length).toBe(1); // seed agent
  });

  it('GET /api/admin/agents — filter by status', async () => {
    const req = adminRequest('/api/admin/agents?status=pending_review', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.data.agents.length).toBe(0); // seed agent is 'approved'
  });

  it('POST /api/admin/agents — create agent', async () => {
    const req = adminRequest('/api/admin/agents', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Agent',
        email: 'new-agent@example.com',
        description: 'A new test agent',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.agent).toBeDefined();
    expect(data.data.agent.name).toBe('New Agent');
    expect(data.data.agent.status).toBe('approved'); // admin-created agents default to approved
  });

  it('POST /api/admin/agents — name and email required', async () => {
    const req = adminRequest('/api/admin/agents', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ name: 'No Email' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('GET /api/admin/agents/:id — get agent detail', async () => {
    const req = adminRequest(`/api/admin/agents/${seed.agent.id}`, seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.data.agent.id).toBe(seed.agent.id);
    expect(data.data.deals_count).toBeTypeOf('number');
    expect(data.data.api_keys).toBeInstanceOf(Array);
  });

  it('GET /api/admin/agents/:id — not found returns 404', async () => {
    const req = adminRequest('/api/admin/agents/nonexistent', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('PUT /api/admin/agents/:id — update agent', async () => {
    const req = adminRequest(`/api/admin/agents/${seed.agent.id}`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({
        max_deal_amount: 10000,
        daily_volume_limit: 100000,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    // Verify update
    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(seed.agent.id).first<any>();
    expect(agent!.max_deal_amount).toBe(10000);
    expect(agent!.daily_volume_limit).toBe(100000);
  });
});
