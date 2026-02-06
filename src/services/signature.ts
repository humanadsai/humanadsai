import { sha256Hex, base64Decode } from '../utils/crypto';

/**
 * 署名の正規化文字列を生成 (HMAC-SHA256用)
 *
 * skill.md v1.0.1 形式:
 * {timestamp}|{nonce}|{METHOD}|{path}|{body}
 *
 * - METHOD is UPPERCASE
 * - path is request path only (e.g., /v1/deals/create)
 * - body is exact JSON string sent (empty string for GET/no body)
 * - separator is | (pipe)
 */
export function buildCanonicalStringHmac(
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  body: string
): string {
  return `${timestamp}|${nonce}|${method.toUpperCase()}|${path}|${body}`;
}

/**
 * HMAC-SHA256署名を生成
 */
export async function generateHmacSignature(
  message: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * HMAC-SHA256署名を検証
 */
export async function verifyHmacSignature(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generateHmacSignature(message, secret);
  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

/**
 * 署名の正規化文字列を生成 (Ed25519用 - レガシー)
 *
 * 形式:
 * <HTTP_METHOD>\n
 * <PATH>\n
 * <timestamp>\n
 * <nonce>\n
 * <sha256(body)>\n
 */
export function buildCanonicalString(
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  bodyHash: string
): string {
  return `${method}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}\n`;
}

/**
 * Ed25519署名を検証
 *
 * @param publicKeyBase64 - Base64エンコードされた公開鍵
 * @param signatureBase64 - Base64エンコードされた署名
 * @param message - 署名対象のメッセージ（正規化文字列）
 */
export async function verifyEd25519Signature(
  publicKeyBase64: string,
  signatureBase64: string,
  message: string
): Promise<boolean> {
  try {
    // 公開鍵をインポート
    const publicKeyBuffer = base64Decode(publicKeyBase64);
    const publicKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBuffer,
      {
        name: 'Ed25519',
      },
      false,
      ['verify']
    );

    // 署名をデコード
    const signatureBuffer = base64Decode(signatureBase64);

    // メッセージをエンコード
    const messageBuffer = new TextEncoder().encode(message);

    // 署名を検証
    const isValid = await crypto.subtle.verify(
      {
        name: 'Ed25519',
      },
      publicKey,
      signatureBuffer,
      messageBuffer
    );

    return isValid;
  } catch {
    // 検証エラーは false を返す
    return false;
  }
}

/**
 * リクエストボディのSHA-256ハッシュを計算
 */
export async function hashRequestBody(body: string | ArrayBuffer | null): Promise<string> {
  if (!body) {
    return sha256Hex('');
  }
  return sha256Hex(body);
}

/**
 * 署名検証に必要なヘッダを抽出
 */
export interface SignatureHeaders {
  authorization: string | null;
  timestamp: string | null;
  nonce: string | null;
  signature: string | null;
  keyId: string | null;
}

export function extractSignatureHeaders(request: Request): SignatureHeaders {
  return {
    authorization: request.headers.get('Authorization'),
    timestamp: request.headers.get('X-AdClaw-Timestamp'),
    nonce: request.headers.get('X-AdClaw-Nonce'),
    signature: request.headers.get('X-AdClaw-Signature'),
    keyId: request.headers.get('X-AdClaw-Key-Id'),
  };
}

/**
 * Authorizationヘッダからベアラートークンを抽出
 */
export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * タイムスタンプが有効な範囲内かチェック (±5分)
 */
export function isTimestampValid(timestampMs: number, nowMs: number = Date.now()): boolean {
  const skew = Math.abs(nowMs - timestampMs);
  return skew <= 300000; // 5分 = 300,000ms
}

/**
 * タイムスタンプのスキュー（差分）を計算
 */
export function calculateTimestampSkew(timestampMs: number, nowMs: number = Date.now()): number {
  return nowMs - timestampMs;
}
