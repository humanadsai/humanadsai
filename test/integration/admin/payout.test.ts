import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';
import { createDeal, createMission } from '../../helpers/factories';

describe('Admin Payout Testing (Playground)', () => {
  let seed: TestSeedData;
  let dealId: string;
  let missionId: string;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);

    // Create verified mission ready for payout
    dealId = await createDeal(env.DB, {
      agent_id: seed.agent.id,
      reward_amount: 1000,
      auf_percentage: 10,
    });
    missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'verified',
      submission_url: 'https://x.com/test/status/123',
    });
  });

  it('preview (dry_run) ledger mode — returns calculations without DB changes', async () => {
    const req = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        mode: 'ledger',
        execute: false,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.mode).toBe('ledger');
    expect(data.data.execute).toBe(false);
    expect(data.data.auf_amount_cents).toBeDefined();
    expect(data.data.payout_amount_cents).toBeDefined();
    // AUF = reward * auf_percentage / 100 = 1000 * 10 / 100 = 100
    expect(data.data.auf_amount_cents).toBe(100);
    // Payout = reward - AUF = 1000 - 100 = 900
    expect(data.data.payout_amount_cents).toBe(900);

    // Mission should remain 'verified' (no DB change)
    const mission = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(missionId).first<any>();
    expect(mission!.status).toBe('verified');
  });

  it('preview (dry_run) testnet mode — returns calculations', async () => {
    const req = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        mode: 'testnet',
        execute: false,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.auf_amount_cents).toBe(100);
    expect(data.data.payout_amount_cents).toBe(900);
  });

  it('execute ledger mode — returns simulated transactions (no DB change)', async () => {
    const req = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        mode: 'ledger',
        execute: true,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    // Ledger mode always returns execute: false (simulation only)
    expect(data.data.execute).toBe(false);
    expect(data.data.mode).toBe('ledger');
    expect(data.data.simulated_auf_tx).toBeDefined();
    expect(data.data.simulated_payout_tx).toBeDefined();

    // In ledger mode, mission status remains unchanged (no real payout)
    const mission = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(missionId).first<any>();
    expect(mission!.status).toBe('verified');
  });

  it('execute testnet with invalid TREASURY_KEY — transactions fail', async () => {
    const req = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        mode: 'testnet',
        execute: true,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    // In test environment, TREASURY_PRIVATE_KEY exists but is invalid,
    // so transactions execute but fail
    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.all_success).toBe(false);

    // Mission should remain 'verified' since transactions failed
    const mission = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(missionId).first<any>();
    expect(mission!.status).toBe('verified');
  });

  it('AUF fee calculation accuracy', async () => {
    // Create deal with different auf_percentage
    const dealId2 = await createDeal(env.DB, {
      agent_id: seed.agent.id,
      reward_amount: 5000,
      auf_percentage: 15,
    });
    const missionId2 = await createMission(env.DB, {
      deal_id: dealId2,
      operator_id: seed.regularOperator.id,
      status: 'verified',
      submission_url: 'https://x.com/test/status/456',
    });

    const req = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId2,
        mode: 'ledger',
        execute: false,
      }),
    });
    const { data } = await fetchJson<any>(SELF, req);

    // AUF = 5000 * 15 / 100 = 750
    expect(data.data.auf_amount_cents).toBe(750);
    // Payout = 5000 - 750 = 4250
    expect(data.data.payout_amount_cents).toBe(4250);
  });

  it('invalid mission_id — returns error', async () => {
    const req = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id: 'nonexistent-mission',
        mode: 'ledger',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});
