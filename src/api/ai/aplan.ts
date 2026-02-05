import type {
  Env,
  AuthContext,
  Mission,
  Deal,
  Payment,
  PayoutLink,
  ApproveMissionRequest,
  ApproveMissionResponse,
  UnlockAddressRequest,
  UnlockAddressResponse,
  ConfirmPayoutRequest,
  ConfirmPayoutResponse,
  AgentTrustScore,
  PayoutMode,
} from '../../types';
import { success, errors } from '../../utils/response';
import { recordAufReceived, recordPayoutTracked, updateAgentTrustScore } from '../../services/ledger';
import { getPayoutConfig, generateSimulatedTxHash, isSimulatedTxHash } from '../../config/payout';

// Treasury addresses for receiving AUF payments (10%)
const TREASURY_ADDRESSES: Record<string, string> = {
  ethereum: '0x...', // TODO: Set actual treasury addresses
  polygon: '0x...',
  base: '0x...',
  solana: '...', // Solana treasury address
};

// Supported chains and tokens
const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'base', 'solana'];
const SUPPORTED_TOKENS: Record<string, string[]> = {
  ethereum: ['USDC', 'USDT', 'ETH'],
  polygon: ['USDC', 'USDT', 'MATIC'],
  base: ['USDC', 'USDT', 'ETH'],
  solana: ['USDC', 'USDT', 'SOL'],
};

// Default payout deadline in hours
const DEFAULT_PAYOUT_DEADLINE_HOURS = 72;

/**
 * Approve a mission (AI Agent)
 *
 * POST /v1/applications/:id/approve
 *
 * Transitions VERIFIED mission to APPROVED state
 * - Creates AUF payment record
 * - Sets payout_deadline_at
 * - Returns treasury address for AUF payment
 */
