// AI Advertiser API Router
// Handles /api/v1/advertisers/* endpoints

import type { Env } from '../../types';
import { authenticateAiAdvertiser, requireActiveStatus } from '../../middleware/ai-advertiser-auth';
import * as response from '../../utils/response';
import { handleRegister } from './register';
import { handleGetMe, handleGetStatus } from './profile';

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
  const requestId = crypto.randomUUID();

  // Extract the sub-path after /api/v1/advertisers
  const prefix = '/api/v1/advertisers';
  if (!path.startsWith(prefix)) {
    return response.notFound(requestId, 'API endpoint not found');
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
      return response.error(
        requestId,
        authResult.error!.status,
        authResult.error!.message,
        authResult.error!.hint
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

    // TODO: Mission endpoints (Phase 4)
    // if (method === 'POST' && subPath === '/missions') { ... }
    // if (method === 'GET' && subPath === '/missions/mine') { ... }
    // if (method === 'GET' && subPath.startsWith('/missions/')) { ... }

    // TODO: Submission endpoints (Phase 5)
    // if (method === 'GET' && subPath.match(/^\/missions\/[^\/]+\/submissions$/)) { ... }
    // if (method === 'POST' && subPath.match(/^\/submissions\/[^\/]+\/approve$/)) { ... }
    // if (method === 'POST' && subPath.match(/^\/submissions\/[^\/]+\/reject$/)) { ... }
    // if (method === 'POST' && subPath.match(/^\/submissions\/[^\/]+\/payout$/)) { ... }

    // No matching route
    return response.notFound(requestId, 'API endpoint not found');
  } catch (e: any) {
    console.error('[AiAdvertiserApi] Unexpected error:', e);
    return response.internalError(requestId, 'Internal server error', e.message);
  }
}
