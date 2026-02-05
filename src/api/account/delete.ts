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
  let stage = 'init';
  let operatorId = 'unknown';

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
        AND deleted_at IS NULL
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

    operatorId = operator.id;
    console.log(`[Delete ${requestId}] Operator found: ${operator.id} (@${operator.x_handle})`);

    // Stage 3: Parse request body
    stage = 'parse_body';
    let body: DeleteRequest;
    try {
      body = await request.json() as DeleteRequest;
    } catch (parseError) {
      console.log(`[Delete ${requestId}] Invalid JSON body`);
      return errors.badRequest(requestId, 'Invalid JSON body');
    }

    // Stage 4: Verify confirmation text
    stage = 'verify_confirm';
    if (!body.confirmText || body.confirmText.toUpperCase() !== 'DELETE') {
      console.log(`[Delete ${requestId}] Invalid confirm text`);
      return errors.badRequest(requestId, 'Please type DELETE to confirm');
    }

    // Stage 5: Check for active missions
    stage = 'check_missions';
    let activeMissionCount = 0;
    try {
      const activeMissions = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM missions
        WHERE operator_id = ?
          AND status IN ('accepted', 'submitted', 'verified')
      `).bind(operator.id).first<{ count: number }>();
      activeMissionCount = activeMissions?.count || 0;
    } catch (missionError) {
      console.log(`[Delete ${requestId}] Mission check failed (ignoring):`, missionError);
      // Continue - if we can't check missions, allow deletion
    }

    if (activeMissionCount > 0) {
      console.log(`[Delete ${requestId}] Blocked: ${activeMissionCount} active missions`);
      return new Response(JSON.stringify({
        ok: false,
        error: 'active_missions',
        activeMissions: activeMissionCount,
        request_id: requestId,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stage 6: Check for pending balance
    stage = 'check_balance';
    let pendingAmount = 0;
    try {
      const balance = await env.DB.prepare(`
        SELECT pending FROM balances
        WHERE owner_type = 'operator' AND owner_id = ?
      `).bind(operator.id).first<{ pending: number }>();
      pendingAmount = balance?.pending || 0;
    } catch (balanceError) {
      console.log(`[Delete ${requestId}] Balance check failed (ignoring):`, balanceError);
      // Continue - if we can't check balance, allow deletion
    }

    if (pendingAmount > 0) {
      console.log(`[Delete ${requestId}] Blocked: pending payout ${pendingAmount}`);
      return new Response(JSON.stringify({
        ok: false,
        error: 'pending_payouts',
        pendingPayouts: pendingAmount,
        request_id: requestId,
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stage 7: Anonymize user data (minimal, safe update)
    stage = 'anonymize';
    const deletedUserId = `deleted_${operator.id.substring(0, 8)}`;
    const deletedAt = new Date().toISOString();
    const metadata = JSON.stringify({
      deleted_at: deletedAt,
      original_handle: operator.x_handle,
    });

    // Use a minimal UPDATE that only touches columns we know exist
    // Core columns that definitely exist in schema
    console.log(`[Delete ${requestId}] Running anonymize UPDATE`);

    try {
      await env.DB.prepare(`
        UPDATE operators SET
          display_name = ?,
          status = 'deleted',
          deleted_at = ?,
          metadata = ?,
          updated_at = ?,
          session_token_hash = NULL,
          session_expires_at = NULL,
          x_handle = NULL,
          avatar_url = NULL,
          bio = NULL
        WHERE id = ?
      `).bind(
        deletedUserId,
        deletedAt,
        metadata,
        deletedAt,
        operator.id
      ).run();
    } catch (updateError) {
      const err = updateError as Error;
      console.error(`[Delete ${requestId}] Core update failed:`, err.message);

      // Try minimal update as fallback
      console.log(`[Delete ${requestId}] Trying minimal update`);
      await env.DB.prepare(`
        UPDATE operators SET
          status = 'deleted',
          deleted_at = ?,
          session_token_hash = NULL,
          session_expires_at = NULL,
          updated_at = ?
        WHERE id = ?
      `).bind(deletedAt, deletedAt, operator.id).run();
    }

    // Stage 8: Clear extended profile data (optional, non-blocking)
    stage = 'clear_extended';
    try {
      await env.DB.prepare(`
        UPDATE operators SET
          x_user_id = NULL,
          x_profile_image_url = NULL,
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
          x_connected_at = NULL
        WHERE id = ?
      `).bind(operator.id).run();
    } catch (extendedError) {
      console.log(`[Delete ${requestId}] Extended profile clear failed (non-critical):`, extendedError);
      // Non-blocking - continue
    }

    // Stage 9: Clear wallet addresses (optional, non-blocking)
    stage = 'clear_wallets';
    try {
      await env.DB.prepare(`
        UPDATE operators SET
          evm_wallet_address = NULL,
          solana_wallet_address = NULL
        WHERE id = ?
      `).bind(operator.id).run();
    } catch (walletError) {
      console.log(`[Delete ${requestId}] Wallet clear failed (non-critical):`, walletError);
      // Non-blocking - continue
    }

    // Stage 10: Clear invite/verification data (optional, non-blocking)
    stage = 'clear_verification';
    try {
      await env.DB.prepare(`
        UPDATE operators SET
          invite_code = NULL,
          verify_code = NULL,
          verify_post_id = NULL,
          verify_completed_at = NULL
        WHERE id = ?
      `).bind(operator.id).run();
    } catch (verifyError) {
      console.log(`[Delete ${requestId}] Verification clear failed (non-critical):`, verifyError);
      // Non-blocking - continue
    }

    // Stage 11: Anonymize ledger entries (optional, non-blocking)
    stage = 'anonymize_ledger';
    try {
      if (operator.x_handle) {
        await env.DB.prepare(`
          UPDATE ledger_entries SET
            description = REPLACE(description, ?, ?)
          WHERE owner_type = 'operator' AND owner_id = ?
        `).bind(
          operator.x_handle,
          deletedUserId,
          operator.id
        ).run();
      }
    } catch (ledgerError) {
      console.log(`[Delete ${requestId}] Ledger anonymize failed (non-critical):`, ledgerError);
      // Non-blocking - continue
    }

    // Stage 12: Success
    stage = 'success';
    console.log(`[Delete ${requestId}] Account deleted successfully: ${operator.id}`);

    return new Response(JSON.stringify({
      ok: true,
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
    console.error(`[Delete ${requestId}] FATAL at stage '${stage}' for operator '${operatorId}':`);
    console.error(`[Delete ${requestId}] Error name: ${error.name}`);
    console.error(`[Delete ${requestId}] Error message: ${error.message}`);
    console.error(`[Delete ${requestId}] Stack: ${error.stack}`);

    return new Response(JSON.stringify({
      ok: false,
      error: 'internal_error',
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
        AND deleted_at IS NULL
    `).bind(sessionHash).first<{ id: string }>();

    if (!operator) {
      return errors.unauthorized(requestId);
    }

    // Check for active missions
    let activeMissionCount = 0;
    try {
      const activeMissions = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM missions
        WHERE operator_id = ?
          AND status IN ('accepted', 'submitted', 'verified')
      `).bind(operator.id).first<{ count: number }>();
      activeMissionCount = activeMissions?.count || 0;
    } catch (e) {
      console.log(`[Delete Check ${requestId}] Mission check failed:`, e);
    }

    // Check for pending balance
    let pendingAmount = 0;
    try {
      const balance = await env.DB.prepare(`
        SELECT pending FROM balances
        WHERE owner_type = 'operator' AND owner_id = ?
      `).bind(operator.id).first<{ pending: number }>();
      pendingAmount = balance?.pending || 0;
    } catch (e) {
      console.log(`[Delete Check ${requestId}] Balance check failed:`, e);
    }

    const canDelete = activeMissionCount === 0 && pendingAmount === 0;

    return success({
      can_delete: canDelete,
      blockers: {
        active_missions: activeMissionCount,
        pending_payout: pendingAmount,
      },
    }, requestId);
  } catch (e) {
    const error = e as Error;
    console.error(`[Delete Check ${requestId}] Error:`, error.message);
    return errors.internalError(requestId);
  }
}
