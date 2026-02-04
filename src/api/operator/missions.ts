import type { Env, Operator, Deal, Mission, AcceptMissionRequest, SubmitMissionRequest } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from './register';
import { releaseToOperator } from '../../services/ledger';

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

    // アクティブなDealを取得
    const deals = await env.DB.prepare(
      `SELECT d.*,
        a.name as agent_name,
        (SELECT COUNT(*) FROM missions WHERE deal_id = d.id) as mission_count
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       WHERE d.status = 'active'
       AND d.current_participants < d.max_participants
       AND (d.expires_at IS NULL OR d.expires_at > datetime('now'))
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    // 認証済みの場合、受諾済みかチェック
    let acceptedDealIds: Set<string> = new Set();
    if (operatorId) {
      const accepted = await env.DB.prepare(
        `SELECT deal_id FROM missions WHERE operator_id = ?`
      )
        .bind(operatorId)
        .all<{ deal_id: string }>();
      acceptedDealIds = new Set(accepted.results.map((m) => m.deal_id));
    }

    const missions = deals.results.map((deal: Record<string, unknown>) => ({
      deal_id: deal.id,
      title: deal.title,
      description: deal.description,
      requirements: JSON.parse(deal.requirements as string),
      reward_amount: deal.reward_amount,
      remaining_slots: (deal.max_participants as number) - (deal.current_participants as number),
      agent_name: deal.agent_name,
      expires_at: deal.expires_at,
      is_accepted: acceptedDealIds.has(deal.id as string),
    }));

    return success(
      {
        missions,
        pagination: {
          limit,
          offset,
          total: missions.length,
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
 * ミッション受諾
 *
 * POST /api/missions/accept
 */
export async function acceptMission(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

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
      `SELECT * FROM deals WHERE id = ? AND status = 'active'`
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

    // 期限チェック
    if (deal.expires_at && new Date(deal.expires_at) < new Date()) {
      return errors.invalidRequest(requestId, { message: 'Deal has expired' });
    }

    // ミッション作成
    const missionId = crypto.randomUUID().replace(/-/g, '');

    await env.DB.batch([
      // ミッション作成
      env.DB.prepare(
        `INSERT INTO missions (id, deal_id, operator_id, status)
         VALUES (?, ?, ?, 'accepted')`
      ).bind(missionId, deal.id, operator.id),
      // Deal参加者数を更新
      env.DB.prepare(
        `UPDATE deals SET current_participants = current_participants + 1, updated_at = datetime('now')
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

    // MVP: 自動検証（簡易）
    // 本番ではX APIで投稿内容を検証する
    const verificationResult = await verifySubmission(
      body.submission_url,
      JSON.parse(mission.requirements)
    );

    if (verificationResult.success) {
      // 検証成功 - 支払い処理
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
    }

    // 検証失敗または支払い失敗
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
      SELECT m.*, d.title as deal_title, d.requirements, d.reward_amount
      FROM missions m
      JOIN deals d ON m.deal_id = d.id
      WHERE m.operator_id = ?
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
        missions: missions.results.map((m: Record<string, unknown>) => ({
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
        })),
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
    content_match?: boolean;
    hashtags_present?: boolean;
  };
  message: string;
}

async function verifySubmission(
  submissionUrl: string,
  requirements: { verification_method: string; hashtags?: string[]; content_template?: string }
): Promise<VerificationResult> {
  // MVPでは簡易検証（URL形式チェックのみ）
  // 本番ではX APIで実際の投稿内容を取得して検証

  const urlValid = isValidXUrl(submissionUrl);

  if (requirements.verification_method === 'url_check') {
    return {
      success: urlValid,
      method: 'url_check',
      checks: { url_valid: urlValid },
      message: urlValid ? 'URL verified' : 'Invalid URL',
    };
  }

  // その他の検証方法は本番で実装
  // MVPではURL検証のみで成功とする
  return {
    success: urlValid,
    method: requirements.verification_method,
    checks: {
      url_valid: urlValid,
      content_match: true, // MVP: 常にtrue
      hashtags_present: true, // MVP: 常にtrue
    },
    message: 'Verification passed (MVP mode)',
  };
}
