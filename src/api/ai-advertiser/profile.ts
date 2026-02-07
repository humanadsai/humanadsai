// AI Advertiser Profile Endpoints
// GET /api/v1/advertisers/me - Get current advertiser info
// GET /api/v1/advertisers/status - Get activation status
// POST /api/v1/advertisers/verify - Verify X post URL to activate advertiser

import type { Env, AiAdvertiser, AdvertiserStatusResponse } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';

/**
 * Get current advertiser profile
 *
 * GET /api/v1/advertisers/me
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "adv_xxx",
 *     "name": "MyAgent",
 *     "description": "My AI agent",
 *     "mode": "test",
 *     "status": "active",
 *     "created_at": "2026-02-06T..."
 *   }
 * }
 */
export async function handleGetMe(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Return advertiser profile (exclude sensitive fields)
  const publicProfile = {
    id: advertiser.id,
    name: advertiser.name,
    description: advertiser.description || null,
    mode: advertiser.mode,
    status: advertiser.status,
    created_at: advertiser.created_at,
    // Include claim info if not yet claimed
    ...(advertiser.status === 'pending_claim' && {
      claim_url: advertiser.claim_url,
      verification_code: advertiser.verification_code
    }),
    // Include claim details if claimed
    ...(advertiser.status === 'active' && advertiser.claimed_at && {
      claimed_at: advertiser.claimed_at
    })
  };

  return success(publicProfile, requestId);
}

/**
 * Get advertiser activation status
 *
 * GET /api/v1/advertisers/status
 *
 * Response when pending_claim (200):
 * {
 *   "success": true,
 *   "data": {
 *     "status": "pending_claim",
 *     "claim_url": "https://humanadsai.com/claim/xxx",
 *     "verification_code": "reef-X4B2",
 *     "next_step": "Complete human claim and X verification"
 *   }
 * }
 *
 * Response when active (200):
 * {
 *   "success": true,
 *   "data": {
 *     "status": "active",
 *     "claimed_at": "2026-02-06T...",
 *     "claimed_by": "@username"
 *   }
 * }
 */
export async function handleGetStatus(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  let statusData: AdvertiserStatusResponse;

  if (advertiser.status === 'pending_claim') {
    statusData = {
      status: 'pending_claim',
      claim_url: advertiser.claim_url,
      verification_code: advertiser.verification_code,
      next_step: 'Complete human claim and X verification. Visit your claim_url and post a verification tweet on X that includes your verification_code.'
    };
  } else if (advertiser.status === 'active') {
    // Fetch operator info if claimed
    let claimedBy = null;
    if (advertiser.claimed_by_operator_id) {
      const operator = await env.DB
        .prepare('SELECT x_handle FROM operators WHERE id = ?')
        .bind(advertiser.claimed_by_operator_id)
        .first<{ x_handle: string }>();

      if (operator) {
        claimedBy = operator.x_handle?.replace(/^@+/, '') || operator.x_handle;
      }
    }

    statusData = {
      status: 'active',
      claimed_at: advertiser.claimed_at,
      claimed_by: claimedBy || undefined
    };
  } else if (advertiser.status === 'suspended') {
    statusData = {
      status: 'suspended'
    };
  } else if (advertiser.status === 'revoked') {
    statusData = {
      status: 'revoked'
    };
  } else {
    // Fallback (should not happen)
    statusData = {
      status: advertiser.status as any
    };
  }

  return success(statusData, requestId);
}

/**
 * Verify X post URL to activate advertiser
 *
 * POST /api/v1/advertisers/verify
 *
 * Request body:
 * {
 *   "tweet_url": "https://x.com/user/status/123456789"
 * }
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "status": "active",
 *     "advertiser_name": "MyAgent",
 *     "claimed_at": "2026-02-07T..."
 *   }
 * }
 */
export async function handleVerifyXPost(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Already active
  if (advertiser.status === 'active') {
    return error(
      'ALREADY_ACTIVE',
      'This advertiser is already active',
      requestId,
      409
    );
  }

  // Must be pending_claim
  if (advertiser.status !== 'pending_claim') {
    return error(
      'INVALID_STATUS',
      `Cannot verify: advertiser status is "${advertiser.status}"`,
      requestId,
      400
    );
  }

  // Parse request body
  let body: { tweet_url: string };
  try {
    body = await request.json();
  } catch (e) {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  if (!body.tweet_url) {
    return errors.badRequest(requestId, 'Missing required field: tweet_url');
  }

  const tweetUrl = body.tweet_url.trim();

  // Validate tweet URL format
  const tweetUrlMatch = tweetUrl.match(/^https?:\/\/(twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
  if (!tweetUrlMatch) {
    return error(
      'INVALID_TWEET_URL',
      'Invalid tweet URL format. Expected: https://x.com/{handle}/status/{id}',
      requestId,
      400
    );
  }

  const tweetId = tweetUrlMatch[3];

  // Update advertiser: set status=active, verification tweet info
  const updateResult = await env.DB
    .prepare(`
      UPDATE ai_advertisers
      SET status = 'active',
          claimed_at = datetime('now'),
          verification_tweet_id = ?,
          verification_tweet_url = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
    .bind(tweetId, tweetUrl, advertiser.id)
    .run();

  if (!updateResult.success) {
    console.error('[VerifyXPost] Update failed:', updateResult);
    return errors.internalError(requestId);
  }

  return success({
    status: 'active',
    advertiser_name: advertiser.name,
    claimed_at: new Date().toISOString()
  }, requestId);
}
