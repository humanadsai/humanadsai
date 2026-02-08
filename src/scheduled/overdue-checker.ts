import type { Env } from '../types';
import { createNotificationWithEmail } from '../services/email-notifications';
import { recalculateReputation } from '../services/reputation';
import { escrowRefund } from '../services/onchain';

/**
 * Scheduled Job
 *
 * Runs every 15 minutes to:
 * 1. Check for expired escrow deals and refund remaining funds
 * 2. Auto-publish expired blind reviews (14 days)
 *
 * Cron schedule: every 15 minutes
 */
export async function handleScheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  console.log('Running scheduled checker at:', new Date().toISOString());

  try {
    // 1. Check for expired escrow deals
    await checkExpiredEscrowDeals(env);

    // 2. Auto-publish expired blind reviews (14 days)
    await publishExpiredBlindReviews(env);

    console.log('Scheduled checker completed successfully');
  } catch (error) {
    console.error('Scheduled checker error:', error);
  }
}

/**
 * Check for expired escrow deals and refund remaining funds.
 * Finds deals where expires_at < now and status = 'active'.
 * Calls escrowRefund() and updates deal status to 'expired'.
 */
async function checkExpiredEscrowDeals(env: Env): Promise<void> {
  const now = new Date().toISOString();

  const expiredDeals = await env.DB.prepare(
    `SELECT id, agent_id, title
     FROM deals
     WHERE expires_at < ?
       AND status = 'active'
     LIMIT 50`
  )
    .bind(now)
    .all<{ id: string; agent_id: string; title: string }>();

  console.log(`Found ${expiredDeals.results?.length || 0} expired escrow deals`);

  for (const deal of expiredDeals.results || []) {
    try {
      console.log(`Refunding expired escrow deal ${deal.id}`);
      const refundResult = await escrowRefund(env, deal.id);

      if (refundResult.success) {
        console.log(`Escrow refund succeeded for deal ${deal.id}: tx=${refundResult.txHash}`);
      } else {
        console.error(`Escrow refund failed for deal ${deal.id}: ${refundResult.error}`);
      }

      // Mark deal as expired regardless of refund result
      await env.DB.prepare(
        `UPDATE deals SET status = 'expired', updated_at = datetime('now') WHERE id = ?`
      )
        .bind(deal.id)
        .run();
    } catch (error) {
      console.error(`Error processing expired escrow deal ${deal.id}:`, error);
    }
  }
}

/**
 * Auto-publish reviews that have been in blind state for 14+ days
 * If only one side reviewed and 14 days passed, publish that single review
 */
async function publishExpiredBlindReviews(env: Env): Promise<void> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Find unpublished reviews older than 14 days
  const expiredReviews = await env.DB.prepare(
    `SELECT id, reviewee_type, reviewee_id, mission_id
     FROM reviews
     WHERE is_published = 0
       AND is_hidden = 0
       AND created_at < ?
     LIMIT 100`
  )
    .bind(fourteenDaysAgo)
    .all<{ id: string; reviewee_type: string; reviewee_id: string; mission_id: string }>();

  console.log(`Found ${expiredReviews.results?.length || 0} expired blind reviews to publish`);

  // Track which entities need reputation recalculation
  const entitiesToRecalc = new Set<string>();

  for (const review of expiredReviews.results || []) {
    try {
      await env.DB.prepare(
        `UPDATE reviews SET is_published = 1, published_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ? AND is_published = 0`
      )
        .bind(review.id)
        .run();

      // Also publish any other unpublished reviews for same mission
      await env.DB.prepare(
        `UPDATE reviews SET is_published = 1, published_at = datetime('now'), updated_at = datetime('now')
         WHERE mission_id = ? AND is_published = 0`
      )
        .bind(review.mission_id)
        .run();

      entitiesToRecalc.add(`${review.reviewee_type}:${review.reviewee_id}`);
    } catch (error) {
      console.error(`Error publishing expired review ${review.id}:`, error);
    }
  }

  // Recalculate reputation for affected entities
  for (const key of entitiesToRecalc) {
    const [entityType, entityId] = key.split(':');
    try {
      await recalculateReputation(env.DB, entityType as 'operator' | 'agent', entityId);
    } catch (error) {
      console.error(`Error recalculating reputation for ${key}:`, error);
    }
  }
}
