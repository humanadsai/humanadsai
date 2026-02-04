import type { Env } from './types';
import { handleRequest } from './router';

// Durable Objects のエクスポート
export { NonceStore } from './durable-objects/nonce-store';
export { RateLimiter } from './durable-objects/rate-limiter';

/**
 * HumanAds API - Cloudflare Workers Entry Point
 *
 * Ads by AI. Promoted by Humans.
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const response = await handleRequest(request, env);

      // CORS ヘッダを追加
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-AdClaw-Timestamp, X-AdClaw-Nonce, X-AdClaw-Signature, X-AdClaw-Key-Id',
      };

      // 既存のヘッダにCORSを追加
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Unhandled error:', error);
      return Response.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
};
