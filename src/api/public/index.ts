import type { Env, Deal, Operator, AiAdvertiser } from '../../types';
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
        d.metadata, d.agent_id,
        d.required_media_type, d.image_url, d.media_instructions,
        a.name as agent_name,
        ai_adv.x_handle as advertiser_x_handle
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       LEFT JOIN ai_advertisers ai_adv ON d.agent_id = ai_adv.id
       WHERE d.status = 'active'
       AND COALESCE(d.visibility, 'visible') = 'visible'
       AND a.status NOT IN ('suspended', 'revoked')
       AND d.current_participants < d.max_participants
       AND (d.expires_at IS NULL OR d.expires_at > datetime('now'))
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(limit, offset)
      .all();

    return success(
      {
        deals: deals.results.map((d: Record<string, unknown>) => {
          // Parse metadata to extract is_sample flag
          let isSample = false;
          if (d.metadata) {
            try {
              const meta = JSON.parse(d.metadata as string);
              isSample = meta.is_sample === true;
            } catch {
              // ignore parse errors
            }
          }
          let isAiAdvertiser = false;
          if (d.metadata) {
            try {
              const meta2 = JSON.parse(d.metadata as string);
              isAiAdvertiser = meta2.created_via === 'ai_advertiser_api';
            } catch {}
          }
          const requiredMedia = (d.required_media_type as string) || 'none';
          return {
            id: d.id,
            title: d.title,
            description: d.description,
            requirements: JSON.parse(d.requirements as string),
            reward_amount: d.reward_amount,
            remaining_slots: (d.max_participants as number) - (d.current_participants as number),
            agent_id: d.agent_id,
            agent_name: d.agent_name,
            advertiser_x_handle: isAiAdvertiser ? (d.advertiser_x_handle as string) || null : null,
            expires_at: d.expires_at,
            created_at: d.created_at,
            is_sample: isSample,
            required_media: requiredMedia,
            image_preview_url: requiredMedia !== 'none' ? ((d.image_url as string) || null) : null,
            media_instructions: requiredMedia !== 'none' ? ((d.media_instructions as string) || null) : null,
          };
        }),
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
      `SELECT d.*, a.name as agent_name,
        ai_adv.x_handle as advertiser_x_handle
       FROM deals d
       JOIN agents a ON d.agent_id = a.id
       LEFT JOIN ai_advertisers ai_adv ON d.agent_id = ai_adv.id
       WHERE d.id = ? AND d.status = 'active'
       AND COALESCE(d.visibility, 'visible') = 'visible'
       AND a.status NOT IN ('suspended', 'revoked')`
    )
      .bind(dealId)
      .first();

    if (!deal) {
      return errors.notFound(requestId, 'Deal');
    }

    // Parse metadata to extract is_sample flag
    let isSample = false;
    if (deal.metadata) {
      try {
        const meta = JSON.parse(deal.metadata as string);
        isSample = meta.is_sample === true;
      } catch {
        // ignore parse errors
      }
    }

    let isAiAdvertiser = false;
    if (deal.metadata) {
      try {
        const meta2 = JSON.parse(deal.metadata as string);
        isAiAdvertiser = meta2.created_via === 'ai_advertiser_api';
      } catch {}
    }

    const requiredMedia = (deal.required_media_type as string) || 'none';
    return success(
      {
        deal: {
          id: deal.id,
          title: deal.title,
          description: deal.description,
          requirements: JSON.parse(deal.requirements as string),
          reward_amount: deal.reward_amount,
          max_participants: deal.max_participants,
          remaining_slots: (deal.max_participants as number) - (deal.current_participants as number),
          total_budget: (deal.reward_amount as number) * (deal.max_participants as number),
          agent_id: deal.agent_id,
          agent_name: deal.agent_name,
          advertiser_x_handle: isAiAdvertiser ? (deal.advertiser_x_handle as string) || null : null,
          expires_at: deal.expires_at,
          created_at: deal.created_at,
          is_sample: isSample,
          required_media: requiredMedia,
          image_preview_url: requiredMedia !== 'none' ? ((deal.image_url as string) || null) : null,
          media_instructions: requiredMedia !== 'none' ? ((deal.media_instructions as string) || null) : null,
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

    let orderBy = 'verified_at DESC, total_earnings DESC';
    if (sortBy === 'recent') {
      orderBy = 'created_at DESC';
    } else if (sortBy === 'missions') {
      orderBy = 'verified_at DESC, total_missions_completed DESC';
    } else if (sortBy === 'earnings') {
      orderBy = 'total_earnings DESC';
    }

    const operators = await env.DB.prepare(
      `SELECT id, x_handle, display_name, avatar_url, x_profile_image_url,
        total_missions_completed, total_earnings, verified_at,
        x_verified, x_followers_count, x_following_count, metadata,
        (SELECT COUNT(*) FROM missions WHERE operator_id = o.id) as total_missions_applied
       FROM operators o
       WHERE status = 'verified'
         AND (x_followers_count > 0 OR x_following_count > 0 OR total_missions_completed > 0)
         AND (metadata IS NULL OR metadata NOT LIKE '%"is_test":true%')
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
          const xHandle = typeof op.x_handle === 'string' ? op.x_handle.replace(/^@+/, '') : op.x_handle;
          return {
            id: op.id,
            x_handle: xHandle,
            display_name: op.display_name,
            avatar_url: op.x_profile_image_url || op.avatar_url,
            total_missions_completed: op.total_missions_completed,
            total_missions_applied: op.total_missions_applied,
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
      `SELECT id, x_handle, display_name, avatar_url, x_profile_image_url, bio,
        x_description, x_url, x_location, x_created_at,
        x_verified, x_verified_type, x_followers_count, x_following_count,
        x_tweet_count, x_listed_count,
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
       WHERE m.operator_id = ? AND m.status IN ('paid', 'paid_complete')
       ORDER BY m.paid_at DESC
       LIMIT 5`
    )
      .bind(operatorId)
      .all();

    return success(
      {
        operator: {
          id: operator.id,
          x_handle: typeof operator.x_handle === 'string' ? operator.x_handle.replace(/^@+/, '') : operator.x_handle,
          display_name: operator.display_name,
          avatar_url: (operator.x_profile_image_url as string) || (operator.avatar_url as string) || null,
          bio: operator.bio,
          x_description: operator.x_description || null,
          x_url: operator.x_url || null,
          x_location: operator.x_location || null,
          x_created_at: operator.x_created_at || null,
          x_verified: operator.x_verified ? true : false,
          x_verified_type: operator.x_verified_type || null,
          x_followers_count: operator.x_followers_count || 0,
          x_following_count: operator.x_following_count || 0,
          x_tweet_count: operator.x_tweet_count || 0,
          x_listed_count: operator.x_listed_count || 0,
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
    let aiAdvertisersCount = 0;

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

    // AI Connected - approved agents (including samples for demo)
    let agentsCountReal = 0;
    let agentsCountSample = 0;
    try {
      // Total approved agents (including samples)
      const agentsTotal = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM agents WHERE status = 'approved'`
      ).first<{ count: number }>();
      agentsCount = agentsTotal?.count || 0;

      // Sample agents only (where metadata contains is_sample: true)
      const agentsSample = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM agents
         WHERE status = 'approved'
         AND json_extract(metadata, '$.is_sample') = true`
      ).first<{ count: number }>();
      agentsCountSample = agentsSample?.count || 0;

      // Real agents (total minus sample)
      agentsCountReal = agentsCount - agentsCountSample;

      if (debug) {
        debugInfo.agents_query = 'success';
        debugInfo.agents_total = agentsCount;
        debugInfo.agents_real = agentsCountReal;
        debugInfo.agents_sample = agentsCountSample;
      }
    } catch (e) {
      console.error('Agents count query failed:', e);
      if (debug) {
        debugInfo.agents_query = 'failed';
        debugInfo.agents_error = String(e);
      }
    }

    // AI Advertisers - active advertisers
    try {
      const advResult = await env.DB.prepare(
        `SELECT COUNT(*) as count FROM ai_advertisers WHERE status = 'active'`
      ).first<{ count: number }>();
      aiAdvertisersCount = advResult?.count || 0;
      if (debug) {
        debugInfo.ai_advertisers_query = 'success';
        debugInfo.ai_advertisers_count = aiAdvertisersCount;
      }
    } catch (e) {
      console.error('AI advertisers count query failed:', e);
      if (debug) {
        debugInfo.ai_advertisers_query = 'failed';
        debugInfo.ai_advertisers_error = String(e);
      }
    }

    // Build response with no-cache headers to prevent CDN/browser caching
    // ai_connected includes samples for demo/MVP (use ai_connected_real for production)
    const responseData: Record<string, unknown> = {
      site_access: siteAccessCount,
      human_operators: operatorsCount,
      ai_connected: aiAdvertisersCount, // Active AI advertisers (shown on KPI card)
      ai_advertisers: aiAdvertisersCount, // Alias for clarity
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

/**
 * Public AI Advertiser detail
 *
 * GET /api/ai-advertisers/:id
 *
 * Returns AI advertiser profile and their missions for public display.
 */
export async function getPublicAiAdvertiserDetail(request: Request, env: Env, advertiserId: string): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Fetch advertiser info
    const advertiser = await env.DB.prepare(`
      SELECT id, name, description, mode, status, x_handle, created_at
      FROM ai_advertisers
      WHERE id = ? AND status = 'active'
    `).bind(advertiserId).first();

    if (!advertiser) {
      return errors.notFound(requestId, 'Advertiser');
    }

    // Fetch missions for this advertiser
    const missions = await env.DB.prepare(`
      SELECT d.id, d.title, d.description, d.reward_amount,
        d.max_participants, d.current_participants, d.status, d.created_at
      FROM deals d
      WHERE d.agent_id = ?
        AND COALESCE(d.visibility, 'visible') = 'visible'
      ORDER BY d.created_at DESC
      LIMIT 50
    `).bind(advertiserId).all();

    return success({
      advertiser: {
        id: advertiser.id,
        name: advertiser.name,
        description: advertiser.description || null,
        mode: advertiser.mode,
        x_handle: advertiser.x_handle ? advertiser.x_handle.replace(/^@+/, '').split('?')[0] : null,
        created_at: advertiser.created_at
      },
      missions: (missions.results || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        reward_amount: m.reward_amount,
        remaining_slots: (m.max_participants as number) - (m.current_participants as number),
        status: m.status,
        created_at: m.created_at
      }))
    }, requestId);
  } catch (e) {
    console.error('Get public AI advertiser detail error:', e);
    return errors.internalError(requestId);
  }
}

/**
 * Public AI Advertisers list
 *
 * GET /api/ai-advertisers
 *
 * Returns active AI advertisers for public display.
 */
export async function getPublicAiAdvertisers(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Fetch active advertisers with comprehensive stats
    const advertisers = await env.DB.prepare(`
      SELECT
        a.id, a.name, a.description, a.mode, a.status, a.x_handle, a.created_at,
        COUNT(d.id) AS missions_count,
        SUM(CASE WHEN d.status = 'active' THEN 1 ELSE 0 END) AS open_missions_count,
        SUM(CASE WHEN d.status IN ('completed', 'expired') THEN 1 ELSE 0 END) AS completed_missions_count,
        COALESCE(AVG(d.reward_amount), 0) AS avg_reward,
        MAX(CASE WHEN d.status = 'active' THEN d.reward_amount ELSE NULL END) AS latest_reward,
        MAX(d.created_at) AS latest_mission_at,
        MAX(CASE WHEN d.status = 'active' THEN d.title ELSE NULL END) AS latest_open_title,
        SUM(COALESCE(d.max_participants, 0)) AS total_slots,
        SUM(d.reward_amount * COALESCE(d.max_participants, 1)) AS total_budget
      FROM ai_advertisers a
      LEFT JOIN deals d ON d.agent_id = a.id AND COALESCE(d.visibility, 'visible') = 'visible'
      WHERE a.status = 'active'
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    if (!advertisers.success) {
      return errors.internalError(requestId);
    }

    const total = await env.DB.prepare(
      `SELECT COUNT(*) as cnt FROM ai_advertisers WHERE status = 'active'`
    ).first<{ cnt: number }>();

    return success({
      advertisers: advertisers.results.map((adv: any) => ({
        id: adv.id,
        name: adv.name,
        description: adv.description || null,
        mode: adv.mode,
        x_handle: adv.x_handle ? adv.x_handle.replace(/^@+/, '').split('?')[0] : null,
        missions_count: adv.missions_count || 0,
        open_missions_count: adv.open_missions_count || 0,
        completed_missions_count: adv.completed_missions_count || 0,
        avg_reward: Math.round(adv.avg_reward || 0),
        latest_reward: adv.latest_reward || null,
        latest_mission_at: adv.latest_mission_at || null,
        latest_open_title: adv.latest_open_title || null,
        total_slots: adv.total_slots || 0,
        total_budget: adv.total_budget || 0,
        created_at: adv.created_at
      })),
      pagination: {
        limit,
        offset,
        total: total?.cnt || 0
      }
    }, requestId);
  } catch (e) {
    console.error('Get public AI advertisers error:', e);
    return errors.internalError(requestId);
  }
}
