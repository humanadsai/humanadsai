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
    -- A-Plan Trust Score Fields
    paid_count INTEGER DEFAULT 0,
    overdue_count INTEGER DEFAULT 0,
    avg_pay_time_seconds INTEGER DEFAULT 0,
    is_suspended_for_overdue INTEGER DEFAULT 0,
    last_overdue_at TEXT,
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_overdue ON agents(is_suspended_for_overdue);
CREATE INDEX idx_agents_paid_count ON agents(paid_count);

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
    -- プロフィール画像URL (legacy, use x_profile_image_url)
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

    -- ============================================
    -- Extended X Profile Data (fetched from /2/users/me)
    -- ============================================
    x_profile_image_url TEXT,
    x_description TEXT,
    x_url TEXT,
    x_location TEXT,
    x_created_at TEXT,
    x_protected INTEGER DEFAULT 0,

    -- X Verification
    x_verified INTEGER DEFAULT 0,
    x_verified_type TEXT,

    -- X Public Metrics
    x_followers_count INTEGER DEFAULT 0,
    x_following_count INTEGER DEFAULT 0,
    x_tweet_count INTEGER DEFAULT 0,
    x_listed_count INTEGER DEFAULT 0,

    -- Raw JSON from /2/users/me (for future use)
    x_raw_json TEXT,
    -- Last X profile fetch timestamp (Unix ms)
    x_fetched_at INTEGER,
    -- First X connection timestamp (Unix ms)
    x_connected_at INTEGER,

    -- Payout Wallet Addresses
    evm_wallet_address TEXT,
    solana_wallet_address TEXT,

    -- Invite System (replaces Post Verification)
    invite_code TEXT UNIQUE, -- User's unique invite code (e.g., HADS_ABC123)
    invited_by TEXT, -- operator_id of who invited this user
    invite_count INTEGER DEFAULT 0, -- Number of users invited by this user

    -- Legacy Post Verification (deprecated, kept for backward compatibility)
    verify_code TEXT UNIQUE,
    verify_status TEXT NOT NULL DEFAULT 'not_started',
    verify_post_id TEXT,
    verify_completed_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_operators_x_handle ON operators(x_handle);
CREATE INDEX idx_operators_status ON operators(status);
CREATE INDEX idx_operators_invite_code ON operators(invite_code);
CREATE INDEX idx_operators_invited_by ON operators(invited_by);
CREATE INDEX idx_operators_verify_code ON operators(verify_code);

-- ============================================
-- Verification Posts (tracking used posts)
-- ============================================

CREATE TABLE IF NOT EXISTS verification_posts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operator_id TEXT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    tweet_id TEXT NOT NULL UNIQUE,
    tweet_url TEXT NOT NULL,
    tweet_text TEXT,
    tweet_author_id TEXT,
    status TEXT NOT NULL DEFAULT 'verified', -- verified, rejected
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_verification_posts_operator ON verification_posts(operator_id);
CREATE INDEX idx_verification_posts_tweet ON verification_posts(tweet_id);

-- ============================================
-- Operator Verification Codes (X Bio認証 - Legacy)
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
    -- A-Plan Payment Model
    payment_model TEXT DEFAULT 'escrow', -- 'escrow' or 'a_plan'
    auf_percentage INTEGER DEFAULT 10, -- Address Unlock Fee percentage
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
    -- A-Plan additional: approved, address_unlocked, paid_partial, paid_complete, overdue
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
    -- A-Plan Timestamps
    approved_at TEXT, -- AI approved payment
    auf_tx_hash TEXT, -- Address Unlock Fee tx hash
    auf_confirmed_at TEXT, -- AUF confirmed timestamp
    payout_deadline_at TEXT, -- Payment deadline
    payout_tx_hash TEXT, -- 90% payout tx hash
    payout_confirmed_at TEXT, -- Payout confirmed timestamp
    overdue_at TEXT, -- When marked as overdue
    -- メタデータ
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(deal_id, operator_id)
);

CREATE INDEX idx_missions_deal ON missions(deal_id);
CREATE INDEX idx_missions_operator ON missions(operator_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_payout_deadline ON missions(payout_deadline_at);
CREATE INDEX idx_missions_approved_at ON missions(approved_at);
CREATE INDEX idx_missions_overdue_at ON missions(overdue_at);

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

-- ============================================
-- Site Visits Tracking (for public stats)
-- ============================================

CREATE TABLE IF NOT EXISTS site_visits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- 訪問日 (YYYY-MM-DD)
    visit_date TEXT NOT NULL,
    -- ビジター識別子 (hashed IP + User-Agent for uniqueness, not stored raw)
    visitor_hash TEXT NOT NULL,
    -- ページパス
    page_path TEXT NOT NULL DEFAULT '/',
    -- リファラードメイン (optional)
    referrer_domain TEXT,
    -- 作成日時
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    -- ユニーク訪問者を日別で追跡
    UNIQUE(visit_date, visitor_hash, page_path)
);

CREATE INDEX idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX idx_site_visits_created ON site_visits(created_at);

-- ============================================
-- Applications Extensions (A-Plan)
-- ============================================

-- Note: payment_ref column is added via migration 005
-- ALTER TABLE applications ADD COLUMN payment_ref TEXT UNIQUE;

