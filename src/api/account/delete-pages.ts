/**
 * Account Deletion Pages Handler
 *
 * GET /settings/account/delete - Explanation page with status check
 * GET /settings/account/delete/confirm - Final confirmation page
 *
 * No modals - pure page navigation for iOS Safari compatibility.
 */

import type { Env } from '../../types';
import { sha256Hex } from '../../utils/crypto';

interface Operator {
  id: string;
  x_handle: string | null;
  display_name: string | null;
}

interface DeleteStatus {
  canDelete: boolean;
  activeMissions: number;
  pendingPayouts: number;
}

/**
 * Get session token from cookie
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
 * Get authenticated operator from session
 */
async function getAuthenticatedOperator(request: Request, env: Env): Promise<Operator | null> {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) return null;

  const sessionHash = await sha256Hex(sessionToken);

  try {
    const operator = await env.DB.prepare(`
      SELECT id, x_handle, display_name
      FROM operators
      WHERE session_token_hash = ?
        AND session_expires_at > datetime('now')
        AND status != 'deleted'
    `).bind(sessionHash).first<Operator>();

    return operator || null;
  } catch (e) {
    console.error('[Delete Pages] Auth error:', e);
    return null;
  }
}

/**
 * Check if account can be deleted
 */
async function getDeleteStatus(env: Env, operatorId: string): Promise<DeleteStatus> {
  let activeMissions = 0;
  let pendingPayouts = 0;

  try {
    const missions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM missions
      WHERE operator_id = ?
        AND status IN ('accepted', 'submitted', 'verified')
    `).bind(operatorId).first<{ count: number }>();
    activeMissions = missions?.count || 0;
  } catch (e) {
    console.error('[Delete Status] Missions query error:', e);
  }

  try {
    const balance = await env.DB.prepare(`
      SELECT pending FROM balances
      WHERE owner_type = 'operator' AND owner_id = ?
    `).bind(operatorId).first<{ pending: number }>();
    pendingPayouts = balance?.pending || 0;
  } catch (e) {
    console.error('[Delete Status] Balance query error:', e);
  }

  return {
    canDelete: activeMissions === 0 && pendingPayouts === 0,
    activeMissions,
    pendingPayouts,
  };
}

/**
 * Common page styles
 */
const pageStyles = `
  :root {
    --color-bg: #0a0a0f;
    --color-surface: rgba(255, 255, 255, 0.05);
    --color-border: rgba(255, 255, 255, 0.1);
    --color-primary: #FF6B35;
    --color-danger: #ef4444;
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
    padding: 20px;
    -webkit-tap-highlight-color: transparent;
  }
  .container {
    max-width: 480px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 32px 24px;
  }
  .title {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--color-danger);
  }
  .subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
  .warning-box {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  .warning-title {
    font-weight: 600;
    color: var(--color-danger);
    margin-bottom: 12px;
    font-size: 0.875rem;
  }
  .warning-list {
    list-style: none;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }
  .warning-list li {
    padding-left: 20px;
    position: relative;
    margin-bottom: 8px;
  }
  .warning-list li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--color-danger);
  }
  .status-box {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  .status-ok {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.1);
  }
  .status-blocked {
    border-color: rgba(239, 68, 68, 0.3);
    background: rgba(239, 68, 68, 0.1);
  }
  .status-title {
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  .status-ok .status-title { color: #22c55e; }
  .status-blocked .status-title { color: var(--color-danger); }
  .status-text {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }
  .blocker-item {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
  }
  .blocker-item a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }
  .blocker-item a:hover {
    text-decoration: underline;
  }
  .btn-group {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 24px;
    border-radius: 10px;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    text-align: center;
    min-height: 48px;
    -webkit-appearance: none;
  }
  .btn-secondary {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .btn-danger {
    background: var(--color-danger);
    color: #fff;
  }
  .btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
  .btn-danger:disabled {
    background: rgba(239, 68, 68, 0.3);
    cursor: not-allowed;
    transform: none;
  }
  .confirm-section {
    margin-bottom: 24px;
  }
  .confirm-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 12px;
  }
  .confirm-label strong {
    color: var(--color-text);
  }
  .confirm-input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: 1rem;
    outline: none;
    -webkit-appearance: none;
  }
  .confirm-input:focus {
    border-color: var(--color-danger);
  }
  .confirm-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  .error-box {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 16px;
    font-size: 0.8125rem;
    color: var(--color-danger);
    display: none;
  }
  .success-box {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
  }
  .success-title {
    font-weight: 600;
    color: #22c55e;
    margin-bottom: 8px;
  }
  .success-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 16px;
  }
  @media (max-width: 480px) {
    .container { padding: 20px 16px; }
    .card { padding: 24px 20px; }
    .btn-group { flex-direction: column; }
  }
