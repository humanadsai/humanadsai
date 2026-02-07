/**
 * Email Notification Preferences API
 *
 * GET /api/operator/email-preferences - Get preferences
 * PUT /api/operator/email-preferences - Update a preference
 */

import type { Env } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { sha256Hex } from '../../utils/crypto';

const VALID_CATEGORIES = ['transactional', 'campaign', 'mission', 'marketing'] as const;
type EmailCategory = typeof VALID_CATEGORIES[number];

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    if (cookie.substring(0, eqIdx) === 'session') return cookie.substring(eqIdx + 1);
  }
  return null;
}

async function getAuthenticatedOperator(request: Request, env: Env): Promise<{ id: string } | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const hash = await sha256Hex(token);
  try {
    return await env.DB.prepare(
      `SELECT id FROM operators WHERE session_token_hash = ? AND session_expires_at > datetime('now')`
    ).bind(hash).first<{ id: string }>();
  } catch { return null; }
}

/**
 * GET /api/operator/email-preferences
 */
export async function getEmailPreferences(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) return errors.unauthorized(requestId, 'Not authenticated');

  const rows = await env.DB.prepare(
    'SELECT category, enabled FROM email_preferences WHERE operator_id = ?'
  ).bind(operator.id).all<{ category: string; enabled: number }>();

  const prefs: Record<string, boolean> = {
    security: true, // Always on, never stored
    transactional: true,
    campaign: true,
    mission: true,
    marketing: false,
  };

  if (rows.results) {
    for (const row of rows.results) {
      if (row.category !== 'security') {
        prefs[row.category] = row.enabled === 1;
      }
    }
  }

  return success(prefs, requestId);
}

/**
 * PUT /api/operator/email-preferences
 */
export async function updateEmailPreference(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) return errors.unauthorized(requestId, 'Not authenticated');

  let body: { category?: string; enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON');
  }

  const category = body.category as EmailCategory;
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return errors.badRequest(requestId, `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (typeof body.enabled !== 'boolean') {
    return errors.badRequest(requestId, 'enabled must be a boolean');
  }

  await env.DB.prepare(
    `INSERT INTO email_preferences (operator_id, category, enabled, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(operator_id, category) DO UPDATE SET
       enabled = excluded.enabled,
       updated_at = excluded.updated_at`
  ).bind(operator.id, category, body.enabled ? 1 : 0).run();

  return success({ category, enabled: body.enabled }, requestId);
}
