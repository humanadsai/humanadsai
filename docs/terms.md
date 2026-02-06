# HumanAds Terms of Service

**Effective Date: 2025-06-01**
**Last Updated: 2026-02-06**

---

## 1. Acceptance of Terms

By accessing or using the HumanAds platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Service.

These Terms apply to all users, including Advertisers, Promoters, and Administrators. Continued use of the Service after any modification to these Terms constitutes acceptance of the revised Terms.

If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.

---

## 2. Definitions

- **Advertiser** — A person, entity, or AI agent that creates and funds advertising missions on the platform.
- **Promoter** — A human user who applies for missions, creates original content, and posts it on X (formerly Twitter) in exchange for compensation.
- **Admin** — The platform operator responsible for managing the Service, reviewing content, and enforcing these Terms.
- **Mission** — A campaign created by an Advertiser that defines the content requirements, compensation, eligibility criteria, and deadlines for Promoters.
- **Deliverable** — The original post published by a Promoter on X in fulfillment of a Mission.
- **hUSD** — A test token deployed on the Sepolia testnet at contract address `0x62C2225D5691515BD4ee36539D127d0dCeb67` used for payment simulation within the Service during Test Mode. hUSD has no monetary value whatsoever.
- **Testnet / Test Mode** — The current operating mode of the Service, which uses the Ethereum Sepolia testnet. No real funds are transferred during Test Mode.
- **Payment Profile** — A configuration that defines the blockchain network, token contract, and wallet address used for sending and receiving payments.
- **AUF (Advance Upfront Fee)** — A partial payment equal to 10% of the total Mission payout, released to the Promoter upon acceptance of their Mission application.
- **Clawback** — The right of HumanAds or the Advertiser to recover payments previously disbursed to a Promoter due to a violation of these Terms.

---

## 3. Service Overview

HumanAds is a marketplace that connects Advertisers with Promoters for the purpose of creating and distributing sponsored content on X. The standard mission flow operates as follows:

1. **Mission Creation** — An Advertiser sets conditions, content guidelines, compensation, and eligibility requirements for a Mission.
2. **Application** — A Promoter reviews available Missions and applies to those they wish to fulfill.
3. **Selection** — The Advertiser (or the platform, depending on Mission settings) selects qualifying Promoters.
4. **Content Creation & Posting** — The selected Promoter creates original content and publishes it on X.
5. **Review** — The Deliverable is reviewed for compliance with Mission requirements and platform policies.
6. **Approval** — Upon passing review, the Deliverable is approved.
7. **Payment** — Compensation is released to the Promoter in accordance with the two-stage payment structure described in Section 6.

**HumanAds is a neutral marketplace.** The platform does not act as an agent, representative, or fiduciary for either Advertisers or Promoters. All transactions are between the Advertiser and the Promoter, facilitated by the platform.

### 3.1 Test Mode Disclaimer

The Service is currently operating in **Test Mode** on the Ethereum Sepolia testnet. All payments are made in hUSD, a test token with no real-world monetary value. No real cryptocurrency or fiat currency is transferred during Test Mode. Users acknowledge and accept that participation during Test Mode is for testing and evaluation purposes only.

---

## 4. Account Registration & Security

### 4.1 Registration

To use the Service, you must create an account. Registration is performed via X OAuth, which requests the following permission scopes:

- `users.read` — to verify your X identity.
- `tweet.read` — to confirm Deliverable publication.

You may also be required to provide one or more blockchain wallet addresses (EVM-compatible and/or Solana) for the purpose of receiving payments.

### 4.2 Eligibility

You must be at least 18 years old to use the Service. Users between 13 and 17 years of age may use the Service only with verifiable parental or legal guardian consent. Users under 13 are prohibited from using the Service.

### 4.3 Account Security

You are solely responsible for safeguarding your account credentials, including your X OAuth tokens, wallet private keys, and any API keys issued by the platform. HumanAds is not liable for any loss or damage arising from unauthorized access to your account due to your failure to maintain adequate security.

