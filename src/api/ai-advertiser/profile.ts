// AI Advertiser Profile Endpoints
// GET /api/v1/advertisers/me - Get current advertiser info
// GET /api/v1/advertisers/status - Get activation status
// POST /api/v1/advertisers/verify - Verify X post URL to activate advertiser
// DELETE /api/v1/advertisers/me - Delete advertiser account

import type { Env, AiAdvertiser, AdvertiserStatusResponse } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { createBatchNotifications } from '../../services/notifications';

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
      next_step: 'Complete human claim and X verification. Visit your claim_url and post on X with your verification_code. After posting, paste the post URL back so verification can be completed via API.'
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

/**
 * Delete advertiser account
 *
 * DELETE /api/v1/advertisers/me
 *
 * Permanently deletes the advertiser account if no active missions exist.
 * Requires confirmation text "DELETE" in request body.
 */
export async function handleDeleteAccount(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  // Parse body - confirmation required
  let body: { confirm: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  if (!body.confirm || body.confirm !== 'DELETE') {
    return error(
      'CONFIRMATION_REQUIRED',
      'You must send {"confirm": "DELETE"} to confirm account deletion.',
      requestId,
      400
    );
  }

  // Check for active missions (selected promoters, in-progress, submitted, etc.)
  const activeMissions = await env.DB
    .prepare(
      `SELECT COUNT(*) as count FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE d.agent_id = ?
       AND m.status IN ('accepted', 'submitted', 'verified', 'approved', 'address_unlocked', 'paid_partial')`
    )
    .bind(advertiser.id)
    .first<{ count: number }>();

  if (activeMissions && activeMissions.count > 0) {
    return error(
      'HAS_ACTIVE_MISSIONS',
      `Cannot delete account: ${activeMissions.count} mission(s) are in progress. Complete or cancel all active missions first.`,
      requestId,
      409
    );
  }

  // Check for selected applications not yet converted to missions
  const selectedApps = await env.DB
    .prepare(
      `SELECT COUNT(*) as count FROM applications a
       JOIN deals d ON a.deal_id = d.id
       WHERE d.agent_id = ? AND a.status = 'selected'`
    )
    .bind(advertiser.id)
    .first<{ count: number }>();

  if (selectedApps && selectedApps.count > 0) {
    return error(
      'HAS_SELECTED_PROMOTERS',
      `Cannot delete account: ${selectedApps.count} selected promoter(s) awaiting mission start. Complete or cancel first.`,
      requestId,
      409
    );
  }

  // Get affected operators before deletion for notifications
  const affectedApps = await env.DB
    .prepare(
      `SELECT a.operator_id, d.title as deal_title, d.id as deal_id
       FROM applications a
       JOIN deals d ON a.deal_id = d.id
       WHERE d.agent_id = ? AND a.status IN ('applied', 'shortlisted')`
    )
    .bind(advertiser.id)
    .all<{ operator_id: string; deal_title: string; deal_id: string }>();

  // Proceed with deletion:
  // 1. Hide all deals (set visibility=hidden)
  // 2. Cancel pending applications
  // 3. Revoke the advertiser record
  // 4. Remove agent record

  await env.DB.batch([
    // Hide all deals from public listings
    env.DB.prepare(
      `UPDATE deals SET visibility = 'hidden', visibility_changed_at = datetime('now'), visibility_changed_by = 'account_deletion', updated_at = datetime('now') WHERE agent_id = ?`
    ).bind(advertiser.id),

    // Reject all pending/shortlisted applications for this advertiser's deals
    env.DB.prepare(
      `UPDATE applications SET status = 'rejected', ai_notes = 'Advertiser account deleted', updated_at = datetime('now')
       WHERE deal_id IN (SELECT id FROM deals WHERE agent_id = ?) AND status IN ('applied', 'shortlisted')`
    ).bind(advertiser.id),

    // Revoke the advertiser (keep record for audit, but mark as revoked)
    env.DB.prepare(
      `UPDATE ai_advertisers SET status = 'revoked', api_key_hash = 'DELETED', api_secret = 'DELETED', updated_at = datetime('now') WHERE id = ?`
    ).bind(advertiser.id),
  ]);

  // Notify all affected operators
  if (affectedApps.results && affectedApps.results.length > 0) {
    await createBatchNotifications(
      env.DB,
      affectedApps.results.map((app) => ({
        recipientId: app.operator_id,
        type: 'application_cancelled_advertiser_deleted',
        title: 'Mission Cancelled',
        body: `Mission '${app.deal_title}' has been cancelled (advertiser removed)`,
        referenceType: 'deal',
        referenceId: app.deal_id,
        metadata: { deal_title: app.deal_title },
      }))
    );
  }

  return success({
    deleted: true,
    advertiser_id: advertiser.id,
    advertiser_name: advertiser.name,
    message: 'Account deleted. All missions hidden and pending applications rejected. API key is now invalid.'
  }, requestId);
}
