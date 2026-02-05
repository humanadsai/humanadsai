import type { Env, Deal, Operator } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';

/**
 * 公開Deal一覧
 *
 * GET /api/deals
 */
export async function getPublicDeals(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const deals = await env.DB.prepare(
      `SELECT d.id, d.title, d.description, d.requirements, d.reward_amount,
        d.max_participants, d.current_participants, d.expires_at, d.created_at,
        a.name as agent_name
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

    return success(
      {
        deals: deals.results.map((d: Record<string, unknown>) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          requirements: JSON.parse(d.requirements as string),
          reward_amount: d.reward_amount,
          remaining_slots: (d.max_participants as number) - (d.current_participants as number),
          agent_name: d.agent_name,
          expires_at: d.expires_at,
          created_at: d.created_at,
        })),
        pagination: {
          limit,
          offset,
          total: deals.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get public deals error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 公開Deal詳細
 *
 * GET /api/deals/:id
 */
export async function getPublicDeal(request: Request, env: Env, dealId: string): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const deal = await env.DB.prepare(
      `SELECT d.*, a.name as agent_name
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       WHERE d.id = ? AND d.status = 'active'`
    )
      .bind(dealId)
      .first();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    return success(
      {
        deal: {
          id: deal.id,
          title: deal.title,
          description: deal.description,
          requirements: JSON.parse(deal.requirements as string),
          reward_amount: deal.reward_amount,
          remaining_slots: (deal.max_participants as number) - (deal.current_participants as number),
          agent_name: deal.agent_name,
          expires_at: deal.expires_at,
          created_at: deal.created_at,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get public deal error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Operator一覧（リーダーボード）
 *
 * GET /api/operators
 */
export async function getPublicOperators(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const sortBy = url.searchParams.get('sort') || 'earnings'; // earnings, missions

    let orderBy = 'total_earnings DESC';
    if (sortBy === 'missions') {
      orderBy = 'total_missions_completed DESC';
    }

    const operators = await env.DB.prepare(
      `SELECT id, x_handle, display_name, avatar_url, x_profile_image_url,
        total_missions_completed, total_earnings, verified_at,
        x_verified, x_followers_count, x_following_count, metadata
       FROM operators
       WHERE status = 'verified'
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    return success(
      {
        operators: operators.results.map((op: Record<string, unknown>) => {
          let preferredPrice = null;
          if (op.metadata) {
            try {
              const meta = JSON.parse(op.metadata as string);
              preferredPrice = meta.preferred_price || null;
            } catch (e) {
              // ignore parse errors
            }
          }
          return {
            id: op.id,
            x_handle: op.x_handle,
            display_name: op.display_name,
            avatar_url: op.x_profile_image_url || op.avatar_url,
            total_missions_completed: op.total_missions_completed,
            total_earnings: op.total_earnings,
            verified_at: op.verified_at,
            x_verified: op.x_verified === 1,
            x_followers_count: op.x_followers_count,
            x_following_count: op.x_following_count,
            preferred_price: preferredPrice,
          };
        }),
        pagination: {
          limit,
          offset,
          total: operators.results.length,
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get public operators error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Operatorプロフィール（公開）
 *
 * GET /api/operators/:id
 */
export async function getPublicOperator(
  request: Request,
  env: Env,
  operatorId: string
): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const operator = await env.DB.prepare(
      `SELECT id, x_handle, display_name, avatar_url, bio,
        total_missions_completed, total_earnings, verified_at
       FROM operators
       WHERE id = ? AND status = 'verified'`
    )
      .bind(operatorId)
      .first();

    if (!operator) {
      return errors.notFound(requestId, 'Operator');
    }

    // 最近の完了ミッション
    const recentMissions = await env.DB.prepare(
      `SELECT m.id, m.paid_at, d.title, d.reward_amount
       FROM missions m
       JOIN deals d ON m.deal_id = d.id
       WHERE m.operator_id = ? AND m.status = 'paid'
       ORDER BY m.paid_at DESC
       LIMIT 5`
    )
      .bind(operatorId)
      .all();

    return success(
      {
        operator: {
          id: operator.id,
          x_handle: operator.x_handle,
          display_name: operator.display_name,
          avatar_url: operator.avatar_url,
          bio: operator.bio,
          total_missions_completed: operator.total_missions_completed,
          total_earnings: operator.total_earnings,
          verified_at: operator.verified_at,
        },
        recent_missions: recentMissions.results,
      },
      requestId
    );
  } catch (e) {
    console.error('Get public operator error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 統計情報
 *
 * GET /api/stats
 *
 * Query params:
 * - debug=1: Include detailed debug information
 *
 * Returns:
 * - site_access: Unique visitors in the last 30 days
 * - human_operators: Total verified human promoters
 * - ai_connected: Total approved AI agents
 * - generated_at: Timestamp of when the stats were generated
 * - cache: "miss" (always fresh from DB)
 */
export async function getStats(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  try {
    // Calculate date 30 days ago in YYYY-MM-DD format
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Query each stat separately to avoid one failure breaking all stats
    let siteAccessCount = 0;
    let operatorsCount = 0;
    let agentsCount = 0;

    // Debug info
    const debugInfo: Record<string, unknown> = {};

    // Site Access - may fail if table doesn't exist yet
    try {
      const siteAccess = await env.DB.prepare(
        `SELECT COUNT(DISTINCT visitor_hash) as count
         FROM site_visits
         WHERE visit_date >= ?`
      ).bind(thirtyDaysAgoStr).first<{ count: number }>();
      siteAccessCount = siteAccess?.count || 0;
      if (debug) {
        debugInfo.site_access_query = 'success';
        debugInfo.site_access_date_from = thirtyDaysAgoStr;
      }
    } catch (e) {
      console.warn('Site visits query failed (table may not exist):', e);
      if (debug) {
        debugInfo.site_access_query = 'failed';
        debugInfo.site_access_error = String(e);
      }
    }

    // Human Promoters - verified operators
    try {
      const operators = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM operators WHERE status = 'verified'`
      ).first<{ count: number }>();
      operatorsCount = operators?.count || 0;
      if (debug) {
        debugInfo.operators_query = 'success';
      }
    } catch (e) {
      console.error('Operators count query failed:', e);
      if (debug) {
        debugInfo.operators_query = 'failed';
        debugInfo.operators_error = String(e);
      }
    }

    // AI Connected - approved agents
    try {
      const agents = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM agents WHERE status = 'approved'`
      ).first<{ count: number }>();
      agentsCount = agents?.count || 0;
      if (debug) {
        debugInfo.agents_query = 'success';
      }
    } catch (e) {
      console.error('Agents count query failed:', e);
      if (debug) {
        debugInfo.agents_query = 'failed';
        debugInfo.agents_error = String(e);
      }
    }

    // Build response with no-cache headers to prevent CDN/browser caching
    const responseData: Record<string, unknown> = {
      site_access: siteAccessCount,
      human_operators: operatorsCount,
      ai_connected: agentsCount,
      generated_at: new Date().toISOString(),
      cache: 'miss',
    };

    // Include debug info if requested
    if (debug) {
      responseData._debug = {
        ...debugInfo,
        request_id: requestId,
        timestamp: Date.now(),
      };
    }

    const response = success(responseData, requestId);

    // Clone response to add cache-control headers
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (e) {
    console.error('Get stats error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * 訪問追跡
 *
 * POST /api/track-visit
 *
 * Tracks a page visit for statistics.
 * Uses hashed IP + User-Agent for unique visitor identification (privacy-friendly).
 */
export async function trackVisit(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Get visitor identification from headers
    const ip = request.headers.get('CF-Connecting-IP') ||
               request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
               'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    const referer = request.headers.get('Referer');

    // Parse request body for page path
    let pagePath = '/';
    try {
      const body = await request.json() as { page?: string };
      pagePath = body.page || '/';
    } catch {
      // Default to root path if no body
    }

    // Create a privacy-friendly visitor hash (not storing raw IP)
    const visitorData = `${ip}:${userAgent}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(visitorData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const visitorHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Extract referrer domain if present
    let referrerDomain: string | null = null;
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        // Don't track self-referrals
        const requestUrl = new URL(request.url);
        if (refererUrl.hostname !== requestUrl.hostname) {
          referrerDomain = refererUrl.hostname;
        }
      } catch {
        // Invalid referrer URL, ignore
      }
    }

    // Insert or ignore (unique constraint handles duplicates)
    await env.DB.prepare(
      `INSERT OR IGNORE INTO site_visits (visit_date, visitor_hash, page_path, referrer_domain)
       VALUES (?, ?, ?, ?)`
    ).bind(today, visitorHash, pagePath, referrerDomain).run();

    return success({ tracked: true }, requestId);
  } catch (e) {
    console.error('Track visit error:', e);
    // Don't fail the request for tracking errors
    return success({ tracked: false }, requestId);
  }
}