`;

/**
 * GET /settings/account/delete
 * Page 1: Explanation and status check
 */
export async function handleDeletePage(request: Request, env: Env): Promise<Response> {
  const operator = await getAuthenticatedOperator(request, env);

  if (!operator) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/auth/x/login?redirect=/settings/account/delete' },
    });
  }

  const status = await getDeleteStatus(env, operator.id);

  const statusHtml = status.canDelete
    ? `
      <div class="status-box status-ok">
        <div class="status-title">Ready to delete</div>
        <div class="status-text">Your account can be deleted. Click Continue to proceed to the final confirmation.</div>
      </div>
    `
    : `
      <div class="status-box status-blocked">
        <div class="status-title">Deletion blocked</div>
        <div class="status-text">Please resolve the following before deleting your account:</div>
        ${status.activeMissions > 0 ? `
          <div class="blocker-item">
            <strong>Active missions (${status.activeMissions})</strong><br>
            Complete or cancel your active missions first.<br>
            <a href="/dashboard">View your missions</a>
          </div>
        ` : ''}
        ${status.pendingPayouts > 0 ? `
          <div class="blocker-item">
            <strong>Pending payouts ($${(status.pendingPayouts / 100).toFixed(2)})</strong><br>
            Wait for pending payouts to complete, or contact support.<br>
            <a href="mailto:support@humanads.ai">Contact support</a>
          </div>
        ` : ''}
      </div>
    `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Delete Account | HumanAds</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>${pageStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1 class="title">Delete Account</h1>
      <p class="subtitle">This action cannot be undone.</p>

      <div class="warning-box">
        <div class="warning-title">What happens when you delete your account:</div>
        <ul class="warning-list">
          <li>Your profile will be removed from Available Humans</li>
          <li>You will not be able to log in to HumanAds with this X account again</li>
          <li>Mission history will be anonymized</li>
          <li>Wallet addresses linked to this account will be deleted</li>
        </ul>
      </div>

      ${statusHtml}

      <div class="btn-group">
        <a href="/dashboard" class="btn btn-secondary">Back</a>
        ${status.canDelete
          ? `<a href="/settings/account/delete/confirm" class="btn btn-danger">Continue</a>`
          : `<span class="btn btn-danger" style="pointer-events: none; opacity: 0.5;">Continue</span>`
        }
      </div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

/**
 * GET /settings/account/delete/confirm
 * Page 2: Final confirmation with DELETE input
 */
export async function handleDeleteConfirmPage(request: Request, env: Env): Promise<Response> {
  const operator = await getAuthenticatedOperator(request, env);

  if (!operator) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/auth/x/login?redirect=/settings/account/delete' },
    });
  }

  const status = await getDeleteStatus(env, operator.id);

  // If can't delete, redirect back to first page
  if (!status.canDelete) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/settings/account/delete' },
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Confirm Deletion | HumanAds</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>${pageStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1 class="title">Confirm Deletion</h1>
      <p class="subtitle">This is your final confirmation.</p>

      <div class="warning-box">
        <div class="warning-title">This action cannot be undone</div>
        <ul class="warning-list">
          <li>Your account and all associated data will be permanently deleted</li>
          <li>You will be logged out immediately</li>
        </ul>
      </div>

      <form id="delete-form" method="POST" action="/api/account/delete">
        <div class="confirm-section">
          <div class="confirm-label">Type <strong>DELETE</strong> to confirm:</div>
          <input
            type="text"
            id="confirm-input"
            name="confirmText"
            class="confirm-input"
            placeholder="DELETE"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            required
          >
        </div>

        <div id="error-box" class="error-box"></div>

        <div class="btn-group">
          <a href="/settings/account/delete" class="btn btn-secondary">Cancel</a>
          <button type="submit" id="delete-btn" class="btn btn-danger" disabled>Permanently Delete</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    (function() {
      var input = document.getElementById('confirm-input');
      var btn = document.getElementById('delete-btn');
      var form = document.getElementById('delete-form');
      var errorBox = document.getElementById('error-box');

      function checkInput() {
        var value = input.value.trim().toUpperCase();
        btn.disabled = value !== 'DELETE';
      }

      input.addEventListener('input', checkInput);
      input.addEventListener('keyup', checkInput);

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        var value = input.value.trim().toUpperCase();
        if (value !== 'DELETE') {
          errorBox.textContent = 'Please type DELETE to confirm.';
          errorBox.style.display = 'block';
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Deleting...';
        errorBox.style.display = 'none';

        fetch('/api/account/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ confirmText: 'DELETE' })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            // Redirect to success page or home
            window.location.href = '/settings/account/deleted';
          } else {
            errorBox.textContent = data.error?.message || 'Failed to delete account. Please try again.';
            errorBox.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Permanently Delete';
          }
        })
        .catch(function(err) {
          errorBox.textContent = 'Network error. Please check your connection and try again.';
          errorBox.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Permanently Delete';
        });
      });
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

/**
 * GET /settings/account/deleted
 * Success page after account deletion
 */
export async function handleDeletedPage(request: Request, env: Env): Promise<Response> {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Account Deleted | HumanAds</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>${pageStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="success-box">
        <div class="success-title">Account Deleted</div>
        <div class="success-text">
          Your account has been permanently deleted.<br>
          Thank you for using HumanAds.
        </div>
        <a href="/" class="btn btn-secondary" style="display: inline-flex;">Return to Home</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}
