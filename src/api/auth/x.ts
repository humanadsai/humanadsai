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

// Get redirect URL from cookie
const getRedirectCookie = (request: Request): string | null => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    const name = cookie.substring(0, eqIdx);
    const value = cookie.substring(eqIdx + 1);
    if (name === 'x_auth_redirect' && value) {
      try {
        const decoded = decodeURIComponent(value);
        // Only allow relative paths for security
        // Block protocol-relative URLs (//evil.com) which bypass startsWith('/') check
        if (decoded.startsWith('//') || decoded.startsWith('/\\')) return null;
        return decoded.startsWith('/') ? decoded : null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Get invite code from cookie
const getInviteCookie = (request: Request): string | null => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    const name = cookie.substring(0, eqIdx);
    const value = cookie.substring(eqIdx + 1);
    if (name === 'x_auth_invite' && value) {
      try {
        return decodeURIComponent(value);
      } catch {
        return null;
      }
    }
  }
  return null;
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
    // Check required environment variables
    if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) {
      console.error(`[X Login] [${requestId}] Missing X OAuth credentials`);
      return createErrorRedirect('Service temporarily unavailable. Please try again later.');
    }

    // Get optional redirect URL and invite code from query parameters
    const requestUrl = new URL(request.url);
    const redirectAfterLogin = requestUrl.searchParams.get('redirect') || '/missions/my';
    const inviteCode = requestUrl.searchParams.get('invite') || '';

    // Only allow relative paths for security
    // Block protocol-relative URLs (//evil.com) which bypass startsWith('/') check
    const safeRedirect = (redirectAfterLogin.startsWith('/') && !redirectAfterLogin.startsWith('//') && !redirectAfterLogin.startsWith('/\\'))
      ? redirectAfterLogin : '/missions/my';
    console.log(`[X Login] [${requestId}] Will redirect to after login:`, safeRedirect);
    if (inviteCode) {
      console.log(`[X Login] [${requestId}] Invite code:`, inviteCode);
    }

    const config: XAuthConfig = {
      clientId: env.X_CLIENT_ID,
      clientSecret: env.X_CLIENT_SECRET,
      redirectUri: getRedirectUri(request),
    };

    // Avoid logging sensitive config details (redirect URI, credential presence)

    const { url, state, codeVerifier } = await buildAuthUrl(config);

    // Create encrypted cookie with state and code_verifier
    const cookie = await createAuthCookie(state, codeVerifier, env.X_CLIENT_SECRET);

  // Create separate cookie for redirect URL (simple, non-encrypted)
  const redirectCookie = `x_auth_redirect=${encodeURIComponent(safeRedirect)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;

  // Create cookie for invite code (if provided)
  const inviteCookie = inviteCode
    ? `x_auth_invite=${encodeURIComponent(inviteCode)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    : 'x_auth_invite=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

    console.log(`[X Login] [${requestId}] Redirecting to X authorization page...`);

    // Use intermediate HTML page to ensure cookies are set before redirect.
    // Some browsers (Safari ITP) may ignore Set-Cookie on 302 redirect responses.
    const escapedUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${escapedUrl}"><title>Redirecting to X...</title></head><body><script>window.location.replace(${JSON.stringify(url)});</script><p>Redirecting to X for authentication...</p></body></html>`;

    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache');
    headers.append('Set-Cookie', cookie);
    headers.append('Set-Cookie', redirectCookie);
    headers.append('Set-Cookie', inviteCookie);

    return new Response(html, {
      status: 200,
      headers,
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
    console.error('[X Callback] State mismatch detected (values redacted for security)');
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

  // Normalize x_handle: strip leading @ to prevent @@handle in display
  const xHandleNormalized = (userInfo.username || '').replace(/^@+/, '');

  // Save or update operator in database
  const sessionToken = generateSessionToken();
  const sessionTokenHash = await sha256Hex(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  try {
    // Check if operators table exists (without leaking full schema in logs)
    const hasOperators = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='operators'"
    ).first<{ name: string }>();
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

    // Check if ALL new columns exist (for backward compatibility)
    // Check for the last column in the migration to ensure full migration was applied
    const hasAllNewColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'x_connected_at'"
    ).first<{ count: number }>();
    const useExtendedSchema = (hasAllNewColumns?.count || 0) > 0;
    console.log('[X Callback] Using extended schema:', useExtendedSchema);

    // Prepare extended user data for storage
    const nowMs = Date.now();
    const metrics = userInfo.public_metrics;

    if (existing) {
      console.log('[X Callback] Updating existing operator:', existing.id);

      if (useExtendedSchema) {
        // Update with all X profile data (new schema)
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
        // Fallback: Update with basic fields only (old schema)
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

      // Check if invite_code column exists FIRST (before any invite-related queries)
      const hasInviteColumns = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'invite_code'"
      ).first<{ count: number }>();
      const useInviteSchema = (hasInviteColumns?.count || 0) > 0;
      console.log('[X Callback] Using invite schema:', useInviteSchema);

      // Generate unique invite code for new user (only if invite schema exists)
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

      // Check if user was invited by someone (only if invite schema exists)
      const inviteCodeUsed = getInviteCookie(request);
      let inviterId: string | null = null;

      if (inviteCodeUsed && useInviteSchema) {
        console.log('[X Callback] Checking invite code:', inviteCodeUsed);
        const inviter = await env.DB.prepare(
          'SELECT id FROM operators WHERE invite_code = ?'
        ).bind(inviteCodeUsed).first<{ id: string }>();

        if (inviter) {
          inviterId = inviter.id;
          console.log('[X Callback] Valid invite from operator:', inviterId);
        }
      }

      if (useExtendedSchema && useInviteSchema) {
        // Create with all fields including invite system
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
            nowMs, // x_connected_at = first connection time
            newInviteCode,
            inviterId,
            sessionTokenHash,
            sessionExpiresAt
          )
          .run();
      } else if (useExtendedSchema) {
        // Create with extended schema but no invite columns
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
        // Fallback: Create with basic fields only (old schema)
        await env.DB.prepare(
          `INSERT INTO operators (x_user_id, x_handle, display_name, status, verified_at, session_token_hash, session_expires_at)
          VALUES (?, ?, ?, 'verified', datetime('now'), ?, ?)`
        )
          .bind(userInfo.id!, xHandleNormalized, userInfo.name!, sessionTokenHash, sessionExpiresAt)
          .run();
      }

      // Increment inviter's invite_count if applicable
      if (inviterId && useInviteSchema) {
        await env.DB.prepare(
          `UPDATE operators SET invite_count = invite_count + 1, updated_at = datetime('now') WHERE id = ?`
        ).bind(inviterId).run();
        console.log('[X Callback] Incremented invite count for:', inviterId);
      }
    }

    // Get redirect URL from cookie (if set during login)
    const rawRedirectUrl = getRedirectCookie(request) || '/missions/my';
    // Validate redirect URL one more time before use
    const redirectUrl = (rawRedirectUrl.startsWith('/') && !rawRedirectUrl.startsWith('//') && !rawRedirectUrl.startsWith('/\\'))
      ? rawRedirectUrl : '/missions/my';
    console.log('[X Callback] Login successful! Redirecting to:', redirectUrl);

    const sessionCookie = `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
    const clearRedirectCookie = 'x_auth_redirect=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
    const clearInviteCookie = 'x_auth_invite=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

    // Use an intermediate HTML page to ensure cookies are set before redirect.
    // Some browsers/environments may not reliably process Set-Cookie on 302 redirects.
    const escapedUrl = redirectUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${escapedUrl}"><title>Redirecting...</title></head><body><script>window.location.replace(${JSON.stringify(redirectUrl)});</script><p>Redirecting...</p></body></html>`;

    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache');
    headers.append('Set-Cookie', deleteAuthCookie());
    headers.append('Set-Cookie', sessionCookie);
    headers.append('Set-Cookie', clearRedirectCookie);
    headers.append('Set-Cookie', clearInviteCookie);

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
