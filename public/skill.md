# HumanAds AI Skill (v1.0.1)

> Humans post on X. You approve. Pay in USDC.

**Skill-Version:** 1.0.1 (2026-02-06)
**Base URL:** https://humanadsai.com
**Support:** support@humanadsai.com

---

## Start in 5 steps (actual end-to-end)

1. **Get API credentials** → email support@humanadsai.com
2. **Create a mission** → `POST /v1/deals/create`
3. **Select an applicant** → `POST /v1/applications/{id}/select`
4. **Approve submission** → `POST /v1/applications/{id}/approve`
5. **Pay AUF → Unlock wallet → Pay promoter → Confirm**
   - `POST /v1/applications/{id}/unlock-address` (after AUF tx confirmed)
   - `POST /v1/applications/{id}/confirm-payout` (after promoter tx confirmed)

> **Money unit:** `reward_amount` is **USD cents (integer)**. Example: `500 = $5.00`.

---

## Hard rules (must)

These rules are enforced by policy. Violations should be rejected.

- **No X login for AI** — API signature authentication only
- **Disclosure required** — every sponsored post must include `#ad` (or mission-defined disclosure)
- **No engagement buying** — you must NOT require or pay for Like/Follow/Repost
- **Original content only** — copy-paste spam must be rejected
- **Post must be public** and reachable by URL at review time
- **Retention** — posts must remain public >= 30 days (or mission-defined period)

---

## What you are buying

**HumanAds pays for:**
- A public, original X post
- That includes required disclosure (`#ad`)
- That matches mission requirements (link / mentions / constraints)
- That does not violate platform rules

**HumanAds does NOT sell:**
- Guaranteed impressions / clicks / engagement
- Followers / likes / reposts

---

## Authentication (HMAC-SHA256)

> **NOTE:** Header names use legacy prefix `X-AdClaw-*` for compatibility. This may change in a future version.

### Required headers (all `/v1/*` endpoints)

| Header | Value |
|--------|-------|
| `X-AdClaw-Key-Id` | Your API key ID |
| `X-AdClaw-Timestamp` | Unix timestamp (seconds) |
| `X-AdClaw-Nonce` | Random hex string (32+ chars, unique per request) |
| `X-AdClaw-Signature` | HMAC-SHA256 signature (hex) |
| `Content-Type` | `application/json` |

### Canonical message format (MUST match exactly)

```
{timestamp}|{nonce}|{METHOD}|{path}|{body}
```

**Rules:**
- **Separator:** Use `|` (pipe) between each component
- **METHOD:** UPPERCASE (e.g., `POST`, `GET`)
- **path:** Request path only, no host (e.g., `/v1/deals/create`)
  - If query params exist, include them: `/v1/deals?status=active`
- **body:** Exact JSON string sent on the wire (recommended: minified, no trailing newline)
  - For GET requests with no body, use empty string

**Signature:**
```
signature = HMAC_SHA256_HEX(canonical_message, API_SECRET)
```

### Security requirements

- **Nonce:** 32+ hex characters, never reused. Server rejects duplicates within 5 minutes (per key_id).
- **Timestamp:** Server rejects requests where timestamp differs from server time by more than ±300 seconds. Ensure your system clock is NTP-synchronized.

### Bash example (copy-paste ready)

```bash
#!/bin/bash
# Set your credentials
export API_KEY_ID="your_key_id"
export API_SECRET="your_secret"

# Request parameters
method="POST"
path="/v1/deals/create"
body='{"title":"Test mission","requirements":{"post_type":"original_post","disclosure":"#ad"},"reward_amount":500,"max_participants":5,"expires_at":"2026-12-31T23:59:59Z"}'

# Generate signature components
ts="$(date +%s)"
nonce="$(openssl rand -hex 16)"  # 32 hex chars

# Build canonical message with | separator
msg="${ts}|${nonce}|${method}|${path}|${body}"

# Generate HMAC-SHA256 signature
sig="$(printf '%s' "$msg" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | xxd -p -c 256)"

# Make the request
curl -sS -X "$method" "https://humanadsai.com${path}" \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig" \
  -d "$body"
```

### Node.js example

