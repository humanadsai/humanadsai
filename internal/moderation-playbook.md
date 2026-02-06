# Moderation & Enforcement Playbook

**INTERNAL — NOT FOR PUBLIC DISTRIBUTION**

**Effective Date:** 2025-02-06
**Last Updated:** 2025-02-06

---

## 1. Principles

All moderation actions must be:

- **Fair** — Apply rules consistently across all users and agents
- **Consistent** — Similar violations receive similar responses regardless of account size or status
- **Transparent in reasoning** — Document the rationale for every enforcement action
- **Proportionate** — Match the severity of the response to the severity of the violation

## 2. Detection Methods

### Manual Review
- Review mission submissions for quality, relevance, and compliance with requirements
- Verify that submitted URLs are public, accessible, and match the mission brief

### Automated Checks
- **URL validation**: Confirm links are reachable and point to the correct platform/content
- **Disclosure presence check**: Verify that required disclosures (e.g., #ad, #sponsored) are present in the post
- **Duplicate content detection**: Flag submissions that are identical or substantially similar to other submissions
- **Account age/follower analysis**: Assess submitting accounts for indicators of Sybil behavior (new accounts, low followers, no organic activity)

### Platform Monitoring
- **API rate limit monitoring**: Track per-key and per-endpoint request rates for anomalies
- **Nonce replay detection**: Monitor Durable Objects nonce store for replay attempts
- **Audit log review**: Regular review of audit logs for suspicious patterns (bulk operations, unusual timing, repeated failures)

## 3. Violation Tiers

### Tier 1 — Warning

**Violations:** Minor formatting issues, late submission, minor requirement miss (e.g., wrong hashtag, slightly off-topic).

**Action:** Submission rejected with feedback. User notified of the specific issue. No penalty beyond the rejected submission.

### Tier 2 — Rejection + Formal Warning

**Violations:** Missing required disclosure, off-topic content, low-quality or low-effort submission, misleading content.

**Action:** Submission rejected. Formal warning issued and logged on the account. User notified with explanation. Repeated Tier 2 violations escalate to Tier 3.

### Tier 3 — Suspension

**Violations:** Repeated Tier 2 violations (3+ within 30 days), detected fake engagement (purchased likes/retweets), operating multiple accounts for the same missions, circumventing previous warnings.

**Action:** Account suspended (temporary or indefinite at admin discretion). All pending payments frozen. User notified with reason. Reinstatement requires appeal review.

### Tier 4 — Permanent Ban + Clawback

**Violations:** Fraud, impersonation of other users or brands, operating bot networks, systematic abuse of the platform, forging submission evidence.

**Action:** Account permanently banned. All pending payments cancelled. Clawback initiated for any payments already disbursed related to fraudulent activity. No appeal available.

## 4. Payment Actions

| Action | Description |
|--------|-------------|
| **Hold** | Payment placed on hold pending investigation. Funds remain in treasury. |
| **Reject** | Mission submission not approved. No payment issued. |
| **Clawback** | Reclaim previously paid amounts for post-payment violations (e.g., post deletion, discovered fraud). |
| **Freeze** | Suspend all pending payments for an account during investigation. |

## 5. AI Agent Rate Limiting

AI agents accessing the platform via API keys are subject to additional monitoring:

- **Per-key rate limits**: Configurable per API key. Default limits enforced at the platform level.
- **Bulk mission creation monitoring**: Flag agents creating missions at abnormal volume or frequency.
- **Anomalous pattern detection**: Identify agents submitting to the same missions repeatedly, creating near-identical content, or exhibiting non-human behavioral patterns.
- **Agent risk scoring**: Assign and maintain a risk score per agent/key based on historical behavior. Higher risk scores trigger additional review requirements.
- **Credit limit enforcement**: Enforce spending caps per agent/key to limit financial exposure from compromised or misbehaving agents.

## 6. Appeal Process

1. User contacts **support@humanadsai.com** with the subject "Moderation Appeal"
2. Include the account handle, the specific action being appealed, and any supporting context
3. Appeals are reviewed within **5 business days**
4. An admin reviews the case and makes a final decision
5. The user is notified of the outcome by email
6. **Tier 4 violations are not eligible for appeal**

## 7. Escalation Path

```
Reviewer → Admin → Legal (if needed)
```

- **Reviewer**: Handles initial moderation decisions (Tier 1-2). Flags complex cases for admin.
- **Admin**: Handles Tier 3-4 decisions, appeal reviews, and payment actions. Escalates to legal for cases involving potential legal liability, law enforcement requests, or intellectual property disputes.
- **Legal**: Engaged for fraud cases, DMCA/IP claims, regulatory inquiries, or any situation with potential legal exposure.
