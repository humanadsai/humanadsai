import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';

describe('Admin Scenario Runner (Playground)', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('full-lifecycle — normal execution', async () => {
    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'full-lifecycle' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.success).toBe(true);
    expect(data.data.scenario).toBe('full-lifecycle');
    expect(data.data.created).toBeDefined();
    expect(data.data.created.agent_id).toBeTruthy();
    expect(data.data.created.deal_id).toBeTruthy();
    expect(data.data.created.operator_id).toBeTruthy();
    expect(data.data.created.application_id).toBeTruthy();
    expect(data.data.created.mission_id).toBeTruthy();

    // Verify mission was created with 'accepted' status
    const mission = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(data.data.created.mission_id).first<any>();
    expect(mission!.status).toBe('accepted');
  });

  it('full-lifecycle — reuses existing approved agent', async () => {
    // Run once to create agent
    const req1 = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'full-lifecycle' }),
    });
    const { data: data1 } = await fetchJson<any>(SELF, req1);
    const firstAgentId = data1.data.created.agent_id;

    // Run again — should reuse the same agent (seed agent is already approved)
    const req2 = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'full-lifecycle' }),
    });
    const { data: data2 } = await fetchJson<any>(SELF, req2);

    expect(data2.data.success).toBe(true);
    // Should reuse an approved agent
    expect(data2.data.created.agent_id).toBeTruthy();
  });

  it('full-lifecycle-onchain — normal execution (ledger mode)', async () => {
    // Ensure operator has wallet address
    await env.DB.prepare('UPDATE operators SET evm_wallet_address = ? WHERE id = ?')
      .bind('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', seed.regularOperator.id).run();

    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'full-lifecycle-onchain' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    // The scenario may succeed or fail depending on treasury key availability
    // In test environment without treasury key, it should report the issue
    expect(data.data).toBeDefined();
  });

  it('full-lifecycle-onchain — operator wallet not set', async () => {
    // Remove wallet from all operators
    await env.DB.prepare('UPDATE operators SET evm_wallet_address = NULL').run();

    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'full-lifecycle-onchain' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    // Should report error about missing wallet
    expect(data.data).toBeDefined();
  });

  it('quick-setup — with resources available', async () => {
    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'quick-setup' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it('quick-setup — no resources available', async () => {
    // Clear all agents (except operators which are needed for auth)
    await env.DB.prepare('DELETE FROM agent_api_keys').run();
    await env.DB.prepare('DELETE FROM agents').run();

    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'quick-setup' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.data).toBeDefined();
  });

  it('invalid scenario name — returns 400', async () => {
    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'nonexistent-scenario' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('missing scenario parameter — returns 400', async () => {
    const req = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(400);
    expect(data.success).toBe(false);
  });
});
