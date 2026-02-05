/**
 * Post Verification API
 *
 * GET /api/operator/verify-code - Get user's verification code
 * POST /api/operator/verify-post - Verify a post URL
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { sha256Hex } from '../../utils/crypto';

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
async function getAuthenticatedOperator(
  request: Request,
  env: Env
): Promise<{
  id: string;
  x_user_id: string;
  x_handle: string;
  verify_code: string | null;
  verify_status: string;
} | null> {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) return null;

  const sessionHash = await sha256Hex(sessionToken);

  try {
    // Check if verify columns exist
    const hasVerifyColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'verify_code'"
    ).first<{ count: number }>();

    if ((hasVerifyColumns?.count || 0) === 0) {
      // Columns don't exist, fetch basic info
      const operator = await env.DB.prepare(`
        SELECT id, x_user_id, x_handle
        FROM operators
        WHERE session_token_hash = ?
          AND session_expires_at > datetime('now')
      `)
        .bind(sessionHash)
        .first<{ id: string; x_user_id: string; x_handle: string }>();

      if (!operator) return null;
      return { ...operator, verify_code: null, verify_status: 'not_started' };
    }

    const operator = await env.DB.prepare(`
      SELECT id, x_user_id, x_handle, verify_code, verify_status
      FROM operators
      WHERE session_token_hash = ?
        AND session_expires_at > datetime('now')
    `)
      .bind(sessionHash)
      .first<{
        id: string;
        x_user_id: string;
        x_handle: string;
        verify_code: string | null;
        verify_status: string | null;
      }>();

    if (!operator) return null;
    return {
      ...operator,
      verify_status: operator.verify_status || 'not_started',
    };
  } catch (e) {
    console.error('[Verification API] Error checking session:', e);
    return null;
  }
}

/**
 * Generate a unique verification code
 */
function generateVerifyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HADS_';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Extract tweet ID from URL
 */
