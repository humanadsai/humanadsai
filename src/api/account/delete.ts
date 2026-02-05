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
 * Check which columns exist in the operators table
 */
async function getOperatorColumns(env: Env): Promise<Set<string>> {
  try {
    const result = await env.DB.prepare(
      "SELECT name FROM pragma_table_info('operators')"
    ).all<{ name: string }>();
    return new Set(result.results.map(r => r.name));
  } catch (e) {
    console.error('[Delete] Failed to get column info:', e);
    return new Set();
  }
}

/**
 * POST /api/account/delete
 */
export async function handleAccountDelete(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  let stage = 'init';

  try {
    // Stage 1: Verify authentication
    stage = 'auth';
    const sessionToken = getSessionToken(request);
    if (!sessionToken) {
      console.log(`[Delete ${requestId}] No session token`);
      return errors.unauthorized(requestId);
    }

    const sessionHash = await sha256Hex(sessionToken);

    // Stage 2: Get authenticated operator
    stage = 'get_operator';
    const operator = await env.DB.prepare(`
      SELECT id, x_handle, display_name, status
      FROM operators
      WHERE session_token_hash = ?
        AND session_expires_at > datetime('now')
        AND status != 'deleted'
    `).bind(sessionHash).first<{
      id: string;
      x_handle: string | null;
      display_name: string | null;
      status: string;
    }>();

    if (!operator) {
      console.log(`[Delete ${requestId}] Operator not found or session expired`);
      return errors.unauthorized(requestId);
    }

    console.log(`[Delete ${requestId}] Operator found: ${operator.id} (@${operator.x_handle})`);

    // Stage 3: Parse request body
    stage = 'parse_body';
    let body: DeleteRequest;
    try {
      body = await request.json() as DeleteRequest;
    } catch (e) {
      console.log(`[Delete ${requestId}] Invalid JSON body:`, e);
      return errors.badRequest(requestId, 'Invalid JSON body');
    }

    // Stage 4: Verify confirmation text
    stage = 'verify_confirm';
    if (!body.confirmText || body.confirmText.toUpperCase() !== 'DELETE') {
      console.log(`[Delete ${requestId}] Invalid confirm text: ${body.confirmText}`);
      return errors.badRequest(requestId, 'Please type DELETE to confirm');
    }

    // Stage 5: Check for active missions
    stage = 'check_missions';
    const activeMissions = await env.DB.prepare(`
      SELECT id, status FROM missions
      WHERE operator_id = ?
        AND status IN ('accepted', 'submitted', 'verified')
    `).bind(operator.id).all<Mission>();

    if (activeMissions.results && activeMissions.results.length > 0) {
      console.log(`[Delete ${requestId}] Blocked: ${activeMissions.results.length} active missions`);
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'ACTIVE_MISSIONS',
          message: 'You have active missions. Please complete or cancel them before deleting your account.',
          details: {
            count: activeMissions.results.length,
          },
        },
        request_id: requestId,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stage 6: Check for pending balance
    stage = 'check_balance';
    const balance = await env.DB.prepare(`
      SELECT available, pending FROM balances
      WHERE owner_type = 'operator' AND owner_id = ?
    `).bind(operator.id).first<Balance>();

    if (balance && balance.pending > 0) {
      console.log(`[Delete ${requestId}] Blocked: pending payout ${balance.pending}`);
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

    // Stage 7: Get available columns to build safe UPDATE
    stage = 'get_columns';
    const columns = await getOperatorColumns(env);
    console.log(`[Delete ${requestId}] Available columns:`, Array.from(columns).join(', '));

    // Stage 8: Anonymize user data
    stage = 'anonymize';
    const deletedUserId = `deleted_${operator.id.substring(0, 8)}`;
    const deletedAt = new Date().toISOString();
    const metadata = JSON.stringify({
      deleted_at: deletedAt,
      original_handle: operator.x_handle,
    });

    // Build UPDATE query dynamically based on available columns
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    // Always update these core fields
    updates.push('display_name = ?');
    values.push(deletedUserId);

    updates.push('status = ?');
    values.push('deleted');

    updates.push('metadata = ?');
    values.push(metadata);

    updates.push('updated_at = ?');
    values.push(deletedAt);

    // Clear session
    updates.push('session_token_hash = NULL');
    updates.push('session_expires_at = NULL');

    // Clear personal identifiers if columns exist
    if (columns.has('x_handle')) {
      updates.push('x_handle = NULL');
    }
    if (columns.has('x_user_id')) {
      updates.push('x_user_id = NULL');
    }
    if (columns.has('avatar_url')) {
      updates.push('avatar_url = NULL');
    }
    if (columns.has('bio')) {
      updates.push('bio = NULL');
    }

    // Clear X profile data if columns exist
    if (columns.has('x_profile_image_url')) {
      updates.push('x_profile_image_url = NULL');
    }
    if (columns.has('x_description')) {
      updates.push('x_description = NULL');
    }
    if (columns.has('x_url')) {
      updates.push('x_url = NULL');
    }
    if (columns.has('x_location')) {
      updates.push('x_location = NULL');
    }
    if (columns.has('x_created_at')) {
      updates.push('x_created_at = NULL');
    }
    if (columns.has('x_protected')) {
      updates.push('x_protected = 0');
    }
    if (columns.has('x_verified')) {
      updates.push('x_verified = 0');
    }
    if (columns.has('x_verified_type')) {
      updates.push('x_verified_type = NULL');
    }
    if (columns.has('x_followers_count')) {
      updates.push('x_followers_count = 0');
    }
    if (columns.has('x_following_count')) {
      updates.push('x_following_count = 0');
    }
    if (columns.has('x_tweet_count')) {
      updates.push('x_tweet_count = 0');
    }
    if (columns.has('x_listed_count')) {
      updates.push('x_listed_count = 0');
    }
    if (columns.has('x_raw_json')) {
      updates.push('x_raw_json = NULL');
    }
    if (columns.has('x_fetched_at')) {
      updates.push('x_fetched_at = NULL');
    }
    if (columns.has('x_connected_at')) {
      updates.push('x_connected_at = NULL');
    }

    // Clear wallet addresses if columns exist
    if (columns.has('evm_wallet_address')) {
      updates.push('evm_wallet_address = NULL');
    }
    if (columns.has('solana_wallet_address')) {
      updates.push('solana_wallet_address = NULL');
    }

    // Clear invite data if columns exist
    if (columns.has('invite_code')) {
      updates.push('invite_code = NULL');
    }

    // Clear verification data if columns exist
    if (columns.has('verify_code')) {
      updates.push('verify_code = NULL');
    }
    if (columns.has('verify_status')) {
      // verify_status is NOT NULL, so set to 'deleted' instead of NULL
      updates.push("verify_status = 'deleted'");
    }
    if (columns.has('verify_post_id')) {
      updates.push('verify_post_id = NULL');
    }
    if (columns.has('verify_completed_at')) {
      updates.push('verify_completed_at = NULL');
    }

    // Add WHERE clause
    values.push(operator.id);

    const updateQuery = `UPDATE operators SET ${updates.join(', ')} WHERE id = ?`;
    console.log(`[Delete ${requestId}] Running UPDATE query with ${updates.length} columns`);

    await env.DB.prepare(updateQuery).bind(...values).run();

    // Stage 9: Anonymize ledger entries (optional, non-blocking)
    stage = 'anonymize_ledger';
    try {
      await env.DB.prepare(`
        UPDATE ledger_entries SET
          description = REPLACE(description, ?, ?)
        WHERE owner_type = 'operator' AND owner_id = ?
      `).bind(
        operator.x_handle || '',
        deletedUserId,
        operator.id
      ).run();
    } catch (ledgerError) {
      // Log but don't fail the deletion
      console.error(`[Delete ${requestId}] Ledger anonymization failed (non-critical):`, ledgerError);
    }

    // Stage 10: Success
    stage = 'success';
    console.log(`[Delete ${requestId}] Account deleted successfully: ${operator.id} (@${operator.x_handle})`);

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
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    });
  } catch (e) {
    const error = e as Error;
    console.error(`[Delete ${requestId}] Error at stage '${stage}':`, error.message);
    console.error(`[Delete ${requestId}] Stack:`, error.stack);

    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred. Please try again or contact support.',
      },
      request_id: requestId,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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
        AND status != 'deleted'
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
    const error = e as Error;
    console.error(`[Delete Check ${requestId}] Error:`, error.message);
    console.error(`[Delete Check ${requestId}] Stack:`, error.stack);
    return errors.internalError(requestId);
  }
}
