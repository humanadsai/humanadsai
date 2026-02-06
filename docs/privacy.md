# Privacy Policy

**Effective Date: 2026-02-06**
**Last Updated: 2026-02-06**

> **Note:** This document is a template draft and does not constitute legal advice. You should consult a qualified attorney to ensure compliance with all applicable laws and regulations.

---

## 1. Introduction

Welcome to HumanAds. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform and related services ("Services"). HumanAds connects advertisers with individuals who promote products and services through social media, with payments facilitated via blockchain technology.

By accessing or using HumanAds, you agree to the collection and use of information as described in this policy. If you do not agree, please do not use our Services.

---

## 2. Information We Collect

### 2.1 Account Information (X OAuth)

When you sign in through X (formerly Twitter), we request the following OAuth scopes:

- **`users.read`** -- Access to your public profile information
- **`tweet.read`** -- Read-only access to your tweets

Through this authentication, we collect:

- Username and display name
- Profile image URL
- Bio / profile description
- Location (as set in your profile)
- Followers and following counts
- Tweet count
- Verified status
- Account creation date

We do **not** request write access to your X account. We cannot post, like, follow, or modify anything on your behalf.

### 2.2 Profile and Activity Data

In the course of using our Services, we collect:

- **Post URLs** submitted as deliverables for advertising missions
- **Mission participation history**, including acceptance, completion, and status

### 2.3 Payment and Wallet Information

To facilitate payments, we collect:

- **Wallet addresses** -- both EVM-compatible (e.g., Ethereum, Base) and Solana addresses that you connect to your account
- **Transaction hashes** associated with payments made through the platform

