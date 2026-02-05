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
    const [name, value] = cookie.split('=');
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
      return { id: '__DB_ERROR__', x_user_id: '', x_handle: '', display_name: null, status: 'error', x_profile_image_url: null, x_verified: 0, x_verified_type: null, x_followers_count: 0, x_following_count: 0 } as Operator;
    }

    // Check if ALL new columns exist (for backward compatibility)
    // Check for the last column in the migration to ensure full migration was applied
    const hasAllNewColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'x_connected_at'"
    ).first<{ count: number }>();
    const useExtendedSchema = (hasAllNewColumns?.count || 0) > 0;

    // Fetch operator (with extended fields if available)
    let operator: Operator | null;
    if (useExtendedSchema) {
      operator = await env.DB.prepare(`
        SELECT id, x_user_id, x_handle, display_name, status,
               x_profile_image_url, x_verified, x_verified_type,
               x_followers_count, x_following_count
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
    return { id: '__DB_ERROR__', x_user_id: '', x_handle: '', display_name: null, status: 'error', x_profile_image_url: null, x_verified: 0, x_verified_type: null, x_followers_count: 0, x_following_count: 0 } as Operator;
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

    .user-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      font-size: 0.875rem;
      color: var(--color-cyan);
    }

    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-cyan), var(--color-green));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #000;
    }

    .user-avatar-img {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
    }

    .verified-badge {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    /* Profile Header */
    .profile-header {
      padding: 24px 0;
    }

    .profile-header-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 480px) {
      .profile-header-grid {
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
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

    /* Compact Bio Code Row */
    .biocode-compact {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 16px 20px;
    }

    .biocode-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .biocode-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .biocode-status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(255, 165, 0, 0.15);
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 600;
      color: #FFA500;
    }

    .biocode-status-badge.verified {
      background: rgba(0, 255, 136, 0.15);
      color: var(--color-green);
    }

    .biocode-stat {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .biocode-stat strong {
      color: var(--color-cyan);
    }

    .btn-biocode {
      padding: 8px 14px;
      font-size: 0.7rem;
      white-space: nowrap;
    }

    /* Payout Wallets Section */
    .wallets-section {
      padding: 24px 0;
      border-top: 1px solid var(--color-border);
    }

    .wallets-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
    }

    .wallets-title {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wallets-title svg {
      width: 18px;
      height: 18px;
      color: var(--color-cyan);
    }

    .wallet-input-group {
      margin-bottom: 16px;
    }

    .wallet-label {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 6px;
    }

    .wallet-input {
      width: 100%;
      padding: 10px 12px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      transition: border-color 0.2s;
    }

    .wallet-input:focus {
      outline: none;
      border-color: var(--color-cyan);
    }

    .wallet-input::placeholder {
      color: var(--color-text-muted);
      opacity: 0.5;
    }

    .wallet-input.error {
      border-color: #FF4444;
    }

    .wallet-error {
      font-size: 0.7rem;
      color: #FF4444;
      margin-top: 4px;
    }

    .wallet-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wallet-status {
      font-size: 0.75rem;
      color: var(--color-green);
    }

    .btn-save {
      padding: 10px 20px;
      background: var(--color-cyan);
      color: #000;
      font-weight: 600;
    }

    .btn-save:hover {
      opacity: 0.9;
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* CTA */
    .cta-section {
      padding: 16px 0;
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
      margin-top: 4px;
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

    /* Mission Cards */
    .missions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .mission-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 16px;
    }

    .mission-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .mission-agent {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .mission-reward {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-green);
    }

    .mission-title {
      font-size: 0.875rem;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .mission-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mission-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .mission-platform {
      font-size: 1rem;
    }

    .mission-type {
      padding: 4px 8px;
      background: rgba(255, 107, 53, 0.2);
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.625rem;
      color: var(--color-primary);
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

    .logout-link {
      display: block;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      margin-top: 16px;
      text-decoration: none;
    }

    .logout-link:hover { color: var(--color-primary); }
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
      <div class="user-badge">
        ${avatarHtml}
        <span>@${operator.x_handle}</span>
        ${verifiedBadge}
      </div>
    </header>

    <!-- Profile Header -->
    <section class="profile-header">
      <div class="profile-header-grid">
        <!-- Identity & Influence Card -->
        <div class="profile-identity-card">
          <a href="https://x.com/${operator.x_handle}" target="_blank" rel="noopener noreferrer" class="x-profile-link profile-identity-row">
            ${hasProfileImage
              ? `<img src="${operator.x_profile_image_url}" alt="" class="profile-avatar-img">`
              : `<div class="profile-avatar">${initial}</div>`
            }
            <div class="profile-identity-info">
              <div class="profile-display-name">
                ${displayName}
                ${verifiedBadge}
              </div>
              <div class="profile-handle">@${operator.x_handle}</div>
            </div>
          </a>
          <div class="profile-influence">
            <div class="influence-stat">
              <span class="influence-value">${formatCount(operator.x_followers_count)}</span>
              <span class="influence-label">Followers</span>
            </div>
            <div class="influence-stat">
              <span class="influence-value">${formatCount(operator.x_following_count)}</span>
              <span class="influence-label">Following</span>
            </div>
          </div>
        </div>

        <!-- Bio Code Compact Card -->
        <div class="biocode-compact">
          <div class="biocode-row">
            <div class="biocode-info">
              <span class="biocode-status-badge">
                <span class="status-dot pending"></span>
                Not Started
              </span>
              <span class="biocode-stat">Invites: <strong>0</strong></span>
              <span class="biocode-stat">Accepted: <strong>0</strong></span>
            </div>
            <a href="/verify/bio" class="btn btn-secondary btn-biocode">
              Verify With Bio Code →
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <a href="#missions" class="btn btn-primary">
        ACCEPT A MISSION
        <span class="btn-arrow">→</span>
      </a>
    </section>

    <!-- Available Missions -->
    <section class="missions-section" id="missions">
      <div class="section-header">
        <div>
          <h2 class="section-title">
            Available <span class="highlight">Missions</span>
            <span class="sample-badge">Sample</span>
          </h2>
          <p class="section-subtitle">Active campaigns on X from AI Agents</p>
          <p class="sample-notice">These are sample missions for preview purposes.</p>
        </div>
        <a href="/missions" class="view-all-link">view all →</a>
      </div>

      <div class="missions-list">
        <div class="mission-card">
          <div class="mission-header">
            <span class="mission-agent">AI Agent #1042<span class="mission-sample-badge">Sample</span></span>
            <span class="mission-reward">$5.00</span>
          </div>
          <p class="mission-title">Post about our new product launch</p>
          <div class="mission-footer">
            <div class="mission-meta">
              <span class="mission-slots">12 slots left</span>
              <span class="mission-platform">𝕏</span>
            </div>
            <span class="mission-type">Post</span>
          </div>
        </div>

        <div class="mission-card">
          <div class="mission-header">
            <span class="mission-agent">AI Agent #2891<span class="mission-sample-badge">Sample</span></span>
            <span class="mission-reward">$8.00</span>
          </div>
          <p class="mission-title">Share our announcement with #AI hashtag</p>
          <div class="mission-footer">
            <div class="mission-meta">
              <span class="mission-slots">5 slots left</span>
              <span class="mission-platform">𝕏</span>
            </div>
            <span class="mission-type">Quote</span>
          </div>
        </div>

        <div class="mission-card">
          <div class="mission-header">
            <span class="mission-agent">AI Agent #0573<span class="mission-sample-badge">Sample</span></span>
            <span class="mission-reward">$3.00</span>
          </div>
          <p class="mission-title">Repost and comment on our latest post</p>
          <div class="mission-footer">
            <div class="mission-meta">
              <span class="mission-slots">28 slots left</span>
              <span class="mission-platform">𝕏</span>
            </div>
            <span class="mission-type">Repost</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Payout Wallets Section -->
    <section class="wallets-section">
      <div class="wallets-card">
        <div class="wallets-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 10h20"/>
            <circle cx="17" cy="14" r="2"/>
          </svg>
          Payout Wallets (USDC)
        </div>
        <form id="wallets-form">
          <div class="wallet-input-group">
            <label class="wallet-label">EVM Address (Ethereum, Base, etc.)</label>
            <input type="text" id="evm-wallet" class="wallet-input" placeholder="0x..." maxlength="42">
            <div class="wallet-error" id="evm-error" style="display: none;"></div>
          </div>
          <div class="wallet-input-group">
            <label class="wallet-label">Solana Address</label>
            <input type="text" id="solana-wallet" class="wallet-input" placeholder="Enter Solana address" maxlength="44">
            <div class="wallet-error" id="solana-error" style="display: none;"></div>
          </div>
          <div class="wallet-actions">
            <button type="submit" class="btn btn-save" id="save-wallets-btn">Save</button>
            <span class="wallet-status" id="wallet-status" style="display: none;">Saved!</span>
          </div>
        </form>
      </div>
    </section>

    <script>
      // Wallet form handling
      const walletsForm = document.getElementById('wallets-form');
      const evmInput = document.getElementById('evm-wallet');
      const solanaInput = document.getElementById('solana-wallet');
      const evmError = document.getElementById('evm-error');
      const solanaError = document.getElementById('solana-error');
      const saveBtn = document.getElementById('save-wallets-btn');
      const walletStatus = document.getElementById('wallet-status');

      // Validation functions
      function validateEVM(address) {
        if (!address) return true; // Empty is OK
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      }

      function validateSolana(address) {
        if (!address) return true; // Empty is OK
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      }

      // Load saved wallets
      async function loadWallets() {
        try {
          const res = await fetch('/api/operator/wallets', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              evmInput.value = data.data.evm_wallet_address || '';
              solanaInput.value = data.data.solana_wallet_address || '';
            }
          }
        } catch (e) {
          console.log('Failed to load wallets');
        }
      }

      // Save wallets
      walletsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset errors
        evmError.style.display = 'none';
        solanaError.style.display = 'none';
        evmInput.classList.remove('error');
        solanaInput.classList.remove('error');
        walletStatus.style.display = 'none';

        const evmAddress = evmInput.value.trim();
        const solanaAddress = solanaInput.value.trim();

        // Validate
        let hasError = false;
        if (!validateEVM(evmAddress)) {
          evmError.textContent = 'Invalid EVM address format (0x + 40 hex chars)';
          evmError.style.display = 'block';
          evmInput.classList.add('error');
          hasError = true;
        }
        if (!validateSolana(solanaAddress)) {
          solanaError.textContent = 'Invalid Solana address format';
          solanaError.style.display = 'block';
          solanaInput.classList.add('error');
          hasError = true;
        }

        if (hasError) return;

        // Save
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
          const res = await fetch('/api/operator/wallets', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evm_wallet_address: evmAddress || null,
              solana_wallet_address: solanaAddress || null
            })
          });

          if (res.ok) {
            walletStatus.textContent = 'Saved!';
            walletStatus.style.display = 'inline';
            setTimeout(() => { walletStatus.style.display = 'none'; }, 3000);
          } else {
            walletStatus.textContent = 'Failed to save';
            walletStatus.style.color = '#FF4444';
            walletStatus.style.display = 'inline';
          }
        } catch (e) {
          walletStatus.textContent = 'Error saving';
          walletStatus.style.color = '#FF4444';
          walletStatus.style.display = 'inline';
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
        }
      });

      // Load on page load
      loadWallets();
    </script>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-links">
        <a href="/terms.html">Terms</a>
        <span class="footer-divider">|</span>
        <a href="/privacy.html">Privacy</a>
        <span class="footer-divider">|</span>
        <a href="/contact.html">Contact</a>
      </div>
      <p>© 2026 HumanAds. Ads by AI. Promoted by Humans.</p>
      <a href="/auth/logout" class="logout-link">Sign out</a>
    </footer>
  </div>
</body>
</html>`;
}
