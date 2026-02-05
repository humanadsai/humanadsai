/**
 * Account Deletion Handler
 *
 * POST /api/account/delete
 *
 * Anonymizes user data instead of full deletion for audit/payment tracking.
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { sha256Hex } from '../../utils/crypto';

interface DeleteRequest {
  confirmText: string;
}

interface Mission {
  id: string;
  status: string;
}

interface Balance {
  available: number;
  pending: number;
}

/**
 * Get session token from cookie
 */
function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'session') {
      return value;
    }
  }
  return null;
}

/**
 * POST /api/account/delete
 */
export async function handleAccountDelete(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  // Verify authentication
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    return errors.unauthorized(requestId);
  }

  const sessionHash = await sha256Hex(sessionToken);

  try {
    // Get authenticated operator
    const operator = await env.DB.prepare(`
      SELECT id, x_handle, display_name, status
      FROM operators
      WHERE session_token_hash = ?
        AND session_expires_at > datetime('now')
    `).bind(sessionHash).first<{
      id: string;
      x_handle: string;
      display_name: string | null;
      status: string;
    }>();

    if (!operator) {
      return errors.unauthorized(requestId);
    }

    // Parse request body
    let body: DeleteRequest;
    try {
      body = await request.json() as DeleteRequest;
    } catch {
      return errors.badRequest(requestId, 'Invalid JSON body');
    }

    // Verify confirmation text
    if (body.confirmText !== 'DELETE') {
      return errors.badRequest(requestId, 'Please type DELETE to confirm');
    }

    // Check for active missions
    const activeMissions = await env.DB.prepare(`
      SELECT id, status FROM missions
      WHERE operator_id = ?
        AND status IN ('accepted', 'submitted', 'verified')
    `).bind(operator.id).all<Mission>();

    if (activeMissions.results && activeMissions.results.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'ACTIVE_MISSIONS',
          message: 'You have active missions. Please complete or cancel them before deleting your account.',
          details: {
            count: activeMissions.results.length,
            missions: activeMissions.results.map(m => ({
              id: m.id,
              status: m.status,
            })),
          },
        },
        request_id: requestId,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for pending balance
    const balance = await env.DB.prepare(`
      SELECT available, pending FROM balances
      WHERE owner_type = 'operator' AND owner_id = ?
    `).bind(operator.id).first<Balance>();

    if (balance && balance.pending > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'PENDING_PAYOUT',
          message: 'You have a pending payout. Please wait for it to complete or contact support.',
          details: {
            pending_amount: balance.pending,
          },
        },
        request_id: requestId,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate anonymized identifier
    const deletedUserId = `deleted_${operator.id.substring(0, 8)}`;
    const deletedAt = new Date().toISOString();

    // Anonymize user data (keep minimal info for audit)
    await env.DB.prepare(`
      UPDATE operators SET
        -- Clear personal identifiers
        x_handle = NULL,
        x_user_id = NULL,
        display_name = ?,
        avatar_url = NULL,
        x_profile_image_url = NULL,
        bio = NULL,
        -- Clear X profile data
        x_description = NULL,
        x_url = NULL,
        x_location = NULL,
        x_created_at = NULL,
        x_protected = 0,
        x_verified = 0,
        x_verified_type = NULL,
        x_followers_count = 0,
        x_following_count = 0,
        x_tweet_count = 0,
        x_listed_count = 0,
        x_raw_json = NULL,
        x_fetched_at = NULL,
        x_connected_at = NULL,
        -- Clear wallet addresses
        evm_wallet_address = NULL,
        solana_wallet_address = NULL,
        -- Clear session
        session_token_hash = NULL,
        session_expires_at = NULL,
        -- Clear invite code (but keep invite_count for stats)
        invite_code = NULL,
        -- Clear verification data
        verify_code = NULL,
        verify_status = 'deleted',
        verify_post_id = NULL,
        verify_completed_at = NULL,
        -- Update status and metadata
        status = 'deleted',
        metadata = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      deletedUserId,
      JSON.stringify({
        deleted_at: deletedAt,
        original_handle: operator.x_handle, // Keep for support reference
      }),
      deletedAt,
      operator.id
    ).run();

    // Update ledger entries to anonymize (keep financial data)
    await env.DB.prepare(`
      UPDATE ledger_entries SET
        description = REPLACE(description, ?, ?)
      WHERE owner_type = 'operator' AND owner_id = ?
    `).bind(
      operator.x_handle || '',
      deletedUserId,
      operator.id
    ).run();

    // Log the deletion for audit
    console.log(`[Account Deletion] Operator ${operator.id} (@${operator.x_handle}) deleted at ${deletedAt}`);

    // Return success with logout instruction
    return new Response(JSON.stringify({
      success: true,
      data: {
        deleted: true,
        message: 'Your account has been deleted. You will be logged out.',
      },
      request_id: requestId,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Clear session cookie
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    });
  } catch (e) {
    console.error('[Account Deletion] Error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * GET /api/account/delete/check
 *
 * Pre-check if account can be deleted (no active missions, no pending payouts)
 */
export async function handleAccountDeleteCheck(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  // Verify authentication
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    return errors.unauthorized(requestId);
  }

  const sessionHash = await sha256Hex(sessionToken);

  try {
    // Get authenticated operator
    const operator = await env.DB.prepare(`
      SELECT id FROM operators
      WHERE session_token_hash = ?
        AND session_expires_at > datetime('now')
    `).bind(sessionHash).first<{ id: string }>();

    if (!operator) {
      return errors.unauthorized(requestId);
    }

    // Check for active missions
    const activeMissions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM missions
      WHERE operator_id = ?
        AND status IN ('accepted', 'submitted', 'verified')
    `).bind(operator.id).first<{ count: number }>();

    // Check for pending balance
    const balance = await env.DB.prepare(`
      SELECT available, pending FROM balances
      WHERE owner_type = 'operator' AND owner_id = ?
    `).bind(operator.id).first<Balance>();

    const canDelete = (activeMissions?.count || 0) === 0 && (!balance || balance.pending === 0);

    return success({
      can_delete: canDelete,
      blockers: {
        active_missions: activeMissions?.count || 0,
        pending_payout: balance?.pending || 0,
      },
    }, requestId);
  } catch (e) {
    console.error('[Account Delete Check] Error:', e);
    return errors.internalError(requestId);
  }
}
