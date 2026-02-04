/**
 * X (Twitter) OAuth2 PKCE Authentication Service
 */

import type { Env } from '../types';

// ============================================
// PKCE Utilities
// ============================================

/**
 * Generate a random string for code_verifier (43-128 chars)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate code_challenge from code_verifier (S256)
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Generate a random state string for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Base64 URL encode (no padding)
 */
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ============================================
// Cookie Encryption (AES-GCM)
// ============================================

const COOKIE_NAME = 'x_auth_state';
const COOKIE_MAX_AGE = 600; // 10 minutes

/**
 * Derive encryption key from client secret
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('humanads-x-auth'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data for cookie storage
 */
export async function encryptCookieData(
  data: { state: string; codeVerifier: string },
  secret: string
): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  // Combine IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return base64UrlEncode(combined);
}

/**
 * Decrypt cookie data
 */
export async function decryptCookieData(
  encrypted: string,
  secret: string
): Promise<{ state: string; codeVerifier: string } | null> {
  try {
    const key = await deriveKey(secret);

    // Decode base64url
    const combined = base64UrlDecode(encrypted);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(plaintext));
  } catch {
    return null;
  }
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): Uint8Array {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ============================================
// OAuth2 Flow
// ============================================

const X_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const X_USER_URL = 'https://api.twitter.com/2/users/me';

export interface XAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Build the authorization URL for X OAuth2
 */
export async function buildAuthUrl(
  config: XAuthConfig
): Promise<{ url: string; state: string; codeVerifier: string }> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'users.read',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return {
    url: `${X_AUTH_URL}?${params.toString()}`,
    state,
    codeVerifier,
  };
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  config: XAuthConfig
): Promise<{ accessToken: string; expiresIn: number } | null> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code: code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  });

  // X requires Basic auth with client_id:client_secret for confidential clients
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

  const response = await fetch(X_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    console.error('Token exchange failed:', await response.text());
    return null;
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get user info from X API
 */
export async function getXUserInfo(
  accessToken: string
): Promise<{ id: string; name: string; username: string } | null> {
  try {
    const response = await fetch(X_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('X User API response status:', response.status);
    console.log('X User API response:', responseText);

    if (!response.ok) {
      console.error('User info fetch failed:', response.status, responseText);
      return null;
    }

    const parsed = data as {
      data?: {
        id: string;
        name: string;
        username: string;
      };
      errors?: Array<{ message: string }>;
    };

    if (!parsed.data) {
      console.error('No data in response:', parsed);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

// ============================================
// Cookie Helpers
// ============================================

/**
 * Create encrypted auth state cookie
 */
export async function createAuthCookie(
  state: string,
  codeVerifier: string,
  secret: string
): Promise<string> {
  const encrypted = await encryptCookieData({ state, codeVerifier }, secret);
  return `${COOKIE_NAME}=${encrypted}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

/**
 * Parse auth state cookie from request
 */
export function getAuthCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${COOKIE_NAME}=`)) {
      return cookie.substring(COOKIE_NAME.length + 1);
    }
  }
  return null;
}

/**
 * Create cookie deletion header
 */
export function deleteAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
