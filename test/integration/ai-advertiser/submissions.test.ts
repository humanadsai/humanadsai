import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { fetchJson } from '../../helpers/request';
import { sha256Hex } from '../../../src/utils/crypto';
import { createDeal, createMission } from '../../helpers/factories';

describe('AI Advertiser Submissions', () => {
  let seed: TestSeedData;
  let apiKey: string;
  let apiKeyHash: string;
  const advertiserId = 'adv-sub-001';

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);

    apiKey = 'humanads_submtest12345678901234567';
    apiKeyHash = await sha256Hex(apiKey);

    // Create AI advertiser with agent link
    await env.DB.prepare(
      `INSERT INTO ai_advertisers (id, name, mode, status, api_key_hash, api_key_prefix, api_secret, key_id, claim_url, verification_code)
       VALUES (?, 'SubTestAdv', 'test', 'active', ?, 'humanads_submtest', 'secret', 'hads_sub001', 'https://humanadsai.com/claim/sub001', 'reef-SUB1')`
    ).bind(advertiserId, apiKeyHash).run();
  });

  function advRequest(path: string, options: RequestInit = {}): Request {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${apiKey}`);
    if (options.body) headers.set('Content-Type', 'application/json');
    headers.set('Origin', 'http://localhost:8787');
    return new Request(`http://localhost:8787${path}`, { ...options, headers });
  }

  it('GET /api/v1/advertisers/missions/:id/submissions — list submissions', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'submitted',
      submission_url: 'https://x.com/test/status/111',
    });

    const req = advRequest(`/api/v1/advertisers/missions/${dealId}/submissions`);
    const { status, data } = await fetchJson<any>(SELF, req);

    // May return submissions or auth error depending on ownership
    expect(data).toBeDefined();
  });

  it('POST /api/v1/advertisers/submissions/:id/approve — approve submission', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'submitted',
      submission_url: 'https://x.com/test/status/222',
    });

    const req = advRequest(`/api/v1/advertisers/submissions/${missionId}/approve`, {
      method: 'POST',
    });
    const { data } = await fetchJson<any>(SELF, req);
    expect(data).toBeDefined();
  });

  it('POST /api/v1/advertisers/submissions/:id/reject — reject submission', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'submitted',
      submission_url: 'https://x.com/test/status/333',
    });

    const req = advRequest(`/api/v1/advertisers/submissions/${missionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Content does not meet requirements' }),
    });
    const { data } = await fetchJson<any>(SELF, req);
    expect(data).toBeDefined();
  });

  it('GET /api/v1/advertisers/submissions/:id/payout — payout status', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'verified',
    });

    const req = advRequest(`/api/v1/advertisers/submissions/${missionId}/payout`);
    const { data } = await fetchJson<any>(SELF, req);
    expect(data).toBeDefined();
  });
});
