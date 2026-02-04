/**
 * X (Twitter) OAuth2 Authentication Routes
 */

import type { Env } from '../../types';
import {
  buildAuthUrl,
  exchangeCodeForToken,
  getXUserInfo,
  createAuthCookie,
  getAuthCookie,
  decryptCookieData,
  deleteAuthCookie,
  type XAuthConfig,
} from '../../services/x-auth';
import { generateSessionToken } from '../../utils/crypto';
import { sha256Hex } from '../../utils/crypto';

// Callback URL - must match X Developer Console exactly
const getRedirectUri = (request: Request): string => {
  const url = new URL(request.url);
  // Use the current host for the redirect URI
  return `${url.protocol}//${url.host}/auth/x/callback`;
};

/**
 * GET /auth/x/login
 * Initiates X OAuth2 PKCE flow
 */
export async function handleXLogin(request: Request, env: Env): Promise<Response> {
  console.log('[X Login] Starting OAuth2 PKCE flow...');

  const config: XAuthConfig = {
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
    redirectUri: getRedirectUri(request),
  };

  console.log('[X Login] Redirect URI:', config.redirectUri);
  console.log('[X Login] Client ID present:', !!config.clientId);
  console.log('[X Login] Client Secret present:', !!config.clientSecret);

  const { url, state, codeVerifier } = await buildAuthUrl(config);

  // Create encrypted cookie with state and code_verifier
  const cookie = await createAuthCookie(state, codeVerifier, env.X_CLIENT_SECRET);

  console.log('[X Login] Redirecting to X authorization page...');

  // Redirect to X authorization page
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Set-Cookie': cookie,
    },
  });
}

/**
 * GET /auth/x/callback
 * Handles X OAuth2 callback
 */
export async function handleXCallback(request: Request, env: Env): Promise<Response> {
  console.log('[X Callback] Received callback from X...');

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  console.log('[X Callback] code present:', !!code);
  console.log('[X Callback] state present:', !!state);
  console.log('[X Callback] error:', error || 'none');

  // Check for error from X
  if (error) {
    const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
    console.error('[X Callback] X returned error:', error, errorDescription);
    return createErrorRedirect(`X authentication failed: ${errorDescription}`);
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('[X Callback] Missing code or state');
    return createErrorRedirect('Missing code or state parameter');
  }

  // Get and decrypt cookie data
  const encryptedCookie = getAuthCookie(request);
  if (!encryptedCookie) {
    console.error('[X Callback] No auth cookie found');
    return createErrorRedirect('Authentication session expired. Please try again.');
  }

  console.log('[X Callback] Decrypting cookie...');
  const cookieData = await decryptCookieData(encryptedCookie, env.X_CLIENT_SECRET);
  if (!cookieData) {
    console.error('[X Callback] Failed to decrypt cookie');
    return createErrorRedirect('Invalid authentication session. Please try again.');
  }

  // Verify state matches
  if (cookieData.state !== state) {
    console.error('[X Callback] State mismatch! Expected:', cookieData.state.substring(0, 10) + '...', 'Got:', state.substring(0, 10) + '...');
    return createErrorRedirect('State mismatch. Possible CSRF attack.');
  }

  console.log('[X Callback] State verified successfully');

  const config: XAuthConfig = {
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
    redirectUri: getRedirectUri(request),
  };

  // Exchange code for token
  console.log('[X Callback] Starting token exchange...');
  const tokenResult = await exchangeCodeForToken(code, cookieData.codeVerifier, config);

  if (!tokenResult.success) {
    console.error('[X Callback] Token exchange failed:', tokenResult.error, 'HTTP:', tokenResult.httpStatus);
    const errorMsg = tokenResult.httpStatus === 401
      ? 'Invalid client credentials. Please contact support.'
      : `Token exchange failed (${tokenResult.httpStatus || 'network error'}). Please try again.`;
    return createErrorRedirect(errorMsg);
  }

  console.log('[X Callback] Token exchange successful, fetching user info...');

  // Get user info
  const userInfo = await getXUserInfo(tokenResult.accessToken!);

  if (!userInfo.success) {
    console.error('[X Callback] User info failed:', userInfo.error, 'HTTP:', userInfo.httpStatus);

    // Provide specific error messages based on HTTP status
    let errorMsg: string;
    if (userInfo.httpStatus === 403) {
      errorMsg = 'X API access denied. The app may need elevated API access. Please try manual verification.';
    } else if (userInfo.httpStatus === 401) {
      errorMsg = 'Access token invalid or expired. Please try again.';
    } else if (userInfo.httpStatus === 429) {
      errorMsg = 'Too many requests to X API. Please wait a moment and try again.';
    } else {
      errorMsg = `Failed to get user info from X (${userInfo.httpStatus || 'network error'}): ${userInfo.error}`;
    }
    return createErrorRedirect(errorMsg);
  }

  console.log('[X Callback] User info received:', userInfo.username);

  // Save or update operator in database
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await sha256Hex(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  try {
    // DEBUG: Check what tables exist in D1
    console.log('[X Callback] Checking D1 database tables...');
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all<{ name: string }>();
    console.log('[X Callback] D1 tables:', tables.results?.map(t => t.name).join(', ') || 'NONE');

    // Check if operators table exists
    const hasOperators = tables.results?.some(t => t.name === 'operators');
    if (!hasOperators) {
      console.error('[X Callback] FATAL: operators table not found in D1. Run migration first.');
      return createErrorRedirect('Database not initialized. Please contact support.');
    }

    // Check if operator exists by x_user_id
    console.log('[X Callback] Checking database for existing operator...');
    const existing = await env.DB.prepare(
      'SELECT id FROM operators WHERE x_user_id = ?'
    )
      .bind(userInfo.id!)
      .first<{ id: string }>();

    if (existing) {
      // Update existing operator
      console.log('[X Callback] Updating existing operator:', existing.id);
      await env.DB.prepare(
        `UPDATE operators SET
          x_handle = ?,
          display_name = ?,
          session_token_hash = ?,
          session_expires_at = ?,
          status = CASE WHEN status = 'unverified' THEN 'verified' ELSE status END,
          verified_at = CASE WHEN verified_at IS NULL THEN datetime('now') ELSE verified_at END,
          updated_at = datetime('now')
        WHERE x_user_id = ?`
      )
        .bind(userInfo.username!, userInfo.name!, sessionTokenHash, sessionExpiresAt, userInfo.id!)
        .run();
    } else {
      // Create new operator
      console.log('[X Callback] Creating new operator for:', userInfo.username);
      await env.DB.prepare(
        `INSERT INTO operators (x_user_id, x_handle, display_name, status, verified_at, session_token_hash, session_expires_at)
        VALUES (?, ?, ?, 'verified', datetime('now'), ?, ?)`
      )
        .bind(userInfo.id!, userInfo.username!, userInfo.name!, sessionTokenHash, sessionExpiresAt)
        .run();
    }

    // Create session cookie and redirect to success page
    console.log('[X Callback] Login successful! Redirecting to success page...');
    const sessionCookie = `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/auth/success?username=${encodeURIComponent(userInfo.username!)}`,
        'Set-Cookie': [deleteAuthCookie(), sessionCookie].join(', '),
      },
    });
  } catch (e) {
    console.error('[X Callback] Database error:', e);
    return createErrorRedirect('Failed to save user information. Please try again.');
  }
}

/**
 * Create error redirect response
 */
function createErrorRedirect(message: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/auth/error?message=${encodeURIComponent(message)}`,
      'Set-Cookie': deleteAuthCookie(),
    },
  });
}
