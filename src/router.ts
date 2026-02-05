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
import { getOperatorWallets, updateOperatorWallets } from './api/operator/wallets';
import { getVerifyCode, verifyPost } from './api/operator/verification';

// Auth API
import { handleXLogin, handleXCallback } from './api/auth/x';
import { handleDashboard } from './api/auth/dashboard';

// Public API
import {
  getPublicDeals,
  getPublicDeal,
  getPublicOperators,
  getPublicOperator,
  getStats,
  trackVisit,
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
    // User API (/api/user/...) - Session authenticated user endpoints
    // ============================================

    if (path.startsWith('/api/user/')) {
      return handleUserApi(request, env, path, method);
    }

    // ============================================
    // Public API (/api/...)
    // ============================================

    if (path.startsWith('/api/')) {
      return handlePublicApi(request, env, path, method);
    }

    // ============================================
    // Dashboard (authenticated users)
    // ============================================

    if (path === '/dashboard') {
      return handleDashboard(request, env);
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

  // GET /api/operator/wallets
  if (path === '/api/operator/wallets' && method === 'GET') {
    return getOperatorWallets(request, env);
  }

  // POST /api/operator/wallets
  if (path === '/api/operator/wallets' && method === 'POST') {
    return updateOperatorWallets(request, env);
  }

  // GET /api/operator/verify-code
  if (path === '/api/operator/verify-code' && method === 'GET') {
    return getVerifyCode(request, env);
  }

  // POST /api/operator/verify-post
  if (path === '/api/operator/verify-post' && method === 'POST') {
    return verifyPost(request, env);
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
 * User API ハンドラー (Session authenticated)
 * User-facing endpoints for logged-in users
 */
async function handleUserApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // GET /api/user/verify-code
  if (path === '/api/user/verify-code' && method === 'GET') {
    return getVerifyCode(request, env);
  }

  // POST /api/user/verify-post
  if (path === '/api/user/verify-post' && method === 'POST') {
    return verifyPost(request, env);
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

  // POST /api/track-visit
  if (path === '/api/track-visit' && method === 'POST') {
    return trackVisit(request, env);
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

  // GET /auth/logout
  if (path === '/auth/logout' && method === 'GET') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    });
  }

  // GET /auth/error
  if (path === '/auth/error' && method === 'GET') {
    const url = new URL(request.url);
    const message = url.searchParams.get('message') || 'An error occurred';
    return new Response(generateAuthErrorHTML(message), {
      status: 400,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  return errors.notFound(generateRequestId(), 'Endpoint');
}

/**
 * Generate auth error HTML
 */
function generateAuthErrorHTML(message: string): string {
  // Escape HTML to prevent XSS
  const escapedMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Error | HumanAds</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>
    :root {
      --color-bg: #0a0a0f;
      --color-surface: rgba(255, 255, 255, 0.05);
      --color-border: rgba(255, 255, 255, 0.1);
      --color-primary: #FF6B35;
      --color-text: #ffffff;
      --color-text-muted: rgba(255, 255, 255, 0.6);
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'IBM Plex Mono', monospace;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font-sans);
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
      min-height: 100vh;
      color: var(--color-text);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .error-container {
      max-width: 400px;
      padding: 40px 24px;
      text-align: center;
    }
    .error-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
    }
    .error-title {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      margin-bottom: 12px;
      color: var(--color-primary);
    }
    .error-message {
      font-size: 0.875rem;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      background: var(--color-primary);
      color: #fff;
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
    }
  </style>
</head>
<body>
  <div class="error-container">
    <svg class="error-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke="#FF6B35" stroke-width="3"/>
      <path d="M24 24L40 40M40 24L24 40" stroke="#FF6B35" stroke-width="3" stroke-linecap="round"/>
    </svg>
    <h1 class="error-title">Authentication Error</h1>
    <p class="error-message">${escapedMessage}</p>
    <a href="/" class="btn">Back to Home</a>
  </div>
</body>
</html>`;
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
