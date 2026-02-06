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
  applyForMission,
  getMyApplications,
  withdrawApplication,
  getApplication,
} from './api/operator/applications';

// AI Agent API
import {
  getApplicationsForMission,
  shortlistApplication,
  selectApplication,
  rejectApplication,
  bulkUpdateApplications,
} from './api/ai/applications';

// A-Plan API (Address Unlock Fee Model)
import {
  approveMission,
  unlockAddress,
  confirmPayout,
  getAgentTrustScore,
} from './api/ai/aplan';

// User API
import { getMe } from './api/user/me';
import { getPendingRewards } from './api/user/pending-rewards';
import {
  getAvailableMissions,
  acceptMission,
  submitMission,
  getMyMissions,
  cancelMission,
} from './api/operator/missions';
import { getOperatorWallets, updateOperatorWallets } from './api/operator/wallets';
import { getVerifyCode, verifyPost } from './api/operator/verification';

// Auth API
import { handleXLogin, handleXCallback } from './api/auth/x';

// Account API
import { handleAccountDelete, handleAccountDeleteCheck } from './api/account/delete';
import { getAccountMe } from './api/account/me';
import { handleDeletePage, handleDeleteConfirmPage, handleDeletedPage } from './api/account/delete-pages';

// Public API
import {
  getPublicDeals,
  getPublicDeal,
  getPublicOperators,
  getPublicOperator,
  getStats,
  trackVisit,
} from './api/public/index';

// Admin API
import {
  getAdminDashboardStats,
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  listDeals as adminListDeals,
  createDeal as adminCreateDeal,
  updateDealStatus,
  listOperators,
  updateOperatorRole,
  listApplications,
  seedApplication,
  updateApplication,
  listMissions,
  createSubmission,
  reviewMission,
  testPayout,
  runScenario,
  getAuditLogs,
  getPayments,
  getFeeRecipients,
} from './api/admin/index';
import { getAdvertiserDashboard } from './api/admin/dashboard-stats';