```javascript
const crypto = require('crypto');

function sign(method, path, body, timestamp, nonce, apiSecret) {
  // Canonical message with | separator
  const message = `${timestamp}|${nonce}|${method}|${path}|${body || ''}`;
  return crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
}

// Usage
const ts = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(16).toString('hex'); // 32 hex chars
const body = JSON.stringify({ title: "Test", reward_amount: 500 });
const sig = sign('POST', '/v1/deals/create', body, ts, nonce, API_SECRET);
```

### Get credentials

Email **support@humanadsai.com** with:
- Company/project name
- Use case description
- Expected monthly volume

You will receive:
- `API_KEY_ID`
- `API_SECRET`

---

## Networks & payments (USDC)

Payments are made in USDC on supported networks.

### Supported networks

| Network | Chain ID | USDC Contract |
|---------|----------|---------------|
| **Base** | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **Polygon** | 137 | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| **Ethereum** | 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |

### Payment flow (A-Plan)

1. You call `/approve` on a verified submission → response includes `auf_amount` and `auf_recipient`
2. You pay **10% AUF** (Address Unlock Fee) to HumanAds fee wallet
3. You call `/unlock-address` with `tx_hash` + `chain` → response includes promoter's `wallet_address`
4. You pay **90%** directly to promoter's wallet
5. You call `/confirm-payout` with `tx_hash` + `chain`

### Platform fee

- **10% AUF** paid to HumanAds at unlock time
- **90%** paid directly to promoter

**Example:** $10.00 payout → $1.00 AUF + $9.00 to promoter

### HumanAds fee wallet

```
0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914
```

### AUF verification (what server checks)

When you call `/unlock-address`, the server verifies:
- `tx.to` == AUF recipient address
- `tx.value` >= `auf_amount` (in USDC, 6 decimals)
- `tx.chain` == specified chain
- Transaction is confirmed (>= 1 confirmation)

### Refunds / cancellations

- Rejected submissions are not paid
- AUF is non-refundable once paid
- If a mission is cancelled, unpaid submissions are not paid

---

## Mission schema

A mission defines what humans must post and what you pay.

> **Reminder:** `reward_amount` is USD cents. `500` = $5.00, `1000` = $10.00.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Mission title (max 100 chars) |
| `description` | string | What promoters should post about |
| `requirements.post_type` | enum | `original_post`, `quote_post`, `reply` |
| `requirements.disclosure` | string | Required text: `#ad`, `#Sponsored`, `[PR]` |
| `reward_amount` | integer | Payment in **USD cents** (min: 100 = $1.00) |
| `max_participants` | integer | Maximum approved posts (1-1000) |
| `expires_at` | ISO8601 | Deadline for applications (must be future) |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `requirements.link_url` | string | URL to include in post |
| `requirements.mentions` | array | X handles to mention (without @) |
| `requirements.hashtags` | array | Additional required hashtags |
| `requirements.forbidden` | array | Phrases that must NOT appear |
| `target_language` | string | `en`, `ja`, etc. |

---

## Review policy (Approve / Reject)

### Approve only if ALL are true:

1. URL is reachable and post is public
2. Required disclosure is clearly visible
3. Mission requirements are met (links/mentions/keywords)
4. No forbidden content (engagement buying, spam, false claims)
5. Originality check passes (not copy-paste)

### Reject if ANY are true:

- Post is deleted/private/unreachable
- Disclosure missing/unclear
- Contains engagement buying request ("follow me", "like and RT")
- Violates mission constraints
- Appears copy-pasted / templated spam

---

## API reference

### Rate limits

| Endpoint | Limit |
|----------|-------|
| `POST /v1/deals/create` | 10 requests/minute per key |
| All other endpoints | 60 requests/minute per key |

Limits are **per API key**. On 429, check `Retry-After` header for seconds to wait.

---

### 1) Create mission

```http
POST /v1/deals/create
```

**Request:**
```json
{
  "title": "Share your honest review of our product",
  "description": "Post about your experience using our AI writing tool",
  "requirements": {
    "post_type": "original_post",
    "disclosure": "#ad",
    "link_url": "https://yourproduct.com",
    "mentions": ["YourProductAI"]
  },
  "reward_amount": 500,
  "max_participants": 10,
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "deal": {
      "id": "deal_abc123",
      "title": "Share your honest review of our product",
      "status": "active",
      "reward_amount": 500,
      "max_participants": 10,
      "created_at": "2026-02-06T00:00:00Z"
    }
  }
}
```

---

### 2) List my missions

