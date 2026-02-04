import type { Env } from './types';
import { errors, generateRequestId } from './utils/response';
import { authenticateAgent } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';

// Agent API
import { createDeal, fundDeal, cancelDeal, listDeals, getDeal } from './api/agent/deals';
import { createDeposit, getAgentBalance } from './api/agent/deposit';

// Operator API
import { registerOperator, verifyOperator, getOperatorProfile } from './api/operator/register';
import {
  getAvailableMissions,
  acceptMission,
  submitMission,
  getMyMissions,
} from './api/operator/missions';

// Auth API
import { handleXLogin, handleXCallback } from './api/auth/x';

// Public API
import {
  getPublicDeals,
  getPublicDeal,
  getPublicOperators,
  getPublicOperator,
  getStats,
} from './api/public/index';

/**
 * メインルーター
 */
export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS対応
  if (method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // ============================================
    // Auth API (/auth/...)
    // ============================================

    if (path.startsWith('/auth/')) {
      return handleAuthApi(request, env, path, method);
    }

    // ============================================
    // Agent API (/v1/...) - 署名認証必須
    // ============================================

    if (path.startsWith('/v1/')) {
      return handleAgentApi(request, env, path, method);
    }

    // ============================================
    // Operator API (/api/operator/..., /api/missions/...)
    // ============================================

    if (path.startsWith('/api/operator/') || path.startsWith('/api/missions/')) {
      return handleOperatorApi(request, env, path, method);
    }

    // ============================================
    // Public API (/api/...)
    // ============================================

    if (path.startsWith('/api/')) {
      return handlePublicApi(request, env, path, method);
    }

    // ============================================
    // Health check
    // ============================================

    if (path === '/health' || path === '/') {
      return Response.json({
        status: 'ok',
        service: 'HumanAds API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // Not found
    return errors.notFound(generateRequestId(), 'Endpoint');
  } catch (e) {
    console.error('Router error:', e);
    return errors.internalError(generateRequestId());
  }
}

/**
 * Agent API ハンドラー
 */
async function handleAgentApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // 認証
  const requiredScopes = getRequiredScopes(path);
  const authResult = await authenticateAgent(request, env, requiredScopes);

  if (!authResult.success) {
    return authResult.error!;
  }

  const { context } = authResult;

  // レート制限
  const operationType = getOperationType(path);
  const rateLimitResult = await rateLimitMiddleware(
    request,
    env,
    context!.apiKey.id,
    operationType
  );

  if (!rateLimitResult.allowed) {
    return rateLimitResult.error!;
  }

  // ルーティング
  // POST /v1/deals/create
  if (path === '/v1/deals/create' && method === 'POST') {
    return createDeal(request, env, context!);
  }

  // POST /v1/deals/fund
  if (path === '/v1/deals/fund' && method === 'POST') {
    return fundDeal(request, env, context!);
  }

  // POST /v1/deals/cancel
  if (path === '/v1/deals/cancel' && method === 'POST') {
    return cancelDeal(request, env, context!);
  }

  // GET /v1/deals
  if (path === '/v1/deals' && method === 'GET') {
    return listDeals(request, env, context!);
  }

  // GET /v1/deals/:id
  const dealMatch = path.match(/^\/v1\/deals\/([a-f0-9]+)$/);
  if (dealMatch && method === 'GET') {
    return getDeal(request, env, context!, dealMatch[1]);
  }

  // POST /v1/deposit
  if (path === '/v1/deposit' && method === 'POST') {
    return createDeposit(request, env, context!);
  }

  // GET /v1/balance
  if (path === '/v1/balance' && method === 'GET') {
    return getAgentBalance(request, env, context!);
  }

  return errors.notFound(context!.requestId, 'Endpoint');
}

/**
 * Operator API ハンドラー
 */
async function handleOperatorApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // POST /api/operator/register
  if (path === '/api/operator/register' && method === 'POST') {
    return registerOperator(request, env);
  }

  // POST /api/operator/verify
  if (path === '/api/operator/verify' && method === 'POST') {
    return verifyOperator(request, env);
  }

  // GET /api/operator/profile
  if (path === '/api/operator/profile' && method === 'GET') {
    return getOperatorProfile(request, env);
  }

  // GET /api/missions/available
  if (path === '/api/missions/available' && method === 'GET') {
    return getAvailableMissions(request, env);
  }

  // POST /api/missions/accept
  if (path === '/api/missions/accept' && method === 'POST') {
    return acceptMission(request, env);
  }

  // POST /api/missions/submit
  if (path === '/api/missions/submit' && method === 'POST') {
    return submitMission(request, env);
  }

  // GET /api/missions/my
  if (path === '/api/missions/my' && method === 'GET') {
    return getMyMissions(request, env);
  }

  return errors.notFound(generateRequestId(), 'Endpoint');
}

/**
 * Public API ハンドラー
 */
async function handlePublicApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // GET /api/deals
  if (path === '/api/deals' && method === 'GET') {
    return getPublicDeals(request, env);
  }

  // GET /api/deals/:id
  const dealMatch = path.match(/^\/api\/deals\/([a-f0-9]+)$/);
  if (dealMatch && method === 'GET') {
    return getPublicDeal(request, env, dealMatch[1]);
  }

  // GET /api/operators
  if (path === '/api/operators' && method === 'GET') {
    return getPublicOperators(request, env);
  }

  // GET /api/operators/:id
  const operatorMatch = path.match(/^\/api\/operators\/([a-f0-9]+)$/);
  if (operatorMatch && method === 'GET') {
    return getPublicOperator(request, env, operatorMatch[1]);
  }

  // GET /api/stats
  if (path === '/api/stats' && method === 'GET') {
    return getStats(request, env);
  }

  return errors.notFound(generateRequestId(), 'Endpoint');
}

/**
 * CORS対応
 */
function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-AdClaw-Timestamp, X-AdClaw-Nonce, X-AdClaw-Signature, X-AdClaw-Key-Id',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Auth API ハンドラー
 */
async function handleAuthApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // GET /auth/x/login
  if (path === '/auth/x/login' && method === 'GET') {
    return handleXLogin(request, env);
  }

  // GET /auth/x/callback
  if (path === '/auth/x/callback' && method === 'GET') {
    return handleXCallback(request, env);
  }

  return errors.notFound(generateRequestId(), 'Endpoint');
}

/**
 * パスから必要なスコープを取得
 */
function getRequiredScopes(path: string): Array<'deals:create' | 'deals:deposit' | 'deals:release' | 'deals:refund' | 'deals:dispute' | 'proofs:verify'> {
  if (path === '/v1/deals/create') return ['deals:create'];
  if (path === '/v1/deals/fund') return ['deals:deposit'];
  if (path === '/v1/deals/cancel') return ['deals:refund'];
  if (path === '/v1/deposit') return ['deals:deposit'];
  return [];
}

/**
 * パスから操作タイプを取得（レート制限用）
 */
function getOperationType(path: string): 'deals:create' | 'deals:deposit' | undefined {
  if (path === '/v1/deals/create') return 'deals:create';
  if (path === '/v1/deals/fund' || path === '/v1/deposit') return 'deals:deposit';
  return undefined;
}
