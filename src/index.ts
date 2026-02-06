import type { Env } from './types';
import { handleRequest } from './router';
import { handleScheduled } from './scheduled/overdue-checker';

// Durable Objects のエクスポート
export { NonceStore } from './durable-objects/nonce-store';
export { RateLimiter } from './durable-objects/rate-limiter';

/**
 * HumanAds API - Cloudflare Workers Entry Point
 *
 * Ads by AI. Promoted by Humans.
 */
export default {
  /**
   * HTTP Request Handler
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      // CSRF: Origin check for cookie-authenticated POST/PUT/DELETE
      if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
        const path = url.pathname;

        // Cookie-authenticated routes (Operator, User, Admin APIs)
        const needsCsrfCheck =
          path.startsWith('/api/operator/') ||
          path.startsWith('/api/missions/') ||
          path.startsWith('/api/my/') ||
          path.startsWith('/api/applications/') ||
          path.startsWith('/api/user/') ||
          path.startsWith('/api/account/') ||
          path.startsWith('/api/admin/');

        if (needsCsrfCheck) {
          const origin = request.headers.get('Origin');
          const allowedOrigin = `${url.protocol}//${url.host}`;
          if (origin && origin !== allowedOrigin) {
            return Response.json(
              { success: false, error: { code: 'CSRF_REJECTED', message: 'Cross-origin request rejected' } },
              { status: 403 }
            );
          }
        }
      }

      const response = await handleRequest(request, env);

      // CORS ヘッダ（動的 Origin 検証）
      const requestOrigin = request.headers.get('Origin');
      const allowedOrigin = `${url.protocol}//${url.host}`;
      const corsOrigin = requestOrigin === allowedOrigin ? requestOrigin : allowedOrigin;

      const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-AdClaw-Timestamp, X-AdClaw-Nonce, X-AdClaw-Signature, X-AdClaw-Key-Id',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin',
      };

      // セキュリティヘッダ（Safe Browsing対策）
      const securityHeaders = {
        // XSS対策
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        // HTTPS強制
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        // リファラーポリシー
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // パーミッションポリシー（不要な機能を無効化）
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
        // CSP（Content Security Policy）- HTMLレスポンス用
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // インラインスクリプト許可（既存コード互換）
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https://pbs.twimg.com https://*.twimg.com",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "base-uri 'self'",
        ].join('; '),
      };

      // 既存のヘッダにCORSとセキュリティヘッダを追加
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      // HTMLレスポンスにのみセキュリティヘッダを追加
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('text/html') || !contentType) {
        Object.entries(securityHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
      }

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

  /**
   * Scheduled Job Handler (Cron Trigger)
   * Runs every 15 minutes to check for overdue A-Plan payments
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleScheduled(controller, env, ctx);
  },
};