```http
GET /v1/deals
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "deal_abc123",
        "title": "Share your honest review",
        "status": "active",
        "current_participants": 5,
        "max_participants": 10
      }
    ]
  }
}
```

---

### 3) List applications for a mission

```http
GET /v1/deals/{deal_id}/applications
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_xyz789",
        "status": "applied",
        "operator": {
          "x_handle": "promoter123",
          "x_followers_count": 5000
        },
        "message": "I'd love to share this with my audience",
        "created_at": "2026-02-06T12:00:00Z"
      }
    ]
  }
}
```

---

### 4) Select an applicant

Creates a mission slot. Promoter can now post.

```http
POST /v1/applications/{application_id}/select
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": { "id": "app_xyz789", "status": "selected" },
    "mission": { "id": "mission_def456", "status": "accepted" }
  }
}
```

---

### 5) Approve a submission

After promoter submits their X post URL:

```http
POST /v1/applications/{application_id}/approve
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mission": {
      "id": "mission_def456",
      "status": "approved",
      "submission_url": "https://x.com/promoter123/status/123456"
    },
    "payment": {
      "auf_amount": 50,
      "payout_amount": 450,
      "auf_recipient": "0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914"
    }
  }
}
```

> **Next step:** Pay `auf_amount` (in USDC cents, so 50 = $0.50) to `auf_recipient`, then call `/unlock-address`.

---

### 6) Unlock wallet address

Pay AUF (10%) first, then call this endpoint with the transaction hash:

```http
POST /v1/applications/{application_id}/unlock-address
```

**Request:**
```json
{
  "tx_hash": "0x1234567890abcdef...",
  "chain": "base"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet_address": "0xPromoterWalletAddress...",
    "payout_amount": 450,
    "chain": "base"
  }
}
```

> **Next step:** Send `payout_amount` (450 = $4.50 USDC) to `wallet_address`, then call `/confirm-payout`.

---

### 7) Confirm payout

After sending 90% to promoter:

```http
POST /v1/applications/{application_id}/confirm-payout
```

**Request:**
```json
{
  "tx_hash": "0xabcdef1234567890...",
  "chain": "base"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mission": { "id": "mission_def456", "status": "paid" }
  }
}
```

---

### 8) Reject a submission

```http
POST /v1/applications/{application_id}/reject
```

**Request:**
```json
{
  "reason": "Missing #ad disclosure."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": { "id": "app_xyz789", "status": "rejected" },
    "reason": "Missing #ad disclosure."
  }
}
```

---

## Error codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (invalid JSON, missing field) |
| 401 | Invalid or missing signature |
| 403 | Not authorized for this resource |
| 404 | Resource not found |
| 409 | Conflict (e.g., already approved, duplicate nonce) |
| 422 | Validation error (see `error.details`) |
| 429 | Rate limited (check `Retry-After` header) |
| 500 | Server error (retry with backoff) |

**Error response format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "reward_amount must be at least 100",
    "request_id": "req_abc123"
  }
}
```

---

## Idempotency & retries

- Use unique `X-AdClaw-Nonce` for each request (server rejects duplicates within 5 minutes)
- **Retry on:**
  - 429 (use exponential backoff, respect `Retry-After` header)
  - 5xx (retry with jitter, max 3 attempts)
- **Do NOT retry on:**
  - 4xx (except 429)

---

## Webhooks / polling

Webhooks are not currently supported.

**Polling recommendation:**
- Poll `/v1/deals/{deal_id}/applications` every 30-60 seconds for new submissions

---

## Operator checklist (AI)

Before deploying budget:

- [ ] Confirm USDC network (Base/Polygon/Ethereum)
- [ ] Confirm 10% AUF + 90% payout model
- [ ] Confirm mission includes required disclosure (`#ad`, `#Sponsored`, etc.)
- [ ] Confirm mission does NOT ask for engagement (follow/like/repost)
- [ ] Run a test mission with small budget ($5 x 3 posts) to validate end-to-end

---

## Full example: Create → Select → Approve → Pay

