# Security & Abuse Threat Model

**INTERNAL — NOT FOR PUBLIC DISTRIBUTION**

**Effective Date:** 2025-02-06
**Last Updated:** 2025-02-06

---

## 1. Authentication Threats

| Threat | Risk | Mitigation |
|--------|------|------------|
| **OAuth state tampering** | Attacker modifies OAuth state to hijack login flow | AES-GCM encrypted state cookie with PKCE code verifier. State is validated server-side on callback. |
| **Session hijacking** | Attacker steals session token to impersonate user | HttpOnly, Secure, SameSite=Lax cookies. Session tokens are hashed before storage in the database. Raw tokens never stored. |
| **API key compromise** | Leaked API key used for unauthorized access | API keys are hashed before storage (only prefix displayed to user). Keys can be revoked immediately. Per-key rate limits enforced. |
| **Replay attacks** | Attacker replays a previously valid signed request | Nonce tracking via Durable Objects with TTL. Timestamp window enforced (plus or minus 5 minutes). Used nonces are rejected. |
| **HMAC signature bypass** | Attacker crafts a valid signature without the secret | Canonical string format for signature input. Constant-time comparison to prevent timing attacks. |

## 2. Content & Mission Abuse

| Threat | Risk | Guard |
|--------|------|-------|
| **Fake submissions** | User submits non-existent or inaccessible URLs | URL validation (reachability check). Manual review of submissions before approval. |
| **Post-then-delete** | User publishes post, gets paid, then deletes it | Clawback policy in Terms of Service. Post-deletion monitoring (manual, automated monitoring planned). |
| **Copy-paste farming** | User submits identical or near-identical content across missions | Duplicate content detection across submissions. Originality review during manual approval. |
| **Engagement buying** | User purchases fake likes/retweets to inflate metrics | Explicit policy prohibition. Mission approval is not based solely on engagement metrics. Manual review of suspicious engagement patterns. |
| **AI-generated spam** | User mass-produces low-quality AI-generated posts | Originality and quality requirements in mission briefs. Human review of all submissions. Quality-based rejection at reviewer discretion. |

## 3. Financial Abuse

| Threat | Risk | Guard |
|--------|------|-------|
| **Double payment claims** | User attempts to claim payment twice for the same mission | Idempotency keys on all ledger entries. Transaction hash uniqueness constraint in database. Duplicate payment attempts are rejected. |
| **Sybil attacks** | Single person operates multiple accounts to claim multiple payouts | X handle uniqueness enforced (one account per X handle). X user ID uniqueness enforced. Manual verification for suspicious account clusters. |
| **Faucet drain** | Attacker drains test token faucet | 24-hour cooldown per wallet address. Admin-only faucet access. Treasury balance check before dispensing. All operations logged. |
| **Treasury key theft** | Attacker obtains treasury private key | Private key stored as environment variable (not in code or database). Admin-only access to key configuration. Key status monitoring (balance alerts). |

## 4. Platform Abuse

| Threat | Risk | Guard |
|--------|------|-------|
| **Rate limit bypass** | Attacker circumvents rate limits via multiple keys or IP rotation | Per-key and per-endpoint rate limiting (configurable). Anomalous request pattern detection. Key revocation for abusive keys. |
| **Nonce reuse** | Attacker reuses a nonce to replay authenticated requests | Durable Object nonce store with TTL. Each nonce is single-use. Expired nonces are automatically cleaned up. |
| **Admin impersonation** | Attacker gains access to admin functionality | Role-based access control (RBAC). Session verification on every admin action. Admin actions logged in audit trail. |
| **API enumeration** | Attacker probes API endpoints to discover structure or data | Comprehensive audit logging of all API access. Anomaly detection on request patterns. Rate limiting on authentication endpoints. |

## 5. Blockchain Risks

| Threat | Risk | Handling |
|--------|------|----------|
| **Transaction failure** | On-chain transaction fails after submission | Automatic retry (1 retry). Error returned to caller with details. Admin notified for manual follow-up if needed. |
| **Wrong recipient** | Tokens sent to incorrect wallet address | Recipient address verified against operator record before transaction submission. Address format validation. |
| **Testnet reset** | Sepolia testnet resets, wiping all balances and history | Accepted risk during test mode. No real value at stake. Contracts can be redeployed. Ledger records preserved in database. |
| **RPC endpoint unavailable** | Blockchain RPC provider experiences downtime | Error handling with informative error messages. Admin notification. Transactions can be retried when RPC recovers. |

## 6. Data Risks

| Threat | Risk | Mitigation |
|--------|------|------------|
| **PII exposure** | User personal data leaked or exposed | Minimal data collection (X handle, wallet address, email). Session tokens hashed. OAuth state encrypted (AES-GCM). No unnecessary PII stored. |
| **Wallet address linkability** | Wallet addresses linked to real-world identities | Accepted risk. Blockchain data is inherently public. Users are informed of this in the Testnet Disclosure. |
| **Audit log tampering** | Attacker modifies audit logs to cover tracks | Append-only logging design. Admin-only access to log data. Logs stored in durable database (D1). |

## 7. Recommended Improvements (Future)

The following enhancements are recommended for future implementation, prioritized by impact:

### High Priority
- **Automated URL verification via X API** — Programmatically verify that submitted post URLs exist and match requirements, reducing manual review burden.
- **Automated post-deletion monitoring** — Detect when paid posts are deleted, enabling timely clawback actions.
- **Multi-sig treasury** — Require multiple signatures for treasury transactions above a threshold, reducing single-point-of-failure risk.

### Medium Priority
- **Content similarity scoring** — Implement automated similarity detection (e.g., cosine similarity on text embeddings) to flag copy-paste farming at scale.
- **IP-based Sybil detection** — Track IP addresses (hashed) during registration and submission to identify account clusters operating from the same origin.
- **Bug bounty program** — Establish a formal program to incentivize external security researchers to report vulnerabilities responsibly.

### Lower Priority
- **Automated engagement quality scoring** — Analyze engagement patterns on submitted posts to flag likely purchased engagement.
- **Geolocation-based anomaly detection** — Flag accounts with impossible travel patterns or submissions from unusual regions.
- **Formal penetration testing** — Engage a third-party security firm for comprehensive platform security assessment before production launch.
