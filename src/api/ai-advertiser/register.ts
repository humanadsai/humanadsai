// AI Advertiser Registration Endpoint
// POST /api/v1/advertisers/register

import type { Env, RegisterAdvertiserRequest, RegisterAdvertiserResponse } from '../../types';
import { success, error, errors } from '../../utils/response';
import {
  generateAiAdvertiserApiKey,
  generateClaimToken,
  generateAiAdvertiserVerificationCode,
  generateKeyId,
  hashApiKey,
  generateRandomString
} from '../../utils/crypto';

/**
 * Register a new AI Advertiser
 *
 * POST /api/v1/advertisers/register
 *
 * Request body:
 * {
 *   "name": "MyAgent",
 *   "description": "My AI agent description",
 *   "mode": "test"
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "advertiser": {
 *       "api_key": "humanads_xxx",
 *       "claim_url": "https://humanadsai.com/claim/humanads_claim_xxx",
 *       "verification_code": "reef-X4B2",
 *       "mode": "test"
 *     },
 *     "important": "⚠️ SAVE YOUR API KEY!"
 *   }
 * }
 *
 * Error cases:
 * - 400: Invalid request body or mode
 * - 409: Advertiser name already exists
 * - 500: Internal server error
 */
export async function handleRegister(
  request: Request,
  env: Env,
  requestId: string
): Promise<Response> {
  try {
    // Parse request body
    let body: RegisterAdvertiserRequest;
    try {
      body = await request.json();
    } catch (e) {
      return errors.badRequest(requestId, 'Invalid JSON in request body');
    }

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return errors.badRequest(requestId, 'Missing or invalid field: name');
    }

    if (!body.mode || typeof body.mode !== 'string') {
      return errors.badRequest(requestId, 'Missing or invalid field: mode');
    }

    // Normalize name (trim whitespace, lowercase for comparison)
    const name = body.name.trim();
    if (name.length === 0) {
      return errors.badRequest(requestId, 'Advertiser name cannot be empty');
    }

    if (name.length > 100) {
      return errors.badRequest(requestId, 'Advertiser name too long (max 100 characters)');
    }

    const description = body.description?.trim() || null;

    // Validate mode
    if (body.mode !== 'test' && body.mode !== 'production') {
      return errors.badRequest(
        requestId,
        'Invalid mode. Must be "test" or "production"'
      );
    }

    // Enforce: only test mode is currently enabled
    if (body.mode === 'production') {
      return error(
        'PRODUCTION_NOT_AVAILABLE',
        'Production mode is not yet available. Use mode: "test" for now. Production mode will be announced when available.',
        requestId,
        400
      );
    }

    // Check if advertiser name already exists (409 Conflict per retry policy)
    const existing = await env.DB
      .prepare('SELECT id, name FROM ai_advertisers WHERE LOWER(name) = LOWER(?)')
      .bind(name)
      .first();

    if (existing) {
      // Re-register: regenerate credentials for existing advertiser
      const { key: newApiKey, prefix: newPrefix } = generateAiAdvertiserApiKey();
      const newApiKeyHash = await hashApiKey(newApiKey);
      const newKeyId = generateKeyId();
      const newClaimToken = generateClaimToken();
      const newClaimUrl = `https://humanadsai.com/claim/${newClaimToken}`;
      const newVerificationCode = generateAiAdvertiserVerificationCode();

      await env.DB
        .prepare(`
          UPDATE ai_advertisers SET
            api_key_hash = ?, api_key_prefix = ?, key_id = ?,
            claim_url = ?, verification_code = ?,
            description = COALESCE(?, description),
            status = 'pending_claim', updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(
          newApiKeyHash, newPrefix, newKeyId,
          newClaimUrl, newVerificationCode,
          description,
          existing.id
        )
        .run();

      // Ensure agents table has a corresponding record (deals.agent_id FK)
      await env.DB
        .prepare(`
          INSERT OR IGNORE INTO agents (id, name, email, description, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
        `)
        .bind(
          existing.id,
          name,
          `${existing.id}@ai-advertiser.humanadsai.com`,
          description || `AI Advertiser: ${name}`
        )
        .run();

      return success({
        advertiser: {
          api_key: newApiKey,
          claim_url: newClaimUrl,
          verification_code: newVerificationCode,
          mode: body.mode
        },
        important: '⚠️ Credentials regenerated. Previous API key is now invalid.'
      }, requestId, 200);
    }

    // Generate credentials
    const { key: apiKey, prefix: apiKeyPrefix } = generateAiAdvertiserApiKey();
    const apiKeyHash = await hashApiKey(apiKey);
    const apiSecret = generateRandomString(64); // For future HMAC support
    const keyId = generateKeyId();
    const claimToken = generateClaimToken();
    const claimUrl = `https://humanadsai.com/claim/${claimToken}`;
    const verificationCode = generateAiAdvertiserVerificationCode();

    // Generate unique ID (use random string instead of UUID for CF Workers compatibility)
    const advertiserId = generateRandomString(32);

    // Insert into database
    const result = await env.DB
      .prepare(`
        INSERT INTO ai_advertisers (
          id, name, description, mode, status,
          api_key_hash, api_key_prefix, api_secret, key_id,
          claim_url, verification_code,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(
        advertiserId,
        name,
        description,
        body.mode,
        'pending_claim', // Initial status
        apiKeyHash,
        apiKeyPrefix,
        apiSecret,
        keyId,
        claimUrl,
        verificationCode
      )
      .run();

    if (!result.success) {
      console.error('[Register] Database insert failed:', result);
      return errors.internalError(requestId);
    }

    // Also insert into agents table (deals.agent_id has FK → agents.id)
    await env.DB
      .prepare(`
        INSERT OR IGNORE INTO agents (id, name, email, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
      `)
      .bind(
        advertiserId,
        name,
        `${advertiserId}@ai-advertiser.humanadsai.com`,
        description || `AI Advertiser: ${name}`
      )
      .run();

    // Return credentials (ONLY TIME they're visible in plaintext!)
    const responseData: RegisterAdvertiserResponse = {
      advertiser: {
        api_key: apiKey,
        claim_url: claimUrl,
        verification_code: verificationCode,
        mode: body.mode
      },
      important: '⚠️ SAVE YOUR API KEY! It will not be shown again.'
    };

    return success(responseData, requestId, 201);
  } catch (e: any) {
    console.error('[Register] Unexpected error:', e);
    return errors.internalError(requestId);
  }
}
