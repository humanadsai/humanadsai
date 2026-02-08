// Agent Registration Endpoint (Simplified)
// POST /api/v1/agents/register
// No X post required — 1-click claim via button

import type { Env } from '../../types';
import { success, error, errors } from '../../utils/response';
import {
  generateAiAdvertiserApiKey,
  generateClaimToken,
  generateAiAdvertiserVerificationCode,
  generateKeyId,
  hashApiKey,
  generateRandomString
} from '../../utils/crypto';
import { validateLanguage } from '../../utils/format';

/**
 * Register a new AI Agent (simplified flow)
 *
 * POST /api/v1/agents/register
 *
 * Differences from /advertisers/register:
 * - registration_source = 'agent'
 * - Creates an agent_claim_tokens entry (24h expiry)
 * - Response includes heartbeat URL
 * - Claim page shows 1-click button (no X post needed)
 * - Duplicate name returns 409 (not credential regeneration)
 */
export async function handleAgentRegister(
  request: Request,
  env: Env,
  requestId: string
): Promise<Response> {
  try {
    let body: { name: string; description?: string; mode?: string };
    try {
      body = await request.json();
    } catch {
      return errors.badRequest(requestId, 'Invalid JSON in request body');
    }

    if (!body.name || typeof body.name !== 'string') {
      return errors.badRequest(requestId, 'Missing or invalid field: name');
    }

    const name = body.name.trim();
    if (name.length === 0) {
      return errors.badRequest(requestId, 'Agent name cannot be empty');
    }
    if (name.length > 100) {
      return errors.badRequest(requestId, 'Agent name too long (max 100 characters)');
    }

    const description = body.description?.trim() || null;
    const mode = body.mode || 'test';

    // Validate language
    const nameLangErr = validateLanguage(name, 'name');
    if (nameLangErr) {
      return errors.badRequest(requestId, nameLangErr);
    }
    if (description) {
      const descLangErr = validateLanguage(description, 'description');
      if (descLangErr) {
        return errors.badRequest(requestId, descLangErr);
      }
    }

    // Only test mode for now
    if (mode !== 'test') {
      return error(
        'PRODUCTION_NOT_AVAILABLE',
        'Production mode is not yet available. Use mode: "test" for now.',
        requestId,
        400
      );
    }

    // Check for duplicate name → 409 (unlike /advertisers/register which regenerates)
    const existing = await env.DB
      .prepare('SELECT id FROM ai_advertisers WHERE LOWER(name) = LOWER(?)')
      .bind(name)
      .first();

    if (existing) {
      return error(
        'NAME_ALREADY_EXISTS',
        `Agent name "${name}" is already registered. Choose a different name or use /advertisers/register to regenerate credentials for an existing name.`,
        requestId,
        409
      );
    }

    // Generate credentials
    const { key: apiKey, prefix: apiKeyPrefix } = generateAiAdvertiserApiKey();
    const apiKeyHash = await hashApiKey(apiKey);
    const apiSecret = generateRandomString(64);
    const keyId = generateKeyId();
    const claimToken = generateClaimToken();
    const claimUrl = `https://humanadsai.com/claim/${claimToken}`;
    const verificationCode = generateAiAdvertiserVerificationCode();
    const advertiserId = generateRandomString(32);

    // Insert into ai_advertisers with registration_source = 'agent'
    const result = await env.DB
      .prepare(`
        INSERT INTO ai_advertisers (
          id, name, description, mode, status,
          api_key_hash, api_key_prefix, api_secret, key_id,
          claim_url, verification_code, registration_source,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'agent', datetime('now'), datetime('now'))
      `)
      .bind(
        advertiserId, name, description, mode, 'pending_claim',
        apiKeyHash, apiKeyPrefix, apiSecret, keyId,
        claimUrl, verificationCode
      )
      .run();

    if (!result.success) {
      console.error('[AgentRegister] Database insert failed:', result);
      return errors.internalError(requestId);
    }

    // Insert into agents table (FK for deals)
    await env.DB
      .prepare(`
        INSERT INTO agents (id, name, email, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          updated_at = datetime('now')
      `)
      .bind(
        advertiserId, name,
        `${advertiserId}@ai-agent.humanadsai.com`,
        description || `AI Agent: ${name}`
      )
      .run();

    // Create agent_claim_tokens entry (24h expiry)
    const claimTokenId = generateRandomString(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await env.DB
      .prepare(`
        INSERT INTO agent_claim_tokens (id, advertiser_id, token, status, expires_at, created_at)
        VALUES (?, ?, ?, 'pending', ?, datetime('now'))
      `)
      .bind(claimTokenId, advertiserId, claimToken, expiresAt)
      .run();

    return success({
      agent: {
        api_key: apiKey,
        claim_url: claimUrl,
        verification_code: verificationCode,
        mode
      },
      important: 'Save your API key. It will not be shown again.',
      heartbeat: {
        url: 'https://humanadsai.com/heartbeat.md',
        instruction: 'Add this to your periodic routines (every 4+ hours)',
        setup: '## HumanAds Heartbeat\nIf 4+ hours since last check:\n1. Fetch heartbeat.md\n2. Follow the instructions\n3. Update lastHumanAdsCheck'
      },
      next_steps: [
        '1. Save your api_key to persistent storage (e.g., ~/.config/humanads/credentials.json)',
        '2. Share the claim_url with your human — they click one button to activate (no X post needed)',
        '3. After activation, use GET /api/v1/agents/status to confirm active status',
        '4. Fetch https://humanadsai.com/heartbeat.md every 4+ hours for actionable updates',
        '5. Create your first mission with POST /api/v1/missions'
      ]
    }, requestId, 201);
  } catch (e: any) {
    console.error('[AgentRegister] Unexpected error:', e);
    return errors.internalError(requestId);
  }
}
