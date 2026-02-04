-- HumanAds MVP Database Schema
-- Cloudflare D1 (SQLite compatible)

-- ============================================
-- Agent (AI Advertiser) Management
-- ============================================

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    description TEXT,
    -- 審査ステータス: pending_review, approved, suspended, revoked
    status TEXT NOT NULL DEFAULT 'pending_review',
    -- リスクスコア (審査で決定)
    risk_score INTEGER DEFAULT 50,
    -- 取引上限 (審査で段階解除)
    max_deal_amount INTEGER DEFAULT 5000, -- cents ($50)
    daily_volume_limit INTEGER DEFAULT 50000, -- cents ($500)
    open_deals_limit INTEGER DEFAULT 5,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_email ON agents(email);

-- ============================================
-- Agent API Keys
-- ============================================

CREATE TABLE IF NOT EXISTS agent_api_keys (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    -- キーのハッシュ (argon2/bcrypt相当、実際はSHA-256 + saltで簡易実装)
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL, -- 表示用 (例: "hads_xxxxx...")
    -- スコープ (JSON配列)
    scopes TEXT NOT NULL DEFAULT '["deals:create","deals:deposit"]',
    -- 状態: active, suspended, revoked
    status TEXT NOT NULL DEFAULT 'active',
    -- レート制限
    rate_limit_per_min INTEGER DEFAULT 120,
    -- 最終使用
    last_used_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    revoked_at TEXT
);

CREATE INDEX idx_agent_api_keys_agent ON agent_api_keys(agent_id);
CREATE INDEX idx_agent_api_keys_prefix ON agent_api_keys(key_prefix);
CREATE INDEX idx_agent_api_keys_status ON agent_api_keys(status);

-- ============================================
-- Agent Public Keys (Ed25519)
-- ============================================

CREATE TABLE IF NOT EXISTS agent_public_keys (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    api_key_id TEXT NOT NULL REFERENCES agent_api_keys(id) ON DELETE CASCADE,
    -- Ed25519公開鍵 (base64)
    public_key TEXT NOT NULL,
    -- 状態: active, revoked
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    revoked_at TEXT
);

CREATE INDEX idx_agent_public_keys_api_key ON agent_public_keys(api_key_id);

-- ============================================
-- Human Operators (Creators)
-- ============================================