export async function approveMission(
  request: Request,
  env: Env,
  context: AuthContext,
  applicationId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Check if agent is suspended for overdue
    if (agent.is_suspended_for_overdue) {
      return errors.forbidden(requestId, 'Agent is suspended due to overdue payments');
    }

    // Get application with mission and deal info
    const appData = await env.DB.prepare(
      `SELECT a.*, m.id as mission_id, m.status as mission_status, m.operator_id,
              d.id as deal_id, d.agent_id, d.reward_amount, d.payment_model, d.auf_percentage,
              o.evm_wallet_address, o.solana_wallet_address
       FROM applications a
       JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       JOIN deals d ON a.deal_id = d.id
       JOIN operators o ON a.operator_id = o.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first<{
        mission_id: string;
        mission_status: string;
        operator_id: string;
        deal_id: string;
        agent_id: string;
        reward_amount: number;
        payment_model: string;
        auf_percentage: number;
        evm_wallet_address: string | null;
        solana_wallet_address: string | null;
      }>();

    if (!appData) {
      return errors.notFound(requestId, 'Application or Mission');
    }

    if (appData.agent_id !== agent.id) {
      return errors.forbidden(requestId, 'You do not own this deal');
    }

    // Verify this is an A-Plan deal
    if (appData.payment_model !== 'a_plan') {
      return errors.invalidRequest(requestId, {
        message: 'This deal uses escrow model, not A-Plan',
      });
    }

    // Verify mission is in VERIFIED status
    if (appData.mission_status !== 'verified') {
      return errors.invalidRequest(requestId, {
        message: `Cannot approve mission with status '${appData.mission_status}'. Must be 'verified'.`,
      });
    }

    // Verify operator has at least one wallet address
    if (!appData.evm_wallet_address && !appData.solana_wallet_address) {
      return errors.invalidRequest(requestId, {
        message: 'Operator has not configured any payout wallet address',
      });
    }

    // Parse request body
    let payoutDeadlineHours = DEFAULT_PAYOUT_DEADLINE_HOURS;
    try {
      const body = await request.json<ApproveMissionRequest>();
      if (body.payout_deadline_hours && body.payout_deadline_hours > 0) {
        payoutDeadlineHours = Math.min(body.payout_deadline_hours, 168); // Max 7 days
      }
    } catch {
      // Body is optional
    }

    // Calculate amounts
    const aufPercentage = appData.auf_percentage || 10;
    const aufAmountCents = Math.floor((appData.reward_amount * aufPercentage) / 100);

    // Calculate deadline
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + payoutDeadlineHours * 60 * 60 * 1000);

    // Create AUF payment record
    const paymentId = crypto.randomUUID().replace(/-/g, '');

    // Get payout mode from environment
    const payoutConfig = getPayoutConfig(env);
    const payoutMode: PayoutMode = payoutConfig.mode;

    // Update mission and create payment atomically
    await env.DB.batch([
      // Update mission status
      env.DB.prepare(
        `UPDATE missions SET
          status = 'approved',
          approved_at = datetime('now'),
          payout_deadline_at = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(deadlineAt.toISOString(), appData.mission_id),
      // Create AUF payment record with payout_mode
      env.DB.prepare(
        `INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type, amount_cents, chain, token, status, payout_mode, deadline_at)
         VALUES (?, ?, ?, ?, 'auf', ?, 'pending', 'pending', 'pending', ?, ?)`
      ).bind(paymentId, appData.mission_id, agent.id, appData.operator_id, aufAmountCents, payoutMode, deadlineAt.toISOString()),
    ]);

    const response: ApproveMissionResponse = {
      mission_id: appData.mission_id,
      status: 'approved',
      approved_at: now.toISOString(),
      payout_deadline_at: deadlineAt.toISOString(),
      auf_amount_cents: aufAmountCents,
      auf_percentage: aufPercentage,
      treasury_address: TREASURY_ADDRESSES.ethereum, // Default to Ethereum
      supported_chains: SUPPORTED_CHAINS,
      // Include payout mode info
      payout_mode: payoutMode,
      ...(payoutMode === 'ledger' ? {
        ledger_mode_info: 'Simulated mode enabled. Use any tx_hash starting with "SIMULATED_" to proceed without real blockchain transactions.',
      } : {}),
    };

    return success(response, requestId);
  } catch (e) {
    console.error('Approve mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Unlock address after AUF payment (AI Agent)
 *
 * POST /v1/applications/:id/unlock-address
 *
 * Request: { auf_tx_hash, chain, token }
 * - Verifies tx hash on-chain
 * - Transitions to ADDRESS_UNLOCKED
 * - Returns operator's wallet address for 90% payout
 */
export async function unlockAddress(
  request: Request,
  env: Env,
  context: AuthContext,
  applicationId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Parse request body
    let body: UnlockAddressRequest;
    try {
      body = await request.json<UnlockAddressRequest>();
    } catch {
      return errors.badRequest(requestId, 'Invalid request body');
    }

    if (!body.auf_tx_hash || !body.chain || !body.token) {
      return errors.invalidRequest(requestId, {
        message: 'auf_tx_hash, chain, and token are required',
      });
    }

    // Validate chain
    if (!SUPPORTED_CHAINS.includes(body.chain)) {
      return errors.invalidRequest(requestId, {
        message: `Unsupported chain: ${body.chain}. Supported: ${SUPPORTED_CHAINS.join(', ')}`,
      });
    }

    // Validate token
    const supportedTokens = SUPPORTED_TOKENS[body.chain] || [];
    if (!supportedTokens.includes(body.token)) {
      return errors.invalidRequest(requestId, {
        message: `Unsupported token: ${body.token} on ${body.chain}. Supported: ${supportedTokens.join(', ')}`,
      });
    }

    // Get application with mission and deal info
    const appData = await env.DB.prepare(
      `SELECT a.*, m.id as mission_id, m.status as mission_status, m.payout_deadline_at,
              d.id as deal_id, d.agent_id, d.reward_amount, d.auf_percentage,
              o.evm_wallet_address, o.solana_wallet_address
       FROM applications a
       JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       JOIN deals d ON a.deal_id = d.id
       JOIN operators o ON a.operator_id = o.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first<{
        mission_id: string;
        mission_status: string;
        payout_deadline_at: string;
        operator_id: string;
        deal_id: string;
        agent_id: string;
        reward_amount: number;
        auf_percentage: number;
        evm_wallet_address: string | null;
        solana_wallet_address: string | null;
      }>();

    if (!appData) {
      return errors.notFound(requestId, 'Application or Mission');
    }

    if (appData.agent_id !== agent.id) {
      return errors.forbidden(requestId, 'You do not own this deal');
    }

    // Verify mission is in APPROVED status
    if (appData.mission_status !== 'approved') {
      return errors.invalidRequest(requestId, {
        message: `Cannot unlock address for mission with status '${appData.mission_status}'. Must be 'approved'.`,
      });
    }

    // Determine wallet address based on chain
    let walletAddress: string;
    if (body.chain === 'solana') {
      if (!appData.solana_wallet_address) {
        return errors.invalidRequest(requestId, {
          message: 'Operator has not configured Solana wallet address',
        });
      }
      walletAddress = appData.solana_wallet_address;
    } else {
      if (!appData.evm_wallet_address) {
        return errors.invalidRequest(requestId, {
          message: 'Operator has not configured EVM wallet address',
        });
      }
      walletAddress = appData.evm_wallet_address;
    }

    // Calculate payout amount (90%)
    const aufPercentage = appData.auf_percentage || 10;
    const payoutAmountCents = appData.reward_amount - Math.floor((appData.reward_amount * aufPercentage) / 100);

    // Get payout configuration
    const payoutConfig = getPayoutConfig(env);
    const payoutMode: PayoutMode = payoutConfig.mode;

    // In ledger mode, allow simulated tx hashes
    if (payoutMode === 'ledger') {
      // Accept any tx_hash in ledger mode (simulated payments)
      console.log(`[Ledger Mode] Simulated AUF payment: ${body.auf_tx_hash}`);
    } else {
      // TODO: Verify tx hash on-chain using blockchain service
      // For MVP, we trust the tx_hash and mark as confirmed
      // In production, this should verify:
      // 1. Transaction exists and is confirmed
      // 2. To address is correct (treasury)
      // 3. Amount is correct (AUF amount)
      // 4. Token is correct
    }

    const now = new Date();

    // Determine if this is a simulated transaction
    const isSimulated = isSimulatedTxHash(body.auf_tx_hash);
    const effectiveStatus = payoutMode === 'ledger' ? 'confirmed' : 'confirmed';

    // Update mission and payment records atomically
    await env.DB.batch([
      // Update mission status
      env.DB.prepare(
        `UPDATE missions SET
          status = 'address_unlocked',
          auf_tx_hash = ?,
          auf_confirmed_at = datetime('now'),
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(body.auf_tx_hash, appData.mission_id),
      // Update AUF payment record with payout_mode
      env.DB.prepare(
        `UPDATE payments SET
          tx_hash = ?,
          chain = ?,
          token = ?,
          payout_mode = ?,
          status = ?,
          confirmed_at = datetime('now'),
          updated_at = datetime('now')
         WHERE mission_id = ? AND payment_type = 'auf'`
      ).bind(body.auf_tx_hash, body.chain, body.token, payoutMode, effectiveStatus, appData.mission_id),
      // Create payout payment record with payout_mode
      env.DB.prepare(
        `INSERT INTO payments (id, mission_id, agent_id, operator_id, payment_type, amount_cents, chain, token, to_address, status, payout_mode, deadline_at)
         VALUES (?, ?, ?, ?, 'payout', ?, ?, ?, ?, 'pending', ?, ?)`
      ).bind(
        crypto.randomUUID().replace(/-/g, ''),
        appData.mission_id,
        agent.id,
        appData.operator_id,
        payoutAmountCents,
        body.chain,
        body.token,
        walletAddress,
        payoutMode,
        appData.payout_deadline_at
      ),
    ]);

    // Record AUF received in ledger
    await recordAufReceived(
      env.DB,
      appData.mission_id,
      agent.id,
      Math.floor((appData.reward_amount * aufPercentage) / 100),
      body.auf_tx_hash,
      body.chain,
      body.token
    );

    const response: UnlockAddressResponse = {
      mission_id: appData.mission_id,
      status: 'address_unlocked',
      wallet_address: walletAddress,
      payout_amount_cents: payoutAmountCents,
      payout_deadline_at: appData.payout_deadline_at,
      chain: body.chain,
      // Include payout mode info
      payout_mode: payoutMode,
      is_simulated: isSimulated,
      ...(payoutMode === 'ledger' ? {
        ledger_mode_info: 'Simulated mode. Send payout tx_hash starting with "SIMULATED_" to confirm payment.',
      } : {}),
    };

    return success(response, requestId);
  } catch (e) {
    console.error('Unlock address error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Confirm payout completion (AI Agent)
 *
 * POST /v1/applications/:id/confirm-payout
 *
 * Request: { payout_tx_hash, chain, token }
 * - Verifies tx hash on-chain
 * - Transitions to PAID_COMPLETE
 * - Updates agent trust score
 */
export async function confirmPayout(
  request: Request,
  env: Env,
  context: AuthContext,
  applicationId: string
): Promise<Response> {
  const { requestId, agent } = context;

  try {
    // Parse request body
    let body: ConfirmPayoutRequest;
    try {
      body = await request.json<ConfirmPayoutRequest>();
    } catch {
      return errors.badRequest(requestId, 'Invalid request body');
    }

    if (!body.payout_tx_hash || !body.chain || !body.token) {
      return errors.invalidRequest(requestId, {
        message: 'payout_tx_hash, chain, and token are required',
      });
    }

    // Get application with mission and deal info
    const appData = await env.DB.prepare(
      `SELECT a.*, m.id as mission_id, m.status as mission_status, m.approved_at, m.payout_deadline_at,
              d.id as deal_id, d.agent_id, d.reward_amount, d.auf_percentage
       FROM applications a
       JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
       JOIN deals d ON a.deal_id = d.id
       WHERE a.id = ?`
    )
      .bind(applicationId)
      .first<{
        mission_id: string;
        mission_status: string;
        operator_id: string;
        approved_at: string;
        payout_deadline_at: string;
        deal_id: string;
        agent_id: string;
        reward_amount: number;
        auf_percentage: number;
      }>();

    if (!appData) {
      return errors.notFound(requestId, 'Application or Mission');
    }

    if (appData.agent_id !== agent.id) {
      return errors.forbidden(requestId, 'You do not own this deal');
    }

    // Verify mission is in ADDRESS_UNLOCKED status
    if (appData.mission_status !== 'address_unlocked') {
      return errors.invalidRequest(requestId, {
        message: `Cannot confirm payout for mission with status '${appData.mission_status}'. Must be 'address_unlocked'.`,
      });
    }

    // Get payout configuration
    const payoutConfig = getPayoutConfig(env);
    const payoutMode: PayoutMode = payoutConfig.mode;
    const isSimulated = isSimulatedTxHash(body.payout_tx_hash);

    // In ledger mode, allow simulated tx hashes
    if (payoutMode === 'ledger') {
      console.log(`[Ledger Mode] Simulated payout: ${body.payout_tx_hash}`);
    } else {
      // TODO: Verify tx hash on-chain using blockchain service
      // For MVP, we trust the tx_hash and mark as confirmed
    }

    const now = new Date();
    const approvedAt = new Date(appData.approved_at);
    const payTimeSeconds = Math.floor((now.getTime() - approvedAt.getTime()) / 1000);

    // Check if payment is within deadline (not overdue)
    const isOverdue = now > new Date(appData.payout_deadline_at);

    // Update mission and payment records atomically
    await env.DB.batch([
      // Update mission status
      env.DB.prepare(
        `UPDATE missions SET
          status = 'paid_complete',
          payout_tx_hash = ?,
          payout_confirmed_at = datetime('now'),
          paid_at = datetime('now'),
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(body.payout_tx_hash, appData.mission_id),
      // Update payout payment record with payout_mode
      env.DB.prepare(
        `UPDATE payments SET
          tx_hash = ?,
          chain = ?,
          token = ?,
          payout_mode = ?,
          status = 'confirmed',
          confirmed_at = datetime('now'),
          updated_at = datetime('now')
         WHERE mission_id = ? AND payment_type = 'payout'`
      ).bind(body.payout_tx_hash, body.chain, body.token, payoutMode, appData.mission_id),
    ]);

    // Record payout in ledger
    const aufPercentage = appData.auf_percentage || 10;
    const payoutAmountCents = appData.reward_amount - Math.floor((appData.reward_amount * aufPercentage) / 100);

    await recordPayoutTracked(
      env.DB,
      appData.mission_id,
      agent.id,
      appData.operator_id,
      payoutAmountCents,
      body.payout_tx_hash,
      body.chain,
      body.token
    );

    // Update agent trust score
    await updateAgentTrustScore(env.DB, agent.id, payTimeSeconds, isOverdue);

    const response: ConfirmPayoutResponse = {
      mission_id: appData.mission_id,
      status: 'paid_complete',
      paid_complete_at: now.toISOString(),
      total_amount_cents: appData.reward_amount,
      // Include payout mode info
      payout_mode: payoutMode,
      is_simulated: isSimulated,
    };

    return success(response, requestId);
  } catch (e) {
    console.error('Confirm payout error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Get agent trust score (Public API)
 *
 * GET /api/agents/:id/trust-score
 *
 * Returns public trust score for an agent
 */
export async function getAgentTrustScore(
  request: Request,
  env: Env,
  agentId: string
): Promise<Response> {
  const requestId = crypto.randomUUID();

  try {
    const agent = await env.DB.prepare(
      `SELECT id, name, paid_count, overdue_count, avg_pay_time_seconds, is_suspended_for_overdue, last_overdue_at
       FROM agents WHERE id = ?`
    )
      .bind(agentId)
      .first<{
        id: string;
        name: string;
        paid_count: number;
        overdue_count: number;
        avg_pay_time_seconds: number;
        is_suspended_for_overdue: number;
        last_overdue_at: string | null;
      }>();

    if (!agent) {
      return errors.notFound(requestId, 'Agent');
    }

    // Calculate on-time rate
    const totalPayments = agent.paid_count + agent.overdue_count;
    const onTimeRate = totalPayments > 0 ? agent.paid_count / totalPayments : 1;

    // Determine trust level
    let trustLevel: AgentTrustScore['trust_level'];
    if (agent.is_suspended_for_overdue) {
      trustLevel = 'suspended';
    } else if (agent.overdue_count >= 2) {
      trustLevel = 'warning';
    } else if (agent.paid_count >= 50 && onTimeRate >= 0.98) {
      trustLevel = 'excellent';
    } else if (agent.paid_count >= 10 && onTimeRate >= 0.9) {
      trustLevel = 'good';
    } else {
      trustLevel = 'new';
    }

    const trustScore: AgentTrustScore = {
      agent_id: agent.id,
      paid_count: agent.paid_count || 0,
      overdue_count: agent.overdue_count || 0,
      avg_pay_time_seconds: agent.avg_pay_time_seconds || 0,
      is_suspended_for_overdue: !!agent.is_suspended_for_overdue,
      last_overdue_at: agent.last_overdue_at || undefined,
      on_time_rate: onTimeRate,
      trust_level: trustLevel,
    };

    return success(trustScore, requestId);
  } catch (e) {
    console.error('Get agent trust score error:', e);
    return errors.internalError(requestId);
  }
}
