/**
 * Operator Wallet API
 *
 * GET /api/operator/wallets - Get operator wallet addresses
 * POST /api/operator/wallets - Update operator wallet addresses
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
async function getAuthenticatedOperator(request: Request, env: Env): Promise<{ id: string } | null> {
  const sessionToken = getSessionToken(request);
  if (!sessionToken) return null;

  const sessionHash = await sha256Hex(sessionToken);

  try {
    const operator = await env.DB.prepare(`
      SELECT id FROM operators
      WHERE session_token_hash = ?
        AND session_expires_at > datetime('now')
    `)
      .bind(sessionHash)
      .first<{ id: string }>();

    return operator;
  } catch (e) {
    console.error('[Wallets API] Error checking session:', e);
    return null;
  }
}

/**
 * GET /api/operator/wallets
 */
export async function getOperatorWallets(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) {
    return errors.unauthorized(requestId, 'Not authenticated');
  }

  try {
    // Check if wallet columns exist
    const hasWalletColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'evm_wallet_address'"
    ).first<{ count: number }>();

    if ((hasWalletColumns?.count || 0) === 0) {
      // Columns don't exist yet, return empty
      return success({
        evm_wallet_address: null,
        solana_wallet_address: null,
      }, requestId);
    }

    const wallets = await env.DB.prepare(`
      SELECT evm_wallet_address, solana_wallet_address
      FROM operators
      WHERE id = ?
    `)
      .bind(operator.id)
      .first<{ evm_wallet_address: string | null; solana_wallet_address: string | null }>();

    return success({
      evm_wallet_address: wallets?.evm_wallet_address || null,
      solana_wallet_address: wallets?.solana_wallet_address || null,
    }, requestId);
  } catch (e) {
    console.error('[Wallets API] Error fetching wallets:', e);
    return errors.internalError(requestId);
  }
}

/**
 * POST /api/operator/wallets
 */
export async function updateOperatorWallets(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  const operator = await getAuthenticatedOperator(request, env);
  if (!operator) {
    return errors.unauthorized(requestId, 'Not authenticated');
  }

  let body: { evm_wallet_address?: string | null; solana_wallet_address?: string | null };
  try {
    body = await request.json();
  } catch (e) {
    return errors.invalidRequest(requestId, 'Invalid JSON body');
  }

  const { evm_wallet_address, solana_wallet_address } = body;

  // Validate EVM address
  if (evm_wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(evm_wallet_address)) {
    return errors.invalidRequest(requestId, 'Invalid EVM address format');
  }

  // Validate Solana address (basic check)
  if (solana_wallet_address && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(solana_wallet_address)) {
    return errors.invalidRequest(requestId, 'Invalid Solana address format');
  }

  try {
    // Check if wallet columns exist
    const hasWalletColumns = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM pragma_table_info('operators') WHERE name = 'evm_wallet_address'"
    ).first<{ count: number }>();

    if ((hasWalletColumns?.count || 0) === 0) {
      // Add columns if they don't exist
      await env.DB.prepare(`
        ALTER TABLE operators ADD COLUMN evm_wallet_address TEXT
      `).run();
      await env.DB.prepare(`
        ALTER TABLE operators ADD COLUMN solana_wallet_address TEXT
      `).run();
    }

    // Update wallet addresses
    await env.DB.prepare(`
      UPDATE operators
      SET evm_wallet_address = ?,
          solana_wallet_address = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `)
      .bind(
        evm_wallet_address || null,
        solana_wallet_address || null,
        operator.id
      )
      .run();

    return success({
      message: 'Wallet addresses updated',
      evm_wallet_address: evm_wallet_address || null,
      solana_wallet_address: solana_wallet_address || null,
    }, requestId);
  } catch (e) {
    console.error('[Wallets API] Error updating wallets:', e);
    return errors.internalError(requestId);
  }
}
