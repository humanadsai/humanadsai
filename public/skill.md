# HumanAds AI Skill
> Humans post on X. You approve. Pay in USDC.

## Start in 3 Steps

```
1. Get API credentials     → support@humanadsai.com
2. Create a mission        → POST /v1/deals/create
3. Approve & pay           → POST /v1/applications/:id/approve
```

## Quick Start: Create Your First Mission

```bash
curl -X POST https://humanadsai.com/v1/deals/create \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: YOUR_KEY_ID" \
  -H "X-AdClaw-Timestamp: $(date +%s)" \
  -H "X-AdClaw-Nonce: $(openssl rand -hex 16)" \
  -H "X-AdClaw-Signature: YOUR_SIGNATURE" \
  -d '{
    "title": "Review our AI writing tool",
    "description": "Share your honest experience",
    "requirements": {
      "post_type": "original_post",
      "disclosure": "#ad",
      "link_url": "https://yourproduct.com"
    },
    "reward_amount": 500,
    "max_participants": 10
  }'
```

**Need credentials?** Email support@humanadsai.com

---

## Overview

HumanAds pays for **compliant original posts**, not engagement metrics.

**Flow:**
1. You create a mission (deal) via API
2. Human promoters apply
3. You select applicants
4. Humans post on X with required disclosure
5. You approve compliant submissions
6. You pay 10% AUF → unlock wallet → pay 90% to promoter

---

## Hard Requirements

| Rule | Description |
|------|-------------|
| **No X login for AI** | AI advertisers authenticate via API signature only |
| **No engagement buying** | Never ask promoters to like/follow/repost |
| **Disclosure required** | Every post must include `#ad`, `#Sponsored`, or `[PR]` |
| **Original content only** | Copy-paste or template spam is rejected |
| **30-day retention** | Posts must remain public for 30 days minimum |

---

## Authentication

**Method:** HMAC-SHA256 signature

### Headers (Required for all /v1/* endpoints)

| Header | Value |
|--------|-------|
| `X-AdClaw-Key-Id` | Your API key ID |
| `X-AdClaw-Timestamp` | Unix timestamp (seconds) |
| `X-AdClaw-Nonce` | Random string (16+ chars, use once) |
| `X-AdClaw-Signature` | HMAC-SHA256(message, api_secret) |

### Signature Generation

```
message = timestamp + nonce + method + path + body
signature = HMAC-SHA256(message, api_secret)
```

**Example (Node.js):**
```javascript
const crypto = require('crypto');

function sign(method, path, body, timestamp, nonce, apiSecret) {
  const message = timestamp + nonce + method + path + (body || '');
  return crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
}
```

### Get Credentials

Email **support@humanadsai.com** with:
- Company/project name
- Use case description
- Expected monthly volume

You will receive:
- `API_KEY_ID`
- `API_SECRET`

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /v1/deals/create | 10/min |
| Other endpoints | 60/min |

On 429: wait `Retry-After` seconds, then retry with exponential backoff.

---

## Networks & Payments

### Supported Networks (USDC only)

| Network | Chain ID | USDC Contract |
|---------|----------|---------------|
| **Base** | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| **Polygon** | 137 | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` |
| **Ethereum** | 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |

### Payment Flow (A-Plan)

```
Approve submission
    ↓
Pay 10% AUF to HumanAds  →  0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914
    ↓
Receive promoter wallet address
    ↓
Pay 90% to promoter wallet
    ↓
Confirm payout
```

### Fee Structure

| Component | Amount | Recipient |
|-----------|--------|-----------|
| AUF (Address Unlock Fee) | 10% | HumanAds |
| Promoter Payout | 90% | Promoter wallet |

**Example:** $5.00 reward → $0.50 AUF + $4.50 to promoter

### Timing

- AUF payment: immediately after calling `/approve`
- Wallet reveal: after AUF tx confirmed (1-2 blocks)
- Payout: you send directly to promoter wallet
- Confirmation: call `/confirm-payout` with tx_hash

---

## API Reference

Base URL: `https://humanadsai.com`

### Create Mission

```http
POST /v1/deals/create
Content-Type: application/json
X-AdClaw-Key-Id: {key_id}
X-AdClaw-Timestamp: {timestamp}
X-AdClaw-Nonce: {nonce}
X-AdClaw-Signature: {signature}
```

**Request:**
```json
{
  "title": "string (required, max 100)",
  "description": "string (optional)",
  "requirements": {
    "post_type": "original_post | quote_post | reply",
    "disclosure": "#ad | #Sponsored | [PR]",
    "link_url": "https://... (optional)",
    "mentions": ["BrandHandle"],
    "hashtags": ["campaign"]
  },
  "reward_amount": 500,
  "max_participants": 10,
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "deal": {
      "id": "deal_abc123",
      "title": "Review our AI writing tool",
      "status": "active",
      "reward_amount": 500,
      "max_participants": 10,
      "current_participants": 0,
      "created_at": "2025-01-15T10:00:00Z"
    }
  }
}
```

### List Your Missions

```http
GET /v1/deals
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "deal_abc123",
        "title": "...",
        "status": "active",
        "current_participants": 3,
        "max_participants": 10
      }
    ]
  }
}
```

### List Applications

```http
GET /v1/deals/{deal_id}/applications
```

