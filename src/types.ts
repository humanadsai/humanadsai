// ============================================
// Environment Bindings
// ============================================

export interface Env {
  DB: D1Database;
  NONCE_STORE: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;
  // KV for session tokens (optional fallback)
  SESSIONS?: KVNamespace;
  // Static assets (Cloudflare Workers Static Assets)
  ASSETS: Fetcher;
  // Environment variables
  ENVIRONMENT: string;
  // Payout mode: 'ledger' (simulated) or 'onchain' (real transactions)
  PAYOUT_MODE?: string;
  // X (Twitter) OAuth2
  X_CLIENT_ID: string;
  X_CLIENT_SECRET: string;
  // X (Twitter) API v2 Bearer Token
  X_BEARER_TOKEN?: string;
  // Advertiser Test API credentials (for /advertiser/test page)
  ADVERTISER_TEST_KEY_ID?: string;
  ADVERTISER_TEST_SECRET?: string;
  // On-chain payment configuration (Sepolia)
  CHAIN_ID?: string;
  EVM_NETWORK?: string;
  RPC_URL?: string;
  HUSD_CONTRACT?: string;
  TREASURY_ADDRESS?: string;
  TREASURY_PRIVATE_KEY?: string;
  ADMIN_ADDRESS?: string;
  // Faucet configuration
  FAUCET_CONTRACT?: string;
  FAUCET_PER_ADVERTISER?: string;
  FAUCET_COOLDOWN_SECONDS?: string;
  // Resend Webhook (Svix signature verification)
  RESEND_WEBHOOK_SECRET?: string;
  // Resend API Key (for sending emails)
  RESEND_API_KEY?: string;
}

// ============================================
// Database Models
// ============================================

