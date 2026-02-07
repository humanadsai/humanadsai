/**
 * X (Twitter) OAuth2 PKCE Authentication Service
 */

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
  } catch (e) {
    console.error('[X Auth] Cookie decrypt failed:', e);
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
// Fetch all available user fields in one request to minimize Read consumption
const X_USER_URL = 'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url,description,url,location,created_at,public_metrics,verified,verified_type,protected';

export interface XAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenExchangeResult {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
  httpStatus?: number;
}

// Public metrics from X API
export interface XPublicMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  like_count?: number;
}

// Full user info result with all available fields
export interface UserInfoResult {
  success: boolean;
  // Basic info
  id?: string;
  name?: string;
  username?: string;
  // Extended info
  profile_image_url?: string;
  description?: string;
  url?: string;
  location?: string;
  created_at?: string;
  protected?: boolean;
  // Verification
  verified?: boolean;
  verified_type?: string;
  // Metrics
  public_metrics?: XPublicMetrics;
  // Raw JSON for future use
  raw_json?: string;
  // Error info
  error?: string;
  httpStatus?: number;
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

  // Request minimal scopes
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'users.read tweet.read',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  console.log('[X Auth] Building auth URL with redirect_uri:', config.redirectUri);

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
): Promise<TokenExchangeResult> {
  console.log('[X Auth] Starting token exchange');
  console.log('[X Auth] redirect_uri:', config.redirectUri);
  console.log('[X Auth] code present:', !!code);
  console.log('[X Auth] code_verifier present:', !!codeVerifier);

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code: code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  });

  // X requires Basic auth with client_id:client_secret for confidential clients
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

  try {
    const response = await fetch(X_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    console.log('[X Auth] Token exchange status:', response.status);

    const responseText = await response.text();

    if (!response.ok) {
      // Mask sensitive data in error log
      const maskedError = responseText.replace(
        /"access_token"\s*:\s*"[^"]+"/g,
        '"access_token":"[MASKED]"'
      );
      console.error('[X Auth] Token exchange failed:', response.status, maskedError);
      return {
        success: false,
        error: `Token exchange failed: ${response.status}`,
        httpStatus: response.status,
      };
    }

    const data = JSON.parse(responseText) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope?: string;
    };

    console.log('[X Auth] Token exchange successful, scope:', data.scope);

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('[X Auth] Token exchange error:', error);
    return {
      success: false,
      error: 'Token exchange network error',
    };
  }
}

/**
 * Get user info from X API (fetches all available fields in one request)
 */
export async function getXUserInfo(accessToken: string): Promise<UserInfoResult> {
  console.log('[X Auth] Fetching user info from /2/users/me (with all user.fields)');

  try {
    const response = await fetch(X_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('[X Auth] User info status:', response.status);

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[X Auth] User info failed:', response.status, responseText);

      // Parse error details
      let errorDetail = 'Unknown error';
      try {
        const errorData = JSON.parse(responseText);
        errorDetail = errorData.detail || errorData.title || errorData.error || responseText;
      } catch {
        errorDetail = responseText;
      }

      return {
        success: false,
        error: errorDetail,
        httpStatus: response.status,
      };
    }

    // Parse full response with all user.fields
    const data = JSON.parse(responseText) as {
      data?: {
        id: string;
        name: string;
        username: string;
        profile_image_url?: string;
        description?: string;
        url?: string;
        location?: string;
        created_at?: string;
        protected?: boolean;
        verified?: boolean;
        verified_type?: string;
        public_metrics?: XPublicMetrics;
      };
      errors?: Array<{ message: string }>;
    };

    console.log('[X Auth] User info response parsed, has data:', !!data.data);

    if (!data.data) {
      const errorMsg = data.errors?.[0]?.message || 'No user data in response';
      console.error('[X Auth] No user data:', errorMsg);
      return {
        success: false,
        error: errorMsg,
        httpStatus: response.status,
      };
    }

    const user = data.data;
    console.log('[X Auth] User info success, username:', user.username, 'followers:', user.public_metrics?.followers_count);

    return {
      success: true,
      // Basic info
      id: user.id,
      name: user.name,
      username: user.username,
      // Extended info
      profile_image_url: user.profile_image_url,
      description: user.description,
      url: user.url,
      location: user.location,
      created_at: user.created_at,
      protected: user.protected,
      // Verification
      verified: user.verified,
      verified_type: user.verified_type,
      // Metrics
      public_metrics: user.public_metrics,
      // Store raw JSON for future use
      raw_json: responseText,
    };
  } catch (error) {
    console.error('[X Auth] User info error:', error);
    return {
      success: false,
      error: 'User info network error',
    };
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
  // Path=/ to ensure cookie is sent on callback (some browsers drop Path=/auth/x on redirects)
  return `${COOKIE_NAME}=${encrypted}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

/**
 * Parse auth state cookie from request
 */
export function getAuthCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  console.log('[X Auth] Cookie header present:', !!cookieHeader);

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${COOKIE_NAME}=`)) {
      console.log('[X Auth] Found auth cookie');
      return cookie.substring(COOKIE_NAME.length + 1);
    }
  }

  console.log('[X Auth] Auth cookie not found in:', cookies.map((c) => c.split('=')[0]));
  return null;
}

/**
 * Create cookie deletion header
 */
export function deleteAuthCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
