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
  publicKey: AgentPublicKey;
  timestamp: number;
  nonce: string;
  bodyHash: string;
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
  | 'withdrawn'
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
  withdrawn_at?: string;
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
  treasury_address: string;
  supported_chains: string[];
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
}

// Fee Recipient Configuration
export interface FeeRecipientConfig {
  solana: string;
  evm: string;
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
