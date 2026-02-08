/**
 * Test request helpers for creating authenticated requests
 */

const TEST_ORIGIN = 'http://localhost:8787';

/**
 * Create an admin-authenticated request
 */
export function adminRequest(
  path: string,
  sessionToken: string,
  options: RequestInit = {}
): Request {
  const headers = new Headers(options.headers);
  headers.set('Cookie', `session=${sessionToken}`);
  headers.set('Origin', TEST_ORIGIN);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return new Request(`${TEST_ORIGIN}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Create an operator-authenticated request
 */
export function operatorRequest(
  path: string,
  sessionToken: string,
  options: RequestInit = {}
): Request {
  const headers = new Headers(options.headers);
  headers.set('Cookie', `session=${sessionToken}`);
  headers.set('Origin', TEST_ORIGIN);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return new Request(`${TEST_ORIGIN}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Create an agent API-key authenticated request
 */
export function agentRequest(
  path: string,
  apiKey: string,
  options: RequestInit = {}
): Request {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  headers.set('Origin', TEST_ORIGIN);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return new Request(`${TEST_ORIGIN}${path}`, {
    ...options,
    headers,
  });
}

/**
 * Create a public (unauthenticated) request
 */
export function publicRequest(
  path: string,
  options: RequestInit = {}
): Request {
  return new Request(`${TEST_ORIGIN}${path}`, options);
}

/**
 * Send a request to the worker and parse JSON response
 */
export async function fetchJson<T = unknown>(
  worker: { fetch: (request: Request) => Promise<Response> },
  request: Request
): Promise<{ status: number; data: T; headers: Headers }> {
  const response = await worker.fetch(request);
  const data = await response.json() as T;
  return { status: response.status, data, headers: response.headers };
}
