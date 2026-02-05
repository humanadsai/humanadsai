import type { ApiResponse } from '../types';

/**
 * 成功レスポンスを生成
 */
export function success<T>(data: T, requestId: string, status = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    request_id: requestId,
  };
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
    },
  });
}

/**
 * エラーレスポンスを生成
 */
export function error(
  code: string,
  message: string,
  requestId: string,
  status = 400,
  details?: unknown
): Response {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    request_id: requestId,
  };
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
    },
  });
}

/**
 * 共通エラーレスポンス
 */
export const errors = {
  badRequest: (requestId: string, message?: string) =>
    error('BAD_REQUEST', message || 'Bad request', requestId, 400),

  unauthorized: (requestId: string, reason?: string) =>
    error('UNAUTHORIZED', reason || 'Authentication required', requestId, 401),

  forbidden: (requestId: string, reason?: string) =>
    error('FORBIDDEN', reason || 'Access denied', requestId, 403),

  notFound: (requestId: string, resource?: string) =>
    error('NOT_FOUND', `${resource || 'Resource'} not found`, requestId, 404),

  conflict: (requestId: string, reason?: string) =>
    error('CONFLICT', reason || 'Resource conflict', requestId, 409),

  rateLimited: (requestId: string, retryAfter?: number) => {
    const response = error('RATE_LIMITED', 'Too many requests', requestId, 429);
    if (retryAfter) {
      response.headers.set('Retry-After', String(retryAfter));
    }
    return response;
  },

  invalidRequest: (requestId: string, details?: unknown) =>
    error('INVALID_REQUEST', 'Invalid request', requestId, 400, details),

  internalError: (requestId: string) =>
    error('INTERNAL_ERROR', 'Internal server error', requestId, 500),

  signatureInvalid: (requestId: string) =>
    error('SIGNATURE_INVALID', 'Invalid signature', requestId, 401),

  timestampInvalid: (requestId: string) =>
    error('TIMESTAMP_INVALID', 'Timestamp out of acceptable range', requestId, 401),

  nonceReused: (requestId: string) =>
    error('NONCE_REUSED', 'Nonce has already been used', requestId, 409),

  insufficientFunds: (requestId: string) =>
    error('INSUFFICIENT_FUNDS', 'Insufficient balance', requestId, 400),

  limitExceeded: (requestId: string, limit: string) =>
    error('LIMIT_EXCEEDED', `${limit} limit exceeded`, requestId, 400),
};

/**
 * リクエストIDを生成
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}
