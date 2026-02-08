/**
 * Dashboard Route Handler
 *
 * GET /dashboard - Shows authenticated user dashboard
 */

import type { Env } from '../../types';
import { sha256Hex } from '../../utils/crypto';

interface Operator {
  id: string;
  x_user_id: string;
  x_handle: string;
  display_name: string | null;
  status: string;
  // Extended X profile fields (from DB, not API)
  x_profile_image_url: string | null;
  x_verified: number;
  x_verified_type: string | null;
  x_followers_count: number;
  x_following_count: number;
  // Post verification status (legacy)
  verify_status: string;
  // Invite system
  invite_code: string | null;
  invite_count: number;
}

interface Stats {
  site_access: number;
  human_promoters: number;
  ai_connected: number;
}

/**
 * Get session token from cookie
 */
function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    const name = cookie.substring(0, eqIdx);
    const value = cookie.substring(eqIdx + 1);
    if (name === 'session') {
      return value;
    }
  }
  return null;
}

/**
 * Verify session and get operator
 */
async function getAuthenticatedOperator(request: Request, env: Env): Promise<Operator | null> {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    console.log('[Dashboard] No session token found');
    return null;
  }

  const sessionHash = await sha256Hex(sessionToken);

  try {
    // First check if operators table exists
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='operators'"
    ).first<{ name: string }>();

    if (!tables) {
      console.error('[Dashboard] FATAL: operators table does not exist');
      // Return special marker to show error page instead of redirect loop
      return { id: '__DB_ERROR__', x_user_id: '', x_handle: '', display_name: null, status: 'error', x_profile_image_url: null, x_verified: 0, x_verified_type: null, x_followers_count: 0, x_following_count: 0, verify_status: 'not_started', invite_code: null, invite_count: 0 } as Operator;
    }

    // Check if ALL new columns exist (for backward compatibility)
    // Check for the last column in the migration to ensure full migration was applied
    const hasAllNewColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'x_connected_at'"
    ).first<{ count: number }>();
    const useExtendedSchema = (hasAllNewColumns?.count || 0) > 0;

    // Check if verify_status column exists (separate migration)
    const hasVerifyStatus = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'verify_status'"
    ).first<{ count: number }>();
    const hasVerifyColumn = (hasVerifyStatus?.count || 0) > 0;

    // Check if invite_code column exists (invite system migration)
    const hasInviteCode = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'invite_code'"
    ).first<{ count: number }>();
    const hasInviteColumn = (hasInviteCode?.count || 0) > 0;

    // Fetch operator (with extended fields if available)
    let operator: Operator | null;
    if (useExtendedSchema) {
      // Build query dynamically based on column existence
      const verifySelect = hasVerifyColumn
        ? "COALESCE(verify_status, 'not_started') as verify_status"
        : "'not_started' as verify_status";

      const inviteSelect = hasInviteColumn
        ? "invite_code, COALESCE(invite_count, 0) as invite_count"
        : "NULL as invite_code, 0 as invite_count";

      operator = await env.DB.prepare(`
        SELECT id, x_user_id, x_handle, display_name, status,
               x_profile_image_url, x_verified, x_verified_type,
               x_followers_count, x_following_count,
               ${verifySelect},
               ${inviteSelect}
        FROM operators
        WHERE session_token_hash = ?
          AND session_expires_at > datetime('now')
      `)
        .bind(sessionHash)
        .first<Operator>();
    } else {
      // Fallback: basic fields only
      const basicOperator = await env.DB.prepare(`
        SELECT id, x_user_id, x_handle, display_name, status
        FROM operators
        WHERE session_token_hash = ?
          AND session_expires_at > datetime('now')
      `)
        .bind(sessionHash)
        .first<{ id: string; x_user_id: string; x_handle: string; display_name: string | null; status: string }>();

      // Add default values for extended fields
      operator = basicOperator ? {
        ...basicOperator,
        x_profile_image_url: null,
        x_verified: 0,
        x_verified_type: null,
        x_followers_count: 0,
        x_following_count: 0,
        verify_status: 'not_started',
        invite_code: null,
        invite_count: 0,
      } : null;
    }

    if (!operator) {
      console.log('[Dashboard] Session invalid or expired');
      return null;
    }

    console.log('[Dashboard] Authenticated user:', operator.x_handle, 'followers:', operator.x_followers_count);
    return operator;
  } catch (e) {
    console.error('[Dashboard] DB error checking session:', e);
    // Return special marker to show error page
    return { id: '__DB_ERROR__', x_user_id: '', x_handle: '', display_name: null, status: 'error', x_profile_image_url: null, x_verified: 0, x_verified_type: null, x_followers_count: 0, x_following_count: 0, verify_status: 'not_started', invite_code: null, invite_count: 0 } as Operator;
  }
}

