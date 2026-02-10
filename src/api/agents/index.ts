// Agent API Router
// Handles /api/v1/agents/* endpoints

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { authenticateAiAdvertiser } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';
import { handleAgentRegister } from './register';
import { handleAgentClaim } from './claim';
import { handleGetMe, handleGetStatus } from '../ai-advertiser/profile';
import { handleAiAdvertiserApi } from '../ai-advertiser/index';

/**
 * POST /api/v1/agents/activate
 * Activate an agent account using only API key (no browser/claim_url needed).
 * Only works for agents registered via /agents/register with status pending_claim.
 */
async function handleAgentActivate(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext,
  requestId: string
): Promise<Response> {
  const { advertiser } = context;

  if (advertiser.status === 'active') {
    return success({
      message: 'Account is already active.',
      status: 'active',
    }, requestId);
  }

  if (advertiser.status !== 'pending_claim') {
    return error(
      'INVALID_STATUS',
      `Cannot activate from status "${advertiser.status}". Only pending_claim accounts can be activated.`,
      requestId,
      400
    );
  }

  // Only allow agent-registered accounts (not full advertiser registration which requires X verification)
  if (advertiser.registration_source !== 'agent') {
    return error(
      'NOT_AGENT_REGISTRATION',
      'This endpoint is only for accounts registered via /agents/register. Accounts registered via /advertisers/register must be verified via X post.',
      requestId,
      400
    );
  }

  // Activate the account
  await env.DB.prepare(
    "UPDATE ai_advertisers SET status = 'active', claimed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
  ).bind(advertiser.id).run();

  // Mark any pending claim tokens as used
  await env.DB.prepare(
    "UPDATE agent_claim_tokens SET status = 'used' WHERE advertiser_id = ? AND status = 'pending'"
  ).bind(advertiser.id).run().catch(() => {});

  return success({
    message: 'Account activated successfully. You can now create missions.',
    status: 'active',
  }, requestId);
}

/**
 * Route Agent API requests
 *
 * /api/v1/agents/register → POST (no auth)
 * /api/v1/agents/claim → POST (no auth, uses claim token)
 * /api/v1/agents/me → GET (auth) — delegates to advertiser profile
 * /api/v1/agents/status → GET (auth) — delegates to advertiser status
 * /api/v1/agents/missions/* → rewrites to /api/v1/advertisers/missions/*
 * /api/v1/agents/submissions/* → rewrites to /api/v1/advertisers/submissions/*
 * /api/v1/agents/applications/* → rewrites to /api/v1/advertisers/applications/*
 * /api/v1/agents/payouts → rewrites to /api/v1/advertisers/payouts
 */
export async function handleAgentApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  const requestId = generateRandomString(16);

  const prefix = '/api/v1/agents';
  if (!path.startsWith(prefix)) {
    return errors.notFound(requestId, 'API endpoint not found');
  }

  const subPath = path.substring(prefix.length) || '/';

  try {
    // ============================================
    // Public endpoints (no auth)
    // ============================================

    if (method === 'POST' && subPath === '/register') {
      return await handleAgentRegister(request, env, requestId);
    }

    if (method === 'POST' && subPath === '/claim') {
      return await handleAgentClaim(request, env, requestId);
    }

    // ============================================
    // Authenticated endpoints
    // ============================================

    const authResult = await authenticateAiAdvertiser(request, env, requestId);
    if (!authResult.success || !authResult.context) {
      return error(
        'AUTHENTICATION_FAILED',
        authResult.error!.hint || authResult.error!.message,
        requestId,
        authResult.error!.status
      );
    }

    const context = authResult.context;

    // POST /agents/activate — API-only activation (no browser needed)
    if (method === 'POST' && subPath === '/activate') {
      return await handleAgentActivate(request, env, context, requestId);
    }

    // Profile endpoints (delegate to existing handlers)
    if (method === 'GET' && subPath === '/me') {
      return await handleGetMe(request, env, context);
    }

    if (method === 'GET' && subPath === '/status') {
      return await handleGetStatus(request, env, context);
    }

    // ============================================
    // Alias rewrite: /agents/X → /advertisers/X
    // Reuse existing advertiser API handlers
    // ============================================

    const aliasSubPaths = ['/missions', '/submissions', '/applications', '/payouts', '/promoters'];
    for (const aliasPrefix of aliasSubPaths) {
      if (subPath.startsWith(aliasPrefix)) {
        const rewrittenPath = `/api/v1/advertisers${subPath}`;
        return await handleAiAdvertiserApi(request, env, rewrittenPath, method);
      }
    }

    return errors.notFound(requestId, 'API endpoint not found');
  } catch (e: any) {
    console.error('[AgentApi] Unexpected error:', e);
    return errors.internalError(requestId);
  }
}
