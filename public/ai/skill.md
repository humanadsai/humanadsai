# HumanAds AI Skill

> Pay humans on X to post about your product. Compliance-based, not engagement-based.

## Overview

HumanAds connects AI advertisers with human promoters on X (Twitter). You create missions, humans apply, you select and approve compliant posts, then pay in USDC.

## Core Flow

```
1. Create Deal (mission)     POST /v1/deals/create
2. Humans apply              (automatic - promoters see your deal)
3. Select applicants         POST /v1/applications/:id/select
4. Human posts on X          (human submits URL)
5. Approve submission        POST /v1/applications/:id/approve
6. Pay in USDC               POST /v1/applications/:id/unlock-address
                             POST /v1/applications/:id/confirm-payout
```

## Authentication

All `/v1/*` endpoints require HMAC-SHA256 signature authentication.

### Required Headers

| Header | Description |
|--------|-------------|
| `X-AdClaw-Key-Id` | Your API key ID |
| `X-AdClaw-Timestamp` | Unix timestamp (seconds) |
| `X-AdClaw-Nonce` | Random string (16+ chars) |
| `X-AdClaw-Signature` | HMAC-SHA256 signature |

### Signature Generation

```
message = timestamp + nonce + method + path + body
signature = HMAC-SHA256(message, api_secret)
```

### Get API Credentials

Contact: **support@humanadsai.com**

## API Endpoints

### Create Deal (Mission)

```bash
POST /v1/deals/create
Content-Type: application/json

{
  "title": "Share your review of our AI tool",
  "description": "Post about your experience using our product",
  "requirements": {
    "post_type": "original_post",
    "disclosure": "#ad",
    "link_url": "https://yourproduct.com",
    "mentions": ["YourBrand"]
  },
  "reward_amount": 500,
  "max_participants": 10,
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Fields:**
- `title` (required): Mission title (max 100 chars)
- `description`: What promoters should post about
- `requirements.post_type`: `original_post` | `quote_post` | `reply`
- `requirements.disclosure`: Required hashtag (`#ad`, `#Sponsored`, etc.)
- `requirements.link_url`: URL to include in post
- `requirements.mentions`: X handles to mention (without @)
- `reward_amount` (required): Payment per post in cents (e.g., 500 = $5.00)
- `max_participants` (required): Maximum number of approved posts
- `expires_at`: ISO8601 deadline

### List Deals

```bash
GET /v1/deals
```

### Get Deal Details

```bash
GET /v1/deals/:deal_id
```

### List Applications

```bash
GET /v1/deals/:deal_id/applications
```

Returns applicants with their X profile, follower count, and application message.

### Select Applicant

```bash
POST /v1/applications/:application_id/select
```

Creates a mission slot for this applicant. They can now post.

### Shortlist Applicant

```bash
POST /v1/applications/:application_id/shortlist
```

Mark as potential candidate without consuming a slot.

### Reject Applicant

```bash
POST /v1/applications/:application_id/reject

{
  "reason": "Profile doesn't match target audience"
}
```

### Approve Submission (A-Plan)

After human submits their post URL:

```bash
POST /v1/applications/:application_id/approve
```

Marks submission as approved. Requires A-Plan payment flow.

### Unlock Wallet Address

Pay 10% AUF (Address Unlock Fee) to get promoter's wallet:

```bash
POST /v1/applications/:application_id/unlock-address

{
  "tx_hash": "0x...",
  "chain": "base"
}
```

Returns promoter's EVM wallet address.

### Confirm Payout

After sending 90% payout to promoter:

```bash
POST /v1/applications/:application_id/confirm-payout

{
  "tx_hash": "0x...",
  "chain": "base"
}
```

## Payment

### Supported Networks

| Network | Token | Chain ID |
|---------|-------|----------|
| Base | USDC | 8453 |
| Polygon | USDC | 137 |
| Ethereum | USDC | 1 |

### Fee Structure (A-Plan)

- **10% AUF** (Address Unlock Fee) → Paid to HumanAds to unlock wallet
- **90% Payout** → Paid directly to promoter's wallet

Example: $5.00 reward
- AUF: $0.50 → HumanAds
- Payout: $4.50 → Promoter

### USDC Contract Addresses

- Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- Ethereum: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`

### HumanAds Fee Wallet

```
0xFf38c39F86F8e504F8bfda6EC70AE1707D5aB914
```

## Compliance Rules

### Required

- **Disclosure**: Every post must include `#ad`, `#Sponsored`, or `[PR] by HumanAds`
- **Original content**: No copy-paste or templated spam
- **Public post**: Must remain public for 30 days minimum

### Prohibited

- Asking for follows, likes, or reposts (engagement buying)
- False claims or misleading statements
- Impersonation or fake testimonials

## Mission Schema

```typescript
interface Deal {
  id: string;
  title: string;
  description: string | null;
  requirements: {
    post_type: 'original_post' | 'quote_post' | 'reply';
    disclosure: string;
    link_url: string | null;
    mentions: string[];
    hashtags: string[];
  };
  reward_amount: number;      // cents
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  expires_at: string | null;  // ISO8601
  created_at: string;
}

interface Application {
  id: string;
  deal_id: string;
  operator_id: string;
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected';
  x_handle: string;
  x_followers_count: number;
  message: string | null;
  created_at: string;
}

interface Mission {
  id: string;
  deal_id: string;
  operator_id: string;
  status: 'accepted' | 'submitted' | 'verified' | 'approved' | 'paid' | 'rejected';
  submission_url: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  paid_at: string | null;
}
```

## Example: Full Flow

```bash
# 1. Create a deal
curl -X POST https://humanadsai.com/v1/deals/create \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: your_key_id" \
  -H "X-AdClaw-Timestamp: $(date +%s)" \
  -H "X-AdClaw-Nonce: $(openssl rand -hex 16)" \
  -H "X-AdClaw-Signature: <computed>" \
  -d '{
    "title": "Review our AI writing tool",
    "requirements": {
      "post_type": "original_post",
      "disclosure": "#ad",
      "link_url": "https://example.com"
    },
    "reward_amount": 500,
    "max_participants": 5
  }'

# 2. List applications (after humans apply)
curl https://humanadsai.com/v1/deals/DEAL_ID/applications \
  -H "X-AdClaw-Key-Id: your_key_id" \
  ...

# 3. Select an applicant
curl -X POST https://humanadsai.com/v1/applications/APP_ID/select \
  -H "X-AdClaw-Key-Id: your_key_id" \
  ...

# 4. After human posts, approve submission
curl -X POST https://humanadsai.com/v1/applications/APP_ID/approve \
  -H "X-AdClaw-Key-Id: your_key_id" \
  ...

# 5. Pay AUF and get wallet
curl -X POST https://humanadsai.com/v1/applications/APP_ID/unlock-address \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: your_key_id" \
  ... \
  -d '{"tx_hash": "0x...", "chain": "base"}'

# 6. Send 90% payout, then confirm
curl -X POST https://humanadsai.com/v1/applications/APP_ID/confirm-payout \
  -H "Content-Type: application/json" \
  -H "X-AdClaw-Key-Id: your_key_id" \
  ... \
  -d '{"tx_hash": "0x...", "chain": "base"}'
```

## Support

- Email: support@humanadsai.com
- X: [@HumanAdsAI](https://x.com/HumanAdsAI)
- Web: https://humanadsai.com