-- ============================================
-- Payments Table (A-Plan - AUF + 90% TxHash Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    mission_id TEXT NOT NULL REFERENCES missions(id),
    agent_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    -- Payment type: 'auf' (10% address unlock fee) or 'payout' (90% direct payment)
    payment_type TEXT NOT NULL,
    -- Amount in cents
    amount_cents INTEGER NOT NULL,
    -- Blockchain details
    chain TEXT NOT NULL,
    token TEXT NOT NULL,
    tx_hash TEXT,
    to_address TEXT,
    -- Status: pending, submitted, confirmed, failed
    status TEXT NOT NULL DEFAULT 'pending',
    -- Payout mode: 'ledger' (simulated) or 'onchain' (real blockchain transaction)
    payout_mode TEXT DEFAULT 'onchain',
    confirmed_at TEXT,
    deadline_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_payments_mission ON payments(mission_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_agent ON payments(agent_id);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_payout_mode ON payments(payout_mode);

-- ============================================
-- Payout Links Table (A-Plan - Secure Address Disclosure)
-- ============================================

CREATE TABLE IF NOT EXISTS payout_links (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    mission_id TEXT NOT NULL REFERENCES missions(id),
    -- Secure token for one-time address reveal
    token_hash TEXT NOT NULL UNIQUE,
    -- Blockchain details
    chain TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    -- Status: pending_auf, unlocked, paid, expired
    status TEXT NOT NULL DEFAULT 'pending_auf',
    unlocked_at TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_payout_links_mission ON payout_links(mission_id);
CREATE INDEX idx_payout_links_token ON payout_links(token_hash);
CREATE INDEX idx_payout_links_status ON payout_links(status);

-- ============================================
-- Reviews (Two-sided Reputation Layer B)
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- Review layer: 'transaction' (Phase 1) or 'early_signal' (Phase 2)
    layer TEXT NOT NULL DEFAULT 'transaction',
    -- Related entities
    mission_id TEXT REFERENCES missions(id),
    application_id TEXT, -- Phase 2 (early_signal layer)
    deal_id TEXT NOT NULL REFERENCES deals(id),
    -- Reviewer
    reviewer_type TEXT NOT NULL, -- 'operator' or 'agent'
    reviewer_id TEXT NOT NULL,
    -- Reviewee
    reviewee_type TEXT NOT NULL, -- 'operator' or 'agent'
    reviewee_id TEXT NOT NULL,
    -- Review content
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT, -- max 500 chars (enforced at API level)
    tags TEXT, -- JSON array of tag strings
    -- Double-blind publish control
    is_published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    -- Moderation
    is_reported INTEGER NOT NULL DEFAULT 0,
    report_reason TEXT,
    reported_at TEXT,
    is_hidden INTEGER NOT NULL DEFAULT 0,
    hidden_at TEXT,
    hidden_by TEXT,
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    -- One review per mission per reviewer
    UNIQUE(mission_id, reviewer_type, reviewer_id),
    -- One review per application per reviewer (Phase 2)
    UNIQUE(application_id, reviewer_type, reviewer_id)
);

CREATE INDEX idx_reviews_mission ON reviews(mission_id);
CREATE INDEX idx_reviews_deal ON reviews(deal_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_type, reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id);
CREATE INDEX idx_reviews_published ON reviews(is_published);
CREATE INDEX idx_reviews_reported ON reviews(is_reported);
CREATE INDEX idx_reviews_created ON reviews(created_at);

-- ============================================
-- Reputation Snapshots (Aggregated scores)
-- ============================================

CREATE TABLE IF NOT EXISTS reputation_snapshots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    -- Entity being rated
    entity_type TEXT NOT NULL, -- 'operator' or 'agent'
    entity_id TEXT NOT NULL,
    -- Aggregated stats
    avg_rating REAL NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    rating_distribution TEXT NOT NULL DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}', -- JSON
    tag_counts TEXT NOT NULL DEFAULT '{}', -- JSON: {"fast_payment": 3, ...}
    -- Phase 2: completion rate
    completion_rate REAL,
    -- Timestamps
    calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    -- One snapshot per entity
    UNIQUE(entity_type, entity_id)
);

CREATE INDEX idx_reputation_entity ON reputation_snapshots(entity_type, entity_id);
CREATE INDEX idx_reputation_avg ON reputation_snapshots(avg_rating);

-- ============================================
-- AI Advertisers (API-registered AI agents)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_advertisers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    mode TEXT NOT NULL CHECK(mode IN ('test', 'production')),
    status TEXT NOT NULL DEFAULT 'pending_claim' CHECK(status IN ('pending_claim', 'active', 'suspended', 'revoked')),
    api_key_hash TEXT NOT NULL,
    api_key_prefix TEXT NOT NULL,
    api_secret TEXT NOT NULL,
    key_id TEXT NOT NULL UNIQUE,
    claim_url TEXT NOT NULL UNIQUE,
    verification_code TEXT NOT NULL UNIQUE,
    claimed_by_operator_id TEXT REFERENCES operators(id),
    claimed_at TEXT,
    verification_tweet_id TEXT,
    verification_tweet_url TEXT,
    x_handle TEXT,
    -- Registration source: 'advertiser' (X verification) or 'agent' (1-click claim)
    registration_source TEXT DEFAULT 'advertiser',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_ai_advertisers_name ON ai_advertisers(name);
CREATE INDEX idx_ai_advertisers_status ON ai_advertisers(status);
CREATE INDEX idx_ai_advertisers_key_id ON ai_advertisers(key_id);
CREATE INDEX idx_ai_advertisers_claim_url ON ai_advertisers(claim_url);

-- ============================================
-- Agent Claim Tokens (simplified 1-click activation)
-- ============================================

CREATE TABLE IF NOT EXISTS agent_claim_tokens (
    id TEXT PRIMARY KEY,
    advertiser_id TEXT NOT NULL REFERENCES ai_advertisers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','claimed','expired')),
    expires_at TEXT NOT NULL,
    claimed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agent_claim_tokens_token ON agent_claim_tokens(token);
CREATE INDEX idx_agent_claim_tokens_expires ON agent_claim_tokens(expires_at);
