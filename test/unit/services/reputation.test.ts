import { env } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { createDeal, createMission, createReview } from '../../helpers/factories';
import { recalculateReputation, publishReviewPair } from '../../../src/services/reputation';

describe('Reputation Service', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('recalculateReputation — multiple reviews produce correct average', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId1 = await createMission(env.DB, { deal_id: dealId, operator_id: seed.regularOperator.id });

    // Create published reviews for the agent
    await createReview(env.DB, {
      mission_id: missionId1,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      rating: 5,
      is_published: 1,
      tags: '["fast_payment"]',
    });

    // Second mission with different operator (unique constraint: deal_id + operator_id)
    const missionId2 = await createMission(env.DB, {
      id: 'mission-rep-2',
      deal_id: dealId,
      operator_id: seed.adminOperator.id,
    });
    await createReview(env.DB, {
      mission_id: missionId2,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.adminOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      rating: 3,
      is_published: 1,
      tags: '["clear_brief"]',
    });

    await recalculateReputation(env.DB, 'agent', seed.agent.id);

    const snapshot = await env.DB.prepare(
      'SELECT * FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?'
    ).bind('agent', seed.agent.id).first<any>();

    expect(snapshot).toBeDefined();
    expect(snapshot!.total_reviews).toBe(2);
    expect(snapshot!.avg_rating).toBe(4); // (5+3)/2 = 4
  });

  it('recalculateReputation — zero reviews removes snapshot', async () => {
    // Create a snapshot manually
    await env.DB.prepare(
      `INSERT INTO reputation_snapshots (id, entity_type, entity_id, avg_rating, total_reviews)
       VALUES ('snap-1', 'agent', ?, 4.5, 10)`
    ).bind(seed.agent.id).run();

    // No reviews exist, recalculate
    await recalculateReputation(env.DB, 'agent', seed.agent.id);

    const snapshot = await env.DB.prepare(
      'SELECT * FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?'
    ).bind('agent', seed.agent.id).first<any>();

    expect(snapshot).toBeNull();
  });

  it('recalculateReputation — rating distribution is correct', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });

    // Create reviews with different ratings
    const ratings = [1, 3, 3, 4, 5, 5, 5];
    for (let i = 0; i < ratings.length; i++) {
      const mId = `mission-dist-${i}`;
      const opId = `op-dist-${i}`;
      await env.DB.prepare(
        `INSERT INTO operators (id, x_handle, display_name, status, role)
         VALUES (?, ?, 'Op', 'verified', 'user')`
      ).bind(opId, `handle_${i}`).run();
      await env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status)
         VALUES (?, ?, ?, 'paid')`
      ).bind(mId, dealId, opId).run();
      await createReview(env.DB, {
        mission_id: mId,
        deal_id: dealId,
        reviewer_type: 'operator',
        reviewer_id: opId,
        reviewee_type: 'agent',
        reviewee_id: seed.agent.id,
        rating: ratings[i],
        is_published: 1,
      });
    }

    await recalculateReputation(env.DB, 'agent', seed.agent.id);

    const snapshot = await env.DB.prepare(
      'SELECT * FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?'
    ).bind('agent', seed.agent.id).first<any>();

    expect(snapshot).toBeDefined();
    const dist = JSON.parse(snapshot!.rating_distribution);
    expect(dist['1']).toBe(1);
    expect(dist['2']).toBe(0);
    expect(dist['3']).toBe(2);
    expect(dist['4']).toBe(1);
    expect(dist['5']).toBe(3);
  });

  it('recalculateReputation — tag counts are correct', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });

    const tags = [
      '["fast_payment","clear_brief"]',
      '["fast_payment"]',
      '["fast_payment","good_communication"]',
    ];
    for (let i = 0; i < tags.length; i++) {
      const mId = `mission-tag-${i}`;
      const opId = `op-tag-${i}`;
      await env.DB.prepare(
        `INSERT INTO operators (id, x_handle, display_name, status, role)
         VALUES (?, ?, 'Op', 'verified', 'user')`
      ).bind(opId, `taghandle_${i}`).run();
      await env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status)
         VALUES (?, ?, ?, 'paid')`
      ).bind(mId, dealId, opId).run();
      await createReview(env.DB, {
        mission_id: mId,
        deal_id: dealId,
        reviewer_type: 'operator',
        reviewer_id: opId,
        reviewee_type: 'agent',
        reviewee_id: seed.agent.id,
        rating: 4,
        tags: tags[i],
        is_published: 1,
      });
    }

    await recalculateReputation(env.DB, 'agent', seed.agent.id);

    const snapshot = await env.DB.prepare(
      'SELECT * FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?'
    ).bind('agent', seed.agent.id).first<any>();

    const tagCounts = JSON.parse(snapshot!.tag_counts);
    expect(tagCounts['fast_payment']).toBe(3);
    expect(tagCounts['clear_brief']).toBe(1);
    expect(tagCounts['good_communication']).toBe(1);
  });

  it('publishReviewPair — publishes both reviews and recalculates', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id });
    const missionId = await createMission(env.DB, {
      deal_id: dealId,
      operator_id: seed.regularOperator.id,
      status: 'paid',
    });

    // Create unpublished reviews from both sides
    await createReview(env.DB, {
      id: 'rev-op',
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'operator',
      reviewer_id: seed.regularOperator.id,
      reviewee_type: 'agent',
      reviewee_id: seed.agent.id,
      rating: 5,
      is_published: 0,
    });
    await createReview(env.DB, {
      id: 'rev-agent',
      mission_id: missionId,
      deal_id: dealId,
      reviewer_type: 'agent',
      reviewer_id: seed.agent.id,
      reviewee_type: 'operator',
      reviewee_id: seed.regularOperator.id,
      rating: 4,
      is_published: 0,
    });

    await publishReviewPair(env.DB, missionId, seed.regularOperator.id, seed.agent.id);

    // Both should now be published
    const opReview = await env.DB.prepare('SELECT is_published, published_at FROM reviews WHERE id = ?')
      .bind('rev-op').first<any>();
    const agentReview = await env.DB.prepare('SELECT is_published, published_at FROM reviews WHERE id = ?')
      .bind('rev-agent').first<any>();

    expect(opReview!.is_published).toBe(1);
    expect(opReview!.published_at).toBeTruthy();
    expect(agentReview!.is_published).toBe(1);
    expect(agentReview!.published_at).toBeTruthy();
  });
});
