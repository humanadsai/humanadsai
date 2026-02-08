import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../helpers/db';
import { createDeal, createMission, createReview } from '../helpers/factories';
import { publishReviewPair, recalculateReputation } from '../../src/services/reputation';

describe('E2E: Double-Blind Review System', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('Operator reviews → Advertiser reviews → Both published → Reputation updated', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'paid',
    });

    // Step 1: Operator submits review (unpublished)
    const opReviewId = await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      rating: 5,
      comment: 'Fast payment, clear brief',
      tags: '["fast_payment","clear_brief"]',
      is_published: 0,
    });

    // Verify unpublished
    let opReview = await env.DB.prepare('SELECT is_published FROM reviews WHERE id = ?')
      .bind(opReviewId).first<any>();
    expect(opReview!.is_published).toBe(0);

    // Step 2: Advertiser (agent) submits review (unpublished)
    const agentReviewId = await createReview(env.DB, {
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'agent',
      reviewer_id: seed.agent.id,
      reviewee_type: 'operator',
      reviewee_id: seed.regularOperator.id,
      rating: 4,
      comment: 'Quality work, on time',
      tags: '["high_quality","on_time"]',
      is_published: 0,
    });

    // Step 3: Publish pair (simulates what happens when both reviews exist)
    await publishReviewPair(env.DB, missionId, seed.regularOperator.id, seed.agent.id);

    // Step 4: Verify both are now published
    opReview = await env.DB.prepare('SELECT is_published, published_at FROM reviews WHERE id = ?')
      .bind(opReviewId).first<any>();
    expect(opReview!.is_published).toBe(1);
    expect(opReview!.published_at).toBeTruthy();

    const agentReview = await env.DB.prepare('SELECT is_published, published_at FROM reviews WHERE id = ?')
      .bind(agentReviewId).first<any>();
    expect(agentReview!.is_published).toBe(1);
    expect(agentReview!.published_at).toBeTruthy();

    // Step 5: Verify reputation was recalculated for both
    const agentReputation = await env.DB.prepare(
      'SELECT * FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?'
    ).bind('agent', seed.agent.id).first<any>();
    expect(agentReputation).toBeDefined();
    expect(agentReputation!.total_reviews).toBe(1);
    expect(agentReputation!.avg_rating).toBe(5);

    const operatorReputation = await env.DB.prepare(
      'SELECT * FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?'
    ).bind('operator', seed.regularOperator.id).first<any>();
    expect(operatorReputation).toBeDefined();
    expect(operatorReputation!.total_reviews).toBe(1);
    expect(operatorReputation!.avg_rating).toBe(4);

    // Step 6: Verify tag counts
    const agentTags = JSON.parse(agentReputation!.tag_counts);
    expect(agentTags['fast_payment']).toBe(1);
    expect(agentTags['clear_brief']).toBe(1);

    const operatorTags = JSON.parse(operatorReputation!.tag_counts);
    expect(operatorTags['high_quality']).toBe(1);
    expect(operatorTags['on_time']).toBe(1);
  });
});
