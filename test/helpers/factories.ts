/**
 * Factory functions for creating test data
 */

export function randomId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export async function createDeal(
  db: D1Database,
  overrides: Partial<{
    id: string;
    agent_id: string;
    title: string;
    description: string;
    requirements: string;
    reward_amount: number;
    max_participants: number;
    status: string;
    payment_model: string;
    auf_percentage: number;
    visibility: string;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();
  const agentId = overrides.agent_id || 'testagent001aaaa';
  const title = overrides.title || 'Test Deal';
  const description = overrides.description || 'A test deal';
  const requirements = overrides.requirements || JSON.stringify({
    post_type: 'tweet',
    content_template: 'Check out {{link}}',
    hashtags: ['#test'],
    verification_method: 'url_check',
  });
  const rewardAmount = overrides.reward_amount || 1000;
  const maxParticipants = overrides.max_participants || 10;
  const status = overrides.status || 'active';
  const paymentModel = overrides.payment_model || 'a_plan';
  const aufPercentage = overrides.auf_percentage || 10;
  const visibility = overrides.visibility || 'visible';

  await db.prepare(
    `INSERT INTO deals (id, agent_id, title, description, requirements, reward_amount, max_participants, status, payment_model, auf_percentage, visibility, slots_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, agentId, title, description, requirements, rewardAmount, maxParticipants, status, paymentModel, aufPercentage, visibility, maxParticipants).run();

  return id;
}

export async function createApplication(
  db: D1Database,
  overrides: Partial<{
    id: string;
    deal_id: string;
    operator_id: string;
    status: string;
    proposed_angle: string;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();
  const dealId = overrides.deal_id || 'testdeal001aaaaa';
  const operatorId = overrides.operator_id || 'testoperator001a';
  const status = overrides.status || 'applied';
  const proposedAngle = overrides.proposed_angle || 'Test angle';

  await db.prepare(
    `INSERT INTO applications (id, deal_id, operator_id, status, proposed_angle, accept_disclosure, accept_no_engagement_buying)
     VALUES (?, ?, ?, ?, ?, 1, 1)`
  ).bind(id, dealId, operatorId, status, proposedAngle).run();

  return id;
}

export async function createMission(
  db: D1Database,
  overrides: Partial<{
    id: string;
    deal_id: string;
    operator_id: string;
    status: string;
    submission_url: string;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();
  const dealId = overrides.deal_id || 'testdeal001aaaaa';
  const operatorId = overrides.operator_id || 'testoperator001a';
  const status = overrides.status || 'accepted';

  await db.prepare(
    `INSERT INTO missions (id, deal_id, operator_id, status)
     VALUES (?, ?, ?, ?)`
  ).bind(id, dealId, operatorId, status).run();

  if (overrides.submission_url) {
    await db.prepare(
      `UPDATE missions SET submission_url = ?, submitted_at = datetime('now') WHERE id = ?`
    ).bind(overrides.submission_url, id).run();
  }

  return id;
}

export async function createReview(
  db: D1Database,
  overrides: Partial<{
    id: string;
    mission_id: string;
    deal_id: string;
    reviewer_type: string;
    reviewer_id: string;
    reviewee_type: string;
    reviewee_id: string;
    rating: number;
    comment: string;
    tags: string;
    is_published: number;
    is_reported: number;
    is_hidden: number;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();

  await db.prepare(
    `INSERT INTO reviews (id, mission_id, deal_id, reviewer_type, reviewer_id, reviewee_type, reviewee_id, rating, comment, tags, is_published, is_reported, is_hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    overrides.mission_id || 'testmission001aa',
    overrides.deal_id || 'testdeal001aaaaa',
    overrides.reviewer_type || 'operator',
    overrides.reviewer_id || 'testoperator001a',
    overrides.reviewee_type || 'agent',
    overrides.reviewee_id || 'testagent001aaaa',
    overrides.rating || 4,
    overrides.comment || 'Great experience',
    overrides.tags || '["fast_payment"]',
    overrides.is_published ?? 1,
    overrides.is_reported ?? 0,
    overrides.is_hidden ?? 0,
  ).run();

  return id;
}

export async function createAiAdvertiser(
  db: D1Database,
  overrides: Partial<{
    id: string;
    name: string;
    mode: string;
    status: string;
    api_key_hash: string;
    api_key_prefix: string;
    api_secret: string;
    key_id: string;
    claim_url: string;
    verification_code: string;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();
  const name = overrides.name || `TestAdvertiser_${id.substring(0, 8)}`;

  await db.prepare(
    `INSERT INTO ai_advertisers (id, name, mode, status, api_key_hash, api_key_prefix, api_secret, key_id, claim_url, verification_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    name,
    overrides.mode || 'test',
    overrides.status || 'pending_claim',
    overrides.api_key_hash || 'hash_' + id,
    overrides.api_key_prefix || 'humanads_' + id.substring(0, 8),
    overrides.api_secret || 'secret_' + id,
    overrides.key_id || 'hads_' + id.substring(0, 16),
    overrides.claim_url || `https://humanadsai.com/claim/humanads_claim_${id}`,
    overrides.verification_code || `reef-${id.substring(0, 4).toUpperCase()}`,
  ).run();

  return id;
}

export async function createAgent(
  db: D1Database,
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    status: string;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();

  await db.prepare(
    `INSERT INTO agents (id, name, email, status)
     VALUES (?, ?, ?, ?)`
  ).bind(
    id,
    overrides.name || `Agent_${id.substring(0, 8)}`,
    overrides.email || `agent_${id.substring(0, 8)}@example.com`,
    overrides.status || 'approved',
  ).run();

  return id;
}

export async function createOperator(
  db: D1Database,
  overrides: Partial<{
    id: string;
    x_handle: string;
    display_name: string;
    status: string;
    role: string;
    session_token_hash: string;
    session_expires_at: string;
    evm_wallet_address: string;
  }> = {}
): Promise<string> {
  const id = overrides.id || randomId();

  await db.prepare(
    `INSERT INTO operators (id, x_handle, display_name, status, role, session_token_hash, session_expires_at, evm_wallet_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    overrides.x_handle || `user_${id.substring(0, 8)}`,
    overrides.display_name || `User ${id.substring(0, 8)}`,
    overrides.status || 'verified',
    overrides.role || 'user',
    overrides.session_token_hash || null,
    overrides.session_expires_at || null,
    overrides.evm_wallet_address || null,
  ).run();

  return id;
}
