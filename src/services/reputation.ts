import type { ReviewerType } from '../types';

/**
 * Recalculate reputation snapshot for an entity
 * Aggregates all published reviews into avg_rating, distribution, and tag counts
 */
export async function recalculateReputation(
  db: D1Database,
  entityType: ReviewerType,
  entityId: string
): Promise<void> {
  // Fetch all published, non-hidden reviews for this entity
  const reviews = await db
    .prepare(
      `SELECT rating, tags FROM reviews
       WHERE reviewee_type = ? AND reviewee_id = ?
       AND is_published = 1 AND is_hidden = 0`
    )
    .bind(entityType, entityId)
    .all<{ rating: number; tags: string | null }>();

  const results = reviews.results || [];
  const totalReviews = results.length;

  if (totalReviews === 0) {
    // Remove snapshot if no reviews
    await db
      .prepare('DELETE FROM reputation_snapshots WHERE entity_type = ? AND entity_id = ?')
      .bind(entityType, entityId)
      .run();
    return;
  }

  // Calculate average and distribution
  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  let sum = 0;
  const tagCounts: Record<string, number> = {};

  for (const review of results) {
    sum += review.rating;
    distribution[String(review.rating)] = (distribution[String(review.rating)] || 0) + 1;

    if (review.tags) {
      try {
        const tags: string[] = JSON.parse(review.tags);
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      } catch {
        // Invalid JSON, skip tags
      }
    }
  }

  const avgRating = Math.round((sum / totalReviews) * 100) / 100;

  // UPSERT reputation snapshot
  await db
    .prepare(
      `INSERT INTO reputation_snapshots (id, entity_type, entity_id, avg_rating, total_reviews, rating_distribution, tag_counts, calculated_at, updated_at)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(entity_type, entity_id) DO UPDATE SET
         avg_rating = excluded.avg_rating,
         total_reviews = excluded.total_reviews,
         rating_distribution = excluded.rating_distribution,
         tag_counts = excluded.tag_counts,
         calculated_at = datetime('now'),
         updated_at = datetime('now')`
    )
    .bind(
      entityType,
      entityId,
      avgRating,
      totalReviews,
      JSON.stringify(distribution),
      JSON.stringify(tagCounts)
    )
    .run();
}

/**
 * Publish both sides of a double-blind review pair and recalculate reputations
 */
export async function publishReviewPair(
  db: D1Database,
  missionId: string,
  operatorId: string,
  agentId: string
): Promise<void> {
  // Publish both reviews for this mission
  await db
    .prepare(
      `UPDATE reviews SET is_published = 1, published_at = datetime('now'), updated_at = datetime('now')
       WHERE mission_id = ? AND is_published = 0`
    )
    .bind(missionId)
    .run();

  // Recalculate both sides
  await recalculateReputation(db, 'operator', operatorId);
  await recalculateReputation(db, 'agent', agentId);
}
