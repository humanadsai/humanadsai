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
import { verifyTransaction, isTxHashUsed, getExplorerUrl } from '../../services/blockchain';
import { normalizeAddress } from '../../services/onchain';
import { createNotification } from '../../services/notifications';

// Treasury/Fee Vault addresses for receiving AUF payments (10%)
// These are the actual HumanAds fee collection addresses
const FEE_VAULT_ADDRESSES: Record<string, string> = {
  // EVM chains (all use the same address)
  ethereum: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  polygon: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  base: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  sepolia: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  base_sepolia: '0x5acd3371DB99f7D17DFaFD14b522148260862DE8',
  // Solana
  solana: '5xQeP26JTDyyUCdG7Sq63vyCWgEbATewCj5N2P7H5X8A',
  solana_devnet: '5xQeP26JTDyyUCdG7Sq63vyCWgEbATewCj5N2P7H5X8A',
};

// Minimum confirmations required for tx verification
const MIN_CONFIRMATIONS: Record<string, number> = {
  ethereum: 3,
  polygon: 5,
  base: 2,
  sepolia: 1,
  base_sepolia: 1,
  solana: 1,
  solana_devnet: 1,
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
      // Fee vault addresses for AUF payment (send to the one matching your chain)
      fee_vault_addresses: {
        evm: FEE_VAULT_ADDRESSES.ethereum, // Same for all EVM chains
        solana: FEE_VAULT_ADDRESSES.solana,
      },
      supported_chains: SUPPORTED_CHAINS,
      supported_tokens: SUPPORTED_TOKENS,
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
      walletAddress = appData.solana_wallet_address.trim();
    } else {
      if (!appData.evm_wallet_address) {
        return errors.invalidRequest(requestId, {
          message: 'Operator has not configured EVM wallet address',
        });
      }
      // Normalize to EIP-55 checksum
      walletAddress = normalizeAddress(appData.evm_wallet_address);
    }

    // Calculate payout amount (90%)
    const aufPercentage = appData.auf_percentage || 10;
    const payoutAmountCents = appData.reward_amount - Math.floor((appData.reward_amount * aufPercentage) / 100);

    // Get payout configuration
    const payoutConfig = getPayoutConfig(env);
    const payoutMode: PayoutMode = payoutConfig.mode;

    // Calculate AUF amount for verification
    const aufPercentageForVerify = appData.auf_percentage || 10;
    const aufAmountCentsForVerify = Math.floor((appData.reward_amount * aufPercentageForVerify) / 100);

    // Get expected treasury address
    const treasuryAddress = FEE_VAULT_ADDRESSES[body.chain];
    if (!treasuryAddress) {
      return errors.invalidRequest(requestId, {
        code: 'UNSUPPORTED_CHAIN',
        message: `Chain '${body.chain}' is not supported for AUF payments`,
      });
    }

    // In ledger mode, allow simulated tx hashes
    if (payoutMode === 'ledger') {
      // Accept any tx_hash in ledger mode (simulated payments)
      console.log(`[Ledger Mode] Simulated AUF payment: ${body.auf_tx_hash}`);
    } else {
      // ONCHAIN MODE: Reject simulated hashes explicitly
      if (isSimulatedTxHash(body.auf_tx_hash)) {
        return errors.invalidRequest(requestId, {
          code: 'AUF_SIMULATED_NOT_ALLOWED',
          message: 'Simulated transaction hashes are not allowed in onchain mode',
        });
      }

      // 1. Check if tx_hash has already been used (replay prevention)
      const txUsed = await isTxHashUsed(env.DB, body.auf_tx_hash, body.chain);
      if (txUsed) {
        return errors.invalidRequest(requestId, {
          code: 'AUF_ALREADY_USED',
          message: 'This transaction hash has already been used for another payment',
        });
      }

      // 2. Verify transaction on-chain
      const verification = await verifyTransaction(
        body.auf_tx_hash,
        body.chain,
        treasuryAddress,
        aufAmountCentsForVerify,
        body.token
      );

      if (!verification.verified) {
        // Map verification errors to specific error codes
        let errorCode = 'AUF_TX_INVALID';
        if (verification.error?.includes('not found')) {
          errorCode = 'AUF_TX_NOT_FOUND';
        } else if (verification.error?.includes('recipient')) {
          errorCode = 'AUF_WRONG_RECIPIENT';
        } else if (verification.error?.includes('Amount')) {
          errorCode = 'AUF_WRONG_AMOUNT';
        } else if (verification.error?.includes('token')) {
          errorCode = 'AUF_WRONG_TOKEN';
        }

        return errors.invalidRequest(requestId, {
          code: errorCode,
          message: verification.error || 'AUF transaction verification failed',
          expected: {
            to: treasuryAddress,
            amount_cents: aufAmountCentsForVerify,
            token: body.token,
            chain: body.chain,
          },
        });
      }

      // 3. Check confirmations (optional, for extra safety)
      const minConfirmations = MIN_CONFIRMATIONS[body.chain] || 1;
      if (verification.details && verification.details.confirmations < minConfirmations) {
        return errors.invalidRequest(requestId, {
          code: 'AUF_NOT_CONFIRMED_YET',
          message: `Transaction needs at least ${minConfirmations} confirmations. Current: ${verification.details.confirmations}`,
        });
      }

      console.log(`[OnChain Mode] AUF verified: ${body.auf_tx_hash}`, verification.details);
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

    // Notify operator: AUF paid, payment initiated
    const dealForAuf = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
      .bind(appData.deal_id).first<{ title: string }>();
    await createNotification(env.DB, {
      recipientId: appData.operator_id,
      type: 'payout_auf_paid',
      title: 'Payment Initiated',
      body: `Payment initiated for '${dealForAuf?.title || 'a mission'}'`,
      referenceType: 'mission',
      referenceId: appData.mission_id,
      metadata: { deal_title: dealForAuf?.title, deal_id: appData.deal_id },
    });

    const response: UnlockAddressResponse = {
      mission_id: appData.mission_id,
      status: 'address_unlocked',
      wallet_address: walletAddress,
      payout_amount_cents: payoutAmountCents,
      payout_deadline_at: appData.payout_deadline_at,
      chain: body.chain,
      token: body.token,
      // Transaction verification info
      auf_tx_verified: true,
      auf_explorer_url: getExplorerUrl(body.auf_tx_hash, body.chain),
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

    // Get operator's wallet address for verification
    const operatorWallet = await env.DB.prepare(
      `SELECT evm_wallet_address, solana_wallet_address FROM operators WHERE id = ?`
    ).bind(appData.operator_id).first<{
      evm_wallet_address: string | null;
      solana_wallet_address: string | null;
    }>();

    if (!operatorWallet) {
      return errors.internalError(requestId);
    }

    // Determine expected recipient based on chain
    let expectedRecipient: string;
    if (body.chain === 'solana' || body.chain === 'solana_devnet') {
      if (!operatorWallet.solana_wallet_address) {
        return errors.invalidRequest(requestId, {
          code: 'OPERATOR_WALLET_NOT_SET',
          message: 'Operator has not configured Solana wallet address',
        });
      }
      expectedRecipient = operatorWallet.solana_wallet_address;
    } else {
      if (!operatorWallet.evm_wallet_address) {
        return errors.invalidRequest(requestId, {
          code: 'OPERATOR_WALLET_NOT_SET',
          message: 'Operator has not configured EVM wallet address',
        });
      }
      expectedRecipient = operatorWallet.evm_wallet_address;
    }

    // Calculate expected payout amount
    const aufPercentageForVerify = appData.auf_percentage || 10;
    const payoutAmountCentsForVerify = appData.reward_amount - Math.floor((appData.reward_amount * aufPercentageForVerify) / 100);

    // In ledger mode, allow simulated tx hashes
    if (payoutMode === 'ledger') {
      console.log(`[Ledger Mode] Simulated payout: ${body.payout_tx_hash}`);
    } else {
      // ONCHAIN MODE: Reject simulated hashes explicitly
      if (isSimulatedTxHash(body.payout_tx_hash)) {
        return errors.invalidRequest(requestId, {
          code: 'PAYOUT_SIMULATED_NOT_ALLOWED',
          message: 'Simulated transaction hashes are not allowed in onchain mode',
        });
      }

      // 1. Check if tx_hash has already been used (replay prevention)
      const txUsed = await isTxHashUsed(env.DB, body.payout_tx_hash, body.chain);
      if (txUsed) {
        return errors.invalidRequest(requestId, {
          code: 'PAYOUT_ALREADY_USED',
          message: 'This transaction hash has already been used for another payment',
        });
      }

      // 2. Verify transaction on-chain
      const verification = await verifyTransaction(
        body.payout_tx_hash,
        body.chain,
        expectedRecipient,
        payoutAmountCentsForVerify,
        body.token
      );

      if (!verification.verified) {
        // Map verification errors to specific error codes
        let errorCode = 'PAYOUT_TX_INVALID';
        if (verification.error?.includes('not found')) {
          errorCode = 'PAYOUT_TX_NOT_FOUND';
        } else if (verification.error?.includes('recipient')) {
          errorCode = 'PAYOUT_WRONG_RECIPIENT';
        } else if (verification.error?.includes('Amount')) {
          errorCode = 'PAYOUT_WRONG_AMOUNT';
        } else if (verification.error?.includes('token')) {
          errorCode = 'PAYOUT_WRONG_TOKEN';
        }

        return errors.invalidRequest(requestId, {
          code: errorCode,
          message: verification.error || 'Payout transaction verification failed',
          expected: {
            to: expectedRecipient,
            amount_cents: payoutAmountCentsForVerify,
            token: body.token,
            chain: body.chain,
          },
        });
      }

      // 3. Check confirmations
      const minConfirmations = MIN_CONFIRMATIONS[body.chain] || 1;
      if (verification.details && verification.details.confirmations < minConfirmations) {
        return errors.invalidRequest(requestId, {
          code: 'PAYOUT_NOT_CONFIRMED_YET',
          message: `Transaction needs at least ${minConfirmations} confirmations. Current: ${verification.details.confirmations}`,
        });
      }

      console.log(`[OnChain Mode] Payout verified: ${body.payout_tx_hash}`, verification.details);
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

    // Notify operator: payout confirmed
    const dealForPayout = await env.DB.prepare('SELECT title FROM deals WHERE id = ?')
      .bind(appData.deal_id).first<{ title: string }>();
    await createNotification(env.DB, {
      recipientId: appData.operator_id,
      type: 'payout_confirmed',
      title: 'Payment Complete',
      body: `Payment of ${(payoutAmountCents / 100).toFixed(2)} hUSD for '${dealForPayout?.title || 'a mission'}' is complete`,
      referenceType: 'mission',
      referenceId: appData.mission_id,
      metadata: { deal_title: dealForPayout?.title, deal_id: appData.deal_id, amount: (payoutAmountCents / 100).toFixed(2) },
    });

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
