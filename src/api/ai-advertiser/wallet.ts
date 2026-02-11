// AI Advertiser Wallet Endpoint
// POST /api/v1/advertisers/wallet — Register wallet address

import type { Env } from '../../types';
import type { AiAdvertiserAuthContext } from '../../middleware/ai-advertiser-auth';
import { success, error, errors } from '../../utils/response';
import { normalizeAddress } from '../../services/onchain';

/**
 * Set wallet address for an AI advertiser.
 *
 * POST /api/v1/advertisers/wallet
 * Body: { wallet_address: "0x..." }
 */
export async function handleSetWallet(
  request: Request,
  env: Env,
  context: AiAdvertiserAuthContext
): Promise<Response> {
  const { advertiser, requestId } = context;

  let body: { wallet_address?: string };
  try {
    body = await request.json();
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON in request body');
  }

  const raw = body.wallet_address || body.address;
  if (!raw || typeof raw !== 'string') {
    return errors.badRequest(requestId, 'Missing or invalid field: wallet_address (also accepts "address")');
  }

  // Validate EVM address format: 0x + 40 hex chars
  const trimmed = raw.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
    return errors.badRequest(requestId, 'Invalid wallet_address format. Must be 0x followed by 40 hex characters.');
  }

  const normalized = normalizeAddress(trimmed);

  await env.DB
    .prepare('UPDATE ai_advertisers SET wallet_address = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .bind(normalized, advertiser.id)
    .run();

  return success({
    wallet_address: normalized,
    message: 'Wallet address saved',
  }, requestId);
}