function extractTweetId(url: string): string | null {
  // Match x.com or twitter.com URLs
  const match = url.match(/(?:x\.com|twitter\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * GET /api/operator/verify-code
 * Returns the user's verification code, generating one if needed
 */
export async function getVerifyCode(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) {
    return errors.unauthorized(requestId, 'Not authenticated');
  }

  try {
    let verifyCode = operator.verify_code;

    // Generate code if not exists
    if (!verifyCode) {
      // Check if verify_code column exists
      const hasVerifyColumns = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'verify_code'"
      ).first<{ count: number }>();

      if ((hasVerifyColumns?.count || 0) === 0) {
        // Add columns
        await env.DB.prepare(`ALTER TABLE operators ADD COLUMN verify_code TEXT UNIQUE`).run();
        await env.DB.prepare(`ALTER TABLE operators ADD COLUMN verify_status TEXT NOT NULL DEFAULT 'not_started'`).run();
        await env.DB.prepare(`ALTER TABLE operators ADD COLUMN verify_post_id TEXT`).run();
        await env.DB.prepare(`ALTER TABLE operators ADD COLUMN verify_completed_at TEXT`).run();
      }

      // Generate unique code
      let attempts = 0;
      while (attempts < 10) {
        verifyCode = generateVerifyCode();
        try {
          await env.DB.prepare(`
            UPDATE operators SET verify_code = ?, updated_at = datetime('now')
            WHERE id = ? AND verify_code IS NULL
          `)
            .bind(verifyCode, operator.id)
            .run();
          break;
        } catch (e) {
          // Code collision, retry
          attempts++;
          if (attempts >= 10) {
            return errors.internalError(requestId);
          }
        }
      }
    }

    return success({
      verify_code: verifyCode,
      verify_status: operator.verify_status,
      x_handle: operator.x_handle,
    }, requestId);
  } catch (e) {
    console.error('[Verification API] Error getting verify code:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/operator/verify-post
 * Verifies a post URL contains the verification code
 */
export async function verifyPost(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) {
    return errors.unauthorized(requestId, 'Not authenticated');
  }

  // Check if already verified
  if (operator.verify_status === 'verified') {
    return errors.invalidRequest(requestId, 'Account is already verified');
  }

  // Check if verify code exists
  if (!operator.verify_code) {
    return errors.invalidRequest(requestId, 'No verification code found. Please refresh the page.');
  }

  let body: { post_url?: string };
  try {
    body = await request.json();
  } catch (e) {
    return errors.invalidRequest(requestId, 'Invalid JSON body');
  }

  const { post_url } = body;
  if (!post_url) {
    return errors.invalidRequest(requestId, 'Post URL is required');
  }

  // Extract tweet ID
  const tweetId = extractTweetId(post_url);
  if (!tweetId) {
    return errors.invalidRequest(requestId, 'Invalid URL format. Expected: https://x.com/handle/status/123...');
  }

  try {
    // Check if verification_posts table exists
    const hasVerificationPostsTable = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='verification_posts'"
    ).first<{ name: string }>();

    if (!hasVerificationPostsTable) {
      // Create table
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS verification_posts (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          operator_id TEXT NOT NULL,
          tweet_id TEXT NOT NULL UNIQUE,
          tweet_url TEXT NOT NULL,
          tweet_text TEXT,
          tweet_author_id TEXT,
          status TEXT NOT NULL DEFAULT 'verified',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `).run();
    }

    // Check if tweet ID already used
    const existingPost = await env.DB.prepare(`
      SELECT operator_id FROM verification_posts WHERE tweet_id = ?
    `)
      .bind(tweetId)
      .first<{ operator_id: string }>();

    if (existingPost) {
      return errors.invalidRequest(requestId, 'This post has already been used for verification');
    }

    // Fetch the tweet from X API
    const tweetResult = await fetchTweet(tweetId, env);

    if (!tweetResult.success) {
      return errors.invalidRequest(requestId, tweetResult.error || 'Failed to fetch post');
    }

    const tweet = tweetResult.data!;

    // Check author matches
    if (tweet.author_id !== operator.x_user_id) {
      return errors.invalidRequest(requestId, 'This post belongs to another account');
    }

    // Check verification code in text
    if (!tweet.text.includes(operator.verify_code)) {
      return errors.invalidRequest(requestId, 'Verification code not found in post');
    }

    // Success! Update operator status
    await env.DB.prepare(`
      UPDATE operators SET
        verify_status = 'verified',
        verify_post_id = ?,
        verify_completed_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `)
      .bind(tweetId, operator.id)
      .run();

    // Record the verification post
    await env.DB.prepare(`
      INSERT INTO verification_posts (operator_id, tweet_id, tweet_url, tweet_text, tweet_author_id, status)
      VALUES (?, ?, ?, ?, ?, 'verified')
    `)
      .bind(operator.id, tweetId, post_url, tweet.text, tweet.author_id)
      .run();

    return success({
      message: 'Verification successful',
      verify_status: 'verified',
    }, requestId);
  } catch (e) {
    console.error('[Verification API] Error verifying post:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Fetch a tweet from X API
 */
async function fetchTweet(
  tweetId: string,
  env: Env
): Promise<{ success: boolean; data?: { text: string; author_id: string }; error?: string }> {
  // Check if we have X API bearer token
  const bearerToken = env.X_BEARER_TOKEN;

  if (!bearerToken) {
    console.error('[Verification API] X_BEARER_TOKEN not configured');
    return { success: false, error: 'X API not configured. Please contact support.' };
  }

  try {
    const response = await fetch(
      `https://api.x.com/2/tweets/${tweetId}?tweet.fields=text,author_id`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (response.status === 404) {
      return { success: false, error: 'Post not found' };
    }

    if (response.status === 401) {
      console.error('[Verification API] X API unauthorized');
      return { success: false, error: 'X API authentication failed' };
    }

    if (response.status === 429) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }

    if (!response.ok) {
      console.error('[Verification API] X API error:', response.status);
      return { success: false, error: 'Failed to fetch post from X' };
    }

    const data = await response.json() as { data?: { text: string; author_id: string }; errors?: Array<{ message: string }> };

    if (data.errors && data.errors.length > 0) {
      return { success: false, error: data.errors[0].message };
    }

    if (!data.data) {
      return { success: false, error: 'Post not found' };
    }

    return {
      success: true,
      data: {
        text: data.data.text,
        author_id: data.data.author_id,
      },
    };
  } catch (e) {
    console.error('[Verification API] Network error fetching tweet:', e);
    return { success: false, error: 'Network error. Please try again.' };
  }
}
