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
  const config: XAuthConfig = {
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
    redirectUri: getRedirectUri(request),
  };

  const { url, state, codeVerifier } = await buildAuthUrl(config);

  // Create encrypted cookie with state and code_verifier
  const cookie = await createAuthCookie(state, codeVerifier, env.X_CLIENT_SECRET);

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
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Check for error from X
  if (error) {
    const errorDescription = url.searchParams.get('error_description') || 'Unknown error';
    return createErrorRedirect(`X authentication failed: ${errorDescription}`);
  }

  // Validate required parameters
  if (!code || !state) {
    return createErrorRedirect('Missing code or state parameter');
  }

  // Get and decrypt cookie data
  const encryptedCookie = getAuthCookie(request);
  if (!encryptedCookie) {
    return createErrorRedirect('Authentication session expired. Please try again.');
  }

  const cookieData = await decryptCookieData(encryptedCookie, env.X_CLIENT_SECRET);
  if (!cookieData) {
    return createErrorRedirect('Invalid authentication session. Please try again.');
  }

  // Verify state matches
  if (cookieData.state !== state) {
    return createErrorRedirect('State mismatch. Possible CSRF attack.');
  }

  const config: XAuthConfig = {
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
    redirectUri: getRedirectUri(request),
  };

  // Exchange code for token
  const tokenResult = await exchangeCodeForToken(code, cookieData.codeVerifier, config);
  if (!tokenResult) {
    return createErrorRedirect('Failed to exchange authorization code. Please try again.');
  }

  // Get user info
  const userInfo = await getXUserInfo(tokenResult.accessToken);
  if (!userInfo) {
    return createErrorRedirect('Failed to get user information from X.');
  }

  // Save or update operator in database
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await sha256Hex(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  try {
    // Check if operator exists by x_user_id
    const existing = await env.DB.prepare(
      'SELECT id FROM operators WHERE x_user_id = ?'
    )
      .bind(userInfo.id)
      .first<{ id: string }>();

    if (existing) {
      // Update existing operator
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
        .bind(userInfo.username, userInfo.name, sessionTokenHash, sessionExpiresAt, userInfo.id)
        .run();
    } else {
      // Create new operator
      await env.DB.prepare(
        `INSERT INTO operators (x_user_id, x_handle, display_name, status, verified_at, session_token_hash, session_expires_at)
        VALUES (?, ?, ?, 'verified', datetime('now'), ?, ?)`
      )
        .bind(userInfo.id, userInfo.username, userInfo.name, sessionTokenHash, sessionExpiresAt)
        .run();
    }

    // Create session cookie and redirect to success page
    const sessionCookie = `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/auth/success?username=${encodeURIComponent(userInfo.username)}`,
        'Set-Cookie': [deleteAuthCookie(), sessionCookie].join(', '),
      },
    });
  } catch (e) {
    console.error('Database error:', e);
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
