/**
 * X (Twitter) OAuth2 Authentication Routes
 *
 * Auth state (codeVerifier, redirectUrl, inviteCode) is stored in KV
 * instead of cookies to avoid Safari ITP and cookie-blocking issues.
 */

import type { Env } from '../../types';
import {
  buildAuthUrl,
  exchangeCodeForToken,
  getXUserInfo,
  deleteAuthCookie,
  type XAuthConfig,
} from '../../services/x-auth';
import { generateSessionToken } from '../../utils/crypto';
import { sha256Hex } from '../../utils/crypto';

// KV key prefix for auth state
const AUTH_STATE_PREFIX = 'auth_state:';
const AUTH_STATE_TTL = 600; // 10 minutes

// Callback URL - must match X Developer Console exactly
const getRedirectUri = (request: Request): string => {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}/auth/x/callback`;
};

// Generate unique invite code using cryptographically secure randomness
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  let code = 'HADS_';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code;
};

/**
 * GET /auth/x/login
 * Initiates X OAuth2 PKCE flow
 */
export async function handleXLogin(request: Request, env: Env): Promise<Response> {
  const requestId = crypto.randomUUID();
  console.log(`[X Login] [${requestId}] Starting OAuth2 PKCE flow...`);

  try {
    if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) {
      console.error(`[X Login] [${requestId}] Missing X OAuth credentials`);
      return createErrorRedirect('Service temporarily unavailable. Please try again later.');
    }

    const requestUrl = new URL(request.url);
    const redirectAfterLogin = requestUrl.searchParams.get('redirect') || '/missions/my';
    const inviteCode = requestUrl.searchParams.get('invite') || '';

    // Only allow relative paths for security
    const safeRedirect = (redirectAfterLogin.startsWith('/') && !redirectAfterLogin.startsWith('//') && !redirectAfterLogin.startsWith('/\\'))
      ? redirectAfterLogin : '/missions/my';
    console.log(`[X Login] [${requestId}] Will redirect to after login:`, safeRedirect);

    const config: XAuthConfig = {
      clientId: env.X_CLIENT_ID,
      clientSecret: env.X_CLIENT_SECRET,
      redirectUri: getRedirectUri(request),
    };

    const { url, state, codeVerifier } = await buildAuthUrl(config);

    // Store auth state in KV (no cookies needed)
    await env.SESSIONS.put(
      `${AUTH_STATE_PREFIX}${state}`,
      JSON.stringify({ codeVerifier, redirectUrl: safeRedirect, inviteCode }),
      { expirationTtl: AUTH_STATE_TTL }
    );
    console.log(`[X Login] [${requestId}] Auth state stored in KV`);

    // Use intermediate HTML page to redirect to X
    const escapedUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${escapedUrl}"><title>Redirecting to X...</title></head><body><script>window.location.replace(${JSON.stringify(url)});</script><p>Redirecting to X for authentication...</p></body></html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  } catch (e) {
    console.error(`[X Login] [${requestId}] Error:`, e);
    return createErrorRedirect('Failed to start authentication. Please try again.');
  }
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

  // Look up auth state from KV (instead of cookie)
  const kvKey = `${AUTH_STATE_PREFIX}${state}`;
  const authStateJson = await env.SESSIONS.get(kvKey);

  if (!authStateJson) {
    console.error('[X Callback] Auth state not found in KV for state');
    return createErrorRedirect('Authentication session expired. Please try again.');
  }

  // Delete the KV entry (single-use)
  await env.SESSIONS.delete(kvKey);

  let authState: { codeVerifier: string; redirectUrl: string; inviteCode: string };
  try {
    authState = JSON.parse(authStateJson);
  } catch {
    console.error('[X Callback] Failed to parse auth state from KV');
    return createErrorRedirect('Invalid authentication session. Please try again.');
  }

  console.log('[X Callback] Auth state retrieved from KV successfully');

  const config: XAuthConfig = {
    clientId: env.X_CLIENT_ID,
    clientSecret: env.X_CLIENT_SECRET,
    redirectUri: getRedirectUri(request),
  };

  // Exchange code for token
  console.log('[X Callback] Starting token exchange...');
  const tokenResult = await exchangeCodeForToken(code, authState.codeVerifier, config);

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

  // Normalize x_handle: strip leading @ to prevent @@handle in display
  const xHandleNormalized = (userInfo.username || '').replace(/^@+/, '');

  // Save or update operator in database
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await sha256Hex(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  try {
    const hasOperators = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='operators'"
    ).first<{ name: string }>();
    if (!hasOperators) {
      console.error('[X Callback] FATAL: operators table not found in D1. Run migration first.');
      return createErrorRedirect('Database not initialized. Please contact support.');
    }

    console.log('[X Callback] Checking database for existing operator...');
    const existing = await env.DB.prepare(
      'SELECT id FROM operators WHERE x_user_id = ?'
    )
      .bind(userInfo.id!)
      .first<{ id: string }>();

    const hasAllNewColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'x_connected_at'"
    ).first<{ count: number }>();
    const useExtendedSchema = (hasAllNewColumns?.count || 0) > 0;

    const nowMs = Date.now();
    const metrics = userInfo.public_metrics;

    if (existing) {
      console.log('[X Callback] Updating existing operator:', existing.id);

      if (useExtendedSchema) {
        await env.DB.prepare(
          `UPDATE operators SET
            x_handle = ?,
            display_name = ?,
            x_profile_image_url = ?,
            x_description = ?,
            x_url = ?,
            x_location = ?,
            x_created_at = ?,
            x_protected = ?,
            x_verified = ?,
            x_verified_type = ?,
            x_followers_count = ?,
            x_following_count = ?,
            x_tweet_count = ?,
            x_listed_count = ?,
            x_raw_json = ?,
            x_fetched_at = ?,
            session_token_hash = ?,
            session_expires_at = ?,
            status = CASE WHEN status = 'unverified' THEN 'verified' ELSE status END,
            verified_at = CASE WHEN verified_at IS NULL THEN datetime('now') ELSE verified_at END,
            updated_at = datetime('now')
          WHERE x_user_id = ?`
        )
          .bind(
            xHandleNormalized,
            userInfo.name!,
            userInfo.profile_image_url || null,
            userInfo.description || null,
            userInfo.url || null,
            userInfo.location || null,
            userInfo.created_at || null,
            userInfo.protected ? 1 : 0,
            userInfo.verified ? 1 : 0,
            userInfo.verified_type || null,
            metrics?.followers_count || 0,
            metrics?.following_count || 0,
            metrics?.tweet_count || 0,
            metrics?.listed_count || 0,
            userInfo.raw_json || null,
            nowMs,
            sessionTokenHash,
            sessionExpiresAt,
            userInfo.id!
          )
          .run();
      } else {
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
          .bind(xHandleNormalized, userInfo.name!, sessionTokenHash, sessionExpiresAt, userInfo.id!)
          .run();
      }
    } else {
      console.log('[X Callback] Creating new operator for:', userInfo.username);

      const hasInviteColumns = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'invite_code'"
      ).first<{ count: number }>();
      const useInviteSchema = (hasInviteColumns?.count || 0) > 0;

      let newInviteCode: string | null = null;
      if (useInviteSchema) {
        newInviteCode = generateInviteCode();
        let inviteAttempts = 0;
        while (inviteAttempts < 10) {
          const existingCode = await env.DB.prepare(
            'SELECT id FROM operators WHERE invite_code = ?'
          ).bind(newInviteCode).first();
          if (!existingCode) break;
          newInviteCode = generateInviteCode();
          inviteAttempts++;
        }
      }

      // Check invite code from KV auth state (instead of cookie)
      let inviterId: string | null = null;
      if (authState.inviteCode && useInviteSchema) {
        console.log('[X Callback] Checking invite code:', authState.inviteCode);
        const inviter = await env.DB.prepare(
          'SELECT id FROM operators WHERE invite_code = ?'
        ).bind(authState.inviteCode).first<{ id: string }>();

        if (inviter) {
          inviterId = inviter.id;
          console.log('[X Callback] Valid invite from operator:', inviterId);
        }
      }

      if (useExtendedSchema && useInviteSchema) {
        await env.DB.prepare(
          `INSERT INTO operators (
            x_user_id, x_handle, display_name,
            x_profile_image_url, x_description, x_url, x_location, x_created_at, x_protected,
            x_verified, x_verified_type,
            x_followers_count, x_following_count, x_tweet_count, x_listed_count,
            x_raw_json, x_fetched_at, x_connected_at,
            invite_code, invited_by, invite_count,
            status, verified_at, session_token_hash, session_expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'verified', datetime('now'), ?, ?)`
        )
          .bind(
            userInfo.id!,
            xHandleNormalized,
            userInfo.name!,
            userInfo.profile_image_url || null,
            userInfo.description || null,
            userInfo.url || null,
            userInfo.location || null,
            userInfo.created_at || null,
            userInfo.protected ? 1 : 0,
            userInfo.verified ? 1 : 0,
            userInfo.verified_type || null,
            metrics?.followers_count || 0,
            metrics?.following_count || 0,
            metrics?.tweet_count || 0,
            metrics?.listed_count || 0,
            userInfo.raw_json || null,
            nowMs,
            nowMs,
            newInviteCode,
            inviterId,
            sessionTokenHash,
            sessionExpiresAt
          )
          .run();
      } else if (useExtendedSchema) {
        await env.DB.prepare(
          `INSERT INTO operators (
            x_user_id, x_handle, display_name,
            x_profile_image_url, x_description, x_url, x_location, x_created_at, x_protected,
            x_verified, x_verified_type,
            x_followers_count, x_following_count, x_tweet_count, x_listed_count,
            x_raw_json, x_fetched_at, x_connected_at,
            status, verified_at, session_token_hash, session_expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', datetime('now'), ?, ?)`
        )
          .bind(
            userInfo.id!,
            xHandleNormalized,
            userInfo.name!,
            userInfo.profile_image_url || null,
            userInfo.description || null,
            userInfo.url || null,
            userInfo.location || null,
            userInfo.created_at || null,
            userInfo.protected ? 1 : 0,
            userInfo.verified ? 1 : 0,
            userInfo.verified_type || null,
            metrics?.followers_count || 0,
            metrics?.following_count || 0,
            metrics?.tweet_count || 0,
            metrics?.listed_count || 0,
            userInfo.raw_json || null,
            nowMs,
            nowMs,
            sessionTokenHash,
            sessionExpiresAt
          )
          .run();
      } else {
        await env.DB.prepare(
          `INSERT INTO operators (x_user_id, x_handle, display_name, status, verified_at, session_token_hash, session_expires_at)
          VALUES (?, ?, ?, 'verified', datetime('now'), ?, ?)`
        )
          .bind(userInfo.id!, xHandleNormalized, userInfo.name!, sessionTokenHash, sessionExpiresAt)
          .run();
      }

      if (inviterId && useInviteSchema) {
        await env.DB.prepare(
          `UPDATE operators SET invite_count = invite_count + 1, updated_at = datetime('now') WHERE id = ?`
        ).bind(inviterId).run();
        console.log('[X Callback] Incremented invite count for:', inviterId);
      }
    }

    // Get redirect URL from KV auth state (instead of cookie)
    const rawRedirectUrl = authState.redirectUrl || '/missions/my';
    const redirectUrl = (rawRedirectUrl.startsWith('/') && !rawRedirectUrl.startsWith('//') && !rawRedirectUrl.startsWith('/\\'))
      ? rawRedirectUrl : '/missions/my';
    console.log('[X Callback] Login successful! Redirecting to:', redirectUrl);

    const sessionCookie = `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;

    // Use an intermediate HTML page to ensure cookies are set before redirect
    const escapedUrl = redirectUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${escapedUrl}"><title>Redirecting...</title></head><body><script>window.location.replace(${JSON.stringify(redirectUrl)});</script><p>Redirecting...</p></body></html>`;

    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache');
    headers.append('Set-Cookie', deleteAuthCookie());
    headers.append('Set-Cookie', sessionCookie);
    // Clean up legacy cookies
    headers.append('Set-Cookie', 'x_auth_redirect=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    headers.append('Set-Cookie', 'x_auth_invite=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    return new Response(html, {
      status: 200,
      headers,
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
