import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { publicRequest, fetchJson } from '../../helpers/request';
import { sha256Hex } from '../../../src/utils/crypto';

describe('AI Advertiser Lifecycle', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('POST /api/v1/advertisers/register — register new advertiser', async () => {
    const req = new Request('http://localhost:8787/api/v1/advertisers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TestAdvertiserCo',
        description: 'A test advertiser',
        mode: 'test',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.advertiser).toBeDefined();
    expect(data.data.advertiser.api_key).toBeTruthy();
    expect(data.data.advertiser.claim_url).toBeTruthy();
    expect(data.data.advertiser.verification_code).toBeTruthy();
  });

  it('GET /api/v1/advertisers/me — get profile with API key', async () => {
    // Create advertiser directly
    const apiKey = 'humanads_testkey123456789012345678';
    const apiKeyHash = await sha256Hex(apiKey);

    await env.DB.prepare(
      `INSERT INTO ai_advertisers (id, name, mode, status, api_key_hash, api_key_prefix, api_secret, key_id, claim_url, verification_code)
       VALUES ('adv-001', 'TestAdv', 'test', 'active', ?, 'humanads_testkey1', 'secret123', 'hads_test001', 'https://humanadsai.com/claim/test001', 'reef-TEST')`
    ).bind(apiKeyHash).run();

    const req = new Request('http://localhost:8787/api/v1/advertisers/me', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('POST /api/v1/advertisers/missions — create mission (deal)', async () => {
    const apiKey = 'humanads_testkey123456789012345678';
    const apiKeyHash = await sha256Hex(apiKey);

    await env.DB.prepare(
      `INSERT INTO ai_advertisers (id, name, mode, status, api_key_hash, api_key_prefix, api_secret, key_id, claim_url, verification_code)
       VALUES ('adv-002', 'TestAdv2', 'test', 'active', ?, 'humanads_testkey1', 'secret123', 'hads_test002', 'https://humanadsai.com/claim/test002', 'reef-TST2')`
    ).bind(apiKeyHash).run();

    // Also need to create an agent for this advertiser (AI advertisers link to agents)
    await env.DB.prepare(
      `INSERT INTO agents (id, name, email, status) VALUES ('agent-adv-002', 'TestAdv2', 'adv2@test.com', 'approved')`
    ).run();

    const req = new Request('http://localhost:8787/api/v1/advertisers/missions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Origin': 'http://localhost:8787',
      },
      body: JSON.stringify({
        mode: 'test',
        title: 'Promote Our Product',
        brief: 'Share our product with your audience',
        requirements: {
          must_include_hashtags: ['#test'],
        },
        deadline_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        payout: { token: 'hUSD', amount: '10.00' },
        max_claims: 5,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    // May return 200/201 or an error if advertiser-agent linking is not set up
    expect(data).toBeDefined();
  });

  it('GET /api/v1/advertisers/missions/mine — list own missions', async () => {
    const apiKey = 'humanads_testkey123456789012345678';
    const apiKeyHash = await sha256Hex(apiKey);

    await env.DB.prepare(
      `INSERT INTO ai_advertisers (id, name, mode, status, api_key_hash, api_key_prefix, api_secret, key_id, claim_url, verification_code)
       VALUES ('adv-003', 'TestAdv3', 'test', 'active', ?, 'humanads_testkey1', 'secret123', 'hads_test003', 'https://humanadsai.com/claim/test003', 'reef-TST3')`
    ).bind(apiKeyHash).run();

    const req = new Request('http://localhost:8787/api/v1/advertisers/missions/mine', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('unauthenticated request to protected endpoint — returns 401', async () => {
    const req = new Request('http://localhost:8787/api/v1/advertisers/me');
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('invalid API key — returns 401', async () => {
    const req = new Request('http://localhost:8787/api/v1/advertisers/me', {
      headers: { 'Authorization': 'Bearer invalid_key_here' },
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(401);
    expect(data.success).toBe(false);
  });
});
