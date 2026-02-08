// Agent API Router
// Handles /api/v1/agents/* endpoints

import type { Env } from '../../types';
import { authenticateAiAdvertiser } from '../../middleware/ai-advertiser-auth';
import { error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';
import { handleAgentRegister } from './register';
import { handleAgentClaim } from './claim';
import { handleGetMe, handleGetStatus } from '../ai-advertiser/profile';
import { handleAiAdvertiserApi } from '../ai-advertiser/index';

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