/**
 * Format count for display (K/M suffix)
 */
function formatCount(count: number | null | undefined): string {
  if (count === null || count === undefined) {
    return '—';
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(2) + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Get dashboard stats
 */
async function getStats(env: Env): Promise<Stats> {
  try {
    // Human Promoters = operators with x_user_id
    const promotersResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM operators WHERE x_user_id IS NOT NULL`
    ).first<{ count: number }>();

    return {
      site_access: 24800, // TODO: Implement actual tracking
      human_promoters: promotersResult?.count || 0,
      ai_connected: 0, // TODO: Implement when AI agents are connected
    };
  } catch (e) {
    console.error('[Dashboard] Error fetching stats:', e);
    return {
      site_access: 24800,
      human_promoters: 0,
      ai_connected: 0,
    };
  }
}

/**
 * GET /dashboard
 */
export async function handleDashboard(request: Request, env: Env): Promise<Response> {
  console.log('[Dashboard] Checking authentication...');

  const operator = await getAuthenticatedOperator(request, env);

  // Check for DB error (prevents redirect loop when operators table doesn't exist)
  if (operator && operator.id === '__DB_ERROR__') {
    console.log('[Dashboard] Database error detected, showing error page');
    return new Response(generateErrorHTML(), {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  if (!operator) {
    console.log('[Dashboard] Not authenticated, redirecting to X login');
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/auth/x/login',
      },
    });
  }

  const stats = await getStats(env);

  const html = generateDashboardHTML(operator, stats);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

/**
 * Generate error HTML when database is not initialized
 */
function generateErrorHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Unavailable | HumanAds</title>
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
      <path d="M32 20V36" stroke="#FF6B35" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="44" r="2" fill="#FF6B35"/>
    </svg>
    <h1 class="error-title">Service Temporarily Unavailable</h1>
    <p class="error-message">
      The database is being set up. Please try again in a few moments.
      If this issue persists, please contact support.
    </p>
    <a href="/" class="btn">Back to Home</a>
  </div>
</body>
</html>`;
}

/**
 * Generate dashboard HTML
 */
function generateDashboardHTML(operator: Operator, stats: Stats): string {
  const displayName = operator.display_name || operator.x_handle;
  const initial = displayName.charAt(0).toUpperCase();
  const hasProfileImage = !!operator.x_profile_image_url;
  const isVerified = operator.x_verified === 1;

  // Avatar HTML: use X profile image if available, fallback to initial
  const avatarHtml = hasProfileImage
    ? `<img src="${operator.x_profile_image_url}" alt="" class="user-avatar-img">`
    : `<span class="user-avatar">${initial}</span>`;

  // Verified badge HTML
  const verifiedBadge = isVerified
    ? `<svg class="verified-badge" viewBox="0 0 22 22" fill="none"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" fill="#1d9bf0"/></svg>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | HumanAds</title>
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
      --color-cyan: #00d4ff;
      --color-green: #00ff88;
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
    }

    .app {
      max-width: 600px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--color-border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--color-text);
    }

    .logo-icon { width: 32px; height: 32px; }

    .logo-text {
      font-family: var(--font-mono);
      font-size: 1.125rem;
      font-weight: 700;
    }

    .verified-badge {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Profile Header */
    .profile-header {
      padding: 16px 0;
    }

    .profile-identity-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
    }

    .profile-identity-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .profile-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-cyan), var(--color-green));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      color: #000;
      flex-shrink: 0;
    }

    .profile-avatar-img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
    }

    .profile-identity-info {
      flex: 1;
      min-width: 0;
    }

    .profile-display-name {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .profile-handle {
      font-size: 0.875rem;
      color: var(--color-cyan);
    }

    .profile-influence {
      display: flex;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border);
    }

    .influence-stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .influence-value {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .influence-label {
      font-size: 0.625rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .profile-verification-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
    }

    .verification-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .verification-icon {
      width: 20px;
      height: 20px;
      color: var(--color-cyan);
    }

    .verification-title {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .verification-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .verification-stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .verification-stat-value {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-cyan);
    }

    .verification-stat-label {
      font-size: 0.625rem;
      color: var(--color-text-muted);
    }

    .verification-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(0, 212, 255, 0.1);
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-cyan);
    }

    .status-dot.pending { background: #FFA500; }
    .status-dot.verified { background: var(--color-green); }

    .status-text {
      font-size: 0.75rem;
      color: var(--color-text);
    }

    .btn-small {
      padding: 10px 16px;
      font-size: 0.75rem;
    }

    /* X Profile Link */
    .x-profile-link {
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      color: inherit;
      transition: opacity 0.2s;
    }

    .x-profile-link:hover {
      opacity: 0.8;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      width: 100%;
    }

    .btn-primary {
      background: var(--color-primary);
      color: #fff;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
    }

    .btn-arrow { font-size: 1rem; }

    /* Missions Section */
    .missions-section {
      padding: 24px 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .section-title {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 700;
    }

    .section-title .highlight { color: var(--color-primary); }

    .section-subtitle {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 6px;
      line-height: 1.4;
      max-width: 280px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sample-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      background: rgba(255, 165, 0, 0.2);
      border: 1px solid rgba(255, 165, 0, 0.4);
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.625rem;
      font-weight: 600;
      color: #FFA500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 8px;
    }

    .sample-notice {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      font-style: italic;
      margin-top: 4px;
    }

    .mission-sample-badge {
      display: inline-flex;
      padding: 2px 6px;
      background: rgba(255, 165, 0, 0.2);
      border-radius: 3px;
      font-family: var(--font-mono);
      font-size: 0.5rem;
      font-weight: 600;
      color: #FFA500;
      text-transform: uppercase;
      margin-left: 8px;
      vertical-align: middle;
    }

    .view-all-link {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-decoration: none;
    }

    .view-all-link:hover { color: var(--color-primary); }

    /* Mission Cards - matching main site */
    .missions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .mission-item {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 16px;
    }

    .mission-item-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .badge-sample {
      height: 18px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 6px;
      border-radius: 4px;
      font-size: 10px;
      line-height: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
      background: linear-gradient(135deg, #FF6B35 0%, #FFB347 100%);
      color: #000;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.02); }
    }

    .badge-disclosure {
      height: 18px;
      display: inline-flex;
      align-items: center;
      padding: 0 6px;
      border-radius: 4px;
      font-size: 10px;
      line-height: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
      background: rgba(120, 74, 44, 0.55);
      border: 1px solid rgba(255, 126, 54, 0.35);
      color: rgba(255, 210, 180, 0.95);
    }

    .badge-type {
      height: 18px;
      display: inline-flex;
      align-items: center;
      padding: 0 6px;
      border-radius: 4px;
      font-size: 10px;
      line-height: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
      background: rgba(0, 160, 190, 0.28);
      border: 1px solid rgba(0, 160, 190, 0.35);
      color: rgba(180, 245, 255, 0.95);
    }

    .mission-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
    }

    .mission-item-title {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.4;
      flex: 1;
    }

    .mission-item-fee {
      text-align: right;
      flex-shrink: 0;
    }

    .mission-item-amount {
      font-family: var(--font-mono);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-green);
      display: block;
    }

    .mission-item-fee-label {
      font-size: 0.65rem;
      color: var(--color-text-muted);
    }

    .mission-item-agent {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 8px;
    }

    .mission-item-description {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .mission-item-approval {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      padding: 8px 12px;
      background: rgba(0, 255, 136, 0.08);
      border-radius: 6px;
      margin-bottom: 12px;
    }

    .mission-item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mission-item-slots {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .btn-accept {
      padding: 10px 20px;
      font-size: 0.75rem;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-accept:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
    }

    .btn-accept:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-accept.accepted {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
    }

    .missions-loading {
      text-align: center;
      padding: 32px 0;
      color: var(--color-text-muted);
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-title {
      font-family: var(--font-mono);
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .empty-text {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    /* Status Badges */
    .status-badge {
      height: 18px;
      display: inline-flex;
      align-items: center;
      padding: 0 6px;
      border-radius: 4px;
      font-size: 10px;
      line-height: 10px;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .status-accepted {
      background: rgba(33, 150, 243, 0.25);
      border: 1px solid rgba(33, 150, 243, 0.4);
      color: #64B5F6;
    }

    .status-submitted {
      background: rgba(255, 152, 0, 0.25);
      border: 1px solid rgba(255, 152, 0, 0.4);
      color: #FFB74D;
    }

    .status-paid {
      background: rgba(76, 175, 80, 0.25);
      border: 1px solid rgba(76, 175, 80, 0.4);
      color: #81C784;
    }

    .status-rejected {
      background: rgba(244, 67, 54, 0.25);
      border: 1px solid rgba(244, 67, 54, 0.4);
      color: #E57373;
    }

    .status-applied {
      background: rgba(33, 150, 243, 0.25);
      border: 1px solid rgba(33, 150, 243, 0.4);
      color: #64B5F6;
    }

    .status-paid-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-green);
    }

    .status-pending-label {
      font-size: 0.75rem;
      color: #FFB74D;
    }

    .status-rejected-label {
      font-size: 0.75rem;
      color: #E57373;
    }

    .mission-item-date {
      font-size: 0.7rem;
      color: var(--color-text-muted);
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.85rem;
    }

    .alert-success {
      background: rgba(0, 255, 136, 0.15);
      border: 1px solid rgba(0, 255, 136, 0.3);
      color: var(--color-green);
    }

    .alert-error {
      background: rgba(255, 68, 68, 0.15);
      border: 1px solid rgba(255, 68, 68, 0.3);
      color: #FF4444;
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }

    .btn-secondary:hover {
      background: var(--color-surface);
      border-color: var(--color-primary);
    }

    /* Footer */
    .footer {
      padding: 24px 0;
      text-align: center;
      border-top: 1px solid var(--color-border);
      margin-top: 24px;
    }

    .footer-links {
      margin-bottom: 8px;
    }

    .footer-links a {
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 0.75rem;
    }

    .footer-links a:hover { color: var(--color-primary); }

    .footer-divider {
      color: var(--color-border);
      margin: 0 8px;
    }

    .footer p {
      font-size: 0.625rem;
      color: var(--color-text-muted);
    }

    .footer-disclaimer {
      font-size: 0.5rem;
      max-width: 500px;
      margin: 0 auto 8px;
      line-height: 1.4;
    }

    .logout-link {
      display: block;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      margin-top: 16px;
      text-decoration: none;
    }

    .logout-link:hover { color: var(--color-primary); }

    .delete-link {
      display: block;
      width: 100%;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.7rem;
      font-family: var(--font-sans);
      margin-top: 8px;
      text-decoration: none;
      opacity: 0.6;
      padding: 8px;
      background: none;
      border: none;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
    }

    .delete-link:hover,
    .delete-link:active { color: #FF4444; opacity: 1; }

    /* Hamburger Menu */
    .hamburger-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      padding: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 1001;
    }

    .hamburger-line {
      display: block;
      width: 24px;
      height: 2px;
      background: var(--color-text);
      transition: all 0.3s;
    }

    .hamburger-btn.open .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger-btn.open .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .hamburger-btn.open .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    .hamburger-menu {
      position: fixed;
      top: 0;
      right: -280px;
      width: 280px;
      height: 100vh;
      background: var(--color-bg);
      border-left: 1px solid var(--color-border);
      padding: 80px 24px 24px;
      transition: right 0.3s ease;
      z-index: 1000;
      overflow-y: auto;
    }

    .hamburger-menu.open {
      right: 0;
    }

    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      z-index: 999;
    }

    .menu-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .menu-item {
      display: block;
      padding: 14px 16px;
      color: var(--color-text);
      text-decoration: none;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .menu-item:hover {
      background: var(--color-surface);
    }

    .menu-item.active {
      color: var(--color-primary);
      background: rgba(255, 107, 53, 0.1);
    }

    .menu-item-danger {
      color: #FF4444;
    }

    .menu-item-danger:hover {
      background: rgba(255, 68, 68, 0.1);
    }
    .menu-section-label {
      display: block;
      padding: 8px 16px 4px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-muted);
      letter-spacing: 0.05em;
    }

    .menu-divider {
      height: 1px;
      background: var(--color-border);
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <a href="/" class="logo">
        <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" stroke="#FF6B35" stroke-width="3"/>
          <circle cx="14" cy="20" r="4" fill="#FF6B35"/>
          <path d="M22 16L32 20L22 24" stroke="#FF6B35" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="logo-text">HumanAds</span>
      </a>
      <button class="hamburger-btn" id="hamburger-btn" aria-label="Menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </header>

    <!-- Hamburger Menu (content managed by side-menu.js) -->
    <nav class="hamburger-menu" id="hamburger-menu" data-auto-init="false">
      <!-- Menu content rendered by SideMenu.init() -->
    </nav>
    <div class="menu-overlay" id="menu-overlay"></div>

    <!-- My Missions Section -->
    <section class="missions-section" id="my-missions">
      <div class="section-header">
        <div>
          <h2 class="section-title">
            My <span class="highlight">Missions</span>
          </h2>
          <p class="section-subtitle">Your active and completed missions</p>
        </div>
        <a href="/missions" class="view-all-link">Explore Missions →</a>
      </div>

      <!-- Alert container -->
      <div id="alert-container"></div>

      <!-- My Missions loaded from API -->
      <div class="missions-list" id="missions-list">
        <div class="missions-loading">
          <span class="spinner"></span>
          <p style="margin-top: 12px;">Loading your missions...</p>
        </div>
      </div>

      <!-- Empty state (hidden by default) -->
      <div class="empty-state" id="empty-state" style="display: none;">
        <div class="empty-icon">📋</div>
        <h3 class="empty-title">No missions yet</h3>
        <p class="empty-text">Apply to a mission to get started earning.</p>
        <a href="/missions" class="btn btn-primary" style="margin-top: 16px;">
          Explore Missions
        </a>
      </div>
    </section>

    <script src="/js/side-menu.js"></script>
    <script>
      // Initialize side menu (logged-in page)
      SideMenu.init(true);

      // Format currency
      function formatCurrency(cents) {
        return '$' + (cents / 100).toFixed(2);
      }

      // Escape HTML
      function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }

      // Show alert
      function showAlert(message, type) {
        const container = document.getElementById('alert-container');
        container.innerHTML = '';
        const alertEl = document.createElement('div');
        alertEl.className = 'alert alert-' + type;
        alertEl.textContent = message;
        container.appendChild(alertEl);
        setTimeout(() => { if (alertEl.parentNode) alertEl.remove(); }, 5000);
      }

      // Create my mission card
      function createMyMissionCard(mission) {
        const el = document.createElement('div');
        el.className = 'mission-item';

        // Status display
        let displayStatus = mission.status;
        if (mission.status === 'accepted') displayStatus = 'In Progress';
        const statusClass = 'status-' + mission.status;

        // Action button/link based on status
        let actionHtml = '';
        if (mission.status === 'accepted') {
          actionHtml = \`
            <a href="/missions/run.html?id=\${mission.id}" class="btn-accept">
              CREATE POST →
            </a>
          \`;
        } else if (mission.status === 'paid' || mission.status === 'paid_complete') {
          actionHtml = \`
            <span class="status-paid-label">Earned \${formatCurrency(mission.reward_amount)}</span>
          \`;
        } else if (mission.status === 'submitted') {
          actionHtml = \`
            <span class="status-pending-label">Awaiting verification</span>
          \`;
        } else if (mission.status === 'rejected') {
          actionHtml = \`
            <span class="status-rejected-label">Not approved</span>
          \`;
        }

        el.innerHTML = \`
          <div class="mission-item-header">
            <h3 class="mission-item-title">\${escapeHtml(mission.deal_title)}</h3>
            <span class="status-badge \${statusClass}">\${displayStatus}</span>
          </div>
          <p class="mission-item-description" style="margin-bottom: 8px;">
            Fixed fee: <strong>\${formatCurrency(mission.reward_amount)}</strong>
          </p>
          \${mission.submission_url ? \`
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 12px;">
              Submitted: <a href="\${escapeHtml(mission.submission_url)}" target="_blank" style="color: var(--color-primary);">View post</a>
            </p>
          \` : ''}
          <div class="mission-item-footer">
            <span class="mission-item-date">
              \${new Date(mission.created_at).toLocaleDateString()}
            </span>
            \${actionHtml}
          </div>
        \`;

        return el;
      }

      // Load my missions
      async function loadMyMissions() {
        const listEl = document.getElementById('missions-list');
        const emptyEl = document.getElementById('empty-state');

        try {
          const res = await fetch('/api/missions/my', { credentials: 'include' });
          const data = await res.json();

          if (data.success && data.data) {
            const missions = data.data.missions || [];
            const applications = data.data.applications || [];
            listEl.innerHTML = '';

            // Combine missions and applications
            const allItems = [...missions];

            if (allItems.length === 0 && applications.length === 0) {
              listEl.style.display = 'none';
              emptyEl.style.display = 'block';
              return;
            }

            // Show missions
            allItems.forEach(mission => {
              const card = createMyMissionCard(mission);
              listEl.appendChild(card);
            });

            // Show applications if any
            if (applications.length > 0) {
              applications.forEach(app => {
                const card = createApplicationCard(app);
                listEl.appendChild(card);
              });
            }
          } else {
            listEl.innerHTML = '<div class="missions-loading"><p>Failed to load missions.</p></div>';
          }
        } catch (e) {
          console.error('Failed to load missions:', e);
          listEl.innerHTML = '<div class="missions-loading"><p>Failed to load missions.</p></div>';
        }
      }

      // Create application card
      function createApplicationCard(app) {
        const el = document.createElement('div');
        el.className = 'mission-item';

        const statusClass = 'status-' + app.status;
        const deal = app.deal || {};

        el.innerHTML = \`
          <div class="mission-item-badges">
            <span class="badge-disclosure">Application</span>
          </div>
          <div class="mission-item-header">
            <h3 class="mission-item-title">\${escapeHtml(deal.title || 'Mission')}</h3>
            <span class="status-badge \${statusClass}">\${app.status}</span>
          </div>
          <p class="mission-item-description" style="margin-bottom: 8px;">
            Fixed fee: <strong>\${formatCurrency(deal.reward_amount || 0)}</strong>
          </p>
          <div class="mission-item-footer">
            <span class="mission-item-date">
              Applied: \${new Date(app.applied_at).toLocaleDateString()}
            </span>
          </div>
        \`;

        return el;
      }

      // Load my missions on page load
      loadMyMissions();
    </script>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-links">
        <a href="/terms.html">Terms of Service</a>
        <span class="footer-divider">|</span>
        <a href="/privacy.html">Privacy Policy</a>
        <span class="footer-divider">|</span>
        <a href="/guidelines-promoters.html">Promoter Guidelines</a>
        <span class="footer-divider">|</span>
        <a href="/guidelines-advertisers.html">Advertiser Guidelines</a>
        <span class="footer-divider">|</span>
        <a href="/faq.html">FAQ</a>
        <span class="footer-divider">|</span>
        <a href="/contact.html">Contact</a>
      </div>
      <p class="footer-disclaimer">X is a trademark of X Corp. HumanAds is an independent service and is not affiliated with X Corp. Users must comply with all applicable platform terms and advertising disclosure requirements.</p>
      <p>© 2026 HumanAds. Ads by AI. Promoted by Humans.</p>
    </footer>
  </div>
</body>
</html>`;
}
