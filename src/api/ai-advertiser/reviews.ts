import type { Env, SubmitReviewRequest } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, errors } from '../../utils/response';
import { recalculateReputation, publishReviewPair } from '../../services/reputation';
import { createNotificationWithEmail } from '../../services/email-notifications';

/**
 * POST /submissions/:id/review — AI advertiser reviews an operator after mission completion
 */
export async function handleAdvertiserSubmitReview(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  submissionId: string
): Promise<Response> {
  const requestId = context.requestId;
  const advertiser = context.advertiser;

  // Parse request body
  let body: SubmitReviewRequest;
  try {
    body = await request.json() as SubmitReviewRequest;
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  // Validate rating
  if (!body.rating || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    return errors.badRequest(requestId, 'Rating must be an integer between 1 and 5');
  }

  // Validate comment length
  if (body.comment && body.comment.length > 500) {
    return errors.badRequest(requestId, 'Comment must be 500 characters or less');
  }

  // Validate tags
  const allowedTags = [
    'high_quality', 'on_time', 'creative', 'professional', 'good_engagement',
    'would_hire_again', 'low_quality', 'late_delivery', 'unresponsive',
  ];
  if (body.tags) {
    if (!Array.isArray(body.tags) || body.tags.length > 5) {
      return errors.badRequest(requestId, 'Tags must be an array of up to 5 items');
    }
    for (const tag of body.tags) {
      if (!allowedTags.includes(tag)) {
        return errors.badRequest(requestId, `Invalid tag: ${tag}`);
      }
    }
  }

  try {
    // Find the mission (submission) and verify ownership
    // submissionId is actually the mission_id in the AI advertiser context
    const mission = await env.DB.prepare(
      `SELECT m.id, m.deal_id, m.operator_id, m.status, d.agent_id
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       JOIN ai_advertisers aa ON d.agent_id = aa.id
       WHERE m.id = ? AND aa.id = ?`
    )
      .bind(submissionId, advertiser.id)
      .first<{ id: string; deal_id: string; operator_id: string; status: string; agent_id: string }>();

    if (!mission) {
      return errors.notFound(requestId, 'Submission');
    }

    // Verify mission is in a reviewable status
    const reviewableStatuses = ['paid', 'paid_complete', 'paid_partial'];
    if (!reviewableStatuses.includes(mission.status)) {
      return errors.badRequest(requestId, 'Submission must be in a paid status to leave a review');
    }

    // Check for existing review
    const existingReview = await env.DB.prepare(
      `SELECT id FROM reviews WHERE mission_id = ? AND reviewer_type = 'agent' AND reviewer_id = ?`
    )
      .bind(mission.id, advertiser.id)
      .first<{ id: string }>();

    if (existingReview) {
      return errors.conflict(requestId, 'You have already reviewed this submission');
    }

    // Insert review (unpublished by default — double-blind)
    await env.DB.prepare(
      `INSERT INTO reviews (id, layer, mission_id, deal_id, reviewer_type, reviewer_id, reviewee_type, reviewee_id, rating, comment, tags, is_published, created_at, updated_at)
       VALUES (lower(hex(randomblob(16))), 'transaction', ?, ?, 'agent', ?, 'operator', ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`
    )
      .bind(
        mission.id,
        mission.deal_id,
        advertiser.id,
        mission.operator_id,
        body.rating,
        body.comment || null,
        body.tags ? JSON.stringify(body.tags) : null
      )
      .run();

    // Double-blind check: if the operator has also reviewed, publish both
    const otherReview = await env.DB.prepare(
      `SELECT id FROM reviews WHERE mission_id = ? AND reviewer_type = 'operator' AND reviewer_id = ?`
    )
      .bind(mission.id, mission.operator_id)
      .first<{ id: string }>();

    let published = false;
    if (otherReview) {
      await publishReviewPair(env.DB, mission.id, mission.operator_id, advertiser.id);
      published = true;
    }

    // Notify promoter about the review
    const dealForReview = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
      .bind(mission.deal_id).first<{ title: string }>();
    const dealTitle = dealForReview?.title || 'a mission';

    await createNotificationWithEmail(env.DB, env, {
      recipientId: mission.operator_id,
      type: 'review_received',
      title: 'New Review Received',
      body: `A review has been submitted for "${dealTitle}".`,
      referenceType: 'mission',
      referenceId: mission.id,
      metadata: { deal_id: mission.deal_id, deal_title: dealTitle },
    });

    // If both sides reviewed and reviews are now published, send additional notification
    if (published) {
      await createNotificationWithEmail(env.DB, env, {
        recipientId: mission.operator_id,
        type: 'reviews_published',
        title: 'Reviews Published',
        body: `Both reviews for "${dealTitle}" are now public.`,
        referenceType: 'mission',
        referenceId: mission.id,
        metadata: { deal_id: mission.deal_id, deal_title: dealTitle },
      });
    }

    return success(
      {
        message: published
          ? 'Review submitted and published (both sides reviewed)'
          : 'Review submitted. It will be published when the promoter also reviews, or after 14 days.',
        published,
      },
      requestId,
      201
    );
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint')) {
      return errors.conflict(requestId, 'You have already reviewed this submission');
    }
    console.error('[AiAdvertiser] Submit review error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /promoters/:id/reputation — Get operator reputation (alias for public API)
 */
export async function handleGetPromoterReputation(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  promoterId: string
): Promise<Response> {
  const requestId = context.requestId;

  try {
    // Verify operator exists
    const operator = await env.DB.prepare(
      `SELECT id, display_name, x_handle, x_profile_image_url
       FROM operators WHERE id = ? AND status = 'verified' AND deleted_at IS NULL`
    )
      .bind(promoterId)
      .first<{ id: string; display_name: string; x_handle: string; x_profile_image_url: string }>();

    if (!operator) {
      return errors.notFound(requestId, 'Promoter');
    }

    // Get reputation snapshot
    const snapshot = await env.DB.prepare(
      `SELECT avg_rating, total_reviews, rating_distribution, tag_counts
       FROM reputation_snapshots WHERE entity_type = 'operator' AND entity_id = ?`
    )
      .bind(promoterId)
      .first<{ avg_rating: number; total_reviews: number; rating_distribution: string; tag_counts: string }>();

    // Get recent published reviews
    const recentReviews = await env.DB.prepare(
      `SELECT r.id, r.rating, r.comment, r.tags, r.published_at
       FROM reviews r
       WHERE r.reviewee_type = 'operator' AND r.reviewee_id = ?
       AND r.is_published = 1 AND r.is_hidden = 0
       ORDER BY r.published_at DESC
       LIMIT 10`
    )
      .bind(promoterId)
      .all<{ id: string; rating: number; comment: string; tags: string; published_at: string }>();

    return success(
      {
        promoter: {
          id: operator.id,
          display_name: operator.display_name,
          x_handle: operator.x_handle,
        },
        reputation: snapshot
          ? {
              avg_rating: snapshot.avg_rating,
              total_reviews: snapshot.total_reviews,
              rating_distribution: JSON.parse(snapshot.rating_distribution),
              tag_counts: JSON.parse(snapshot.tag_counts),
            }
          : null,
        recent_reviews: (recentReviews.results || []).map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          tags: r.tags ? JSON.parse(r.tags) : [],
          published_at: r.published_at,
        })),
      },
      requestId
    );
  } catch (e: any) {
    console.error('[AiAdvertiser] Get promoter reputation error:', e);
    return errors.internalError(requestId);
  }
}
