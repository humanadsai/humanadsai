// Agent Claim Endpoint (Simplified 1-click)
// POST /api/v1/agents/claim
// No authentication required — uses claim token

import type { Env, AgentClaimToken } from '../../types';
import { success, error, errors } from '../../utils/response';

/**
 * Claim (activate) an agent via token
 *
 * POST /api/v1/agents/claim
 *
 * Request body:
 * { "token": "humanads_claim_xxx" }
 *
 * This is called by the claim page button click (no X post needed).
 * Validates the token, checks expiry, and activates the advertiser.
 */
export async function handleAgentClaim(
  request: Request,
  env: Env,
  requestId: string
): Promise<Response> {
  try {
    let body: { token: string };
    try {
      body = await request.json();
    } catch {
      return errors.badRequest(requestId, 'Invalid JSON in request body');
    }

    if (!body.token || typeof body.token !== 'string') {
      return errors.badRequest(requestId, 'Missing or invalid field: token');
    }

    const token = body.token.trim();

    // Look up claim token
    const claimToken = await env.DB
      .prepare('SELECT * FROM agent_claim_tokens WHERE token = ?')
      .bind(token)
      .first<AgentClaimToken>();

    if (!claimToken) {
      return error(
        'INVALID_TOKEN',
        'Claim token not found or invalid.',
        requestId,
        400
      );
    }

    // Check if already claimed
    if (claimToken.status === 'claimed') {
      return error(
        'ALREADY_CLAIMED',
        'This claim token has already been used.',
        requestId,
        410
      );
    }

    // Check if expired
    if (claimToken.status === 'expired' || new Date(claimToken.expires_at) < new Date()) {
      // Mark as expired if not already
      if (claimToken.status !== 'expired') {
        await env.DB
          .prepare('UPDATE agent_claim_tokens SET status = ? WHERE id = ?')
          .bind('expired', claimToken.id)
          .run();
      }
      return error(
        'TOKEN_EXPIRED',
        'This claim token has expired. Please ask the agent to re-register.',
        requestId,
        410
      );
    }

    // Activate the advertiser and mark token as claimed
    const now = new Date().toISOString();

    await env.DB.batch([
      // Set advertiser active
      env.DB
        .prepare(`
          UPDATE ai_advertisers
          SET status = 'active', claimed_at = ?, updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(now, claimToken.advertiser_id),
      // Mark token as claimed
      env.DB
        .prepare('UPDATE agent_claim_tokens SET status = ?, claimed_at = ? WHERE id = ?')
        .bind('claimed', now, claimToken.id),
    ]);

    // Fetch advertiser name for response
    const advertiser = await env.DB
      .prepare('SELECT name, status FROM ai_advertisers WHERE id = ?')
      .bind(claimToken.advertiser_id)
      .first<{ name: string; status: string }>();

    return success({
      ok: true,
      agent: {
        name: advertiser?.name || 'Unknown',
        status: 'active'
      }
    }, requestId);
  } catch (e: any) {
    console.error('[AgentClaim] Unexpected error:', e);
    return errors.internalError(requestId);
  }
}
