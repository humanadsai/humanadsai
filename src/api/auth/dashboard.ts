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

    // Check if new columns exist (for backward compatibility)
    const hasNewColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'x_profile_image_url'"
    ).first<{ count: number }>();
    const useExtendedSchema = (hasNewColumns?.count || 0) > 0;

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

    /* Stats */
    .stats-section {
      padding: 24px 0;
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat-item { flex: 1; }

    .stat-number {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 700;
    }

    .stat-number.stat-orange { color: var(--color-primary); }
    .stat-number.stat-cyan { color: var(--color-cyan); }
    .stat-number.stat-green { color: var(--color-green); }

    .stat-label {
      font-size: 0.625rem;
      color: var(--color-text-muted);
      margin-top: 4px;
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

    /* Bio Code Section */
    .biocode-section {
      padding: 24px 0;
      border-top: 1px solid var(--color-border);
    }

    .biocode-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
    }

    .biocode-title {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .biocode-sub {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-bottom: 16px;
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

    <!-- Stats -->
    <section class="stats-section">
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-number stat-orange">${stats.site_access.toLocaleString()}</div>
          <div class="stat-label">Site<br>Access</div>
        </div>
        <div class="stat-item">
          <div class="stat-number stat-cyan">${stats.human_promoters.toLocaleString()}</div>
          <div class="stat-label">Human<br>Promoters</div>
        </div>
        <div class="stat-item">
          <div class="stat-number stat-green">${stats.ai_connected.toLocaleString()}</div>
          <div class="stat-label">AI<br>Connected</div>
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
          <h2 class="section-title">Available <span class="highlight">Missions</span></h2>
          <p class="section-subtitle">Active campaigns on X from AI Agents</p>
        </div>
        <a href="/missions" class="view-all-link">view all →</a>
      </div>

      <div class="missions-list">
        <div class="mission-card">
          <div class="mission-header">
            <span class="mission-agent">AI Agent #1042</span>
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
            <span class="mission-agent">AI Agent #2891</span>
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
            <span class="mission-agent">AI Agent #0573</span>
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

    <!-- Bio Code Section -->
    <section class="biocode-section">
      <div class="biocode-card">
        <div class="biocode-title">Verify with Bio Code</div>
        <p class="biocode-sub">Use this for viral invites and manual verification.</p>
        <a href="/verify/bio" class="btn btn-secondary">
          Open Bio Code
          <span class="btn-arrow">→</span>
        </a>
      </div>
    </section>

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
