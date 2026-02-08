import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';
import { createDeal, createMission } from '../../helpers/factories';

describe('Admin Mission Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/missions — list missions', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });

    const req = adminRequest('/api/admin/missions', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.missions).toBeInstanceOf(Array);
    expect(data.data.missions.length).toBe(1);
  });

  it('POST /api/admin/missions/submit — create submission', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });

    const req = adminRequest('/api/admin/missions/submit', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        submission_url: 'https://x.com/test/status/123456',
        submission_content: 'Test submission content',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const mission = await env.DB.prepare('SELECT status, submission_url FROM missions WHERE id = ?')
      .bind(missionId).first<any>();
    expect(mission!.status).toBe('submitted');
    expect(mission!.submission_url).toBe('https://x.com/test/status/123456');
  });

  it('POST /api/admin/missions/:id/review — approve (verify)', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'submitted',
      submission_url: 'https://x.com/test/status/123',
    });

    const req = adminRequest(`/api/admin/missions/${missionId}/review`, seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const mission = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(missionId).first<any>();
    expect(mission!.status).toBe('verified');
  });

  it('POST /api/admin/missions/:id/review — reject', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'submitted',
      submission_url: 'https://x.com/test/status/123',
    });

    const req = adminRequest(`/api/admin/missions/${missionId}/review`, seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', verification_result: 'Content does not meet requirements' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);

    const mission = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(missionId).first<any>();
    expect(mission!.status).toBe('rejected');
  });
});