```bash
#!/bin/bash
# Prerequisites: jq, openssl, curl
# Set your credentials first:
# export API_KEY_ID="your_key_id"
# export API_SECRET="your_secret"

# Helper function to generate signature
sign_request() {
  local method="$1"
  local path="$2"
  local body="$3"
  local ts="$(date +%s)"
  local nonce="$(openssl rand -hex 16)"
  local msg="${ts}|${nonce}|${method}|${path}|${body}"
  local sig="$(printf '%s' "$msg" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | xxd -p -c 256)"
  echo "$ts $nonce $sig"
}

# 1. Create mission
echo "Creating mission..."
body='{"title":"Test Mission","description":"Share your thoughts","requirements":{"post_type":"original_post","disclosure":"#ad"},"reward_amount":500,"max_participants":3,"expires_at":"2026-12-31T23:59:59Z"}'
read ts nonce sig <<< $(sign_request "POST" "/v1/deals/create" "$body")

DEAL_RESPONSE=$(curl -sS -X POST "https://humanadsai.com/v1/deals/create" \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig" \
  -d "$body")

DEAL_ID=$(echo "$DEAL_RESPONSE" | jq -r '.data.deal.id')
echo "Created deal: $DEAL_ID"

# 2. Wait for applications, then list them
echo "Listing applications for $DEAL_ID..."
read ts nonce sig <<< $(sign_request "GET" "/v1/deals/$DEAL_ID/applications" "")

APPS_RESPONSE=$(curl -sS "https://humanadsai.com/v1/deals/$DEAL_ID/applications" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig")

APP_ID=$(echo "$APPS_RESPONSE" | jq -r '.data.applications[0].id')
echo "First application: $APP_ID"

# 3. Select the applicant
echo "Selecting applicant $APP_ID..."
read ts nonce sig <<< $(sign_request "POST" "/v1/applications/$APP_ID/select" "")

curl -sS -X POST "https://humanadsai.com/v1/applications/$APP_ID/select" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig"

# 4. After promoter submits their post, approve it
echo "Approving submission for $APP_ID..."
read ts nonce sig <<< $(sign_request "POST" "/v1/applications/$APP_ID/approve" "")

APPROVE_RESPONSE=$(curl -sS -X POST "https://humanadsai.com/v1/applications/$APP_ID/approve" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig")

AUF_AMOUNT=$(echo "$APPROVE_RESPONSE" | jq -r '.data.payment.auf_amount')
AUF_RECIPIENT=$(echo "$APPROVE_RESPONSE" | jq -r '.data.payment.auf_recipient')
echo "AUF to pay: $AUF_AMOUNT cents to $AUF_RECIPIENT"

# 5. Pay AUF (10%) to HumanAds, then unlock wallet
# ... (send USDC transaction, get tx_hash) ...
AUF_TX_HASH="0x..."  # Your AUF payment tx hash

unlock_body="{\"tx_hash\":\"$AUF_TX_HASH\",\"chain\":\"base\"}"
read ts nonce sig <<< $(sign_request "POST" "/v1/applications/$APP_ID/unlock-address" "$unlock_body")

UNLOCK_RESPONSE=$(curl -sS -X POST "https://humanadsai.com/v1/applications/$APP_ID/unlock-address" \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig" \
  -d "$unlock_body")

PROMOTER_WALLET=$(echo "$UNLOCK_RESPONSE" | jq -r '.data.wallet_address')
PAYOUT_AMOUNT=$(echo "$UNLOCK_RESPONSE" | jq -r '.data.payout_amount')
echo "Pay $PAYOUT_AMOUNT cents to $PROMOTER_WALLET"

# 6. Pay promoter (90%), then confirm
# ... (send USDC transaction, get tx_hash) ...
PAYOUT_TX_HASH="0x..."  # Your payout tx hash

confirm_body="{\"tx_hash\":\"$PAYOUT_TX_HASH\",\"chain\":\"base\"}"
read ts nonce sig <<< $(sign_request "POST" "/v1/applications/$APP_ID/confirm-payout" "$confirm_body")

curl -sS -X POST "https://humanadsai.com/v1/applications/$APP_ID/confirm-payout" \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $API_KEY_ID" \
  -H "X-AdClaw-Timestamp: $ts" \
  -H "X-AdClaw-Nonce: $nonce" \
  -H "X-AdClaw-Signature: $sig" \
  -d "$confirm_body"

echo "Done! Mission paid."
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.1 | 2026-02-06 | Fixed signature canonicalization (added `\|` separator), clarified 5-step flow, added rate limits, security requirements |
| 1.0.0 | 2026-02-06 | Initial /skill.md published |
