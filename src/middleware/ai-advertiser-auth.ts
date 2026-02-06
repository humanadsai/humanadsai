// AI Advertiser Authentication Middleware
// Validates Bearer token (api_key) for AI Advertiser API endpoints

import type { Env, AiAdvertiser } from '../types';
import { hashApiKey } from '../utils/crypto';

export interface AiAdvertiserAuthContext {
  advertiser: AiAdvertiser;
  requestId: string;
}

export interface AiAdvertiserAuthResult {
  success: boolean;
  context?: AiAdvertiserAuthContext;
  error?: {
    status: number;
    message: string;
    hint?: string;
  };
}

/**
 * Authenticate AI Advertiser using Bearer token
 *
 * Expected header: Authorization: Bearer humanads_XXXX
 *
 * @param request HTTP request
 * @param env Environment bindings
 * @param requestId Request ID for tracing
 * @returns Authentication result with advertiser context
 */
export async function authenticateAiAdvertiser(
  request: Request,
  env: Env,
  requestId: string
): Promise<AiAdvertiserAuthResult> {
  // Extract Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return {
      success: false,
      error: {
        status: 401,
        message: 'Missing Authorization header',
        hint: 'Include: Authorization: Bearer YOUR_API_KEY'
      }
    };
  }

  // Parse Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      success: false,
      error: {
        status: 401,
        message: 'Invalid Authorization header format',
        hint: 'Expected: Authorization: Bearer YOUR_API_KEY'
      }
    };
  }

  const apiKey = parts[1];

  // Validate API key format (humanads_XXXX)
  if (!apiKey.startsWith('humanads_')) {
    return {
      success: false,
      error: {
        status: 401,
        message: 'Invalid API key format',
        hint: 'API key must start with "humanads_"'
      }
    };
  }

  // Hash the API key for lookup
  const apiKeyHash = await hashApiKey(apiKey);

  // Look up advertiser by api_key_hash
  const advertiser = await env.DB
    .prepare('SELECT * FROM ai_advertisers WHERE api_key_hash = ?')
    .bind(apiKeyHash)
    .first<AiAdvertiser>();

  if (!advertiser) {
    return {
      success: false,
      error: {
        status: 401,
        message: 'Invalid API key',
        hint: 'API key not found. Check your credentials or register at POST /api/v1/advertisers/register'
      }
    };
  }

  // Check advertiser status
  if (advertiser.status === 'revoked') {
    return {
      success: false,
      error: {
        status: 403,
        message: 'API key has been revoked',
        hint: 'Contact support@humanadsai.com for assistance'
      }
    };
  }

  if (advertiser.status === 'suspended') {
    return {
      success: false,
      error: {
        status: 403,
        message: 'Advertiser account is suspended',
        hint: 'Contact support@humanadsai.com for assistance'
      }
    };
  }

  // Success!
  return {
    success: true,
    context: {
      advertiser,
      requestId
    }
  };
}

/**
 * Require advertiser to have 'active' status (human verification completed)
 *
 * @param context Authentication context
 * @returns Error if not active, null if active
 */
export function requireActiveStatus(
  context: AiAdvertiserAuthContext
): { status: number; message: string; hint?: string } | null {
  if (context.advertiser.status !== 'active') {
    return {
      status: 403,
      message: 'Advertiser must complete human claim and X verification',
      hint: `Current status: ${context.advertiser.status}. Visit your claim URL: ${context.advertiser.claim_url}`
    };
  }
  return null;
}
