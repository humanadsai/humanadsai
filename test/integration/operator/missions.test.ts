import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { operatorRequest, fetchJson } from '../../helpers/request';
import { createDeal, createMission, createApplication } from '../../helpers/factories';

describe('Operator Missions', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('POST /api/missions/:dealId/apply — apply for mission', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, status: 'active' });

    const req = operatorRequest(`/api/missions/${dealId}/apply`, seed.regularOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        accept_disclosure: true,
        accept_no_engagement_buying: true,
        proposed_angle: 'I will create a thread about this',
        language: 'en',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.application_id).toBeTruthy();
    expect(data.data.status).toBe('applied');
  });

  it('POST /api/missions/submit — submit mission', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'accepted',
    });

    const req = operatorRequest('/api/missions/submit', seed.regularOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        submission_url: 'https://x.com/operator_test/status/1234567890',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.mission_id).toBe(missionId);
  });

  it('GET /api/missions/my — get my missions', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, title: 'My Test Deal' });
    await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
    });

    const req = operatorRequest('/api/missions/my', seed.regularOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.missions).toBeInstanceOf(Array);
    expect(data.data.missions.length).toBe(1);
  });
});
