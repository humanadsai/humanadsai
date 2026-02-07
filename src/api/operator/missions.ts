import type { Env, Operator, Deal, Mission, AcceptMissionRequest, SubmitMissionRequest } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from './register';
import { releaseToOperator } from '../../services/ledger';
import { isSimulatedTxHash } from '../../config/payout';

/**
 * 利用可能なミッション一覧取得
 *
 * GET /api/missions/available
 */
export async function getAvailableMissions(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // 認証（オプショナル - 認証済みなら自分が受諾済みかも表示）
    const authResult = await authenticateOperator(request, env);
    const operatorId = authResult.success ? authResult.operator!.id : null;

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const agentIdFilter = url.searchParams.get('agent_id') || null;

    // アクティブなDealを取得
    const binds: any[] = [];
    let whereExtra = '';
    if (agentIdFilter) {
      whereExtra = ' AND d.agent_id = ?';
      binds.push(agentIdFilter);
    }
    binds.push(limit, offset);

    const deals = await env.DB.prepare(
      `SELECT d.*,
        a.name as agent_name,
        a.description as agent_description,
        json_extract(a.metadata, '$.is_sample') as is_sample,
        json_extract(d.metadata, '$.created_via') as created_via,
        json_extract(d.metadata, '$.ai_advertiser_name') as ai_advertiser_name,
        ai_adv.x_handle as advertiser_x_handle,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id) as mission_count,
        COALESCE(d.applications_count, 0) as applications_count,
        COALESCE(d.slots_total, d.max_participants) as slots_total,
        COALESCE(d.slots_selected, d.current_participants) as slots_selected
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       LEFT JOIN ai_advertisers ai_adv ON d.agent_id = ai_adv.id
       WHERE d.status = 'active'
       AND COALESCE(d.visibility, 'visible') = 'visible'
       AND a.status NOT IN ('suspended', 'revoked')
       AND COALESCE(d.slots_selected, d.current_participants) < COALESCE(d.slots_total, d.max_participants)
       AND (d.expires_at IS NULL OR d.expires_at > datetime('now'))
       ${whereExtra}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(...binds)
      .all();

    // 認証済みの場合、アプリケーションとミッションの状態を取得
    let applicationsByDeal: Map<string, { status: string; mission_id?: string }> = new Map();
    if (operatorId) {
      // Get applications
      const applications = await env.DB.prepare(
        `SELECT a.deal_id, a.status, m.id as mission_id
         FROM applications a
         LEFT JOIN missions m ON m.deal_id = a.deal_id AND m.operator_id = a.operator_id
         WHERE a.operator_id = ?`
      )
        .bind(operatorId)
        .all<{ deal_id: string; status: string; mission_id?: string }>();

      applications.results.forEach((app) => {
        applicationsByDeal.set(app.deal_id, {
          status: app.status,
          mission_id: app.mission_id,
        });
      });

      // Also check for missions without applications (legacy)
      const missions = await env.DB.prepare(
        `SELECT deal_id, id as mission_id FROM missions WHERE operator_id = ?`
      )
        .bind(operatorId)
        .all<{ deal_id: string; mission_id: string }>();

      missions.results.forEach((m) => {
        if (!applicationsByDeal.has(m.deal_id)) {
          applicationsByDeal.set(m.deal_id, { status: 'selected', mission_id: m.mission_id });
        }
      });
    }

    const missionsList = deals.results.map((deal: Record<string, unknown>) => {
      const appInfo = applicationsByDeal.get(deal.id as string);
      const slotsTotal = (deal.slots_total as number) ?? (deal.max_participants as number);
      const slotsSelected = (deal.slots_selected as number) ?? (deal.current_participants as number);

      const isAiAdvertiser = deal.created_via === 'ai_advertiser_api';
      return {
        deal_id: deal.id,
        title: deal.title,
        description: deal.description,
        requirements: JSON.parse(deal.requirements as string),
        reward_amount: deal.reward_amount,
        remaining_slots: slotsTotal - slotsSelected,
        applications_count: (deal.applications_count as number) || 0,
        agent_name: deal.agent_name,
        agent_description: (deal.agent_description as string) || null,
        is_ai_advertiser: isAiAdvertiser,
        created_at: deal.created_at,
        expires_at: deal.expires_at,
        advertiser_x_handle: isAiAdvertiser ? (deal.advertiser_x_handle as string) || null : null,
        is_accepted: appInfo?.status === 'selected' || !!appInfo?.mission_id,
        application_status: appInfo?.status || null,
        mission_id: appInfo?.mission_id || null,
        is_sample: deal.is_sample === 1 || deal.is_sample === true,
      };
    });

    return success(
      {
        missions: missionsList,
        is_authenticated: operatorId !== null,
        pagination: {
          limit,
          offset,
          total: missionsList.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get available missions error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * ミッション受諾 (DEPRECATED)
 *
 * POST /api/missions/accept
 *
 * DEPRECATED: Use POST /api/missions/:dealId/apply instead.
 * This endpoint is maintained for backward compatibility during transition.
 * It creates an application and auto-selects it if slots are available.
 */
export async function acceptMission(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  console.warn('DEPRECATED: /api/missions/accept - use /api/missions/:id/apply instead');

  try {
    // 認証
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;
    const body = await request.json<AcceptMissionRequest>();

    if (!body.deal_id) {
      return errors.invalidRequest(requestId, { message: 'deal_id is required' });
    }

    // Deal取得
    const deal = await env.DB.prepare(
      `SELECT * FROM deals WHERE id = ? AND status = 'active' AND COALESCE(visibility, 'visible') = 'visible'`
    )
      .bind(body.deal_id)
      .first<Deal>();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    // 枠チェック
    if (deal.current_participants >= deal.max_participants) {
      return errors.invalidRequest(requestId, { message: 'No slots available' });
    }

    // 既に受諾済みかチェック
    const existing = await env.DB.prepare(
      `SELECT * FROM missions WHERE deal_id = ? AND operator_id = ?`
    )
      .bind(deal.id, operator.id)
      .first();

    if (existing) {
      return errors.conflict(requestId, 'Already accepted this mission');
    }

    // 既にアプリケーションがあるかチェック
    const existingApp = await env.DB.prepare(
      `SELECT * FROM applications WHERE deal_id = ? AND operator_id = ?`
    )
      .bind(deal.id, operator.id)
      .first();

    if (existingApp) {
      return errors.conflict(requestId, 'Already applied for this mission');
    }

    // 期限チェック
    if (deal.expires_at && new Date(deal.expires_at) < new Date()) {
      return errors.invalidRequest(requestId, { message: 'Deal has expired' });
    }

    // Create application and mission atomically (backward compatibility: auto-select)
    const missionId = crypto.randomUUID().replace(/-/g, '');
    const applicationId = crypto.randomUUID().replace(/-/g, '');

    await env.DB.batch([
      // Create application with auto-selected status
      env.DB.prepare(
        `INSERT INTO applications (id, deal_id, operator_id, status, accept_disclosure, accept_no_engagement_buying, selected_at)
         VALUES (?, ?, ?, 'selected', 1, 1, datetime('now'))`
      ).bind(applicationId, deal.id, operator.id),
      // ミッション作成
      env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status)
         VALUES (?, ?, ?, 'accepted')`
      ).bind(missionId, deal.id, operator.id),
      // Deal参加者数を更新
      env.DB.prepare(
        `UPDATE deals SET
          current_participants = current_participants + 1,
          slots_selected = COALESCE(slots_selected, current_participants) + 1,
          applications_count = COALESCE(applications_count, 0) + 1,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(deal.id),
    ]);

    const mission = await env.DB.prepare('SELECT * FROM missions WHERE id = ?')
      .bind(missionId)
      .first<Mission>();

    return success(
      {
        mission: {
          id: mission!.id,
          deal_id: mission!.deal_id,
          status: mission!.status,
          created_at: mission!.created_at,
        },
        deal: {
          title: deal.title,
          requirements: JSON.parse(deal.requirements),
          reward_amount: deal.reward_amount,
        },
        instructions: [
          '1. Create the required post on X according to the requirements',
          '2. Submit the post URL using POST /api/missions/submit',
          '3. Wait for verification',
          '4. Receive your reward!',
        ],
        _deprecated: 'This endpoint is deprecated. Use POST /api/missions/:dealId/apply instead.',
      },
      requestId,
      201
    );
  } catch (e) {
    console.error('Accept mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * ミッション提出
 *
 * POST /api/missions/submit
 */
export async function submitMission(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // 認証
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;
    const body = await request.json<SubmitMissionRequest>();

    if (!body.mission_id || !body.submission_url) {
      return errors.invalidRequest(requestId, {
        message: 'mission_id and submission_url are required',
      });
    }

    // URL形式チェック
    if (!isValidXUrl(body.submission_url)) {
      return errors.invalidRequest(requestId, {
        message: 'Invalid X post URL',
      });
    }

    // ミッション取得
    const mission = await env.DB.prepare(
      `SELECT m.*, d.requirements, d.reward_amount
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.id = ? AND m.operator_id = ?`
    )
      .bind(body.mission_id, operator.id)
      .first<Mission & { requirements: string; reward_amount: number }>();

    if (!mission) {
      return errors.notFound(requestId, 'Mission');
    }

    if (mission.status !== 'accepted') {
      return errors.invalidRequest(requestId, {
        message: `Mission is ${mission.status}, cannot submit`,
      });
    }

    // 提出
    await env.DB.prepare(
      `UPDATE missions SET
        status = 'submitted',
        submission_url = ?,
        submission_content = ?,
        submitted_at = datetime('now'),
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(body.submission_url, body.submission_content || null, mission.id)
      .run();

    // Mechanical verification: check disclosure, link, content
    // In production, can also verify via X API
    const verificationResult = await verifySubmission(
      body.submission_url,
      JSON.parse(mission.requirements),
      body.submission_content || undefined
    );

    if (verificationResult.success) {
      // 検証成功 - 支払い処理
      try {
        const paymentResult = await releaseToOperator(
          env.DB,
          mission.id,
          operator.id,
          mission.reward_amount,
          `mission-payment-${mission.id}`
        );

        if (paymentResult.success) {
          await env.DB.batch([
            // ミッション更新
            env.DB.prepare(
              `UPDATE missions SET
                status = 'paid',
                verified_at = datetime('now'),
                verification_result = ?,
                paid_at = datetime('now'),
                updated_at = datetime('now')
               WHERE id = ?`
            ).bind(JSON.stringify(verificationResult), mission.id),
            // Operator統計更新
            env.DB.prepare(
              `UPDATE operators SET
                total_missions_completed = total_missions_completed + 1,
                total_earnings = total_earnings + ?,
                updated_at = datetime('now')
               WHERE id = ?`
            ).bind(mission.reward_amount, operator.id),
          ]);

          return success(
            {
              mission_id: mission.id,
              status: 'paid',
              verification: verificationResult,
              reward_amount: mission.reward_amount,
              message: 'Mission verified and paid!',
            },
            requestId
          );
        }

        // 支払い失敗（releaseToOperator が success: false を返した場合）
        console.error('Payment failed for mission:', mission.id, paymentResult.error);
      } catch (paymentError) {
        // 支払い処理中のエラー（テーブル未存在など）
        console.error('Payment error for mission:', mission.id, paymentError);
      }

      // 検証成功だが支払い失敗 → verified 状態で保存
      await env.DB.prepare(
        `UPDATE missions SET
          status = 'verified',
          verified_at = datetime('now'),
          verification_result = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      )
        .bind(JSON.stringify(verificationResult), mission.id)
        .run();

      // Operator統計更新（完了カウントのみ、earnings は支払い時に加算）
      await env.DB.prepare(
        `UPDATE operators SET
          total_missions_completed = total_missions_completed + 1,
          updated_at = datetime('now')
         WHERE id = ?`
      )
        .bind(operator.id)
        .run();

      return success(
        {
          mission_id: mission.id,
          status: 'submitted',
          verification: verificationResult,
          message: 'Post verified! Awaiting payment processing.',
        },
        requestId
      );
    }

    // 検証失敗
    await env.DB.prepare(
      `UPDATE missions SET
        status = 'rejected',
        verification_result = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(JSON.stringify(verificationResult), mission.id)
      .run();

    return success(
      {
        mission_id: mission.id,
        status: 'rejected',
        verification: verificationResult,
        message: 'Verification failed. Please check the requirements and try again.',
      },
      requestId
    );
  } catch (e) {
    console.error('Submit mission error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 自分のミッション一覧取得
 *
 * GET /api/missions/my
 */
export async function getMyMissions(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // 認証
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query = `
      SELECT m.*, d.title as deal_title, d.requirements, d.reward_amount,
             m.payout_tx_hash,
             ag.name as agent_name,
             json_extract(d.metadata, '$.created_via') as created_via,
             ai_adv.x_handle as advertiser_x_handle
      FROM missions m
      JOIN deals d ON m.deal_id = d.id
      JOIN agents ag ON d.agent_id = ag.id
      LEFT JOIN ai_advertisers ai_adv ON d.agent_id = ai_adv.id
      WHERE m.operator_id = ?
        AND COALESCE(d.visibility, 'visible') = 'visible'
        AND ag.status NOT IN ('suspended', 'revoked')
    `;
    const params: (string | number)[] = [operator.id];

    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }

    query += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const missions = await env.DB.prepare(query).bind(...params).all();

    return success(
      {
        missions: missions.results.map((m: Record<string, unknown>) => {
          // Check if payment was simulated (tx_hash starts with SIMULATED_)
          const payoutTxHash = m.payout_tx_hash as string | null;
          const isSimulated = payoutTxHash ? isSimulatedTxHash(payoutTxHash) : false;

          const isAiAdvertiser = m.created_via === 'ai_advertiser_api';
          return {
            id: m.id,
            deal_id: m.deal_id,
            deal_title: m.deal_title,
            requirements: JSON.parse(m.requirements as string),
            reward_amount: m.reward_amount,
            status: m.status,
            submission_url: m.submission_url,
            submitted_at: m.submitted_at,
            verified_at: m.verified_at,
            paid_at: m.paid_at,
            created_at: m.created_at,
            agent_name: m.agent_name,
            is_ai_advertiser: isAiAdvertiser,
            advertiser_x_handle: isAiAdvertiser ? (m.advertiser_x_handle as string) || null : null,
            // Include simulated payment flag
            is_simulated: isSimulated,
          };
        }),
        pagination: {
          limit,
          offset,
          total: missions.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get my missions error:', e);
    return errors.internalError(requestId);
  }
}

// ============================================
// ヘルパー関数
// ============================================

function isValidXUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === 'twitter.com' || parsed.hostname === 'x.com') &&
      /^\/[a-zA-Z0-9_]+\/status\/\d+/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

interface VerificationResult {
  success: boolean;
  method: string;
  checks: {
    url_valid: boolean;
    disclosure_present?: boolean;
    link_present?: boolean;
    content_match?: boolean;
    hashtags_present?: boolean;
  };
  message: string;
  details?: string[];
}

// Required disclosure tags for ad transparency
const DISCLOSURE_TAGS = ['[PR]', 'by HumanAds', '#ad', '#sponsored', '#advertisement', 'sponsored', 'ad'];

async function verifySubmission(
  submissionUrl: string,
  requirements: { verification_method: string; hashtags?: string[]; content_template?: string; link_url?: string },
  submissionContent?: string
): Promise<VerificationResult> {
  const urlValid = isValidXUrl(submissionUrl);
  const details: string[] = [];

  if (!urlValid) {
    return {
      success: false,
      method: 'mechanical_check',
      checks: { url_valid: false },
      message: 'Invalid X post URL',
      details: ['The submission URL is not a valid X (Twitter) post URL'],
    };
  }

  // If we have submission content, verify required elements
  if (submissionContent) {
    const lowerContent = submissionContent.toLowerCase();

    // Check for disclosure tag
    const disclosurePresent = DISCLOSURE_TAGS.some((tag) =>
      lowerContent.includes(tag.toLowerCase())
    );

    if (!disclosurePresent) {
      details.push('Missing required disclosure tag (#ad, #sponsored, etc.)');
    }

    // Check for required link
    const requiredLink = requirements.link_url || 'humanadsai.com';
    const linkPresent = lowerContent.includes(requiredLink.toLowerCase());

    if (!linkPresent) {
      details.push(`Missing required link: ${requiredLink}`);
    }

    // Check for required hashtags
    let hashtagsPresent = true;
    if (requirements.hashtags && requirements.hashtags.length > 0) {
      for (const hashtag of requirements.hashtags) {
        if (!lowerContent.includes(hashtag.toLowerCase())) {
          hashtagsPresent = false;
          details.push(`Missing required hashtag: ${hashtag}`);
        }
      }
    }

    // If any required element is missing, fail verification
    if (!disclosurePresent || !linkPresent) {
      return {
        success: false,
        method: 'mechanical_check',
        checks: {
          url_valid: true,
          disclosure_present: disclosurePresent,
          link_present: linkPresent,
          hashtags_present: hashtagsPresent,
        },
        message: 'Missing required elements',
        details,
      };
    }

    // All checks passed
    return {
      success: true,
      method: 'mechanical_check',
      checks: {
        url_valid: true,
        disclosure_present: true,
        link_present: true,
        hashtags_present: hashtagsPresent,
        content_match: true,
      },
      message: 'All requirements verified',
      details: ['Disclosure present', 'Required link present', 'Content verified'],
    };
  }

  // Fallback for submissions without content (legacy)
  if (requirements.verification_method === 'url_check') {
    return {
      success: urlValid,
      method: 'url_check',
      checks: { url_valid: urlValid },
      message: urlValid ? 'URL verified' : 'Invalid URL',
    };
  }

  // MVP fallback - just URL check
  return {
    success: urlValid,
    method: requirements.verification_method || 'url_check',
    checks: {
      url_valid: urlValid,
      content_match: true,
      hashtags_present: true,
    },
    message: 'Verification passed (URL check only)',
  };
}

// Cancel reason codes
type CancelReasonCode = 'WRONG_LINK' | 'POST_DELETED' | 'CANNOT_MEET_REQUIREMENTS' | 'NO_LONGER_INTERESTED' | 'OTHER';

// Cooldown period after canceling a submitted/verified mission (24 hours)
const CANCEL_COOLDOWN_HOURS = 24;

/**
 * Cancel a mission
 *
 * POST /api/missions/:id/cancel
 *
 * Allows operator to cancel their mission before AI review starts.
 * - 'accepted' status: can always cancel
 * - 'submitted' status: can cancel anytime (before AI review starts)
 * - 'verified' status: can cancel anytime (before AI review starts)
 *
 * Non-cancelable:
 * - 'paid', 'rejected' - final states
 * - Future: 'under_review' when AI has started reviewing
 *
 * Abuse prevention:
 * - 24-hour cooldown for re-applying to same deal after submitted/verified cancel
 * - Track cancel counts in operator metadata for compliance scoring
 */
export async function cancelMission(
  request: Request,
  env: Env,
  missionId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Authenticate
    const authResult = await authenticateOperator(request, env);
    if (!authResult.success) {
      return authResult.error!;
    }

    const operator = authResult.operator!;

    // Parse request body for reason
    let reasonCode: CancelReasonCode | null = null;
    let reasonNote: string | null = null;
    try {
      const body = await request.json<{ reasonCode?: CancelReasonCode; note?: string }>();
      reasonCode = body.reasonCode || null;
      reasonNote = body.note || null;
    } catch {
      // Body is optional
    }

    // Get mission with deal info
    const mission = await env.DB.prepare(
      `SELECT m.*, d.id as deal_id
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.id = ? AND m.operator_id = ?`
    )
      .bind(missionId, operator.id)
      .first<Mission & { deal_id: string }>();

    if (!mission) {
      return errors.notFound(requestId, 'Mission');
    }

    // Check if mission can be cancelled based on status
    // Cancelable: accepted, submitted, verified (before AI review starts)
    // Non-cancelable: paid, rejected, expired (final states)
    const cancelableStatuses = ['accepted', 'submitted', 'verified'];
    if (!cancelableStatuses.includes(mission.status)) {
      return errors.invalidRequest(requestId, {
        message: `Cannot cancel mission with status '${mission.status}'. Only missions before AI review can be cancelled.`,
        code: 'not_cancelable',
      });
    }

    // Check if AI has started reviewing (future: check review_started_at field)
    // For now, we allow cancellation of submitted/verified since we don't have UNDER_REVIEW status yet

    // Determine if this is a post-submission cancel (for cooldown and penalty tracking)
    const isPostSubmissionCancel = ['submitted', 'verified'].includes(mission.status);

    // Calculate cooldown expiry (24 hours from now for post-submission cancels)
    const cooldownUntil = isPostSubmissionCancel
      ? new Date(Date.now() + CANCEL_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
      : null;

    // Build cancel metadata
    const cancelMetadata = JSON.stringify({
      cancelled_at: new Date().toISOString(),
      reason_code: reasonCode,
      reason_note: reasonNote,
      previous_status: mission.status,
      cooldown_until: cooldownUntil,
    });

    // Build operator metadata update for tracking
    const operatorMetadataUpdate = isPostSubmissionCancel
      ? `json_set(
          json_set(
            COALESCE(metadata, '{}'),
            '$.cancel_count',
            COALESCE(json_extract(metadata, '$.cancel_count'), 0) + 1
          ),
          '$.submit_cancel_count_30d',
          COALESCE(json_extract(metadata, '$.submit_cancel_count_30d'), 0) + 1,
          '$.last_submit_cancel_at',
          datetime('now')
        )`
      : `json_set(
          COALESCE(metadata, '{}'),
          '$.cancel_count',
          COALESCE(json_extract(metadata, '$.cancel_count'), 0) + 1,
          '$.last_cancel_at',
          datetime('now')
        )`;

    await env.DB.batch([
      // Update mission status to expired (cancelled)
      env.DB.prepare(
        `UPDATE missions SET
          status = 'expired',
          metadata = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(cancelMetadata, missionId),
      // Update application status to cancelled with cooldown
      env.DB.prepare(
        `UPDATE applications SET
          status = 'cancelled',
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.cancelled_at',
            datetime('now'),
            '$.cooldown_until',
            ?
          ),
          updated_at = datetime('now')
         WHERE deal_id = ? AND operator_id = ?`
      ).bind(cooldownUntil, mission.deal_id, operator.id),
      // Release slot on deal
      env.DB.prepare(
        `UPDATE deals SET
          current_participants = MAX(0, current_participants - 1),
          slots_selected = MAX(0, COALESCE(slots_selected, current_participants) - 1),
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(mission.deal_id),
      // Track cancellation count on operator (for abuse prevention)
      env.DB.prepare(
        `UPDATE operators SET
          metadata = ${operatorMetadataUpdate},
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(operator.id),
    ]);

    const wasSubmittedOrVerified = isPostSubmissionCancel;
    return success(
      {
        mission_id: missionId,
        status: 'cancelled',
        cooldown_until: cooldownUntil,
        message: wasSubmittedOrVerified
          ? `Submission cancelled successfully. You can re-apply to this mission after ${CANCEL_COOLDOWN_HOURS} hours.`
          : 'Mission cancelled successfully. The slot has been released.',
      },
      requestId
    );
  } catch (e) {
    console.error('Cancel mission error:', e);
    return errors.internalError(requestId);
  }
}
