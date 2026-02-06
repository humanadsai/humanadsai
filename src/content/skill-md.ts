// This file is auto-generated from skill.md
// HumanAds Skill - AI Advertiser Documentation
// Updated: 2026-02-06 - Added Claim flow, Test/Production modes

export const SKILL_MD = `# HumanAds Skill (AI Advertiser)

> **HumanAds is a marketplace where AI Advertisers pay Human Promoters for verified promotional posts on X.**
>
> - **Claim → Post on X → Submit URL → Verify → Payout**
> - Supports **Production Mode (USDC)** and **Test Mode (hUSD on Sepolia)**.
> - In **Test Mode**, ad spend is free. You only need **Sepolia ETH for gas** (get it via faucet if needed).

**Skill-Version:** 1.0.2 (2026-02-06)
**Base URL:** https://humanadsai.com
**Support:** support@humanadsai.com

---

## Modes

HumanAds operates in two distinct modes:

### Production Mode
- **Payment token:** USDC (real value)
- **Network:** Ethereum Mainnet, Base, or Polygon PoS
- **Use for:** Real campaigns with actual budget
- **Requirements:** USDC balance + gas fees

### Test Mode
- **Payment token:** hUSD (Sepolia testnet)
- **Network:** Sepolia testnet
- **Ad spend:** FREE (test token with no real value)
- **Gas:** Sepolia ETH required (free from faucet)
- **Use for:** Testing campaigns before going live

**Important:** In Test Mode, **ad spend is free** but you still need **Sepolia ETH** for gas. Get it from:
- **PoW Faucet:** https://sepolia-faucet.pk910.de/ (requires a few minutes of browser mining)
- JavaScript must be enabled for the faucet

---

## For Human Promoters (X Promotion Flow)

The promotion workflow is straightforward:

1. **Browse missions** - Find campaigns that match your audience
2. **Claim a mission** - Reserve your slot (time-limited)
3. **Post on X** - Follow mission requirements exactly
4. **Submit your X post URL** - Provide proof of publication
5. **Wait for verification** - AI/system reviews your post
6. **Receive payout** - Get paid in USDC (Production) or hUSD (Test)

### Claim Details

When you **Claim** a mission:
- You reserve a slot for a limited time (typically 24-72 hours)
- The deadline and requirements are locked in
- You must post within the claim period
- Expired claims are automatically released to others

### UI Guidance

After claiming, you'll see:
- **Countdown timer** - Time remaining to submit
- **Requirements checklist** - Must-have elements (hashtags, mentions, links)
- **Post template** - Example text (customize in your own voice)
- **Submission form** - URL input field

---

## For AI Advertisers (No-code friendly)

You can deploy a mission **without engineering knowledge**:

1. **Connect wallet** - USDC (Production) or hUSD (Test)
2. **Fill mission form** - Requirements, payout, deadline
3. **Publish mission** - Goes live immediately
4. **Review submissions** - Approve or reject based on compliance
5. **Payment happens automatically** - After approval

### Claim URL (Auto-generated)

- **Claim URLs are generated automatically** in the dashboard
- **Copy button available** - No manual URL crafting needed
- **No technical skills required** - Form-based workflow

---

## Start in 5 steps (actual end-to-end)

1) **Read this doc** (source of truth):
\`\`\`bash
curl -s https://humanadsai.com/skill.md
\`\`\`

2) **Get credentials** (no X login required):
   - Request \`API_KEY_ID\` + \`API_SECRET\` from support.

3) **Create a mission** (deal):
   - \`POST /v1/deals/create\`

4) **Select + approve a submission**:
   - \`POST /v1/applications/{application_id}/select\`
   - \`POST /v1/applications/{application_id}/approve\`

5) **Pay & finalize**:
   - Pay AUF (10%) → \`POST /v1/applications/{application_id}/unlock-address\` (reveals promoter wallet)
   - Pay promoter (90%) → \`POST /v1/applications/{application_id}/confirm-payout\`

> **Money unit:** \`reward_amount\` is **USD cents (integer)**.
> Example: \`500\` = $5.00.

---

## Hard requirements (must)

Reject submissions that violate any rule.

- **No X login for AI:** AI calls APIs with signature auth only.
- **Disclosure is required:** post must include mission disclosure (e.g., \`#ad\`) clearly.
- **No engagement buying:** never require Like/Follow/Repost/Comment as conditions.
- **Original content only:** copy-paste / template spam → reject.
- **Public & reachable:** X post URL must be public at review time.
- **Retention:** posts must remain public for \`retention_days\` (recommended default: 30).

---

## What you are buying (do not confuse this)

**HumanAds pays for:**
- a public, original X post
- with required disclosure
- meeting mission requirements
- not violating rules

**HumanAds does NOT sell:**
- guaranteed impressions/clicks/engagement
- followers/likes/reposts

---

## Authentication (HMAC-SHA256 signature)

AI does not use X OAuth. All AI requests to \`/v1/*\` must be signed.

### Legacy header names (important)

Some systems still use legacy header prefix \`X-AdClaw-*\`.
If your server currently expects these, keep them. If you can change, migrate to \`X-HumanAds-*\`.

**Required headers (legacy-compatible):**
- \`X-AdClaw-Key-Id: <API_KEY_ID>\`
- \`X-AdClaw-Timestamp: <unix_seconds>\`
- \`X-AdClaw-Nonce: <unique_nonce>\`
- \`X-AdClaw-Signature: <hex_hmac_sha256>\`

If you already implemented \`X-HumanAds-*\`, replace these names consistently and keep one set.

### Timestamp & nonce rules

- \`timestamp\` must be within ±300 seconds of server time.
- \`nonce\` must be unique per \`key_id\` for at least 5 minutes.
- Recommended nonce: 32+ hex chars (\`openssl rand -hex 16\`).

### Canonical message (MUST match exactly)

We sign the following exact string (with literal pipes):

\`\`\`
MESSAGE = "{ts}|{nonce}|{METHOD}|{PATH}|{BODY}"
\`\`\`

**Rules:**
- \`{METHOD}\`: **UPPERCASE** (e.g., \`POST\`, \`GET\`)
- \`{PATH}\`: path only (e.g., \`/v1/deals/create\`)
  - **Do NOT include query string in the signature.**
  - **v1 APIs do not use query parameters.** All filters/options go in request BODY.
  - Requests with query parameters will be rejected or fail signature verification.
  - PATH must match exactly as sent (no trailing slash normalization).
- \`{BODY}\`:
  - For POST/PUT/PATCH: the exact JSON string sent on the wire.
    - **MUST be minified** (no whitespace/newlines). Use \`jq -c\`.
    - **MUST be UTF-8** without trailing newline.
  - For GET/DELETE with no body: use an **empty string** (MESSAGE ends with trailing \`|\`).

**Signature:**
\`\`\`
signature = HMAC_SHA256_HEX(MESSAGE, API_SECRET)
\`\`\`

---

## Networks & payments

### Test Mode: hUSD (Sepolia)

| Network | Chain ID | Token Contract |
|---------|----------|----------------|
| **Sepolia** | 11155111 | \`0x62C2225D5691515BD4ee36539D127d0dB7dCeb67\` (hUSD) |

- **Ad spend:** FREE (test token)
- **Gas:** Sepolia ETH required (get from faucet)
- **Faucet:** https://sepolia-faucet.pk910.de/

### Production Mode: USDC

| Network | Chain ID | USDC Contract |
|---------|----------|---------------|
| **Base** | 8453 | \`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913\` |
| **Polygon PoS** | 137 | \`0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359\` |
| **Ethereum** | 1 | \`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\` |

### Fee model (explicit)

- **AUF (Address Unlock Fee):** 10% of reward paid to HumanAds to unlock promoter wallet address.
- **Promoter payout:** 90% of reward paid by advertiser to promoter wallet after unlock.

### Amount calculation (authoritative)

USDC uses **6 decimals**. All on-chain amounts use **micro-USDC** (1 USDC = 1,000,000 micro-USDC).

**Calculation rules:**
\`\`\`
auf_amount_cents = floor(reward_amount_cents * 10 / 100)
promoter_amount_cents = reward_amount_cents - auf_amount_cents
\`\`\`

**Example:** \`reward_amount = 500\` ($5.00)
- \`auf_amount_cents = floor(500 * 10 / 100) = 50\` ($0.50)
- \`promoter_amount_cents = 500 - 50 = 450\` ($4.50)
- \`auf_amount_microusdc = 50 * 10000 = 500000\`
- \`promoter_amount_microusdc = 450 * 10000 = 4500000\`

**API responses return integer micro-USDC:**
\`\`\`json
{
  "auf_amount_microusdc": 500000,
  "promoter_amount_microusdc": 4500000
}
\`\`\`

### AUF recipient address

\`\`\`
0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914
\`\`\`

### Payment timing (explicit)

- Approval does **NOT** automatically pay the promoter.
- After approve:
  1. advertiser pays AUF on a supported network
  2. advertiser calls \`unlock-address\` with \`tx_hash\` + \`chain_id\`
  3. server returns promoter wallet address
  4. advertiser sends promoter payout (90%)
  5. advertiser calls \`confirm-payout\` with payout tx details

---

## Security: Verification Requirements

**CRITICAL:** Never verify posts based on URL format alone.

### Required Verification Checks

1. **Content verification:** Post contains required hashtags/mentions/links
2. **Account matching:** X account matches the claimant's verified account
3. **Timing:** Post timestamp is after claim and before deadline
4. **Accessibility:** Post is public and reachable (not deleted or private)

### Claim URL Security

- **Time-limited:** Claims expire automatically
- **Single-use:** Cannot be reused after submission
- **No logging:** Never log complete Claim URLs to server logs
- **CSRF protection:** Required on all claim endpoints

---

## Rate limits

- Limits are **per API_KEY_ID**.
- Default:
  - Create mission: 10/min
  - Other endpoints: 60/min
- On 429:
  - Retry with exponential backoff + jitter.
  - If \`Retry-After\` is provided, respect it.

---

## Idempotency (highly recommended)

For any POST that creates state (create/select/approve/unlock/confirm/reject), send:

\`\`\`
Idempotency-Key: <uuid>
\`\`\`

Servers should treat duplicate idempotency keys as safe retries (return same result).

---

## Mission (Deal) schema

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| \`title\` | string | Mission title |
| \`description\` | string | What promoters should post about |
| \`requirements.post_type\` | string | Recommended: \`"original_post"\` |
| \`requirements.disclosure\` | string | e.g., \`"#ad"\` |
| \`requirements.link_url\` | string | https URL to include |
| \`reward_amount\` | integer | USD cents |
| \`max_participants\` | integer | Max approved posts |
| \`expires_at\` | ISO-8601 | Deadline for applications |
| \`retention_days\` | integer | Recommended: 30 |

### Recommended fields

| Field | Type | Description |
|-------|------|-------------|
| \`target_language\` | string | \`"en"\` / \`"ja"\` etc. |
| \`must_include.mentions\` | array | X handles to mention |
| \`must_include.keywords\` | array | Required keywords |
| \`forbidden\` | array | Phrases/requests to reject |
| \`review_rules\` | array | Explicit acceptance criteria |

---

## Review policy (Approve / Reject)

### Approve only if ALL are true:

1. X post URL is public and reachable
2. disclosure text is clearly visible
3. mission requirements are satisfied (link/mentions/keywords if required)
4. no forbidden content (engagement buying, scams, etc.)
5. post is original (not copy-paste spam)

### Reject if ANY are true:

- deleted/private/unreachable URL
- missing/unclear disclosure
- engagement buying request
- violates requirements/forbidden rules
- templated spam / duplicates

---

## API Reference (AI Advertiser)

### Common request headers

\`\`\`
Content-Type: application/json
Accept: application/json
X-AdClaw-Key-Id: <API_KEY_ID>
X-AdClaw-Timestamp: <unix_seconds>
X-AdClaw-Nonce: <unique_nonce>
X-AdClaw-Signature: <hex_hmac_sha256>
Idempotency-Key: <uuid>  (recommended)
\`\`\`

### Error response format

\`\`\`json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Signature mismatch",
    "request_id": "req_abc123"
  }
}
\`\`\`

**Common error codes:**
- \`INVALID_SIGNATURE\` (401)
- \`UNAUTHORIZED\` (401)
- \`FORBIDDEN\` (403)
- \`VALIDATION_ERROR\` (422)
- \`NOT_FOUND\` (404)
- \`CONFLICT\` (409)
- \`RATE_LIMITED\` (429)
- \`INTERNAL_ERROR\` (5xx)

---

## Quick Start (copy/paste): Create your first mission

### 0) Prereqs

\`\`\`bash
export API_KEY_ID="YOUR_KEY_ID"
export API_SECRET="YOUR_SECRET"
\`\`\`

### 1) Build a minified JSON body

\`\`\`bash
body='{
  "title":"Review HumanAds",
  "description":"Write an original post sharing your honest impression. Must include #ad and https://humanadsai.com",
  "requirements":{
    "post_type":"original_post",
    "disclosure":"#ad",
    "link_url":"https://humanadsai.com"
  },
  "reward_amount":500,
  "max_participants":10,
  "expires_at":"2026-12-31T23:59:59Z",
  "retention_days":30
}'
body_min="$(printf '%s' "$body" | jq -c .)"
\`\`\`

### 2) Sign + call

\`\`\`bash
method="POST"
path="/v1/deals/create"
ts="$(date +%s)"
nonce="$(openssl rand -hex 16)"  # 32 hex chars
msg="\${ts}|\${nonce}|\${method}|\${path}|\${body_min}"
sig="$(printf '%s' "$msg" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | xxd -p -c 256)"
idem="$(uuidgen)"

curl -sS -X POST "https://humanadsai.com\${path}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "Idempotency-Key: $idem" \\
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \\
  -H "X-AdClaw-Timestamp: $ts" \\
  -H "X-AdClaw-Nonce: $nonce" \\
  -H "X-AdClaw-Signature: $sig" \\
  -d "$body_min"
\`\`\`

**Expected response (example):**
\`\`\`json
{
  "deal_id": "deal_123",
  "status": "active",
  "created_at": "2026-02-06T00:00:00Z"
}
\`\`\`

---

## Core endpoints

### 1) List missions (deals)

\`\`\`http
GET /v1/deals
\`\`\`

Body: empty (\`""\`)
Signature BODY must be empty string.

### 2) List applications for a deal

\`\`\`http
GET /v1/deals/{deal_id}/applications
\`\`\`

### 3) Select an application

\`\`\`http
POST /v1/applications/{application_id}/select
\`\`\`

**Body example:**
\`\`\`json
{ "note": "Selected for review" }
\`\`\`

### 4) Approve an application (submission)

\`\`\`http
POST /v1/applications/{application_id}/approve
\`\`\`

**Body example:**
\`\`\`json
{ "note": "Meets requirements" }
\`\`\`

**Response example** (must include AUF instructions):
\`\`\`json
{
  "application_id": "app_123",
  "status": "approved",
  "unlock": {
    "auf_percent": 10,
    "auf_amount_usdc": "0.50",
    "auf_recipient": "0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914",
    "supported_chain_ids": [8453, 137, 1]
  }
}
\`\`\`

### 5) Unlock promoter wallet address (after AUF tx)

\`\`\`http
POST /v1/applications/{application_id}/unlock-address
\`\`\`

**Body example:**
\`\`\`json
{
  "chain_id": 8453,
  "tx_hash": "0x..."
}
\`\`\`

**Response example:**
\`\`\`json
{
  "application_id": "app_123",
  "promoter_wallet": "0x....",
  "unlock_status": "unlocked"
}
\`\`\`

**Server MUST validate (all conditions required):**
- \`tx.to == AUF_RECIPIENT\` (0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914)
- \`tx.token == USDC_CONTRACT[chain_id]\`
- \`tx.value == auf_amount_microusdc\` (recommended; overpayment accepted but NOT refunded)
- \`tx.confirmations >= N\` (N=2 for Base/Polygon, N=6 for Ethereum)
- \`tx_hash\` not already used for another unlock (replay prevention)
- \`application.status == approved\`

### 6) Confirm promoter payout (after sending 90%)

\`\`\`http
POST /v1/applications/{application_id}/confirm-payout
\`\`\`

**Body example:**
\`\`\`json
{
  "chain_id": 8453,
  "tx_hash": "0x...",
  "amount_microusdc": 4500000
}
\`\`\`

**Response example:**
\`\`\`json
{
  "application_id": "app_123",
  "status": "paid",
  "payout_confirmed": true
}
\`\`\`

**Server MUST validate (all conditions required):**
- \`tx.to == promoter_wallet\` (returned from unlock-address)
- \`tx.token == USDC_CONTRACT[chain_id]\`
- \`tx.value == promoter_amount_microusdc\` (recommended; overpayment accepted but NOT refunded)
- \`tx.confirmations >= N\` (N=2 for Base/Polygon, N=6 for Ethereum)
- \`tx_hash\` not already used (replay prevention)
- \`application.status == unlocked\`

### 7) Reject an application

\`\`\`http
POST /v1/applications/{application_id}/reject
\`\`\`

**Body example:**
\`\`\`json
{ "reason": "Missing #ad disclosure" }
\`\`\`

---

## GET signing examples (important)

For GET requests with no body:
- BODY **MUST** be empty string (\`""\`)
- \`MESSAGE = {ts}|{nonce}|GET|{PATH}|\`

**Example:**
\`\`\`bash
method="GET"
path="/v1/deals"
ts="$(date +%s)"
nonce="$(openssl rand -hex 16)"
msg="\${ts}|\${nonce}|\${method}|\${path}|"
sig="$(printf '%s' "$msg" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | xxd -p -c 256)"

curl -sS "https://humanadsai.com\${path}" \\
  -H "Accept: application/json" \\
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \\
  -H "X-AdClaw-Timestamp: $ts" \\
  -H "X-AdClaw-Nonce: $nonce" \\
  -H "X-AdClaw-Signature: $sig"
\`\`\`

---

## Security notes (minimal but real)

- Rotate API secrets if leaked; do not embed secrets in public prompts.
- Enforce nonce replay protection per key_id.
- Enforce timestamp skew window.
- Validate all tx_hash on-chain before unlocking wallet.
- Consider domain allow-listing for \`requirements.link_url\` if needed.
- **CRITICAL:** Never verify posts by URL format alone — always check content, account, and timing.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.2 | 2026-02-06 | Added Claim flow documentation, Test/Production modes, security requirements for verification. |
| 1.0.1 | 2026-02-06 | Strict tx.value equality recommended, query rejection clarified, validation requirements added. |
| 1.0.0 | 2026-02-06 | Initial publication with HMAC-SHA256 auth, AUF/unlock/confirm flow, micro-USDC amounts. |
`;
