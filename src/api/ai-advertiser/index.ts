// AI Advertiser API Router
// Handles /api/v1/advertisers/* endpoints

import type { Env } from '../../types';
import { authenticateAiAdvertiser, requireActiveStatus } from '../../middleware/ai-advertiser-auth';
import { error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';
import { handleRegister } from './register';
import { handleGetMe, handleGetStatus } from './profile';
import { handleCreateMission, handleListMyMissions, handleGetMission } from './missions';

/**
 * Route AI Advertiser API requests
 *
 * @param request HTTP request
 * @param env Environment bindings
 * @param path Request path (e.g., /api/v1/advertisers/register)
 * @param method HTTP method
 * @returns Response
 */
export async function handleAiAdvertiserApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  const requestId = generateRandomString(16);

  // Extract the sub-path after /api/v1/advertisers
  const prefix = '/api/v1/advertisers';
  if (!path.startsWith(prefix)) {
    return errors.notFound(requestId, 'API endpoint not found');
  }

  const subPath = path.substring(prefix.length) || '/';

  try {
    // Public endpoints (no authentication required)
    if (method === 'POST' && subPath === '/register') {
      return await handleRegister(request, env, requestId);
    }

    // Protected endpoints (authentication required)
    // Authenticate the request
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

    // Profile endpoints
    if (method === 'GET' && subPath === '/me') {
      return await handleGetMe(request, env, context);
    }

    if (method === 'GET' && subPath === '/status') {
      return await handleGetStatus(request, env, context);
    }

    // Mission endpoints (Phase 4)
    if (method === 'POST' && subPath === '/missions') {
      return await handleCreateMission(request, env, context);
    }

    if (method === 'GET' && subPath === '/missions/mine') {
      return await handleListMyMissions(request, env, context);
    }

    // GET /missions/:id - must be after /missions/mine to avoid conflict
    const missionMatch = subPath.match(/^\/missions\/([a-zA-Z0-9_]+)$/);
    if (missionMatch && method === 'GET') {
      return await handleGetMission(request, env, context, missionMatch[1]);
    }

    // TODO: Submission endpoints (Phase 5)
    // if (method === 'GET' && subPath.match(/^\/missions\/[^\/]+\/submissions$/)) { ... }
    // if (method === 'POST' && subPath.match(/^\/submissions\/[^\/]+\/approve$/)) { ... }
    // if (method === 'POST' && subPath.match(/^\/submissions\/[^\/]+\/reject$/)) { ... }
    // if (method === 'POST' && subPath.match(/^\/submissions\/[^\/]+\/payout$/)) { ... }

    // No matching route
    return errors.notFound(requestId, 'API endpoint not found');
  } catch (e: any) {
    console.error('[AiAdvertiserApi] Unexpected error:', e);
    return errors.internalError(requestId);
  }
}
