/**
 * SHA-256ハッシュを計算 (hex文字列)
 */
export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return arrayBufferToHex(hashBuffer);
}

/**
 * ArrayBufferをhex文字列に変換
 */
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * hex文字列をArrayBufferに変換
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Base64エンコード
 */
export function base64Encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64デコード
 */
export function base64Decode(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * APIキーのハッシュを生成 (SHA-256)
 */
export async function hashApiKey(key: string): Promise<string> {
  return sha256Hex(key);
}

/**
 * APIキーを検証
 */
export async function verifyApiKeyHash(key: string, hash: string): Promise<boolean> {
  const computed = await hashApiKey(key);
  return computed === hash;
}

/**
 * ランダムな文字列を生成
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => chars[b % chars.length])
    .join('');
}

/**
 * APIキーを生成
 * 形式: hads_<random32chars>
 */
export function generateApiKey(): { key: string; prefix: string } {
  const random = generateRandomString(32);
  const key = `hads_${random}`;
  const prefix = `hads_${random.substring(0, 8)}...`;
  return { key, prefix };
}

/**
 * 検証コードを生成
 * 形式: HUMANADS-XXXX-XXXX
 */
export function generateVerificationCode(): string {
  const part1 = generateRandomString(4).toUpperCase();
  const part2 = generateRandomString(4).toUpperCase();
  return `HUMANADS-${part1}-${part2}`;
}

/**
 * セッショントークンを生成
 */
export function generateSessionToken(): string {
  return generateRandomString(64);
}