Please see [Section 6 (Blockchain Data & Immutability)](#6-blockchain-data--immutability) for important information about the permanent and public nature of on-chain data.

### 2.4 Technical and Log Data

We automatically collect certain technical information when you interact with our Services:

- **IP address**
- **User agent** (browser type, version, and operating system)
- **Access logs** (timestamps, pages visited, actions taken)
- **Session tokens** -- stored as cryptographic hashes in our database; we do not retain plaintext session tokens

### 2.5 Advertiser API Keys

If you register as an Advertiser, we issue API keys for programmatic access. Only a short prefix of each key is stored in readable form for your identification purposes. The full key is stored as a one-way cryptographic hash and cannot be recovered.

---

## 3. How We Use Your Information

We use the information we collect for the following purposes:

- **Identity verification** -- Confirming that you are a real person with a genuine social media presence
- **Mission operation** -- Matching advertisers with promoters, tracking deliverable submissions, and verifying mission completion
- **Payment processing** -- Initiating and recording blockchain-based payments to your connected wallet
- **Fraud detection and prevention** -- Identifying suspicious activity, duplicate accounts, and policy violations
- **Compliance** -- Meeting legal and regulatory obligations
- **Customer support** -- Responding to your inquiries and resolving issues
- **Analytics and improvement** -- Understanding how our Services are used so we can improve functionality and user experience

We process your information only where we have a lawful basis to do so, including your consent, the performance of our contract with you, compliance with legal obligations, and our legitimate interests in operating and improving the Services.

---

## 4. Cookies and Similar Technologies

HumanAds uses a limited number of cookies, each serving a specific functional purpose:

| Cookie | Purpose | Attributes | Duration |
|---|---|---|---|
| `session` | Authentication and session management | `HttpOnly`, `Secure`, `SameSite=Lax` | Session-based |
| `x_auth_state` | OAuth PKCE flow state parameter | Encrypted (AES-GCM), `Secure` | 10 minutes |
| `x_auth_redirect` | Stores redirect URL after login | `Secure` | 10 minutes |
| `x_auth_invite` | Referral tracking during signup | `Secure` | 10 minutes |

We do **not** use third-party advertising or analytics cookies. All cookies listed above are strictly functional and necessary for the operation of the Services.

For additional details, please refer to our Cookie Policy.

---

## 5. Information Sharing and Disclosure

We do **not** sell your personal information to third parties.

We may share your information in the following limited circumstances:

- **With your consent** -- When you have given us explicit permission to share specific information
- **Service providers** -- We use the following infrastructure providers to operate our Services:
  - **Cloudflare** -- Workers (compute), D1 (database), and KV (key-value storage) for hosting and data processing
  - **Blockchain networks** -- Sepolia testnet, Base, and Ethereum mainnet for payment transactions

  These providers process data on our behalf and are bound by their own privacy and security obligations.
- **Legal requirements** -- When we are required to disclose information by law, regulation, legal process, or government request
- **Safety and rights** -- When we believe in good faith that disclosure is necessary to protect the safety of any person, prevent fraud, or protect the rights and property of HumanAds
- **Government cooperation** -- In response to lawful requests from public authorities, including for national security or law enforcement purposes

---

## 6. Blockchain Data and Immutability

This section contains important information that differs from typical web services.

When payments are processed through HumanAds, transactions are recorded on public blockchain networks (currently Sepolia testnet; Base and/or Ethereum mainnet in production). You should understand the following:

- **Blockchain transactions are public.** Your wallet address and transaction hashes are visible to anyone on the blockchain explorer and network.
- **Blockchain transactions are irreversible.** Once a transaction is confirmed on-chain, it cannot be altered, reversed, or deleted.
- **Blockchain data is permanent.** Even if you delete your HumanAds account, your wallet address and any associated transaction history will remain permanently on the blockchain.
- **Deletion requests cannot apply to on-chain data.** While we can remove your information from our own databases, we have no ability to modify or erase data recorded on a blockchain. This is a fundamental characteristic of the technology, not a policy choice.

By connecting a wallet and participating in blockchain-based payments through HumanAds, you acknowledge and accept these inherent properties of blockchain technology.

---

## 7. Data Retention

We retain your personal information for as long as it is reasonably necessary to:

- Provide and operate the Services
- Fulfill the purposes described in this policy
- Comply with legal, accounting, and reporting obligations
- Resolve disputes and enforce our agreements

When your information is no longer needed for these purposes, we will securely delete or anonymize it. Specific retention periods vary by data type:

- **Account data** -- Retained for the lifetime of your account and a reasonable period thereafter for legal and compliance purposes
- **Access logs and technical data** -- Retained for a limited period as needed for security monitoring and debugging
- **Blockchain data** -- Permanent and beyond our control (see [Section 6](#6-blockchain-data--immutability))

---

## 8. Data Security

We implement appropriate technical and organizational measures to protect your personal information, including:

- **Encryption** -- OAuth state parameters are encrypted using AES-GCM. Data in transit is protected by TLS.
- **Hashed tokens** -- Session tokens and API keys are stored as cryptographic hashes, not in plaintext
- **Access controls** -- Administrative access to systems and databases is restricted and monitored
- **Audit logging** -- We maintain logs of significant system and administrative actions for security review

While we strive to protect your information, no method of electronic storage or transmission is completely secure. We cannot guarantee absolute security, but we are committed to implementing and maintaining industry-appropriate safeguards.

---

## 9. Your Rights and Choices

Depending on your jurisdiction, you may have the following rights regarding your personal information:

- **Access** -- Request a copy of the personal information we hold about you
- **Correction** -- Request that we correct inaccurate or incomplete information
- **Deletion** -- Request that we delete your personal information, subject to the following limitations:
  - Blockchain data cannot be deleted (see [Section 6](#6-blockchain-data--immutability))
  - We may retain certain information where required by law or for legitimate legal purposes (e.g., legal holds, regulatory obligations)
- **Restriction** -- Request that we limit the processing of your information in certain circumstances

To exercise any of these rights, please contact us at **support@humanadsai.com**. We will respond to your request within a reasonable timeframe and in accordance with applicable law.

You may also disconnect your wallet or revoke X OAuth access at any time through the platform settings.

---

## 10. Children's Privacy

HumanAds is not directed at children under the age of 16 (or the applicable minimum age in your jurisdiction). We do not knowingly collect personal information from minors without verifiable parental or guardian consent.

If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us at **support@humanadsai.com**. We will take steps to delete that information promptly.

---

## 11. International Data Transfers

HumanAds operates on Cloudflare's global edge network. As a result, your personal information may be processed in multiple jurisdictions around the world, including locations outside your country of residence.

We take steps to ensure that any international transfers of personal information are conducted in compliance with applicable data protection laws. Cloudflare maintains appropriate certifications and contractual safeguards for international data transfers.

By using the Services, you acknowledge that your information may be transferred to and processed in jurisdictions with data protection laws that differ from those in your home country.

---

## 12. Changes to This Policy

We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When we make changes, we will:

- Update the "Last Updated" date at the top of this policy
- Notify you through the HumanAds platform or via email for material changes

We encourage you to review this policy periodically. Your continued use of the Services after any changes take effect constitutes your acceptance of the revised policy.

---

## 13. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:

**Email:** support@humanadsai.com

---

## Governing Law

This Privacy Policy and any disputes arising from it are governed by and construed in accordance with the laws of Japan, without regard to its conflict of law provisions.

---

*This document is a template draft and does not constitute legal advice. Please consult with a qualified legal professional to ensure compliance with all applicable privacy laws and regulations in your jurisdiction.*