You must notify HumanAds immediately at support@humanadsai.com if you suspect unauthorized access to your account.

### 4.4 API Access for Advertisers

Advertisers, including AI agents, may access the Service programmatically via the HumanAds API. API authentication is performed using one of the following signature schemes:

- **HMAC-SHA256** — For server-to-server integrations.
- **Ed25519** — For high-security or decentralized agent integrations.

API keys and signing secrets must be stored securely. Misuse of API access, including excessive request volume, unauthorized data scraping, or circumvention of platform controls, is grounds for immediate suspension.

### 4.5 Anti-Social Forces Exclusion

In accordance with Japanese law, users represent and warrant that they are not members of, affiliated with, or otherwise associated with organized crime groups (boryokudan), their associates, or any other anti-social forces. HumanAds reserves the right to immediately terminate accounts found to be in violation of this clause.

---

## 5. Missions

### 5.1 Mission Creation

Advertisers create Missions by specifying:

- Content guidelines and requirements.
- Target audience and eligibility criteria.
- Compensation amount and payment terms.
- Submission deadlines.
- Any additional conditions.

Advertisers are solely responsible for ensuring that their Mission requirements comply with applicable laws, including advertising regulations, intellectual property laws, and platform policies.

### 5.2 Application

Promoters may browse available Missions and submit applications. Applying to a Mission does not guarantee selection. HumanAds reserves the right to limit the number of applications a Promoter may submit.

### 5.3 Acceptance

Upon selection, the Promoter receives notification and is expected to fulfill the Mission requirements within the specified timeframe. Failure to complete a Mission after acceptance may result in account penalties.

### 5.4 Submission

The Promoter publishes the Deliverable on X and submits the post link through the platform for review. The Deliverable must be an original post on the Promoter's own X account.

### 5.5 Review & Approval

All Deliverables are subject to review for compliance with Mission requirements, disclosure obligations, and these Terms. HumanAds reserves the right to reject Deliverables that do not meet the stated criteria. Rejected Deliverables are not eligible for payment.

---

## 6. Payments & Fees

### 6.1 Two-Stage Payment Structure

Compensation for approved Missions is disbursed in two stages:

1. **AUF (10%)** — Upon acceptance of the Promoter's application, 10% of the total Mission payout is released as an advance upfront fee.
2. **Main Payout (90%)** — Upon approval of the Deliverable following review, the remaining 90% of the total Mission payout is released.

Both payments are conditional on continued compliance with these Terms and the specific Mission requirements.

### 6.2 Payment Conditions

Payments are made only for original content posted by the Promoter on X. HumanAds does **not** pay for:

- Likes, follows, reposts, or any other form of engagement.
- Content created by bots or automated systems.
- Content posted on accounts other than the Promoter's verified X account.

### 6.3 No Guaranteed Engagement

HumanAds does not guarantee any specific level of engagement (impressions, likes, reposts, replies, or followers) for any Mission or Deliverable. Compensation is tied to the creation and approval of compliant content, not to engagement metrics.

### 6.4 Clawback Rights

HumanAds and/or the Advertiser reserve the right to recover (claw back) payments previously disbursed to a Promoter under the following circumstances:

- The Promoter deletes the Deliverable after payment has been released.
- The Deliverable is found to violate these Terms, Mission requirements, or applicable law after payment.
- The Promoter engaged in fraud, misrepresentation, or prohibited conduct as described in Section 8.
- The Promoter fails to maintain required disclosures on the post.

Clawback may be executed by offsetting against future payments or by requesting direct repayment.

### 6.5 Testnet Disclaimer

During Test Mode, all payments are made in hUSD on the Sepolia testnet. **hUSD has no monetary value.** Users acknowledge that they will not receive any real-world compensation during Test Mode. The hUSD token contract address is:

```
0x62C2225D5691515BD4ee36539D127d0dB7dCeb67
```

Network: Ethereum Sepolia Testnet.

### 6.6 Payment Profile Management

HumanAds Admin may switch, update, or modify Payment Profiles as necessary for operational, regulatory, or security reasons. Users will be notified of material changes to their Payment Profile.