CREATE TABLE IF NOT EXISTS operators (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- X (Twitter) ハンドル
    x_handle TEXT UNIQUE,
    x_user_id TEXT UNIQUE,
    -- 表示名
    display_name TEXT,
    -- プロフィール画像URL
    avatar_url TEXT,
    -- 認証ステータス: unverified, pending, verified, suspended
    status TEXT NOT NULL DEFAULT 'unverified',
    -- X認証完了日時
    verified_at TEXT,
    -- 統計
    total_missions_completed INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0, -- cents
    -- セッショントークン用
    session_token_hash TEXT,
    session_expires_at TEXT,
    -- メタデータ
    bio TEXT,
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_operators_x_handle ON operators(x_handle);
CREATE INDEX idx_operators_status ON operators(status);

-- ============================================
-- Operator Verification Codes (X Bio認証)
-- ============================================

CREATE TABLE IF NOT EXISTS operator_verifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operator_id TEXT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    -- 認証コード (X bioに貼る)
    verification_code TEXT NOT NULL UNIQUE,
    -- 状態: pending, verified, expired
    status TEXT NOT NULL DEFAULT 'pending',
    -- 有効期限
    expires_at TEXT NOT NULL,
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_operator_verifications_code ON operator_verifications(verification_code);
CREATE INDEX idx_operator_verifications_operator ON operator_verifications(operator_id);

-- ============================================
-- Deals (広告案件)
-- ============================================

CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    agent_id TEXT NOT NULL REFERENCES agents(id),
    -- 案件タイトル・説明
    title TEXT NOT NULL,
    description TEXT,
    -- 要件 (JSON: 投稿内容、ハッシュタグ、リンク等)
    requirements TEXT NOT NULL,
    -- 報酬 (cents)
    reward_amount INTEGER NOT NULL,
    -- 募集人数
    max_participants INTEGER NOT NULL DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    -- 状態: draft, funded, active, completed, cancelled, expired
    status TEXT NOT NULL DEFAULT 'draft',
    -- 期限
    starts_at TEXT,
    expires_at TEXT,
    -- べき等キー (重複作成防止)
    idempotency_key TEXT UNIQUE,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_deals_agent ON deals(agent_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_idempotency ON deals(idempotency_key);

-- ============================================
-- Missions (Operatorへの個別依頼)
-- ============================================

CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    deal_id TEXT NOT NULL REFERENCES deals(id),
    operator_id TEXT NOT NULL REFERENCES operators(id),
    -- 状態: accepted, submitted, verified, rejected, expired, paid
    status TEXT NOT NULL DEFAULT 'accepted',
    -- 投稿URL (Operatorが提出)
    submission_url TEXT,
    submission_content TEXT,
    submitted_at TEXT,
    -- 検証結果
    verified_at TEXT,
    verification_result TEXT, -- JSON
    -- 支払い
    paid_at TEXT,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(deal_id, operator_id)
);

CREATE INDEX idx_missions_deal ON missions(deal_id);
CREATE INDEX idx_missions_operator ON missions(operator_id);
CREATE INDEX idx_missions_status ON missions(status);

-- ============================================
-- Balances (残高管理)
-- ============================================

CREATE TABLE IF NOT EXISTS balances (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- owner_type: agent, operator
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    -- 利用可能残高 (cents)
    available INTEGER NOT NULL DEFAULT 0,
    -- 保留中 (escrow)
    pending INTEGER NOT NULL DEFAULT 0,
    -- 通貨 (将来拡張用)
    currency TEXT NOT NULL DEFAULT 'USD',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(owner_type, owner_id, currency)
);

CREATE INDEX idx_balances_owner ON balances(owner_type, owner_id);

-- ============================================
-- Ledger Entries (台帳)
-- ============================================

CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- 関連エンティティ
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    -- タイプ: deposit, withdrawal, escrow_hold, escrow_release, reward, refund
    entry_type TEXT NOT NULL,
    -- 金額 (正=入金、負=出金)
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    -- 残高スナップショット
    balance_after INTEGER NOT NULL,
    -- 関連ID
    reference_type TEXT, -- deal, mission, etc.
    reference_id TEXT,
    -- 説明
    description TEXT,
    -- べき等キー
    idempotency_key TEXT UNIQUE,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_ledger_owner ON ledger_entries(owner_type, owner_id);
CREATE INDEX idx_ledger_type ON ledger_entries(entry_type);
CREATE INDEX idx_ledger_reference ON ledger_entries(reference_type, reference_id);

-- ============================================
-- Escrow Holds (エスクロー保留)
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_holds (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    deal_id TEXT NOT NULL REFERENCES deals(id),
    agent_id TEXT NOT NULL REFERENCES agents(id),
    -- 保留金額
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    -- 状態: held, released, refunded
    status TEXT NOT NULL DEFAULT 'held',
    released_at TEXT,
    refunded_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_escrow_deal ON escrow_holds(deal_id);
CREATE INDEX idx_escrow_agent ON escrow_holds(agent_id);
CREATE INDEX idx_escrow_status ON escrow_holds(status);

-- ============================================
-- Audit Logs (監査ログ)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- リクエスト情報
    request_id TEXT NOT NULL,
    -- Agent情報
    agent_id TEXT,
    api_key_id TEXT,
    -- リクエスト詳細
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    -- 署名検証結果
    signature_valid INTEGER, -- 0/1
    timestamp_skew_ms INTEGER,
    nonce TEXT,
    body_hash TEXT,
    -- 判定結果
    decision TEXT NOT NULL, -- allow, deny
    denial_reason TEXT,
    -- レスポンス
    response_status INTEGER,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_request ON audit_logs(request_id);
CREATE INDEX idx_audit_agent ON audit_logs(agent_id);
CREATE INDEX idx_audit_decision ON audit_logs(decision);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- Rate Limit Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id TEXT PRIMARY KEY,
    -- キー (ip:xxx, key:xxx, endpoint:xxx)
    limit_key TEXT NOT NULL UNIQUE,
    -- カウント
    count INTEGER NOT NULL DEFAULT 0,
    -- ウィンドウ開始
    window_start TEXT NOT NULL,
    -- 上限
    max_count INTEGER NOT NULL,
    -- 凍結フラグ
    is_frozen INTEGER DEFAULT 0,
    frozen_until TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_rate_limits_key ON rate_limits(limit_key);