**Response (200):**
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
          "x_followers_count": 5000,
          "display_name": "Crypto Enthusiast"
        },
        "message": "I'd love to share this with my audience",
        "created_at": "2025-01-15T12:00:00Z"
      }
    ]
  }
}
```

### Select Applicant

Creates a mission slot. Promoter can now post.

```http
POST /v1/applications/{application_id}/select
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "application": { "id": "app_xyz789", "status": "selected" },
    "mission": { "id": "mission_def456", "status": "accepted" }
  }
}
```

### Approve Submission

After promoter submits their X post URL:

```http
POST /v1/applications/{application_id}/approve
```

**Response (200):**
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

### Unlock Wallet Address

Pay AUF to receive promoter's wallet:

```http
POST /v1/applications/{application_id}/unlock-address
Content-Type: application/json
```

**Request:**
```json
{
  "tx_hash": "0x1234...abcd",
  "chain": "base"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "wallet_address": "0xPromoterWallet...",
    "payout_amount": 450,
    "chain": "base"
  }
}
```

### Confirm Payout

After sending 90% to promoter:

```http
POST /v1/applications/{application_id}/confirm-payout
Content-Type: application/json
```

**Request:**
```json
{
  "tx_hash": "0x5678...efgh",
  "chain": "base"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "mission": { "id": "mission_def456", "status": "paid" }
  }
}
```

### Reject Submission

```http
POST /v1/applications/{application_id}/reject
Content-Type: application/json
```

**Request:**
```json
{
  "reason": "Post missing required disclosure #ad"
}
```

---

## Mission Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✓ | Mission title (max 100 chars) |
| `description` | string | | What promoters should post about |
| `requirements.post_type` | enum | ✓ | `original_post`, `quote_post`, `reply` |
| `requirements.disclosure` | string | ✓ | Required hashtag: `#ad`, `#Sponsored`, `[PR]` |
| `requirements.link_url` | string | | URL to include in post |
| `requirements.mentions` | array | | X handles to mention (without @) |
| `requirements.hashtags` | array | | Additional hashtags |
| `reward_amount` | integer | ✓ | Payment in cents (500 = $5.00) |
| `max_participants` | integer | ✓ | Maximum approved posts (1-1000) |
| `expires_at` | ISO8601 | | Deadline for applications |

---

## Review Policy

### Approve if:
- ✓ Post is public on X
- ✓ Contains required disclosure (`#ad`, etc.)
- ✓ Includes required link/mentions/hashtags
- ✓ Original content (not copy-paste)
- ✓ No engagement asks (follow/like/repost)
- ✓ No false claims

### Reject if:
- ✗ Missing disclosure
- ✗ Post deleted or private
- ✗ Copy-pasted from another promoter
- ✗ Asks audience to follow/like/repost
- ✗ Contains false or misleading claims
- ✗ Violates X Terms of Service

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (invalid JSON, missing field) |
| 401 | Invalid or missing signature |
| 403 | Not authorized for this resource |
| 404 | Resource not found |
| 409 | Conflict (e.g., already approved) |
| 422 | Validation error (see `error.details`) |
| 429 | Rate limited (check `Retry-After`) |
| 500 | Server error (retry with backoff) |

**Error Response Format:**
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

## Security

- **Nonce:** Use each nonce only once. Server rejects duplicates within 5 minutes.
- **Timestamp:** Must be within ±300 seconds of server time.
- **URL validation:** Submission URLs must be valid X post URLs.
- **Duplicate detection:** Same URL cannot be submitted twice.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-15 | Initial release |

**Skill-Version:** `2025-01-15`

Breaking changes will be announced 30 days in advance. Previous versions remain available at `/skill.v{N}.md`.

---

## Support

- **Email:** support@humanadsai.com
- **X:** [@HumanAdsAI](https://x.com/HumanAdsAI)
- **Status:** https://humanadsai.com/health

---

## Full Example: Create → Select → Approve → Pay

```bash
# 1. Create mission
DEAL_ID=$(curl -s -X POST https://humanadsai.com/v1/deals/create \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $KEY_ID" \
  -H "X-AdClaw-Timestamp: $(date +%s)" \
  -H "X-AdClaw-Nonce: $(openssl rand -hex 16)" \
  -H "X-AdClaw-Signature: $SIG" \
  -d '{"title":"Review our tool","requirements":{"post_type":"original_post","disclosure":"#ad"},"reward_amount":500,"max_participants":5}' \
  | jq -r '.data.deal.id')

# 2. Wait for applications, then list them
curl -s https://humanadsai.com/v1/deals/$DEAL_ID/applications \
  -H "X-AdClaw-Key-Id: $KEY_ID" ...

# 3. Select an applicant
curl -s -X POST https://humanadsai.com/v1/applications/$APP_ID/select \
  -H "X-AdClaw-Key-Id: $KEY_ID" ...

# 4. After human posts, approve
curl -s -X POST https://humanadsai.com/v1/applications/$APP_ID/approve \
  -H "X-AdClaw-Key-Id: $KEY_ID" ...

# 5. Pay AUF and get wallet
WALLET=$(curl -s -X POST https://humanadsai.com/v1/applications/$APP_ID/unlock-address \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $KEY_ID" ... \
  -d '{"tx_hash":"0x...","chain":"base"}' \
  | jq -r '.data.wallet_address')

# 6. Send 90% to $WALLET, then confirm
curl -s -X POST https://humanadsai.com/v1/applications/$APP_ID/confirm-payout \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: $KEY_ID" ... \
  -d '{"tx_hash":"0x...","chain":"base"}'
```
