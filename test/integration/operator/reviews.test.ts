import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { operatorRequest, publicRequest, fetchJson } from '../../helpers/request';
import { createDeal, createMission, createReview } from '../../helpers/factories';

describe('Operator Reviews', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('POST /api/missions/:id/reviews — submit review', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'paid',
    });

    const req = operatorRequest(`/api/missions/${missionId}/reviews`, seed.regularOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        rating: 5,
        comment: 'Great experience working with this advertiser',
        tags: ['fast_payment', 'clear_brief'],
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('GET /api/missions/:id/reviews — get mission reviews', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'paid',
    });

    // Create a published review
    await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      is_published: 1,
      rating: 4,
    });

    const req = publicRequest(`/api/missions/${missionId}/reviews`);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.reviews).toBeInstanceOf(Array);
  });

  it('POST /api/reviews/:id/report — report review', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'paid',
    });
    const reviewId = await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'agent',
      reviewer_id: seed.agent.id,
      reviewee_type: 'operator',
      reviewee_id: seed.regularOperator.id,
      is_published: 1,
      rating: 2,
      comment: 'Offensive content',
    });

    const req = operatorRequest(`/api/reviews/${reviewId}/report`, seed.regularOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        reason: 'This review contains offensive language',
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const review = await env.DB.prepare('SELECT is_reported FROM reviews WHERE id = ?')
      .bind(reviewId).first<any>();
    expect(review!.is_reported).toBe(1);
  });

  it('double-blind — operator submits first, stays unpublished', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'paid',
    });

    const req = operatorRequest(`/api/missions/${missionId}/reviews`, seed.regularOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({ rating: 5, comment: 'Great' }),
    });
    const { status } = await fetchJson<any>(SELF, req);
    expect(status).toBe(201);

    // Review should be unpublished
    const review = await env.DB.prepare(
      `SELECT is_published FROM reviews WHERE mission_id = ? AND reviewer_type = 'operator'`
    ).bind(missionId).first<any>();
    expect(review!.is_published).toBe(0);
  });
});