// Advertiser Test API
import { handleAdvertiserTestApi } from './api/advertiser/test';

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

    if (path.startsWith('/api/operator/') || path.startsWith('/api/missions/') || path.startsWith('/api/my/') || path.startsWith('/api/applications/')) {
      return handleOperatorApi(request, env, path, method);
    }

    // ============================================
    // User API (/api/user/..., /api/account/...) - Session authenticated user endpoints
    // ============================================

    if (path.startsWith('/api/user/') || path.startsWith('/api/account/')) {
      return handleUserApi(request, env, path, method);
    }

    // ============================================
    // Advertiser Test API (/api/advertiser/test/...) - Admin-only
    // ============================================

    if (path.startsWith('/api/advertiser/test/')) {
      return handleAdvertiserTestApi(request, env, path, method);
    }

    // ============================================
    // Admin API (/api/admin/...) - Admin-only endpoints
    // ============================================

    if (path.startsWith('/api/admin/')) {
      return handleAdminApi(request, env, path, method);
    }

    // ============================================
    // Public API (/api/...)
    // ============================================

    if (path.startsWith('/api/')) {
      return handlePublicApi(request, env, path, method);
    }

    // ============================================
    // Dashboard redirect (deprecated - now redirects to My Missions)
    // ============================================

    if (path === '/dashboard') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/missions/my' }
      });
    }

    // ============================================
    // Settings Pages - Redirects from old paths
    // ============================================

    // Redirect old delete paths to new /account/delete
    if (path === '/settings/account/delete' && method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/account/delete' }
      });
    }

    if (path === '/settings/account/delete/confirm' && method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/account/delete' }
      });
    }

    if (path === '/settings/account/deleted' && method === 'GET') {
      return handleDeletedPage(request, env);
    }

    // Redirect /settings/account to /account
    if (path === '/settings/account' && method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/account' }
      });
    }

    // ============================================
    // Redirects (deprecated endpoints)
    // ============================================

    // Redirect /payout.json to /settings/payout (deprecated endpoint)
    if (path === '/payout.json') {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/settings/payout',
        },
      });
    }

    // ============================================
    // Health check
    // ============================================

    if (path === '/health') {
      return Response.json({
        status: 'ok',
        service: 'HumanAds API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // AI Advertiser Redirects (All AI paths → /skill.md)
    // ============================================

    // Redirect all AI-related pages to /skill.md
    if (path === '/agent/docs' || path === '/agent/docs.html' ||
        path === '/agent/deploy' || path === '/agent/deploy.html' ||
        path === '/ai/how-it-works' || path === '/ai/how-it-works.html' ||
        path === '/ai/docs' || path === '/ai/docs.html' ||
        path === '/ai/skill.md') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/skill.md' }
      });
    }

    // ============================================
    // skill.md with caching headers
    // ============================================

    if (path === '/skill.md') {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status === 200) {
          const body = await assetResponse.text();
          const headers = new Headers(assetResponse.headers);
          headers.set('Content-Type', 'text/markdown; charset=utf-8');
          headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
          headers.set('X-Skill-Version', '2025-01-15');
          return new Response(body, {
            status: 200,
            headers
          });
        }
      } catch (e) {
        console.error('skill.md fetch error:', e);
      }
    }

    // ============================================
    // Static Assets (fallback to ASSETS for HTML pages and static files)
    // ============================================

    // Serve static files from /public directory
    // This handles: /, /index.html, /settings/payout, /missions, etc.
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    } catch (e) {
      console.error('Asset fetch error:', e);
    }

    // Not found (only for truly unknown routes)
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
  const dealMatch = path.match(/^\/v1\/deals\/([a-zA-Z0-9_]+)$/);
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

  // ============================================
  // AI Application Management Routes
  // ============================================

  // GET /v1/deals/:dealId/applications - List applications for a deal
  const applicationsMatch = path.match(/^\/v1\/deals\/([a-zA-Z0-9_]+)\/applications$/);
  if (applicationsMatch && method === 'GET') {
    return getApplicationsForMission(request, env, context!, applicationsMatch[1]);
  }

  // POST /v1/deals/:dealId/applications/bulk - Bulk update applications
  const bulkMatch = path.match(/^\/v1\/deals\/([a-zA-Z0-9_]+)\/applications\/bulk$/);
  if (bulkMatch && method === 'POST') {
    return bulkUpdateApplications(request, env, context!, bulkMatch[1]);
  }

  // POST /v1/applications/:id/shortlist - Shortlist an application
  const shortlistMatch = path.match(/^\/v1\/applications\/([a-zA-Z0-9_]+)\/shortlist$/);
  if (shortlistMatch && method === 'POST') {
    return shortlistApplication(request, env, context!, shortlistMatch[1]);
  }

  // POST /v1/applications/:id/select - Select an application (creates mission, consumes slot)
  const selectMatch = path.match(/^\/v1\/applications\/([a-zA-Z0-9_]+)\/select$/);
  if (selectMatch && method === 'POST') {
    return selectApplication(request, env, context!, selectMatch[1]);
  }

  // POST /v1/applications/:id/reject - Reject an application
  const rejectMatch = path.match(/^\/v1\/applications\/([a-zA-Z0-9_]+)\/reject$/);
  if (rejectMatch && method === 'POST') {
    return rejectApplication(request, env, context!, rejectMatch[1]);
  }

  // ============================================
  // A-Plan Routes (Address Unlock Fee Model)
  // ============================================

  // POST /v1/applications/:id/approve - Approve mission for payment (VERIFIED → APPROVED)
  const approveMatch = path.match(/^\/v1\/applications\/([a-zA-Z0-9_]+)\/approve$/);
  if (approveMatch && method === 'POST') {
    return approveMission(request, env, context!, approveMatch[1]);
  }

  // POST /v1/applications/:id/unlock-address - Submit AUF tx and get wallet address
  const unlockMatch = path.match(/^\/v1\/applications\/([a-zA-Z0-9_]+)\/unlock-address$/);
  if (unlockMatch && method === 'POST') {
    return unlockAddress(request, env, context!, unlockMatch[1]);
  }

  // POST /v1/applications/:id/confirm-payout - Confirm 90% payout completion
  const confirmMatch = path.match(/^\/v1\/applications\/([a-zA-Z0-9_]+)\/confirm-payout$/);
  if (confirmMatch && method === 'POST') {
    return confirmPayout(request, env, context!, confirmMatch[1]);
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

  // POST /api/missions/:id/cancel - Cancel a mission (before submission)
  const cancelMatch = path.match(/^\/api\/missions\/([a-zA-Z0-9_]+)\/cancel$/);
  if (cancelMatch && method === 'POST') {
    return cancelMission(request, env, cancelMatch[1]);
  }

  // GET /api/missions/my
  if (path === '/api/missions/my' && method === 'GET') {
    return getMyMissions(request, env);
  }

  // ============================================
  // Application Routes (Apply → AI Selection Model)
  // ============================================

  // POST /api/missions/:dealId/apply - Apply for a mission
  const applyMatch = path.match(/^\/api\/missions\/([a-zA-Z0-9_]+)\/apply$/);
  if (applyMatch && method === 'POST') {
    return applyForMission(request, env, applyMatch[1]);
  }

  // GET /api/my/applications - Get my applications
  if (path === '/api/my/applications' && method === 'GET') {
    return getMyApplications(request, env);
  }

  // GET /api/applications/:id - Get application details
  const appDetailMatch = path.match(/^\/api\/applications\/([a-zA-Z0-9_]+)$/);
  if (appDetailMatch && method === 'GET') {
    return getApplication(request, env, appDetailMatch[1]);
  }

  // POST /api/applications/:id/withdraw - Withdraw an application
  const withdrawMatch = path.match(/^\/api\/applications\/([a-zA-Z0-9_]+)\/withdraw$/);
  if (withdrawMatch && method === 'POST') {
    return withdrawApplication(request, env, withdrawMatch[1]);
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

  // GET /api/account/me - Get account info
  if (path === '/api/account/me' && method === 'GET') {
    return getAccountMe(request, env);
  }

  // GET /api/account/delete/check - Pre-check if account can be deleted
  if (path === '/api/account/delete/check' && method === 'GET') {
    return handleAccountDeleteCheck(request, env);
  }

  // POST /api/account/delete - Delete account
  if (path === '/api/account/delete' && method === 'POST') {
    return handleAccountDelete(request, env);
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
  const dealMatch = path.match(/^\/api\/deals\/([a-zA-Z0-9_]+)$/);
  if (dealMatch && method === 'GET') {
    return getPublicDeal(request, env, dealMatch[1]);
  }

  // GET /api/operators
  if (path === '/api/operators' && method === 'GET') {
    return getPublicOperators(request, env);
  }

  // GET /api/operators/:id
  const operatorMatch = path.match(/^\/api\/operators\/([a-zA-Z0-9_]+)$/);
  if (operatorMatch && method === 'GET') {
    return getPublicOperator(request, env, operatorMatch[1]);
  }

  // GET /api/stats
  if (path === '/api/stats' && method === 'GET') {
    return getStats(request, env);
  }

  // GET /api/me - Current user info
  if (path === '/api/me' && method === 'GET') {
    return getMe(request, env);
  }

  // GET /api/me/pending-rewards - Pending rewards and wallet status
  if (path === '/api/me/pending-rewards' && method === 'GET') {
    return getPendingRewards(request, env);
  }

  // POST /api/track-visit
  if (path === '/api/track-visit' && method === 'POST') {
    return trackVisit(request, env);
  }

  // GET /api/payout-wallets (alias for /api/operator/wallets)
  if (path === '/api/payout-wallets' && method === 'GET') {
    return getOperatorWallets(request, env);
  }

  // POST /api/payout-wallets (alias for /api/operator/wallets)
  if (path === '/api/payout-wallets' && method === 'POST') {
    return updateOperatorWallets(request, env);
  }

  // ============================================
  // A-Plan Public Routes
  // ============================================

  // GET /api/agents/:id/trust-score - Public agent trust score
  const trustScoreMatch = path.match(/^\/api\/agents\/([a-zA-Z0-9_]+)\/trust-score$/);
  if (trustScoreMatch && method === 'GET') {
    return getAgentTrustScore(request, env, trustScoreMatch[1]);
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
 * Admin API ハンドラー
 */
async function handleAdminApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // GET /api/admin/dashboard - Dashboard stats
  if (path === '/api/admin/dashboard' && method === 'GET') {
    return getAdminDashboardStats(request, env);
  }

  // GET /api/admin/dashboard/advertiser - Advertiser dashboard stats
  if (path === '/api/admin/dashboard/advertiser' && method === 'GET') {
    return getAdvertiserDashboard(request, env);
  }

  // ============================================
  // Agent Management
  // ============================================

  // GET /api/admin/agents - List agents
  if (path === '/api/admin/agents' && method === 'GET') {
    return listAgents(request, env);
  }

  // POST /api/admin/agents - Create agent
  if (path === '/api/admin/agents' && method === 'POST') {
    return createAgent(request, env);
  }

  // GET /api/admin/agents/:id - Get agent details
  const agentMatch = path.match(/^\/api\/admin\/agents\/([a-zA-Z0-9_]+)$/);
  if (agentMatch && method === 'GET') {
    return getAgent(request, env, agentMatch[1]);
  }

  // PUT /api/admin/agents/:id - Update agent
  if (agentMatch && method === 'PUT') {
    return updateAgent(request, env, agentMatch[1]);
  }

  // ============================================
  // Deal Management
  // ============================================

  // GET /api/admin/deals - List deals
  if (path === '/api/admin/deals' && method === 'GET') {
    return adminListDeals(request, env);
  }

  // POST /api/admin/deals - Create deal
  if (path === '/api/admin/deals' && method === 'POST') {
    return adminCreateDeal(request, env);
  }

  // PUT /api/admin/deals/:id/status - Update deal status
  const dealStatusMatch = path.match(/^\/api\/admin\/deals\/([a-zA-Z0-9_]+)\/status$/);
  if (dealStatusMatch && method === 'PUT') {
    return updateDealStatus(request, env, dealStatusMatch[1]);
  }

  // ============================================
  // Operator Management
  // ============================================

  // GET /api/admin/operators - List operators
  if (path === '/api/admin/operators' && method === 'GET') {
    return listOperators(request, env);
  }

  // PUT /api/admin/operators/:id/role - Update operator role
  const operatorRoleMatch = path.match(/^\/api\/admin\/operators\/([a-zA-Z0-9_]+)\/role$/);
  if (operatorRoleMatch && method === 'PUT') {
    return updateOperatorRole(request, env, operatorRoleMatch[1]);
  }

  // ============================================
  // Application Management
  // ============================================

  // GET /api/admin/applications - List applications
  if (path === '/api/admin/applications' && method === 'GET') {
    return listApplications(request, env);
  }

  // POST /api/admin/applications/seed - Seed application
  if (path === '/api/admin/applications/seed' && method === 'POST') {
    return seedApplication(request, env);
  }

  // PUT /api/admin/applications/:id - Update application status
  const updateAppMatch = path.match(/^\/api\/admin\/applications\/([a-zA-Z0-9]+)$/);
  if (updateAppMatch && method === 'PUT') {
    return updateApplication(request, env, updateAppMatch[1]);
  }

  // ============================================
  // Mission Management
  // ============================================

  // GET /api/admin/missions - List missions
  if (path === '/api/admin/missions' && method === 'GET') {
    return listMissions(request, env);
  }

  // POST /api/admin/missions/submit - Create submission
  if (path === '/api/admin/missions/submit' && method === 'POST') {
    return createSubmission(request, env);
  }

  // POST /api/admin/missions/:id/review - Review mission
  const reviewMatch = path.match(/^\/api\/admin\/missions\/([a-zA-Z0-9_]+)\/review$/);
  if (reviewMatch && method === 'POST') {
    return reviewMission(request, env, reviewMatch[1]);
  }

  // ============================================
  // Payout Testing
  // ============================================

  // POST /api/admin/payout/test - Test payout
  if (path === '/api/admin/payout/test' && method === 'POST') {
    return testPayout(request, env);
  }

  // GET /api/admin/payout/fee-recipients - Get fee recipients
  if (path === '/api/admin/payout/fee-recipients' && method === 'GET') {
    return getFeeRecipients(request, env);
  }

  // ============================================
  // Scenario Runner
  // ============================================

  // POST /api/admin/scenarios/run - Run scenario
  if (path === '/api/admin/scenarios/run' && method === 'POST') {
    return runScenario(request, env);
  }

  // ============================================
  // Logging & Debug
  // ============================================

  // GET /api/admin/logs - Get audit logs
  if ((path === '/api/admin/logs' || path === '/api/admin/logs/audit') && method === 'GET') {
    return getAuditLogs(request, env);
  }

  // GET /api/admin/payments - Get payments
  if (path === '/api/admin/payments' && method === 'GET') {
    return getPayments(request, env);
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
