/**
 * NonceStore Durable Object
 *
 * Agent単位でNonceを管理し、リプレイ攻撃を防ぐ。
 * TTL: 10分（タイムスタンプ窓5分 + 余裕）
 */
export class NonceStore implements DurableObject {
  private state: DurableObjectState;
  private nonces: Map<string, number> = new Map();
  private readonly TTL_MS = 10 * 60 * 1000; // 10分

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 起動時にストレージから復元
    if (this.nonces.size === 0) {
      const stored = await this.state.storage.get<Map<string, number>>('nonces');
      if (stored) {
        this.nonces = new Map(stored);
        // 期限切れを削除
        this.cleanupExpired();
      }
    }

    if (request.method === 'POST' && path === '/check') {
      return this.handleCheck(request);
    }

    if (request.method === 'DELETE' && path === '/clear') {
      // Only allow clear in development/testing environments
      const isDevRequest = request.headers.get('X-Internal-Dev-Key') === 'nonce-clear-allowed';
      if (!isDevRequest) {
        return new Response('Forbidden', { status: 403 });
      }
      return this.handleClear();
    }

    return new Response('Not Found', { status: 404 });
  }

  /**
   * Nonceの使用チェックと登録
   *
   * リクエストボディ: { nonce: string, timestamp: number }
   * レスポンス: { valid: boolean, reason?: string }
   */
  private async handleCheck(request: Request): Promise<Response> {
    try {
      const body = await request.json<{ nonce: string; timestamp: number }>();
      const { nonce, timestamp } = body;

      if (!nonce || typeof nonce !== 'string') {
        return Response.json({ valid: false, reason: 'invalid_nonce' });
      }

      // 期限切れをクリーンアップ
      this.cleanupExpired();

      // 既に使用済みかチェック
      if (this.nonces.has(nonce)) {
        return Response.json({ valid: false, reason: 'nonce_reused' });
      }

      // Nonceを登録
      const expiresAt = timestamp + this.TTL_MS;
      this.nonces.set(nonce, expiresAt);

      // ストレージに永続化
      await this.state.storage.put('nonces', Array.from(this.nonces.entries()));

      return Response.json({ valid: true });
    } catch {
      return Response.json({ valid: false, reason: 'internal_error' }, { status: 500 });
    }
  }

  /**
   * 全Nonceをクリア（テスト用）
   */
  private async handleClear(): Promise<Response> {
    this.nonces.clear();
    await this.state.storage.delete('nonces');
    return Response.json({ cleared: true });
  }

  /**
   * 期限切れNonceを削除
   */
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [nonce, expiresAt] of this.nonces) {
      if (expiresAt < now) {
        this.nonces.delete(nonce);
      }
    }
  }
}
