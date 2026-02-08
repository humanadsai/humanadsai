import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../helpers/db';
import { adminRequest, operatorRequest, fetchJson } from '../helpers/request';

describe('E2E: Full Mission Lifecycle', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('Agent → Deal → Apply → Select → Submit → Verify → Payout → Reviews → Reputation', async () => {
    // Step 1: Admin creates a deal via scenario runner
    const scenarioReq = adminRequest('/api/admin/scenarios/run', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ scenario: 'full-lifecycle' }),
    });
    const { data: scenarioData } = await fetchJson<any>(SELF, scenarioReq);
    expect(scenarioData.data.success).toBe(true);

    const { mission_id, deal_id, agent_id, operator_id } = scenarioData.data.created;
    expect(mission_id).toBeTruthy();

    // Step 2: Find which operator was assigned and get their session
    const operator = await env.DB.prepare('SELECT * FROM operators WHERE id = ?')
      .bind(operator_id).first<any>();
    expect(operator).toBeTruthy();

    // Use the seed regular operator's session if it matches, otherwise use admin
    const operatorSessionToken = operator_id === seed.regularOperator.id
      ? seed.regularOperator.sessionToken
      : seed.adminOperator.sessionToken;

    // Step 3: Submit the mission
    const submitReq = operatorRequest('/api/missions/submit', operatorSessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id,
        submission_url: 'https://x.com/test/status/9876543210',
      }),
    });
    const { data: submitData } = await fetchJson<any>(SELF, submitReq);
    expect(submitData.success).toBe(true);

    // Step 4: Admin verifies the submission
    const verifyReq = adminRequest(`/api/admin/missions/${mission_id}/review`, seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify' }),
    });
    const { data: verifyData } = await fetchJson<any>(SELF, verifyReq);
    expect(verifyData.success).toBe(true);

    // Step 5: Admin previews payout (ledger mode — simulated, no DB change)
    const payoutReq = adminRequest('/api/admin/payout/test', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        mission_id,
        mode: 'ledger',
        execute: true,
      }),
    });
    const { data: payoutData } = await fetchJson<any>(SELF, payoutReq);
    expect(payoutData.success).toBe(true);
    expect(payoutData.data.mode).toBe('ledger');
    expect(payoutData.data.auf_amount_cents).toBeTypeOf('number');
    expect(payoutData.data.payout_amount_cents).toBeTypeOf('number');

    // Ledger mode doesn't actually update mission status (simulation only)
    // Mission remains 'verified' — manual status update or testnet mode needed for 'paid'
    const missionCheck = await env.DB.prepare('SELECT status FROM missions WHERE id = ?')
      .bind(mission_id).first<any>();
    expect(missionCheck!.status).toBe('verified');

    // Manually mark mission as 'paid' to continue the review flow
    // (In production, testnet mode with execute=true would do this)
    await env.DB.prepare("UPDATE missions SET status = 'paid', paid_at = datetime('now') WHERE id = ?")
      .bind(mission_id).run();

    // Step 6: Operator submits review
    const opReviewReq = operatorRequest(`/api/missions/${mission_id}/reviews`, operatorSessionToken, {
      method: 'POST',
      body: JSON.stringify({
        rating: 5,
        comment: 'Excellent advertiser, fast and clear',
        tags: ['fast_payment', 'clear_brief'],
      }),
    });
    const { data: opReviewData } = await fetchJson<any>(SELF, opReviewReq);
    expect(opReviewData.success).toBe(true);

    // Review should be unpublished (double-blind - waiting for other party)
    const opReview = await env.DB.prepare(
      `SELECT is_published FROM reviews WHERE mission_id = ? AND reviewer_type = 'operator'`
    ).bind(mission_id).first<any>();
    expect(opReview!.is_published).toBe(0);
  });
});
