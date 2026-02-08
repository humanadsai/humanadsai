import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';
import { createDeal, createMission, createReview } from '../../helpers/factories';

describe('Admin Review Moderation', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/reviews — list all reviews', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });
    await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      is_published: 1,
    });

    const req = adminRequest('/api/admin/reviews', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.reviews).toBeInstanceOf(Array);
    expect(data.data.reviews.length).toBe(1);
  });

  it('PUT /api/admin/reviews/:id — hide review', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });
    const reviewId = await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      is_published: 1,
    });

    const req = adminRequest(`/api/admin/reviews/${reviewId}`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ action: 'hide' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const review = await env.DB.prepare('SELECT is_hidden FROM reviews WHERE id = ?')
      .bind(reviewId).first<any>();
    expect(review!.is_hidden).toBe(1);
  });

  it('PUT /api/admin/reviews/:id — unhide review', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });
    const reviewId = await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      is_hidden: 1,
    });

    const req = adminRequest(`/api/admin/reviews/${reviewId}`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ action: 'unhide' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);

    const review = await env.DB.prepare('SELECT is_hidden FROM reviews WHERE id = ?')
      .bind(reviewId).first<any>();
    expect(review!.is_hidden).toBe(0);
  });

  it('PUT /api/admin/reviews/:id — dismiss report', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });
    const reviewId = await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      is_reported: 1,
    });

    const req = adminRequest(`/api/admin/reviews/${reviewId}`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ action: 'dismiss_report' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);

    const review = await env.DB.prepare('SELECT is_reported FROM reviews WHERE id = ?')
      .bind(reviewId).first<any>();
    expect(review!.is_reported).toBe(0);
  });
});
