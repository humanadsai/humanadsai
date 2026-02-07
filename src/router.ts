import type { Env } from './types';
import { errors, generateRequestId } from './utils/response';
import { authenticateAgent } from './middleware/auth';
import { rateLimitMiddleware, checkRateLimit } from './middleware/rate-limit';
import { SKILL_MD } from './content/skill-md';
import { transferHusd, hasTreasuryKey } from './services/onchain';

// Agent API
import { createDeal, fundDeal, cancelDeal, listDeals, getDeal } from './api/agent/deals';
import { createDeposit, getAgentBalance } from './api/agent/deposit';

// Operator API
import { registerOperator, verifyOperator, getOperatorProfile } from './api/operator/register';
import {
  applyForMission,
  getMyApplications,
  cancelApplication,
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
import {
  listNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from './api/operator/notifications';

// Auth API
import { handleXLogin, handleXCallback } from './api/auth/x';
import { handleEmailLoginRequest, handleEmailLoginCallback } from './api/auth/email';

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
  getPublicAiAdvertisers,
  getPublicAiAdvertiserDetail,
} from './api/public/index';

// AI Advertiser API (v1)
import { handleAiAdvertiserApi } from './api/ai-advertiser/index';

// AI Advertiser Claim Flow (Public)
import { handleClaimPage, handleClaimVerify } from './api/public/claim';

// Admin API
import {
  getAdminDashboardStats,
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  listDeals as adminListDeals,
  createDeal as adminCreateDeal,
  updateDealStatus,
  updateDealVisibility,
  getAdminActions,
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
  handleFaucet,
  getTokenOps,
  getTokenBalances,
  logTokenOp,
  getEnvStatus,
  getEnvCheck,
} from './api/admin/index';
import { getAdvertiserDashboard } from './api/admin/dashboard-stats';

// Advertiser Test API
import { handleAdvertiserTestApi } from './api/advertiser/test';

// Operator Email API
import { addOperatorEmail, getOperatorEmail, removeOperatorEmail, verifyOperatorEmail } from './api/operator/email';
import { requestEmailChange, verifyEmailChange } from './api/operator/email-change';
import { getEmailPreferences, updateEmailPreference } from './api/operator/email-preferences';

// Admin Email API
import { getEmailStats, getEmailLogs, getEmailSuppressions, removeEmailSuppression } from './api/admin/emails';

// Webhook API
import { handleResendWebhook } from './api/webhooks/resend';

// Config API
import {
  getPublicConfig,
  getAdminPaymentProfile,
  updateAdminPaymentProfile,
  getConfigHistory,
} from './api/admin/config';

/**
 * メインルーター
 */
export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS対応
  if (method === 'OPTIONS') {
    return handleCors(request);
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

    if (path.startsWith('/api/operator/') || path.startsWith('/api/missions/') || path.startsWith('/api/my/') || path.startsWith('/api/applications/') || path.startsWith('/api/notifications')) {
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
    // Sepolia RPC Proxy — allows AI agents to reach blockchain from sandboxed environments
    // No auth needed (public blockchain data). Rate-limited.
    // ============================================

    if (path === '/api/v1/rpc/sepolia' && method === 'POST') {
      return handleRpcProxy(request, env);
    }

    // Faucet endpoints — ALL GET
    // /api/v1/faucet → help/discovery
    if (path === '/api/v1/faucet' && method === 'GET') {
      return faucetJsonResponse({
        message: 'HumanAds Faucet API — claim 1,000 hUSD with one GET request',
        claim: 'GET https://humanadsai.com/api/v1/faucet/claim?address=YOUR_ADDRESS',
        note: 'The claim endpoint sends hUSD directly from the server. No signing, no POST, no RPC needed.',
        important: 'Balance (hUSD + ETH) is included in the faucet/claim response. Do NOT call faucet/balance separately — it returns 403 from AI sandboxes.',
      });
    }
    if (path === '/api/v1/faucet/prepare' && method === 'GET') {
      return handleFaucetPrepare(request, env);
    }
    if (path === '/api/v1/faucet/send' && method === 'GET') {
      return handleFaucetSend(request, env);
    }
    if (path === '/api/v1/faucet/receipt' && method === 'GET') {
      return handleFaucetReceipt(request, env);
    }
    if (path === '/api/v1/faucet/balance' && method === 'GET') {
      return handleFaucetBalance(request, env);
    }
    // Server-side claim — AI just provides address, server does everything
    if (path === '/api/v1/faucet/claim' && method === 'GET') {
      return handleFaucetClaim(request, env);
    }

    // ============================================
    // AI Advertiser API (v1) (/api/v1/advertisers/...)
    // ============================================

    if (path.startsWith('/api/v1/advertisers/')) {
      return await handleAiAdvertiserApi(request, env, path, method);
    }

    // ============================================
    // AI Advertiser Missions API (v1) (/api/v1/missions/...)
    // Alias for /api/v1/advertisers/missions/... per skill.md spec
    // ============================================

    if (path.startsWith('/api/v1/missions')) {
      // Rewrite path to /api/v1/advertisers/missions and delegate
      const rewrittenPath = path.replace('/api/v1/missions', '/api/v1/advertisers/missions');
      return await handleAiAdvertiserApi(request, env, rewrittenPath, method);
    }

    // ============================================
    // AI Advertiser Applications API (v1) (/api/v1/applications/...)
    // Alias for /api/v1/advertisers/applications/... per skill.md spec
    // ============================================

    if (path.startsWith('/api/v1/applications')) {
      const rewrittenPath = path.replace('/api/v1/applications', '/api/v1/advertisers/applications');
      return await handleAiAdvertiserApi(request, env, rewrittenPath, method);
    }

    // ============================================
    // AI Advertiser Submissions API (v1) (/api/v1/submissions/...)
    // Alias for /api/v1/advertisers/submissions/... per skill.md spec
    // ============================================

    if (path.startsWith('/api/v1/submissions')) {
      const rewrittenPath = path.replace('/api/v1/submissions', '/api/v1/advertisers/submissions');
      return await handleAiAdvertiserApi(request, env, rewrittenPath, method);
    }

    // ============================================
    // AI Advertiser Payouts API (v1) (/api/v1/payouts)
    // Alias for /api/v1/advertisers/payouts per skill.md spec
    // ============================================

    if (path.startsWith('/api/v1/payouts')) {
      const rewrittenPath = path.replace('/api/v1/payouts', '/api/v1/advertisers/payouts');
      return await handleAiAdvertiserApi(request, env, rewrittenPath, method);
    }

    // ============================================
    // Webhook Routes (/api/webhooks/...)
    // ============================================

    if (path === '/api/webhooks/resend' && method === 'POST') {
      return handleResendWebhook(request, env);
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
    // AI Advertiser Claim Flow (Public)
    // ============================================

    // GET /claim/:claim_token - Human claim page
    const claimMatch = path.match(/^\/claim\/([a-zA-Z0-9_]+)$/);
    if (claimMatch && method === 'GET') {
      return handleClaimPage(request, env, claimMatch[1]);
    }

    // ============================================
    // skill.md with caching headers and UTF-8 charset
    // ============================================

    if (path === '/skill.md') {
      const headers = new Headers();

      // UTF-8 charset を強制（文字化け防止）
      headers.set('Content-Type', 'text/markdown; charset=utf-8');

      // キャッシュ無効化 — skill.md は頻繁に更新されるため、常に最新版を返す
      // AI agents の web_fetch ツールやプロキシが古い版をキャッシュしないようにする
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      headers.set('CDN-Cache-Control', 'no-store');
      headers.set('Pragma', 'no-cache');

      // バージョン管理用ヘッダー
      headers.set('X-Skill-Version', '2.9.0-2026-02-07');

      return new Response(SKILL_MD, {
        status: 200,
        headers
      });
    }

    // ============================================
    // Dynamic → Static HTML rewrites (SPA-style routing)
    // ============================================

    // /advertiser/:id → redirect to /advertiser/detail?id=:id
    // (env.ASSETS not available with wrangler assets config; static files served before Worker)
    const advertiserPageMatch = path.match(/^\/advertiser\/([a-zA-Z0-9_]+)$/);
    if (advertiserPageMatch && advertiserPageMatch[1] !== 'detail' && method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `/advertiser/detail?id=${encodeURIComponent(advertiserPageMatch[1])}` }
      });
    }

    // /operators/:id → redirect to /operators/detail?id=:id
    const operatorPageMatch = path.match(/^\/operators\/([a-zA-Z0-9_]+)$/);
    if (operatorPageMatch && operatorPageMatch[1] !== 'detail' && method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: { 'Location': `/operators/detail?id=${encodeURIComponent(operatorPageMatch[1])}` }
      });
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
  // IP rate limit
  const ipRateLimit = await rateLimitMiddleware(request, env);
  if (!ipRateLimit.allowed) return ipRateLimit.error!;

  // Operation-specific rate limits for high-risk endpoints
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (path === '/api/operator/register' && method === 'POST') {
    const opResult = await checkRateLimit(env, ip, 'operator:register');
    if (!opResult.allowed) return errors.rateLimited(generateRequestId(), opResult.retryAfter);
  }
  if (path === '/api/operator/verify' && method === 'POST') {
    const opResult = await checkRateLimit(env, ip, 'operator:verify');
    if (!opResult.allowed) return errors.rateLimited(generateRequestId(), opResult.retryAfter);
  }

  // POST /api/operator/register
  if (path === '/api/operator/register' && method === 'POST') {
    return registerOperator(request, env);
  }

  // POST /api/operator/verify (disabled in production — use X OAuth login)
  if (path === '/api/operator/verify' && method === 'POST') {
    if (env.ENVIRONMENT === 'production') {
      return errors.forbidden(generateRequestId(), 'Manual verification is disabled in production. Use X OAuth login.');
    }
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

  // POST /api/applications/:id/cancel - Cancel an application
  const cancelAppMatch = path.match(/^\/api\/applications\/([a-zA-Z0-9_]+)\/cancel$/);
  if (cancelAppMatch && method === 'POST') {
    return cancelApplication(request, env, cancelAppMatch[1]);
  }

  // ============================================
  // Operator Email Routes
  // ============================================

  // POST /api/operator/email - Add email
  if (path === '/api/operator/email' && method === 'POST') {
    return addOperatorEmail(request, env);
  }

  // GET /api/operator/email - Get email (masked)
  if (path === '/api/operator/email' && method === 'GET') {
    return getOperatorEmail(request, env);
  }

  // DELETE /api/operator/email - Remove email
  if (path === '/api/operator/email' && method === 'DELETE') {
    return removeOperatorEmail(request, env);
  }

  // GET /api/operator/email/verify - Verify email token
  if (path === '/api/operator/email/verify' && method === 'GET') {
    return verifyOperatorEmail(request, env);
  }

  // POST /api/operator/email/change - Request email change
  if (path === '/api/operator/email/change' && method === 'POST') {
    return requestEmailChange(request, env);
  }

  // GET /api/operator/email/change/verify - Verify new email
  if (path === '/api/operator/email/change/verify' && method === 'GET') {
    return verifyEmailChange(request, env);
  }

  // GET /api/operator/email-preferences - Get preferences
  if (path === '/api/operator/email-preferences' && method === 'GET') {
    return getEmailPreferences(request, env);
  }

  // PUT /api/operator/email-preferences - Update a preference
  if (path === '/api/operator/email-preferences' && method === 'PUT') {
    return updateEmailPreference(request, env);
  }

  // ============================================
  // Notification Routes
  // ============================================

  // GET /api/notifications/count - Unread count
  if (path === '/api/notifications/count' && method === 'GET') {
    return getNotificationCount(request, env);
  }

  // POST /api/notifications/read-all - Mark all as read
  if (path === '/api/notifications/read-all' && method === 'POST') {
    return markAllNotificationsRead(request, env);
  }

  // POST /api/notifications/:id/read - Mark single as read
  const notifReadMatch = path.match(/^\/api\/notifications\/([a-zA-Z0-9]+)\/read$/);
  if (notifReadMatch && method === 'POST') {
    return markNotificationRead(request, env, notifReadMatch[1]);
  }

  // GET /api/notifications - List notifications
  if (path === '/api/notifications' && method === 'GET') {
    return listNotifications(request, env);
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
  // IP rate limit
  const ipRateLimit = await rateLimitMiddleware(request, env);
  if (!ipRateLimit.allowed) return ipRateLimit.error!;

  // Operation-specific rate limit for account deletion
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (path === '/api/account/delete' && method === 'POST') {
    const opResult = await checkRateLimit(env, ip, 'account:delete');
    if (!opResult.allowed) return errors.rateLimited(generateRequestId(), opResult.retryAfter);
  }

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

  // GET /api/config - Current payment profile (public)
  if (path === '/api/config' && method === 'GET') {
    return getPublicConfig(request, env);
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

  // GET /api/ai-advertisers - Public AI advertisers list
  if (path === '/api/ai-advertisers' && method === 'GET') {
    return getPublicAiAdvertisers(request, env);
  }

  // GET /api/ai-advertisers/:id - Public AI advertiser detail
  const aiAdvDetailMatch = path.match(/^\/api\/ai-advertisers\/([a-zA-Z0-9_]+)$/);
  if (aiAdvDetailMatch && method === 'GET') {
    return getPublicAiAdvertiserDetail(request, env, aiAdvDetailMatch[1]);
  }

  // POST /api/claim/verify - Verify AI advertiser claim with tweet URL
  if (path === '/api/claim/verify' && method === 'POST') {
    return handleClaimVerify(request, env, generateRequestId());
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
function handleCors(request: Request): Response {
  // CORS preflight should mirror the origin policy from index.ts
  const url = new URL(request.url);
  const requestOrigin = request.headers.get('Origin') || '';
  const allowedOrigins = [
    'https://humanadsai.com',
    'https://www.humanadsai.com',
  ];
  const sameOrigin = `${url.protocol}//${url.host}`;
  const corsOrigin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : (requestOrigin === sameOrigin ? requestOrigin : 'https://humanadsai.com');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-AdClaw-Timestamp, X-AdClaw-Nonce, X-AdClaw-Signature, X-AdClaw-Key-Id',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (allowedOrigins.includes(requestOrigin) || requestOrigin === sameOrigin) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return new Response(null, { status: 204, headers });
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
  // IP rate limit
  const ipRateLimit = await rateLimitMiddleware(request, env);
  if (!ipRateLimit.allowed) return ipRateLimit.error!;

  // Operation-specific rate limit for login
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (path === '/auth/x/login' && method === 'GET') {
    const opResult = await checkRateLimit(env, ip, 'auth:login');
    if (!opResult.allowed) return errors.rateLimited(generateRequestId(), opResult.retryAfter);
  }

  // GET /auth/x/login
  if (path === '/auth/x/login' && method === 'GET') {
    return handleXLogin(request, env);
  }

  // GET /auth/x/callback
  if (path === '/auth/x/callback' && method === 'GET') {
    return handleXCallback(request, env);
  }

  // POST /auth/email/login - Magic link request
  if (path === '/auth/email/login' && method === 'POST') {
    const emailRateResult = await checkRateLimit(env, ip, 'auth:email_login');
    if (!emailRateResult.allowed) return errors.rateLimited(generateRequestId(), emailRateResult.retryAfter);
    return handleEmailLoginRequest(request, env);
  }

  // GET /auth/email/verify - Magic link callback
  if (path === '/auth/email/verify' && method === 'GET') {
    return handleEmailLoginCallback(request, env);
  }

  // GET /auth/logout
  if (path === '/auth/logout' && method === 'GET') {
    const url = new URL(request.url);
    const switchAccount = url.searchParams.get('switch') === '1';

    // Clear all auth-related cookies (session + legacy auth state paths)
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache');
    headers.append('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    headers.append('Set-Cookie', 'x_auth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    headers.append('Set-Cookie', 'x_auth_state=; Path=/auth/x; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    if (switchAccount) {
      // Show intermediate page that clears localStorage then redirects to X login
      const html = `<!DOCTYPE html><html><head><title>Switching Account...</title></head><body>
<script>localStorage.removeItem('session_token');localStorage.removeItem('session_expires_at');window.location.href='/auth/x/login';</script>
<p>Switching account...</p></body></html>`;
      return new Response(html, { status: 200, headers });
    }

    // Normal logout: clear localStorage then redirect to home
    const html = `<!DOCTYPE html><html><head><title>Logging out...</title></head><body>
<script>localStorage.removeItem('session_token');localStorage.removeItem('session_expires_at');window.location.href='/';</script>
<p>Logging out...</p></body></html>`;
    return new Response(html, { status: 200, headers });
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

  // DELETE /api/admin/agents/:id - Revoke agent
  if (agentMatch && method === 'DELETE') {
    return deleteAgent(request, env, agentMatch[1]);
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

  // PUT /api/admin/deals/:id/visibility - Update deal visibility (hide/delete/restore)
  const dealVisibilityMatch = path.match(/^\/api\/admin\/deals\/([a-zA-Z0-9_]+)\/visibility$/);
  if (dealVisibilityMatch && method === 'PUT') {
    return updateDealVisibility(request, env, dealVisibilityMatch[1]);
  }

  // GET /api/admin/actions - Get admin action logs
  if (path === '/api/admin/actions' && method === 'GET') {
    return getAdminActions(request, env);
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

  // ============================================
  // Token Operations (hUSD)
  // ============================================

  // POST /api/admin/faucet - Send hUSD to advertiser
  if (path === '/api/admin/faucet' && method === 'POST') {
    return handleFaucet(request, env);
  }

  // GET /api/admin/token-ops - List token operations
  if (path === '/api/admin/token-ops' && method === 'GET') {
    return getTokenOps(request, env);
  }

  // GET /api/admin/token-ops/balances - Get treasury and admin balances
  if (path === '/api/admin/token-ops/balances' && method === 'GET') {
    return getTokenBalances(request, env);
  }

  // POST /api/admin/token-ops/log - Log owner mint/transfer operation
  if (path === '/api/admin/token-ops/log' && method === 'POST') {
    return logTokenOp(request, env);
  }

  // ============================================
  // Email Management
  // ============================================

  // GET /api/admin/emails/stats
  if (path === '/api/admin/emails/stats' && method === 'GET') {
    return getEmailStats(request, env);
  }

  // GET /api/admin/emails/logs
  if (path === '/api/admin/emails/logs' && method === 'GET') {
    return getEmailLogs(request, env);
  }

  // GET /api/admin/emails/suppressions
  if (path === '/api/admin/emails/suppressions' && method === 'GET') {
    return getEmailSuppressions(request, env);
  }

  // DELETE /api/admin/emails/suppressions/:email
  const suppressionMatch = path.match(/^\/api\/admin\/emails\/suppressions\/(.+)$/);
  if (suppressionMatch && method === 'DELETE') {
    return removeEmailSuppression(request, env, suppressionMatch[1]);
  }

  // GET /api/admin/env-check - Lightweight treasury key check
  if (path === '/api/admin/env-check' && method === 'GET') {
    return getEnvCheck(request, env);
  }

  // GET /api/admin/env - Get environment status (secrets as booleans)
  if (path === '/api/admin/env' && method === 'GET') {
    return getEnvStatus(request, env);
  }

  // ============================================
  // Configuration (Environment Switcher)
  // ============================================

  // GET /api/admin/config/payment-profile - Get current payment profile
  if (path === '/api/admin/config/payment-profile' && method === 'GET') {
    return getAdminPaymentProfile(request, env);
  }

  // POST /api/admin/config/payment-profile - Update payment profile
  if (path === '/api/admin/config/payment-profile' && method === 'POST') {
    return updateAdminPaymentProfile(request, env);
  }

  // GET /api/admin/config/history - Get config change history
  if (path === '/api/admin/config/history' && method === 'GET') {
    return getConfigHistory(request, env);
  }

  // Fallback: serve static assets from /public via env.ASSETS
  // For non-API paths, try serving from static assets before returning 404
  if (!path.startsWith('/api/')) {
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    } catch {
      // Asset fetch failed, fall through to 404
    }
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

// ============================================
// Sepolia RPC Proxy
// Allows AI agents in sandboxed environments (blocked from direct RPC)
// to reach Sepolia via HumanAds. No auth needed (public chain data).
// ============================================

const RPC_ALLOWED_METHODS = new Set([
  'eth_call',
  'eth_getTransactionCount',
  'eth_gasPrice',
  'eth_sendRawTransaction',
  'eth_getTransactionReceipt',
  'eth_blockNumber',
  'eth_chainId',
  'eth_getBalance',
  'eth_estimateGas',
  'net_version',
]);

const RPC_TARGETS = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://1rpc.io/sepolia',
  'https://eth-sepolia.public.blastapi.io',
  'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
  'https://sepolia.drpc.org',
];

async function handleRpcProxy(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const method = body?.method;
  if (!method || !RPC_ALLOWED_METHODS.has(method)) {
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: body?.id ?? null, error: { code: -32601, message: `Method not allowed: ${method}. Allowed: ${[...RPC_ALLOWED_METHODS].join(', ')}` } }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use env.RPC_URL as primary, then fallbacks
  const rpcUrl = env.RPC_URL || RPC_TARGETS[0];
  const targets = [rpcUrl, ...RPC_TARGETS.filter(u => u !== rpcUrl)];

  for (const target of targets) {
    try {
      const resp = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-RPC-Via': 'humanads-proxy',
        },
      });
    } catch {
      continue;
    }
  }

  return new Response(JSON.stringify({ jsonrpc: '2.0', id: body?.id ?? null, error: { code: -32000, message: 'All RPC endpoints failed' } }), {
    status: 502,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================
// Shared RPC helper — server-side fallback across multiple Sepolia RPCs
// ============================================

async function sepoliaRpcCall(env: Env, method: string, params: any[]): Promise<any> {
  const rpcUrl = env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const targets = [rpcUrl, ...RPC_TARGETS.filter(u => u !== rpcUrl)];
  for (const target of targets) {
    try {
      const resp = await fetch(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      if (!resp.ok) continue;
      const data: any = await resp.json();
      if (data.error) continue;
      return data.result;
    } catch {
      continue;
    }
  }
  throw new Error('All RPC endpoints failed');
}

function faucetJsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}

// ============================================
// Faucet Prepare — returns unsigned tx fields for claimOpen()
// ALL faucet endpoints are GET-only so AI agents in POST-blocked sandboxes can use them.
// ============================================

async function handleFaucetPrepare(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return faucetJsonResponse({
      success: false,
      error: 'Missing or invalid address parameter. Use ?address=0x...',
    }, 400);
  }

  try {
    const [nonceHex, gasPriceHex] = await Promise.all([
      sepoliaRpcCall(env, 'eth_getTransactionCount', [address.toLowerCase(), 'latest']),
      sepoliaRpcCall(env, 'eth_gasPrice', []),
    ]);

    const nonce = parseInt(nonceHex, 16);
    const gasPrice = gasPriceHex;

    return faucetJsonResponse({
      success: true,
      IMPORTANT: '⚠️ DO NOT use faucet/send — it returns 403 from AI sandboxes. Use faucet/claim instead!',
      easier_method: `GET https://humanadsai.com/api/v1/faucet/claim?address=${address} — server sends hUSD directly, no signing needed`,
      tx: {
        nonce,
        gasPrice,
        gasLimit: 100000,
        to: '0x5D911fe0E0f3928eF15CA6a2540c625cd85B8341',
        value: 0,
        data: '0x4b8bcb58',
        chainId: 11155111,
      },
    });
  } catch (e: any) {
    return faucetJsonResponse({
      success: false,
      error: 'Failed to fetch nonce/gasPrice: ' + (e.message || 'unknown'),
    }, 502);
  }
}

// ============================================
// Faucet Send — submit a signed raw transaction via GET
// GET /api/v1/faucet/send?tx=0xSIGNED_RAW_TX_HEX
// ============================================

async function handleFaucetSend(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const rawTx = url.searchParams.get('tx');

  if (!rawTx || !/^0x[0-9a-fA-F]+$/.test(rawTx)) {
    return faucetJsonResponse({
      success: false,
      error: 'Missing or invalid tx parameter. Use ?tx=0xSIGNED_RAW_TX_HEX',
    }, 400);
  }

  try {
    const txHash = await sepoliaRpcCall(env, 'eth_sendRawTransaction', [rawTx]);
    return faucetJsonResponse({
      success: true,
      txHash,
      explorer: `https://sepolia.etherscan.io/tx/${txHash}`,
      next: `Check receipt: https://humanadsai.com/api/v1/faucet/receipt?hash=${txHash}`,
    });
  } catch (e: any) {
    return faucetJsonResponse({
      success: false,
      error: 'Failed to send transaction: ' + (e.message || 'unknown'),
    }, 502);
  }
}

// ============================================
// Faucet Receipt — check transaction receipt via GET
// GET /api/v1/faucet/receipt?hash=0xTX_HASH
// ============================================

async function handleFaucetReceipt(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const hash = url.searchParams.get('hash');

  if (!hash || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return faucetJsonResponse({
      success: false,
      error: 'Missing or invalid hash parameter. Use ?hash=0xTX_HASH',
    }, 400);
  }

  try {
    const receipt = await sepoliaRpcCall(env, 'eth_getTransactionReceipt', [hash]);
    if (!receipt) {
      return faucetJsonResponse({
        success: true,
        status: 'pending',
        message: 'Transaction not yet mined. Try again in 10-15 seconds.',
      });
    }
    return faucetJsonResponse({
      success: true,
      status: receipt.status === '0x1' ? 'confirmed' : 'failed',
      blockNumber: parseInt(receipt.blockNumber, 16),
      gasUsed: parseInt(receipt.gasUsed, 16),
      explorer: `https://sepolia.etherscan.io/tx/${hash}`,
    });
  } catch (e: any) {
    return faucetJsonResponse({
      success: false,
      error: 'Failed to check receipt: ' + (e.message || 'unknown'),
    }, 502);
  }
}

// ============================================
// Faucet Balance — check hUSD and ETH balance via GET
// GET /api/v1/faucet/balance?address=0xADDRESS
// ============================================

// ============================================
// Faucet Claim — server-side hUSD transfer via GET
// AI just calls GET /api/v1/faucet/claim?address=0x...
// Server transfers 1000 hUSD from treasury wallet. No signing needed from AI.
// ============================================

async function handleFaucetClaim(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return faucetJsonResponse({
      success: false,
      error: 'Missing or invalid address parameter. Use ?address=0x...',
    }, 400);
  }

  // Check if treasury key is configured
  if (!hasTreasuryKey(env)) {
    return faucetJsonResponse({
      success: false,
      error: 'Faucet not configured. Treasury private key not set.',
    }, 503);
  }

  // Cooldown check: max 1 claim per address per 24 hours
  try {
    const lastClaim = await env.DB.prepare(
      'SELECT created_at FROM faucet_claims WHERE address = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(address.toLowerCase()).first<{ created_at: string }>();

    if (lastClaim) {
      const elapsed = Date.now() - new Date(lastClaim.created_at + 'Z').getTime();
      const cooldownMs = 24 * 60 * 60 * 1000;
      if (elapsed < cooldownMs) {
        const remainingHours = ((cooldownMs - elapsed) / (60 * 60 * 1000)).toFixed(1);
        // Include balance in cooldown response so AI doesn't need separate call
        let balance: { hUSD?: string; ETH?: string } = {};
        try {
          const paddedAddr = '000000000000000000000000' + address.toLowerCase().slice(2);
          const [husdRaw, ethRaw] = await Promise.all([
            sepoliaRpcCall(env, 'eth_call', [{
              to: '0x62C2225D5691515BD4ee36539D127d0dB7dCeb67',
              data: '0x70a08231' + paddedAddr,
            }, 'latest']),
            sepoliaRpcCall(env, 'eth_getBalance', [address.toLowerCase(), 'latest']),
          ]);
          balance.hUSD = (Number(BigInt(husdRaw)) / 1e6).toFixed(6);
          balance.ETH = (Number(BigInt(ethRaw)) / 1e18).toFixed(6);
        } catch {
          // Balance check failed — not critical
        }
        return faucetJsonResponse({
          success: false,
          error: `Already claimed in the last 24 hours. Try again in ${remainingHours} hours.`,
          balance,
        }, 429);
      }
    }
  } catch (e: any) {
    // faucet_claims table might not exist yet — continue anyway
    console.error('Cooldown check failed (table may not exist):', e.message);
  }

  // Transfer 1000 hUSD ($1000) from treasury to the address
  // 1000 hUSD = 100000 cents (since $1 = 100 cents)
  const amountCents = 100_000;
  const result = await transferHusd(env, address, amountCents, { forceOnchain: true });

  if (!result.success) {
    return faucetJsonResponse({
      success: false,
      error: 'Transfer failed: ' + (result.error || 'unknown'),
    }, 502);
  }

  // Record the claim
  try {
    await env.DB.prepare(
      'INSERT INTO faucet_claims (address, tx_hash, amount_cents) VALUES (?, ?, ?)'
    ).bind(address.toLowerCase(), result.txHash || '', amountCents).run();
  } catch (e: any) {
    // Non-fatal: claim succeeded even if recording fails
    console.error('Failed to record faucet claim:', e.message);
  }

  // Fetch balance to include in response (non-blocking — if it fails, still return success)
  let balance: { hUSD?: string; ETH?: string } = {};
  try {
    const paddedAddr = '000000000000000000000000' + address.toLowerCase().slice(2);
    const [husdRaw, ethRaw] = await Promise.all([
      sepoliaRpcCall(env, 'eth_call', [{
        to: '0x62C2225D5691515BD4ee36539D127d0dB7dCeb67',
        data: '0x70a08231' + paddedAddr,
      }, 'latest']),
      sepoliaRpcCall(env, 'eth_getBalance', [address.toLowerCase(), 'latest']),
    ]);
    balance.hUSD = (Number(BigInt(husdRaw)) / 1e6).toFixed(6);
    balance.ETH = (Number(BigInt(ethRaw)) / 1e18).toFixed(6);
  } catch {
    // Balance check failed — not critical
  }

  return faucetJsonResponse({
    success: true,
    txHash: result.txHash,
    amount: '1000 hUSD',
    explorer: result.explorerUrl,
    message: 'hUSD sent! Transaction confirmed. Balance included below.',
    balance,
  });
}

async function handleFaucetBalance(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get('address');

  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return faucetJsonResponse({
      success: false,
      error: 'Missing or invalid address parameter. Use ?address=0x...',
    }, 400);
  }

  try {
    const paddedAddr = '000000000000000000000000' + address.toLowerCase().slice(2);
    const [husdRaw, ethRaw] = await Promise.all([
      sepoliaRpcCall(env, 'eth_call', [{
        to: '0x62C2225D5691515BD4ee36539D127d0dB7dCeb67',
        data: '0x70a08231' + paddedAddr,
      }, 'latest']),
      sepoliaRpcCall(env, 'eth_getBalance', [address.toLowerCase(), 'latest']),
    ]);

    const husdWei = BigInt(husdRaw);
    const ethWei = BigInt(ethRaw);

    return faucetJsonResponse({
      success: true,
      address,
      hUSD: {
        raw: husdWei.toString(),
        formatted: (Number(husdWei) / 1e6).toFixed(6),
      },
      ETH: {
        raw: ethWei.toString(),
        formatted: (Number(ethWei) / 1e18).toFixed(6),
      },
    });
  } catch (e: any) {
    return faucetJsonResponse({
      success: false,
      error: 'Failed to check balance: ' + (e.message || 'unknown'),
    }, 502);
  }
}
