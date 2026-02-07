import type { Env, Review, SubmitReviewRequest, OPERATOR_REVIEW_TAGS } from '../../types';
import { authenticateOperator } from './register';
import { success, errors, generateRequestId } from '../../utils/response';
import { recalculateReputation, publishReviewPair } from '../../services/reputation';

/**
 * POST /api/missions/:id/reviews — Submit a review for a completed mission
 * Operator reviews the AI advertiser (agent) after mission completion
 */
export async function submitMissionReview(
  request: Request,
  env: Env,
  missionId: string
): Promise<Response> {
  const requestId = generateRequestId();

  // Authenticate operator
  const auth = await authenticateOperator(request, env);
  if (!auth.success || !auth.operator) {
    return auth.error!;
  }

  const operator = auth.operator;

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
  const allowedTags: readonly string[] = [
    'fast_payment', 'clear_brief', 'good_communication', 'fair_requirements',
    'would_work_again', 'slow_payment', 'unclear_brief', 'poor_communication', 'unfair_requirements',
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
    // Fetch mission with deal info
    const mission = await env.DB.prepare(
      `SELECT m.id, m.deal_id, m.operator_id, m.status, d.agent_id
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.id = ?`
    )
      .bind(missionId)
      .first<{ id: string; deal_id: string; operator_id: string; status: string; agent_id: string }>();

    if (!mission) {
      return errors.notFound(requestId, 'Mission');
    }

    // Verify ownership
    if (mission.operator_id !== operator.id) {
      return errors.forbidden(requestId, 'You can only review missions assigned to you');
    }

    // Verify mission is in a reviewable status
    const reviewableStatuses = ['paid', 'paid_complete', 'paid_partial'];
    if (!reviewableStatuses.includes(mission.status)) {
      return errors.badRequest(requestId, 'Mission must be in a paid status to leave a review');
    }

    // Check for existing review (UNIQUE constraint will also catch this)
    const existingReview = await env.DB.prepare(
      `SELECT id FROM reviews WHERE mission_id = ? AND reviewer_type = 'operator' AND reviewer_id = ?`
    )
      .bind(missionId, operator.id)
      .first<{ id: string }>();

    if (existingReview) {
      return errors.conflict(requestId, 'You have already reviewed this mission');
    }

    // Insert review (unpublished by default — double-blind)
    await env.DB.prepare(
      `INSERT INTO reviews (id, layer, mission_id, deal_id, reviewer_type, reviewer_id, reviewee_type, reviewee_id, rating, comment, tags, is_published, created_at, updated_at)
       VALUES (lower(hex(randomblob(16))), 'transaction', ?, ?, 'operator', ?, 'agent', ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`
    )
      .bind(
        missionId,
        mission.deal_id,
        operator.id,
        mission.agent_id,
        body.rating,
        body.comment || null,
        body.tags ? JSON.stringify(body.tags) : null
      )
      .run();

    // Double-blind check: if the other side has also reviewed, publish both
    const otherReview = await env.DB.prepare(
      `SELECT id FROM reviews WHERE mission_id = ? AND reviewer_type = 'agent' AND reviewer_id = ?`
    )
      .bind(missionId, mission.agent_id)
      .first<{ id: string }>();

    let published = false;
    if (otherReview) {
      await publishReviewPair(env.DB, missionId, operator.id, mission.agent_id);
      published = true;
    }

    return success(
      {
        message: published
          ? 'Review submitted and published (both sides reviewed)'
          : 'Review submitted. It will be published when the other party also reviews, or after 14 days.',
        published,
      },
      requestId,
      201
    );
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint')) {
      return errors.conflict(requestId, 'You have already reviewed this mission');
    }
    console.error('Submit review error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/missions/:id/reviews — Get reviews for a mission
 * Returns published reviews only (plus the caller's own unpublished review)
 */
export async function getMissionReviews(
  request: Request,
  env: Env,
  missionId: string
): Promise<Response> {
  const requestId = generateRequestId();

  // Authenticate operator (optional — for showing own unpublished review)
  const auth = await authenticateOperator(request, env);
  const operatorId = auth.operator?.id;

  try {
    // Fetch published reviews
    const publishedReviews = await env.DB.prepare(
      `SELECT r.id, r.reviewer_type, r.reviewer_id, r.reviewee_type, r.reviewee_id,
              r.rating, r.comment, r.tags, r.published_at, r.created_at
       FROM reviews r
       WHERE r.mission_id = ? AND r.is_published = 1 AND r.is_hidden = 0`
    )
      .bind(missionId)
      .all<Review>();

    // If authenticated, also return own unpublished review
    let myReview = null;
    if (operatorId) {
      const own = await env.DB.prepare(
        `SELECT id, rating, comment, tags, is_published, created_at
         FROM reviews
         WHERE mission_id = ? AND reviewer_type = 'operator' AND reviewer_id = ? AND is_hidden = 0`
      )
        .bind(missionId, operatorId)
        .first<Review>();

      if (own && !own.is_published) {
        myReview = {
          id: own.id,
          rating: own.rating,
          comment: own.comment,
          tags: own.tags ? JSON.parse(own.tags) : [],
          is_published: false,
          created_at: own.created_at,
        };
      }
    }

    return success(
      {
        reviews: (publishedReviews.results || []).map((r) => ({
          id: r.id,
          reviewer_type: r.reviewer_type,
          reviewee_type: r.reviewee_type,
          rating: r.rating,
          comment: r.comment,
          tags: r.tags ? JSON.parse(r.tags as string) : [],
          published_at: r.published_at,
          created_at: r.created_at,
        })),
        my_pending_review: myReview,
      },
      requestId
    );
  } catch (e: any) {
    console.error('Get mission reviews error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/reviews/:id/report — Report a review for moderation
 */
export async function reportReview(
  request: Request,
  env: Env,
  reviewId: string
): Promise<Response> {
  const requestId = generateRequestId();

  // Authenticate operator
  const auth = await authenticateOperator(request, env);
  if (!auth.success || !auth.operator) {
    return auth.error!;
  }

  let body: { reason: string };
  try {
    body = await request.json() as { reason: string };
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON body');
  }

  if (!body.reason || body.reason.length < 5 || body.reason.length > 500) {
    return errors.badRequest(requestId, 'Report reason must be between 5 and 500 characters');
  }

  try {
    const review = await env.DB.prepare('SELECT id, is_reported FROM reviews WHERE id = ?')
      .bind(reviewId)
      .first<{ id: string; is_reported: number }>();

    if (!review) {
      return errors.notFound(requestId, 'Review');
    }

    if (review.is_reported) {
      return errors.conflict(requestId, 'This review has already been reported');
    }

    await env.DB.prepare(
      `UPDATE reviews SET is_reported = 1, report_reason = ?, reported_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(body.reason, reviewId)
      .run();

    return success({ message: 'Review reported for moderation' }, requestId);
  } catch (e: any) {
    console.error('Report review error:', e);
    return errors.internalError(requestId);
  }
}
