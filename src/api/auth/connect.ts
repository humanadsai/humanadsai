/**
 * Connect & Dashboard Routes
 *
 * /connect - Immediate redirect to X OAuth (no intermediate UI)
 * /dashboard - Authenticated user dashboard with Bio Code verification
 */

import type { Env } from '../../types';
import { sha256Hex } from '../../utils/crypto';

/**
 * Get session from cookie
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
 * Verify session and get operator info
 */
async function getAuthenticatedOperator(request: Request, env: Env): Promise<{
  id: string;
  x_handle: string;
  display_name: string;
  status: string;
} | null> {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) return null;

  const sessionHash = await sha256Hex(sessionToken);

  const operator = await env.DB.prepare(`
    SELECT id, x_handle, display_name, status
    FROM operators
    WHERE session_token_hash = ?
      AND session_expires_at > datetime('now')
  `)
    .bind(sessionHash)
    .first<{ id: string; x_handle: string; display_name: string; status: string }>();

  return operator || null;
}

/**
 * GET /connect
 *
 * - If not authenticated: redirect to /auth/x/login
 * - If authenticated: redirect to /dashboard
 */
export async function handleConnect(request: Request, env: Env): Promise<Response> {
  console.log('[Connect] Checking authentication...');

  const operator = await getAuthenticatedOperator(request, env);

  if (operator) {
    console.log('[Connect] User already authenticated:', operator.x_handle);
    return Response.redirect(new URL('/dashboard', request.url).toString(), 302);
  }

  console.log('[Connect] Not authenticated, redirecting to X OAuth...');
  return Response.redirect(new URL('/auth/x/login', request.url).toString(), 302);
}

/**
 * GET /dashboard
 *
 * - If not authenticated: redirect to /connect
 * - If authenticated: show dashboard with Bio Code verification option
 */
export async function handleDashboard(request: Request, env: Env): Promise<Response> {
  console.log('[Dashboard] Checking authentication...');

  const operator = await getAuthenticatedOperator(request, env);

  if (!operator) {
    console.log('[Dashboard] Not authenticated, redirecting to /connect');
    return Response.redirect(new URL('/connect', request.url).toString(), 302);
  }

  console.log('[Dashboard] Authenticated user:', operator.x_handle);

  // Return dashboard HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | HumanAds</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
      min-height: 100vh;
      color: #fff;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding-top: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      margin: 0 auto 16px;
    }
    .username {
      font-size: 24px;
      font-weight: 600;
      color: #00d4ff;
    }
    .handle {
      font-size: 16px;
      color: rgba(255,255,255,0.6);
      margin-top: 4px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 12px;
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.3);
    }
    .card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .card-subtitle {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      margin-bottom: 20px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
      color: #000;
      border: none;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.15);
    }
    .missions-empty {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255,255,255,0.5);
    }
    .logout-link {
      display: block;
      text-align: center;
      color: rgba(255,255,255,0.4);
      font-size: 14px;
      margin-top: 40px;
      text-decoration: none;
    }
    .logout-link:hover {
      color: rgba(255,255,255,0.6);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="avatar">${(operator.display_name || operator.x_handle || 'U').charAt(0).toUpperCase()}</div>
      <div class="username">${operator.display_name || operator.x_handle}</div>
      <div class="handle">@${operator.x_handle}</div>
      <div class="status-badge">X Connected</div>
    </div>

    <div class="card">
      <div class="card-title">Available Missions</div>
      <div class="card-subtitle">Complete missions to earn rewards</div>
      <div class="missions-empty">
        No missions available yet.<br>
        Check back soon!
      </div>
    </div>

    <div class="card">
      <div class="card-title">Invite & Verify</div>
      <div class="card-subtitle">Boost reach by sharing your Bio Code with friends</div>
      <a href="/operator/register" class="btn btn-secondary">Verify with Bio Code</a>
    </div>

    <a href="/auth/logout" class="logout-link">Sign out</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
