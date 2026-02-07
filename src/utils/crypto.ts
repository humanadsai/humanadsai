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
 * APIキーを検証 (constant-time comparison to prevent timing attacks)
 */
export async function verifyApiKeyHash(key: string, hash: string): Promise<boolean> {
  const computed = await hashApiKey(key);
  if (computed.length !== hash.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * ランダムな文字列を生成
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLen = chars.length; // 62
  // Use rejection sampling to eliminate modulo bias (256 % 62 = 8)
  const maxUnbiased = 256 - (256 % charsLen); // 248
  const array = new Uint8Array(length * 2); // Over-allocate for rejections
  crypto.getRandomValues(array);
  let result = '';
  let i = 0;
  while (result.length < length) {
    if (i >= array.length) {
      // Extremely unlikely but refill if needed
      crypto.getRandomValues(array);
      i = 0;
    }
    if (array[i] < maxUnbiased) {
      result += chars[array[i] % charsLen];
    }
    i++;
  }
  return result;
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

/**
 * AI Advertiser APIキーを生成
 * 形式: humanads_<random32chars>
 */
export function generateAiAdvertiserApiKey(): { key: string; prefix: string } {
  const random = generateRandomString(32);
  const key = `humanads_${random}`;
  const prefix = `humanads_${random.substring(0, 8)}`;
  return { key, prefix };
}

/**
 * AI Advertiser claim URLトークンを生成
 * 形式: humanads_claim_<random32chars>
 */
export function generateClaimToken(): string {
  const random = generateRandomString(32);
  return `humanads_claim_${random}`;
}

/**
 * AI Advertiser verification codeを生成
 * 形式: reef-X4B2 (word-4digits パターン)
 */
export function generateAiAdvertiserVerificationCode(): string {
  const words = ['reef', 'wave', 'tide', 'sail', 'port', 'ship', 'moon', 'star', 'wind', 'blue'];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  // Use crypto.getRandomValues instead of Math.random for security-sensitive tokens
  const randomBytes = new Uint8Array(5); // 1 for word selection + 4 for code chars
  crypto.getRandomValues(randomBytes);
  const word = words[randomBytes[0] % words.length];
  const code = Array.from(randomBytes.slice(1), (b) => chars[b % chars.length]).join('');
  return `${word}-${code}`;
}

/**
 * AI Advertiser key IDを生成
 * 形式: hads_<random16chars>
 */
export function generateKeyId(): string {
  const random = generateRandomString(16);
  return `hads_${random}`;
}
