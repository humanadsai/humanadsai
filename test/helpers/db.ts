import { sha256Hex, generateSessionToken, generateApiKey, generateAiAdvertiserApiKey, generateKeyId, generateClaimToken, generateAiAdvertiserVerificationCode } from '../../src/utils/crypto';

/**
 * Apply schema.sql migrations to D1 database for testing
 */
export async function applyMigrations(db: D1Database): Promise<void> {
  // Core tables from schema.sql
  const statements = [
    // Agents
    `CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending_review',
      risk_score INTEGER DEFAULT 50,
      max_deal_amount INTEGER DEFAULT 5000,
      daily_volume_limit INTEGER DEFAULT 50000,
      open_deals_limit INTEGER DEFAULT 5,
      paid_count INTEGER DEFAULT 0,
      overdue_count INTEGER DEFAULT 0,
      avg_pay_time_seconds INTEGER DEFAULT 0,
      is_suspended_for_overdue INTEGER DEFAULT 0,
      last_overdue_at TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Agent API Keys
    `CREATE TABLE IF NOT EXISTS agent_api_keys (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      key_hash TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      scopes TEXT NOT NULL DEFAULT '["deals:create","deals:deposit"]',
      status TEXT NOT NULL DEFAULT 'active',
      rate_limit_per_min INTEGER DEFAULT 120,
      last_used_at TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      revoked_at TEXT
    )`,
    // Agent Public Keys
    `CREATE TABLE IF NOT EXISTS agent_public_keys (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      api_key_id TEXT NOT NULL REFERENCES agent_api_keys(id) ON DELETE CASCADE,
      public_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      revoked_at TEXT
    )`,
    // Operators
    `CREATE TABLE IF NOT EXISTS operators (
      id TEXT PRIMARY KEY,
      x_handle TEXT UNIQUE,
      x_user_id TEXT UNIQUE,
      display_name TEXT,
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'unverified',
      verified_at TEXT,
      total_missions_completed INTEGER DEFAULT 0,
      total_earnings INTEGER DEFAULT 0,
      session_token_hash TEXT,
      session_expires_at TEXT,
      bio TEXT,
      metadata TEXT,
      x_profile_image_url TEXT,
      x_description TEXT,
      x_url TEXT,
      x_location TEXT,
      x_created_at TEXT,
      x_protected INTEGER DEFAULT 0,
      x_verified INTEGER DEFAULT 0,
      x_verified_type TEXT,
      x_followers_count INTEGER DEFAULT 0,
      x_following_count INTEGER DEFAULT 0,
      x_tweet_count INTEGER DEFAULT 0,
      x_listed_count INTEGER DEFAULT 0,
      x_raw_json TEXT,
      x_fetched_at INTEGER,
      x_connected_at INTEGER,
      evm_wallet_address TEXT,
      solana_wallet_address TEXT,
      invite_code TEXT UNIQUE,
      invited_by TEXT,
      invite_count INTEGER DEFAULT 0,
      verify_code TEXT UNIQUE,
      verify_status TEXT NOT NULL DEFAULT 'not_started',
      verify_post_id TEXT,
      verify_completed_at TEXT,
      role TEXT DEFAULT 'user',
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Operator Verifications
    `CREATE TABLE IF NOT EXISTS operator_verifications (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
      verification_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      expires_at TEXT NOT NULL,
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Verification Posts
    `CREATE TABLE IF NOT EXISTS verification_posts (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
      tweet_id TEXT NOT NULL UNIQUE,
      tweet_url TEXT NOT NULL,
      tweet_text TEXT,
      tweet_author_id TEXT,
      status TEXT NOT NULL DEFAULT 'verified',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Deals
    `CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES agents(id),
      title TEXT NOT NULL,
      description TEXT,
      requirements TEXT NOT NULL,
      reward_amount INTEGER NOT NULL,
      max_participants INTEGER NOT NULL DEFAULT 10,
      current_participants INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      starts_at TEXT,
      expires_at TEXT,
      idempotency_key TEXT UNIQUE,
      payment_model TEXT DEFAULT 'escrow',
      auf_percentage INTEGER DEFAULT 10,
      visibility TEXT NOT NULL DEFAULT 'visible',
      visibility_changed_at TEXT,
      visibility_changed_by TEXT,
      admin_note TEXT,
      slots_total INTEGER,
      slots_selected INTEGER DEFAULT 0,
      applications_count INTEGER DEFAULT 0,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Missions
    `CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      operator_id TEXT NOT NULL REFERENCES operators(id),
      status TEXT NOT NULL DEFAULT 'accepted',
      submission_url TEXT,
      submission_content TEXT,
      submitted_at TEXT,
      verified_at TEXT,
      verification_result TEXT,
      paid_at TEXT,
      approved_at TEXT,
      auf_tx_hash TEXT,
      auf_confirmed_at TEXT,
      payout_deadline_at TEXT,
      payout_tx_hash TEXT,
      payout_confirmed_at TEXT,
      overdue_at TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(deal_id, operator_id)
    )`,
    // Applications
    `CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      operator_id TEXT NOT NULL REFERENCES operators(id),
      status TEXT NOT NULL DEFAULT 'applied',
      proposed_angle TEXT,
      estimated_post_time_window TEXT,
      draft_copy TEXT,
      accept_disclosure INTEGER NOT NULL DEFAULT 0,
      accept_no_engagement_buying INTEGER NOT NULL DEFAULT 0,
      language TEXT,
      audience_fit TEXT,
      portfolio_links TEXT,
      applied_at TEXT DEFAULT (datetime('now')),
      shortlisted_at TEXT,
      selected_at TEXT,
      rejected_at TEXT,
      withdrawn_at TEXT,
      cancelled_at TEXT,
      ai_score INTEGER,
      ai_notes TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(deal_id, operator_id)
    )`,
    // Balances
    `CREATE TABLE IF NOT EXISTS balances (
      id TEXT PRIMARY KEY,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 0,
      pending INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(owner_type, owner_id, currency)
    )`,
    // Ledger Entries
    `CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      balance_after INTEGER NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      description TEXT,
      idempotency_key TEXT UNIQUE,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Escrow Holds
    `CREATE TABLE IF NOT EXISTS escrow_holds (
      id TEXT PRIMARY KEY,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      agent_id TEXT NOT NULL REFERENCES agents(id),
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'held',
      released_at TEXT,
      refunded_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Audit Logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      agent_id TEXT,
      api_key_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      signature_valid INTEGER,
      timestamp_skew_ms INTEGER,
      nonce TEXT,
      body_hash TEXT,
      decision TEXT NOT NULL,
      denial_reason TEXT,
      response_status INTEGER,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Rate Limits
    `CREATE TABLE IF NOT EXISTS rate_limits (
      id TEXT PRIMARY KEY,
      limit_key TEXT NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 0,
      window_start TEXT NOT NULL,
      max_count INTEGER NOT NULL,
      is_frozen INTEGER DEFAULT 0,
      frozen_until TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Site Visits
    `CREATE TABLE IF NOT EXISTS site_visits (
      id TEXT PRIMARY KEY,
      visit_date TEXT NOT NULL,
      visitor_hash TEXT NOT NULL,
      page_path TEXT NOT NULL DEFAULT '/',
      referrer_domain TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(visit_date, visitor_hash, page_path)
    )`,
    // Payments
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      mission_id TEXT NOT NULL REFERENCES missions(id),
      agent_id TEXT NOT NULL,
      operator_id TEXT NOT NULL,
      payment_type TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      chain TEXT NOT NULL,
      token TEXT NOT NULL,
      tx_hash TEXT,
      to_address TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payout_mode TEXT DEFAULT 'onchain',
      confirmed_at TEXT,
      deadline_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    // Payout Links
    `CREATE TABLE IF NOT EXISTS payout_links (
      id TEXT PRIMARY KEY,
      mission_id TEXT NOT NULL REFERENCES missions(id),
      token_hash TEXT NOT NULL UNIQUE,
      chain TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_auf',
      unlocked_at TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Reviews
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      layer TEXT NOT NULL DEFAULT 'transaction',
      mission_id TEXT REFERENCES missions(id),
      application_id TEXT,
      deal_id TEXT NOT NULL REFERENCES deals(id),
      reviewer_type TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      reviewee_type TEXT NOT NULL,
      reviewee_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      tags TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      is_reported INTEGER NOT NULL DEFAULT 0,
      report_reason TEXT,
      reported_at TEXT,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      hidden_at TEXT,
      hidden_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(mission_id, reviewer_type, reviewer_id),
      UNIQUE(application_id, reviewer_type, reviewer_id)
    )`,
    // Reputation Snapshots
    `CREATE TABLE IF NOT EXISTS reputation_snapshots (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      avg_rating REAL NOT NULL DEFAULT 0,
      total_reviews INTEGER NOT NULL DEFAULT 0,
      rating_distribution TEXT NOT NULL DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}',
      tag_counts TEXT NOT NULL DEFAULT '{}',
      completion_rate REAL,
      calculated_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(entity_type, entity_id)
    )`,
    // Admin Actions
    `CREATE TABLE IF NOT EXISTS admin_actions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_handle TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      previous_value TEXT,
      new_value TEXT,
      reason TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // AI Advertisers
    `CREATE TABLE IF NOT EXISTS ai_advertisers (
      id TEXT PRIMARY KEY,
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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    // Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Email tables
    `CREATE TABLE IF NOT EXISTS operator_emails (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      is_primary INTEGER DEFAULT 1,
      verified_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS login_tokens (
      id TEXT PRIMARY KEY,
      operator_id TEXT,
      email TEXT,
      token_hash TEXT NOT NULL UNIQUE,
      purpose TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_preferences (
      operator_id TEXT NOT NULL,
      category TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (operator_id, category)
    )`,
    `CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      operator_id TEXT,
      to_email TEXT NOT NULL,
      template TEXT NOT NULL,
      subject TEXT,
      resend_message_id TEXT,
      status TEXT DEFAULT 'sent',
      error_message TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_suppressions (
      email TEXT PRIMARY KEY,
      reason TEXT NOT NULL,
      bounce_count INTEGER DEFAULT 0,
      suppressed INTEGER DEFAULT 0,
      first_event_at TEXT,
      suppressed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_webhook_events (
      event_id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      email_to TEXT,
      email_from TEXT,
      subject TEXT,
      resend_message_id TEXT,
      bounce_type TEXT,
      error_message TEXT,
      raw_payload TEXT NOT NULL,
      processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_audit_log (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Token Operations
    `CREATE TABLE IF NOT EXISTS token_ops (
      id TEXT PRIMARY KEY,
      op_type TEXT NOT NULL,
      chain TEXT NOT NULL DEFAULT 'sepolia',
      token TEXT NOT NULL DEFAULT 'hUSD',
      from_address TEXT,
      to_address TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      tx_hash TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      operator_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      confirmed_at TEXT
    )`,
    // App Config
    `CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      reason TEXT
    )`,
  ];

  for (const sql of statements) {
    await db.prepare(sql).run();
  }

  // Seed default app_config
  await db.prepare(
    `INSERT OR IGNORE INTO app_config (key, value, updated_by, reason)
     VALUES ('PAYMENT_PROFILE', 'TEST_SEPOLIA_HUSD', 'system', 'Initial setup')`
  ).run();
}

/**
 * Clear all data from all tables (for test isolation)
 */
export async function clearDatabase(db: D1Database): Promise<void> {
  const tables = [
    'token_ops', 'app_config',
    'email_audit_log', 'email_webhook_events', 'email_suppressions', 'email_logs',
    'email_preferences', 'login_tokens', 'operator_emails', 'notifications',
    'admin_actions', 'reputation_snapshots', 'reviews', 'payout_links', 'payments',
    'site_visits', 'rate_limits', 'audit_logs', 'escrow_holds', 'ledger_entries',
    'balances', 'applications', 'missions', 'deals', 'agent_public_keys',
    'agent_api_keys', 'agents', 'ai_advertisers', 'verification_posts',
    'operator_verifications', 'operators',
  ];
  for (const table of tables) {
    await db.prepare(`DELETE FROM ${table}`).run();
  }
  // Re-seed default app_config
  await db.prepare(
    `INSERT OR IGNORE INTO app_config (key, value, updated_by, reason)
     VALUES ('PAYMENT_PROFILE', 'TEST_SEPOLIA_HUSD', 'system', 'Initial setup')`
  ).run();
}

export interface TestSeedData {
  adminOperator: { id: string; sessionToken: string; sessionHash: string };
  regularOperator: { id: string; sessionToken: string; sessionHash: string };
  agent: { id: string; apiKey: string; apiKeyHash: string; apiKeyId: string };
}

/**
 * Seed common test data: admin operator, regular operator, and an agent with API key
 */
export async function seedTestData(db: D1Database): Promise<TestSeedData> {
  // Admin operator
  const adminId = 'testadmin001aaa';
  const adminToken = generateSessionToken();
  const adminHash = await sha256Hex(adminToken);
  const adminExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.prepare(
    `INSERT INTO operators (id, x_handle, display_name, status, role, session_token_hash, session_expires_at, verified_at, evm_wallet_address)
     VALUES (?, 'admin_test', 'Admin Test', 'verified', 'admin', ?, ?, datetime('now'), '0x1234567890abcdef1234567890abcdef12345678')`
  ).bind(adminId, adminHash, adminExpires).run();

  // Regular operator
  const operatorId = 'testoperator001a';
  const operatorToken = generateSessionToken();
  const operatorHash = await sha256Hex(operatorToken);
  const operatorExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.prepare(
    `INSERT INTO operators (id, x_handle, display_name, status, role, session_token_hash, session_expires_at, verified_at, evm_wallet_address)
     VALUES (?, 'operator_test', 'Operator Test', 'verified', 'user', ?, ?, datetime('now'), '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')`
  ).bind(operatorId, operatorHash, operatorExpires).run();

  // Agent with API key
  const agentId = 'testagent001aaaa';
  const { key: apiKey, prefix: apiKeyPrefix } = generateApiKey();
  const apiKeyHash = await sha256Hex(apiKey);
  const apiKeyId = 'testapikey001aaa';

  await db.prepare(
    `INSERT INTO agents (id, name, email, status, description)
     VALUES (?, 'Test Agent', 'test-agent@example.com', 'approved', 'Test agent for integration tests')`
  ).bind(agentId).run();

  await db.prepare(
    `INSERT INTO agent_api_keys (id, agent_id, key_hash, key_prefix, status)
     VALUES (?, ?, ?, ?, 'active')`
  ).bind(apiKeyId, agentId, apiKeyHash, apiKeyPrefix).run();

  return {
    adminOperator: { id: adminId, sessionToken: adminToken, sessionHash: adminHash },
    regularOperator: { id: operatorId, sessionToken: operatorToken, sessionHash: operatorHash },
    agent: { id: agentId, apiKey, apiKeyHash, apiKeyId },
  };
}
