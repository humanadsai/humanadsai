# Cookie Policy

**Effective Date:** 2025-02-06
**Last Updated:** 2025-02-06

---

## Overview

HumanAds uses cookies strictly for authentication, security, and basic platform functionality. We do not use cookies for advertising, tracking, or analytics purposes.

## Cookies We Set

### 1. `session` — Authentication Session

| Attribute | Value |
|-----------|-------|
| **Purpose** | Persists your login session so you remain authenticated across page loads |
| **Type** | Essential |
| **HttpOnly** | Yes |
| **Secure** | Yes |
| **SameSite** | Lax |
| **Duration** | Session lifetime |

### 2. `x_auth_state` — OAuth PKCE State

| Attribute | Value |
|-----------|-------|
| **Purpose** | Stores encrypted state for the OAuth PKCE login flow to prevent cross-site request forgery |
| **Type** | Essential |
| **Encryption** | AES-GCM |
| **HttpOnly** | Yes |
| **Secure** | Yes |
| **SameSite** | Lax |
| **Duration** | 10 minutes |

### 3. `x_auth_redirect` — Login Redirect URL

| Attribute | Value |
|-----------|-------|
| **Purpose** | Stores the URL to redirect you back to after completing the login flow |
| **Type** | Essential |
| **Duration** | 10 minutes |

### 4. `x_auth_invite` — Referral/Invite Tracking

| Attribute | Value |
|-----------|-------|
| **Purpose** | Preserves a referral or invite code during the registration process |
| **Type** | Optional |
| **Duration** | 10 minutes |

## Third-Party Cookies

- **No third-party tracking cookies** are set by HumanAds.
- **No advertising cookies** are used.
- **No analytics cookies** are currently in use.

### Infrastructure Cookies

HumanAds uses Cloudflare for infrastructure and security. Cloudflare may set its own cookies (such as `__cf_bm`) for DDoS protection and bot management purposes. These cookies are managed by Cloudflare and are necessary for the secure operation of the platform. For details, refer to [Cloudflare's cookie policy](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/).

## Managing Cookies

You can manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, blocking essential cookies (session, OAuth state) will prevent you from logging in to HumanAds.

Instructions for common browsers:

- **Chrome**: Settings > Privacy and security > Cookies and other site data
- **Firefox**: Settings > Privacy & Security > Cookies and Site Data
- **Safari**: Preferences > Privacy > Manage Website Data

## Contact

If you have questions about this cookie policy, contact us at support@humanadsai.com.