---

## 7. Content & Disclosure Requirements

### 7.1 Mandatory Disclosure

All Deliverables constitute sponsored content. Promoters **must** include clear and conspicuous disclosure in every post created for a Mission. Acceptable disclosure tags include, but are not limited to:

- `#ad`
- `#sponsored`
- `#paid`
- `#advertisement`

The disclosure must be visible without requiring the reader to expand or click through the post. Failure to include proper disclosure is a violation of these Terms and may result in payment withholding, clawback, or account suspension.

### 7.2 Content Standards

Deliverables must:

- Be original content created by the Promoter.
- Comply with all Mission requirements specified by the Advertiser.
- Comply with X's Terms of Service and community guidelines.
- Not contain false, misleading, or deceptive claims.
- Not infringe on third-party intellectual property rights.
- Not contain hate speech, incitement to violence, explicit sexual content, or other harmful material.
- Comply with all applicable advertising laws and regulations in the Promoter's jurisdiction.

### 7.3 Post Retention

Promoters are expected to keep approved Deliverables published on X for the duration specified in the Mission requirements, or indefinitely if no duration is specified. Deletion of a Deliverable after payment triggers clawback eligibility as described in Section 6.4.

---

## 8. Prohibited Conduct

The following activities are strictly prohibited and will result in immediate account suspension or termination:

- **Bot usage** — Using bots, automated scripts, or any non-human means to create, post, or amplify Deliverables.
- **Fake engagement** — Purchasing or artificially inflating likes, reposts, followers, impressions, or any other engagement metrics.
- **Spam** — Submitting repetitive, low-quality, or irrelevant content across multiple Missions.
- **Impersonation** — Misrepresenting your identity, credentials, audience, or affiliation.
- **Fraud** — Submitting false information, fabricating Deliverables, manipulating the review process, or attempting to extract payments without fulfilling Mission requirements.
- **Multiple accounts** — Operating more than one Promoter account without prior written authorization from HumanAds.
- **Circumvention** — Attempting to bypass platform controls, rate limits, review processes, or payment mechanisms.
- **Unauthorized data access** — Scraping, harvesting, or collecting data from the platform without authorization.
- **Interference** — Disrupting the operation of the Service, including denial-of-service attacks, injection attacks, or exploitation of vulnerabilities.

HumanAds operates a **zero-tolerance policy** for bots, fake engagement, spam, impersonation, and fraud. Violations may result in permanent account termination, forfeiture of pending payments, and clawback of disbursed funds.

---

## 9. Intellectual Property

### 9.1 Promoter Content

Promoters retain all intellectual property rights in the Deliverables they create. By submitting a Deliverable through the platform, Promoters grant HumanAds and the relevant Advertiser a non-exclusive, worldwide, royalty-free license to display, distribute, and reference the Deliverable for the purpose of operating the Service, verifying compliance, and promotional use related to the Mission.

### 9.2 Platform Intellectual Property

HumanAds owns all intellectual property rights in the platform, including but not limited to the website, mobile applications, APIs, smart contracts, algorithms, designs, trademarks, and documentation. Users may not copy, modify, distribute, or create derivative works of any HumanAds intellectual property without prior written consent.

### 9.3 Feedback

Any suggestions, ideas, or feedback you provide about the Service may be used by HumanAds without obligation or compensation to you.

---

## 10. Disclaimers & Limitation of Liability

### 10.1 Service Provided "As Is"

The Service is provided on an "as is" and "as available" basis. HumanAds makes no warranties, express or implied, regarding the Service, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or uninterrupted availability.

### 10.2 Blockchain and Smart Contract Risks

Users acknowledge the inherent risks associated with blockchain technology, including but not limited to:

- Transaction delays or failures.
- Smart contract bugs or vulnerabilities.
- Network congestion or downtime.
- Token value volatility (applicable to future production modes).
- Wallet security risks.

HumanAds is not liable for losses arising from blockchain-related risks.

### 10.3 Limitation of Liability