export interface Agent {
  id: string;
  name: string;
  email: string;
  description?: string;
  status: 'pending_review' | 'approved' | 'suspended' | 'revoked';
  risk_score: number;
  max_deal_amount: number;
  daily_volume_limit: number;
  open_deals_limit: number;
  // A-Plan trust score fields
  paid_count: number;
  overdue_count: number;
  avg_pay_time_seconds: number;
  is_suspended_for_overdue: boolean;
  last_overdue_at?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentApiKey {
  id: string;
  agent_id: string;
  key_hash: string;
  key_prefix: string;
  scopes: string;
  status: 'active' | 'suspended' | 'revoked';
  rate_limit_per_min: number;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  revoked_at?: string;
}

export interface AgentPublicKey {
  id: string;
  agent_id: string;
  api_key_id: string;
  public_key: string;
  status: 'active' | 'revoked';
  created_at: string;
  revoked_at?: string;
}

export type OperatorRole = 'user' | 'admin';

export interface Operator {
  id: string;
  x_handle?: string;
  x_user_id?: string;
  display_name?: string;
  avatar_url?: string;
  x_profile_image_url?: string;
  status: 'unverified' | 'pending' | 'verified' | 'suspended' | 'deleted';
  role?: OperatorRole;
  verified_at?: string;
  total_missions_completed: number;
  total_earnings: number;
  session_token_hash?: string;
  session_expires_at?: string;
  bio?: string;
  metadata?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OperatorVerification {
  id: string;
  operator_id: string;
  verification_code: string;
  status: 'pending' | 'verified' | 'expired';
  expires_at: string;
  verified_at?: string;
  created_at: string;
}

export type PaymentModel = 'escrow' | 'a_plan';

export type DealVisibility = 'visible' | 'hidden' | 'deleted';

export interface Deal {
  id: string;
  agent_id: string;
  title: string;
  description?: string;
  requirements: string;
  reward_amount: number;
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'funded' | 'active' | 'completed' | 'cancelled' | 'expired';
  starts_at?: string;
  expires_at?: string;
  idempotency_key?: string;
  // A-Plan payment model
  payment_model: PaymentModel;
  auf_percentage: number;
  // Visibility (admin soft-delete)
  visibility?: DealVisibility;
  visibility_changed_at?: string;
  visibility_changed_by?: string;
  admin_note?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

// Mission status including A-Plan states
export type MissionStatus =
  | 'accepted'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'paid'
  // A-Plan additional statuses
  | 'approved'          // AI approved (payment intent expressed)
  | 'address_unlocked'  // AUF paid, address disclosed
  | 'paid_partial'      // AUF confirmed, awaiting 90%
  | 'paid_complete'     // Full payment completed
  | 'overdue';          // Payment deadline exceeded

export interface Mission {
  id: string;
  deal_id: string;
  operator_id: string;
  status: MissionStatus;
  submission_url?: string;
  submission_content?: string;
  submitted_at?: string;
  verified_at?: string;
  verification_result?: string;
  paid_at?: string;
  // A-Plan timestamps
  approved_at?: string;
  auf_tx_hash?: string;
  auf_confirmed_at?: string;
  payout_deadline_at?: string;
  payout_tx_hash?: string;
  payout_confirmed_at?: string;
  overdue_at?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  owner_type: 'agent' | 'operator';
  owner_id: string;
  available: number;
  pending: number;
  currency: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  owner_type: 'agent' | 'operator';
  owner_id: string;
  entry_type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'reward' | 'refund';
  amount: number;
  currency: string;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  idempotency_key?: string;
  metadata?: string;
  created_at: string;
}

export interface EscrowHold {
  id: string;
  deal_id: string;
  agent_id: string;
  amount: number;
  currency: string;
  status: 'held' | 'released' | 'refunded';
  released_at?: string;
  refunded_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  request_id: string;
  agent_id?: string;
  api_key_id?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint: string;
  method: string;
  signature_valid?: number;
  timestamp_skew_ms?: number;
  nonce?: string;
  body_hash?: string;
  decision: 'allow' | 'deny';
  denial_reason?: string;
  response_status?: number;
  metadata?: string;
  created_at: string;
}

// ============================================
// API Request/Response Types
// ============================================

export type ApiScope =
  | 'deals:create'
  | 'deals:deposit'
  | 'deals:release'
  | 'deals:refund'
  | 'deals:dispute'
  | 'proofs:verify';

export interface AuthenticatedRequest {
  agent: Agent;
  apiKey: AgentApiKey;
  publicKey: AgentPublicKey;
  requestId: string;
  timestamp: number;
  nonce: string;
  bodyHash: string;
}

export interface AuthContext {
  requestId: string;
  agent: Agent;
  apiKey: AgentApiKey;
  publicKey?: AgentPublicKey;
  timestamp: number;
  nonce: string;
  bodyHash?: string;
  authMethod?: 'hmac' | 'ed25519';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  request_id: string;
}

// ============================================
// Deal Creation Request
// ============================================

export interface CreateDealRequest {
  title: string;
  description?: string;
  requirements: DealRequirements;
  reward_amount: number; // cents
  max_participants: number;
  starts_at?: string;
  expires_at?: string;
  idempotency_key?: string;
}

export interface DealRequirements {
  post_type: 'tweet' | 'retweet' | 'quote' | 'reply';
  content_template?: string;
  hashtags?: string[];
  mentions?: string[];
  link_url?: string;
  min_followers?: number;
  verification_method: 'url_check' | 'content_match' | 'manual';
}

// ============================================
// Deposit Request
// ============================================

export interface DepositRequest {
  amount: number; // cents
  deal_id?: string;
  idempotency_key: string;
}

// ============================================
// Operator Registration
// ============================================

export interface OperatorRegisterRequest {
  x_handle: string;
}

export interface OperatorVerifyRequest {
  operator_id: string;
  verification_code: string;
}

// ============================================
// Mission
// ============================================

export interface AcceptMissionRequest {
  deal_id: string;
}

export interface SubmitMissionRequest {
  mission_id: string;
  submission_url: string;
  submission_content?: string;
}

// ============================================
// Application Types (Apply → AI Selection Model)
// ============================================

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'selected'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export interface Application {
  id: string;
  deal_id: string;
  operator_id: string;
  status: ApplicationStatus;
  proposed_angle?: string;
  estimated_post_time_window?: string;
  draft_copy?: string;
  accept_disclosure: boolean;
  accept_no_engagement_buying: boolean;
  language?: string;
  audience_fit?: string;
  portfolio_links?: string;
  applied_at?: string;
  shortlisted_at?: string;
  selected_at?: string;
  rejected_at?: string;
  cancelled_at?: string;
  ai_score?: number;
  ai_notes?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplyMissionRequest {
  proposed_angle?: string;
  estimated_post_time_window?: string;
  draft_copy?: string;
  accept_disclosure: boolean;
  accept_no_engagement_buying: boolean;
  language?: string;
  audience_fit?: string;
  portfolio_links?: string;
}

// ============================================
// A-Plan Types (Address Unlock Fee Model)
// ============================================

export type PaymentType = 'auf' | 'payout';
export type PaymentStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';
export type PayoutLinkStatus = 'pending_auf' | 'unlocked' | 'paid' | 'expired';
export type PayoutMode = 'ledger' | 'onchain';

export interface Payment {
  id: string;
  mission_id: string;
  agent_id: string;
  operator_id: string;
  payment_type: PaymentType;
  amount_cents: number;
  chain: string;
  token: string;
  tx_hash?: string;
  to_address?: string;
  status: PaymentStatus;
  // Payout mode: 'ledger' (simulated) or 'onchain' (real blockchain transaction)
  payout_mode: PayoutMode;
  confirmed_at?: string;
  deadline_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutLink {
  id: string;
  mission_id: string;
  token_hash: string;
  chain: string;
  wallet_address: string;
  amount_cents: number;
  status: PayoutLinkStatus;
  unlocked_at?: string;
  expires_at: string;
  created_at: string;
}

export interface AgentTrustScore {
  agent_id: string;
  paid_count: number;
  overdue_count: number;
  avg_pay_time_seconds: number;
  is_suspended_for_overdue: boolean;
  last_overdue_at?: string;
  // Computed fields
  on_time_rate: number;
  trust_level: 'new' | 'good' | 'excellent' | 'warning' | 'suspended';
}

// A-Plan API Request/Response Types

export interface ApproveMissionRequest {
  payout_deadline_hours?: number; // Default 72 hours
}

export interface ApproveMissionResponse {
  mission_id: string;
  status: MissionStatus;
  approved_at: string;
  payout_deadline_at: string;
  auf_amount_cents: number;
  auf_percentage: number;
  // Fee vault addresses for AUF payment
  fee_vault_addresses: {
    evm: string;
    solana: string;
  };
  supported_chains: string[];
  supported_tokens?: Record<string, string[]>;
  // Payout mode info
  payout_mode?: PayoutMode;
  ledger_mode_info?: string;
}

export interface UnlockAddressRequest {
  auf_tx_hash: string;
  chain: string;
  token: string;
}

export interface UnlockAddressResponse {
  mission_id: string;
  status: MissionStatus;
  wallet_address: string;
  payout_amount_cents: number;
  payout_deadline_at: string;
  chain: string;
  token?: string;
  // Transaction verification info
  auf_tx_verified?: boolean;
  auf_explorer_url?: string;
  // Payout mode info
  payout_mode?: PayoutMode;
  is_simulated?: boolean;
  ledger_mode_info?: string;
}

export interface ConfirmPayoutRequest {
  payout_tx_hash: string;
  chain: string;
  token: string;
}

export interface ConfirmPayoutResponse {
  mission_id: string;
  status: MissionStatus;
  paid_complete_at: string;
  total_amount_cents: number;
  // Payout mode info
  payout_mode?: PayoutMode;
  is_simulated?: boolean;
}

// ============================================
// Admin API Types
// ============================================

export interface AdminContext {
  requestId: string;
  operator: Operator;
}

// Agent Management
export interface AdminCreateAgentRequest {
  name: string;
  email: string;
  description?: string;
  status?: 'pending_review' | 'approved' | 'suspended' | 'revoked';
}

export interface AdminUpdateAgentRequest {
  name?: string;
  email?: string;
  description?: string;
  status?: 'pending_review' | 'approved' | 'suspended' | 'revoked';
  max_deal_amount?: number;
  daily_volume_limit?: number;
  open_deals_limit?: number;
}

// Mission Management (Admin Deploy Test)
export interface AdminCreateDealRequest {
  agent_id: string;
  title: string;
  description?: string;
  requirements: DealRequirements;
  reward_amount: number;
  max_participants: number;
  payment_model?: PaymentModel;
  auf_percentage?: number;
  starts_at?: string;
  expires_at?: string;
}

// Application Seeding
export interface AdminSeedApplicationRequest {
  deal_id: string;
  operator_id: string;
  status?: ApplicationStatus;
  proposed_angle?: string;
  draft_copy?: string;
}

// Submission Testing
export interface AdminCreateSubmissionRequest {
  mission_id: string;
  submission_url: string;
  submission_content?: string;
}

// Review Actions
export interface AdminReviewActionRequest {
  action: 'verify' | 'reject';
  verification_result?: string;
}

// Payout Testing
export interface AdminPayoutTestRequest {
  mission_id: string;
  mode: 'ledger' | 'testnet' | 'mainnet';
  chain?: string;
  token?: string;
  execute?: boolean; // When true, actually send onchain transaction (testnet/mainnet)
}

// Fee Recipient Configuration
export interface FeeRecipientConfig {
  solana: string;
  evm: string;
}

// Admin Action Log
export interface AdminAction {
  id: string;
  admin_id: string;
  admin_handle?: string;
  action: string;
  target_type: string;
  target_id: string;
  previous_value?: string;
  new_value?: string;
  reason?: string;
  metadata?: string;
  created_at: string;
}

// Admin Dashboard Stats
export interface AdminDashboardStats {
  total_agents: number;
  active_agents: number;
  total_operators: number;
  verified_operators: number;
  total_deals: number;
  active_deals: number;
  total_missions: number;
  total_applications: number;
  pending_submissions: number;
  pending_payouts: number;
}

// ============================================
// AI Advertiser API (v1)
// ============================================

export interface AiAdvertiser {
  id: string;
  name: string;
  description?: string;
  mode: 'test' | 'production';
  status: 'pending_claim' | 'active' | 'suspended' | 'revoked';
  api_key_hash: string;
  api_key_prefix: string;
  api_secret: string;
  key_id: string;
  claim_url: string;
  verification_code: string;
  claimed_by_operator_id?: string;
  claimed_at?: string;
  verification_tweet_id?: string;
  verification_tweet_url?: string;
  x_handle?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterAdvertiserRequest {
  name: string;
  description?: string;
  mode: 'test' | 'production';
}

export interface RegisterAdvertiserResponse {
  advertiser: {
    api_key: string;
    claim_url: string;
    verification_code: string;
    mode: string;
  };
  important: string;
  next_steps: string[];
}

export interface AdvertiserStatusResponse {
  status: 'pending_claim' | 'active' | 'suspended' | 'revoked';
  claim_url?: string;
  verification_code?: string;
  next_step?: string;
  claimed_at?: string;
  claimed_by?: string;
  x_handle?: string;
}

export interface CreateMissionRequest {
  mode: 'test' | 'production';
  title: string;
  brief: string;
  requirements: {
    must_include_text?: string;
    must_include_hashtags?: string[];
    must_mention?: string[];
    must_include_urls?: string[];
  };
  deadline_at: string;
  payout: {
    token: 'hUSD' | 'USDC';
    amount: string;
  };
  max_claims: number;
}

export interface MissionSubmission {
  id: string;
  operator: {
    x_handle: string;
    x_followers_count: number;
  };
  submission_url: string;
  status: 'submitted' | 'verified' | 'approved' | 'rejected' | 'paid';
  submitted_at: string;
  verified_at?: string;
  paid_at?: string;
}

export interface SubmissionRejectRequest {
  reason: string;
}

// ============================================
// Review & Reputation Types
// ============================================

export type ReviewLayer = 'transaction' | 'early_signal';
export type ReviewerType = 'operator' | 'agent';

export interface Review {
  id: string;
  layer: ReviewLayer;
  mission_id?: string;
  application_id?: string;
  deal_id: string;
  reviewer_type: ReviewerType;
  reviewer_id: string;
  reviewee_type: ReviewerType;
  reviewee_id: string;
  rating: number;
  comment?: string;
  tags?: string; // JSON array
  is_published: number;
  published_at?: string;
  is_reported: number;
  report_reason?: string;
  reported_at?: string;
  is_hidden: number;
  hidden_at?: string;
  hidden_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReputationSnapshot {
  id: string;
  entity_type: ReviewerType;
  entity_id: string;
  avg_rating: number;
  total_reviews: number;
  rating_distribution: string; // JSON: {"1":0,"2":0,...}
  tag_counts: string; // JSON
  completion_rate?: number;
  calculated_at: string;
  updated_at: string;
}

export interface SubmitReviewRequest {
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface ReportReviewRequest {
  reason: string;
}

// Allowed tags for operator reviews (reviewing an agent/advertiser)
export const OPERATOR_REVIEW_TAGS = [
  'fast_payment',
  'clear_brief',
  'good_communication',
  'fair_requirements',
  'would_work_again',
  'slow_payment',
  'unclear_brief',
  'poor_communication',
  'unfair_requirements',
] as const;

// Allowed tags for agent reviews (reviewing an operator)
export const AGENT_REVIEW_TAGS = [
  'high_quality',
  'on_time',
  'creative',
  'professional',
  'good_engagement',
  'would_hire_again',
  'low_quality',
  'late_delivery',
  'unresponsive',
] as const;

// ============================================
// Email System Types
// ============================================

export interface OperatorEmail {
  id: string;
  operator_id: string;
  email: string;
  is_primary: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginToken {
  id: string;
  operator_id: string | null;
  email: string | null;
  token_hash: string;
  purpose: 'login' | 'email_verify' | 'email_change';
  expires_at: string;
  used_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EmailLog {
  id: string;
  operator_id: string | null;
  to_email: string;
  template: string;
  subject: string | null;
  resend_message_id: string | null;
  status: string;
  error_message: string | null;
  metadata: string | null;
  created_at: string;
}

export interface EmailPreference {
  operator_id: string;
  category: string;
  enabled: number;
  updated_at: string;
}

export interface EmailAuditEntry {
  id: string;
  operator_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
