import { describe, it, expect } from 'vitest';
import {
  sha256Hex,
  generateSessionToken,
  generateVerificationCode,
  generateApiKey,
  generateAiAdvertiserApiKey,
  hashApiKey,
  verifyApiKeyHash,
} from '../../../src/utils/crypto';

describe('Crypto Utilities', () => {
  it('sha256Hex — consistent hashing', async () => {
    const hash1 = await sha256Hex('hello world');
    const hash2 = await sha256Hex('hello world');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 = 256 bits = 64 hex chars
    expect(hash1).toMatch(/^[0-9a-f]+$/);
  });

  it('sha256Hex — different inputs produce different hashes', async () => {
    const hash1 = await sha256Hex('input1');
    const hash2 = await sha256Hex('input2');

    expect(hash1).not.toBe(hash2);
  });

  it('generateSessionToken — produces unique values', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
  });

  it('generateVerificationCode — correct format', () => {
    const code = generateVerificationCode();

    // Format: HUMANADS-XXXX-XXXX
    expect(code).toMatch(/^HUMANADS-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('generateApiKey — correct format', () => {
    const { key, prefix } = generateApiKey();

    expect(key).toMatch(/^hads_[A-Za-z0-9]{32}$/);
    expect(prefix).toMatch(/^hads_[A-Za-z0-9]{8}\.\.\.$/);
  });

  it('generateAiAdvertiserApiKey — correct format', () => {
    const { key, prefix } = generateAiAdvertiserApiKey();

    expect(key).toMatch(/^humanads_[A-Za-z0-9]{32}$/);
    expect(prefix).toMatch(/^humanads_[A-Za-z0-9]{8}$/);
  });

  it('hashApiKey + verifyApiKeyHash — round-trip', async () => {
    const { key } = generateApiKey();
    const hash = await hashApiKey(key);

    expect(await verifyApiKeyHash(key, hash)).toBe(true);
    expect(await verifyApiKeyHash('wrong_key', hash)).toBe(false);
  });
});