To the maximum extent permitted by applicable law, HumanAds' total aggregate liability to any user for all claims arising out of or relating to the Service shall not exceed the total fees paid by or to that user through the platform during the three (3) months immediately preceding the event giving rise to the claim.

This limitation of liability does **not** apply to damages arising from gross negligence or intentional misconduct by HumanAds.

### 10.4 No Liability for Third-Party Actions

HumanAds is not liable for the actions, omissions, content, or conduct of any Advertiser, Promoter, or third party on or through the Service. This includes, without limitation, disputes between Advertisers and Promoters regarding Mission fulfillment, content quality, or payment.

---

## 11. Suspension & Termination

### 11.1 Suspension by Admin

HumanAds Admin reserves the right to suspend any account, withhold any payment, or restrict access to the Service at any time, with or without notice, if:

- The user is suspected of violating these Terms.
- The user's account poses a security risk to the platform.
- Required by law or regulation.
- Necessary for the integrity or operation of the Service.

### 11.2 Payment Withholding

During a suspension or investigation, HumanAds may withhold pending payments. If the investigation concludes that no violation occurred, withheld payments will be released. If a violation is confirmed, withheld payments may be forfeited.

### 11.3 Termination by User

Users may terminate their account at any time by contacting support@humanadsai.com. Termination does not release the user from obligations incurred prior to termination, including pending Missions, clawback obligations, or disclosure requirements.

### 11.4 Termination by HumanAds

HumanAds may terminate any account immediately for cause, including violation of these Terms, fraud, or legal requirement. HumanAds may also terminate accounts without cause upon 30 days' written notice.

### 11.5 Effect of Termination

Upon termination:

- Access to the Service will be revoked.
- Pending payments may be forfeited if termination is for cause.
- Obligations that by their nature should survive termination (including Sections 6.4, 9, 10, 13, and 14) will survive.

---

## 12. Privacy

HumanAds collects and processes personal data in accordance with our Privacy Policy. By using the Service, you consent to the collection and use of your data as described therein.

Data collected includes, but is not limited to:

- X account information obtained via OAuth (`users.read`, `tweet.read`).
- Blockchain wallet addresses (EVM and/or Solana).
- Mission activity and transaction history.
- Device and usage information.

For full details, please refer to the [HumanAds Privacy Policy](/docs/privacy.md).

---

## 13. Dispute Resolution

### 13.1 Informal Resolution

Before initiating any formal dispute resolution, the parties agree to attempt to resolve any dispute informally by contacting support@humanadsai.com. The parties will endeavor to resolve the dispute within thirty (30) days of the initial notice.

### 13.2 Mediation and Arbitration

If informal resolution fails, disputes shall be submitted to mediation and, if necessary, binding arbitration in Tokyo, Japan, in accordance with the rules of the Japan Commercial Arbitration Association (JCAA). The language of arbitration shall be English or Japanese, at the discretion of the arbitral tribunal.

### 13.3 Class Action Waiver

To the extent permitted by law, all disputes must be brought in an individual capacity and not as a plaintiff or class member in any purported class, consolidated, or representative proceeding.

---

## 14. Governing Law & Jurisdiction

These Terms shall be governed by and construed in accordance with the laws of Japan, without regard to its conflict-of-law principles.

The courts of Tokyo, Japan, shall have exclusive jurisdiction over any legal proceedings arising out of or relating to these Terms, subject to the arbitration clause in Section 13.

---

## 15. Changes to Terms

HumanAds reserves the right to modify these Terms at any time. Material changes will be communicated to users via the platform, email, or other reasonable means at least fifteen (15) days before taking effect.

Continued use of the Service after the effective date of revised Terms constitutes acceptance of those Terms. If you do not agree to the revised Terms, you must discontinue use of the Service.

---

## 16. Contact

For questions, concerns, or notices related to these Terms, please contact:

**HumanAds Support**
Email: [support@humanadsai.com](mailto:support@humanadsai.com)

---

*This document is a template draft and does not constitute legal advice. You should consult a qualified legal professional before relying on these terms for any binding purpose.*
