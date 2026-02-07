import type { Env, Review, ReputationSnapshot } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';

/**
 * GET /api/operators/:id/reputation — Public operator reputation
 */
export async function getOperatorReputation(
  request: Request,
  env: Env,
  operatorId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Verify operator exists
    const operator = await env.DB.prepare(
      `SELECT id, display_name, x_handle, avatar_url, x_profile_image_url
       FROM operators WHERE id = ? AND status = 'verified' AND deleted_at IS NULL`
    )
      .bind(operatorId)
      .first<{ id: string; display_name: string; x_handle: string; avatar_url: string; x_profile_image_url: string }>();

    if (!operator) {
      return errors.notFound(requestId, 'Operator');
    }

    // Get reputation snapshot
    const snapshot = await env.DB.prepare(
      `SELECT avg_rating, total_reviews, rating_distribution, tag_counts
       FROM reputation_snapshots WHERE entity_type = 'operator' AND entity_id = ?`
    )
      .bind(operatorId)
      .first<ReputationSnapshot>();

    // Get recent published reviews (last 10)
    const recentReviews = await env.DB.prepare(
      `SELECT r.id, r.rating, r.comment, r.tags, r.published_at, r.created_at
       FROM reviews r
       WHERE r.reviewee_type = 'operator' AND r.reviewee_id = ?
       AND r.is_published = 1 AND r.is_hidden = 0
       ORDER BY r.published_at DESC
       LIMIT 10`
    )
      .bind(operatorId)
      .all<Review>();

    return success(
      {
        operator: {
          id: operator.id,
          display_name: operator.display_name,
          x_handle: operator.x_handle,
          avatar_url: operator.x_profile_image_url || operator.avatar_url,
        },
        reputation: snapshot
          ? {
              avg_rating: snapshot.avg_rating,
              total_reviews: snapshot.total_reviews,
              rating_distribution: JSON.parse(snapshot.rating_distribution as string),
              tag_counts: JSON.parse(snapshot.tag_counts as string),
            }
          : null,
        recent_reviews: (recentReviews.results || []).map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          tags: r.tags ? JSON.parse(r.tags as string) : [],
          published_at: r.published_at,
        })),
      },
      requestId
    );
  } catch (e: any) {
    console.error('Get operator reputation error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/ai-advertisers/:id/reputation — Public advertiser reputation
 */
export async function getAdvertiserReputation(
  request: Request,
  env: Env,
  advertiserId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Try ai_advertisers table first, fall back to agents table
    let entityId = advertiserId;
    let entityName = '';

    const aiAdv = await env.DB.prepare(
      `SELECT id, name FROM ai_advertisers WHERE id = ?`
    )
      .bind(advertiserId)
      .first<{ id: string; name: string }>();

    if (aiAdv) {
      entityName = aiAdv.name;
    } else {
      // Try agents table
      const agent = await env.DB.prepare(
        `SELECT id, name FROM agents WHERE id = ?`
      )
        .bind(advertiserId)
        .first<{ id: string; name: string }>();

      if (!agent) {
        return errors.notFound(requestId, 'Advertiser');
      }
      entityName = agent.name;
    }

    // Get reputation snapshot
    const snapshot = await env.DB.prepare(
      `SELECT avg_rating, total_reviews, rating_distribution, tag_counts
       FROM reputation_snapshots WHERE entity_type = 'agent' AND entity_id = ?`
    )
      .bind(entityId)
      .first<ReputationSnapshot>();

    // Get recent published reviews (last 10)
    const recentReviews = await env.DB.prepare(
      `SELECT r.id, r.rating, r.comment, r.tags, r.published_at, r.created_at
       FROM reviews r
       WHERE r.reviewee_type = 'agent' AND r.reviewee_id = ?
       AND r.is_published = 1 AND r.is_hidden = 0
       ORDER BY r.published_at DESC
       LIMIT 10`
    )
      .bind(entityId)
      .all<Review>();

    return success(
      {
        advertiser: {
          id: entityId,
          name: entityName,
        },
        reputation: snapshot
          ? {
              avg_rating: snapshot.avg_rating,
              total_reviews: snapshot.total_reviews,
              rating_distribution: JSON.parse(snapshot.rating_distribution as string),
              tag_counts: JSON.parse(snapshot.tag_counts as string),
            }
          : null,
        recent_reviews: (recentReviews.results || []).map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          tags: r.tags ? JSON.parse(r.tags as string) : [],
          published_at: r.published_at,
        })),
      },
      requestId
    );
  } catch (e: any) {
    console.error('Get advertiser reputation error:', e);
    return errors.internalError(requestId);
  }
}
