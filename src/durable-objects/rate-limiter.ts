/**
 * RateLimiter Durable Object
 *
 * トークンバケットアルゴリズムでレート制限を実装。
 * IP単位、APIキー単位、エンドポイント単位で制限。
 */

interface RateLimitConfig {
  maxTokens: number; // バケットの最大トークン数
  refillRate: number; // 1秒あたりの補充トークン数
  refillInterval: number; // 補充間隔（ms）
}

interface BucketState {
  tokens: number;
  lastRefill: number;
  frozen: boolean;
  frozenUntil?: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  ip: {
    maxTokens: 60,
    refillRate: 1,
    refillInterval: 1000,
  },
  apiKey: {
    maxTokens: 120,
    refillRate: 2,
    refillInterval: 1000,
  },
  'deals:create': {
    maxTokens: 10,
    refillRate: 0.167, // 10 per minute
    refillInterval: 6000,
  },
  'deals:deposit': {
    maxTokens: 20,
    refillRate: 0.333,
    refillInterval: 3000,
  },
};

export class RateLimiter implements DurableObject {
  private state: DurableObjectState;
  private buckets: Map<string, BucketState> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 起動時にストレージから復元
    if (this.buckets.size === 0) {
      const stored = await this.state.storage.get<[string, BucketState][]>('buckets');
      if (stored) {
        this.buckets = new Map(stored);
      }
    }

    if (request.method === 'POST' && path === '/check') {
      return this.handleCheck(request);
    }

    if (request.method === 'POST' && path === '/freeze') {
      return this.handleFreeze(request);
    }

    if (request.method === 'POST' && path === '/unfreeze') {
      return this.handleUnfreeze(request);
    }

    return new Response('Not Found', { status: 404 });
  }

  /**
   * レート制限チェック
   *
   * リクエストボディ: { key: string, type: string, cost?: number }
   * レスポンス: { allowed: boolean, remaining: number, retryAfter?: number, frozen?: boolean }
   */
  private async handleCheck(request: Request): Promise<Response> {
    try {
      const body = await request.json<{ key: string; type: string; cost?: number }>();
      const { key, type, cost = 1 } = body;

      const config = DEFAULT_CONFIGS[type] || DEFAULT_CONFIGS.ip;
      const bucketKey = `${type}:${key}`;

      // バケットを取得または初期化
      let bucket = this.buckets.get(bucketKey);
      if (!bucket) {
        bucket = {
          tokens: config.maxTokens,
          lastRefill: Date.now(),
          frozen: false,
        };
        this.buckets.set(bucketKey, bucket);
      }

      // 凍結チェック
      if (bucket.frozen) {
        if (bucket.frozenUntil && Date.now() > bucket.frozenUntil) {
          bucket.frozen = false;
          bucket.frozenUntil = undefined;
        } else {
          return Response.json({
            allowed: false,
            remaining: 0,
            frozen: true,
            retryAfter: bucket.frozenUntil
              ? Math.ceil((bucket.frozenUntil - Date.now()) / 1000)
              : 3600,
          });
        }
      }

      // トークン補充
      const now = Date.now();
      const elapsed = now - bucket.lastRefill;
      const tokensToAdd = Math.floor(elapsed / config.refillInterval) * config.refillRate;
      bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;

      // トークン消費
      if (bucket.tokens >= cost) {
        bucket.tokens -= cost;
        await this.state.storage.put('buckets', Array.from(this.buckets.entries()));

        return Response.json({
          allowed: true,
          remaining: Math.floor(bucket.tokens),
        });
      }

      // レート制限超過
      const tokensNeeded = cost - bucket.tokens;
      const retryAfter = Math.ceil((tokensNeeded / config.refillRate) * (config.refillInterval / 1000));

      return Response.json({
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        retryAfter,
      });
    } catch {
      return Response.json({ allowed: false, remaining: 0 }, { status: 500 });
    }
  }

  /**
   * バケットを凍結
   */
  private async handleFreeze(request: Request): Promise<Response> {
    try {
      const body = await request.json<{ key: string; type: string; duration?: number }>();
      const { key, type, duration = 3600000 } = body; // デフォルト1時間

      const bucketKey = `${type}:${key}`;
      let bucket = this.buckets.get(bucketKey);

      if (!bucket) {
        bucket = {
          tokens: 0,
          lastRefill: Date.now(),
          frozen: true,
          frozenUntil: Date.now() + duration,
        };
      } else {
        bucket.frozen = true;
        bucket.frozenUntil = Date.now() + duration;
      }

      this.buckets.set(bucketKey, bucket);
      await this.state.storage.put('buckets', Array.from(this.buckets.entries()));

      return Response.json({ frozen: true, until: bucket.frozenUntil });
    } catch {
      return Response.json({ frozen: false }, { status: 500 });
    }
  }

  /**
   * バケットの凍結を解除
   */
  private async handleUnfreeze(request: Request): Promise<Response> {
    try {
      const body = await request.json<{ key: string; type: string }>();
      const { key, type } = body;

      const bucketKey = `${type}:${key}`;
      const bucket = this.buckets.get(bucketKey);

      if (bucket) {
        bucket.frozen = false;
        bucket.frozenUntil = undefined;
        await this.state.storage.put('buckets', Array.from(this.buckets.entries()));
      }

      return Response.json({ unfrozen: true });
    } catch {
      return Response.json({ unfrozen: false }, { status: 500 });
    }
  }
}
