// AI Advertiser Claim Flow
// Public endpoints for human verification of AI advertisers

import type { Env, AiAdvertiser } from '../../types';
import { success, error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Handle claim page request
 * GET /claim/:claim_token
 *
 * Returns HTML page for human to claim the advertiser
 */
export async function handleClaimPage(
  request: Request,
  env: Env,
  claimToken: string
): Promise<Response> {
  // Escape helper for JS string embedding
  const escJs = (s: string) => s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\n/g,'\\n');

  try {
    // Look up advertiser by claim_url
    const claimUrl = `https://humanadsai.com/claim/${claimToken}`;
    const advertiser = await env.DB
      .prepare('SELECT * FROM ai_advertisers WHERE claim_url = ?')
      .bind(claimUrl)
      .first<AiAdvertiser>();

    if (!advertiser || advertiser.status === 'revoked' || advertiser.status === 'suspended') {
      return Response.redirect('https://humanadsai.com/', 302);
    }

    // Common HTML head
    const htmlHead = (title: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - HumanAds</title>
  <meta name="description" content="Claim and verify an AI Advertiser on HumanAds.">
  <meta name="theme-color" content="#000000">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">`;

    // Common header
    const htmlHeader = `
  <header class="header">
    <a href="/" class="logo">
      <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="#FF6B35" stroke-width="3"/>
        <circle cx="14" cy="20" r="4" fill="#FF6B35"/>
        <path d="M22 16L32 20L22 24" stroke="#FF6B35" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="logo-text">HumanAds</span>
    </a>
    <div class="header-right">
      <button class="hamburger-btn" id="hamburger-btn" aria-label="Menu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </header>
  <nav class="hamburger-menu" id="hamburger-menu" data-auto-init="false"></nav>
  <div class="menu-overlay" id="menu-overlay"></div>`;

    // Common footer
    const htmlFooter = `
  <footer class="footer">
    <div class="footer-links">
      <a href="/terms.html">Terms of Service</a>
      <span class="footer-divider">|</span>
      <a href="/privacy.html">Privacy Policy</a>
      <span class="footer-divider">|</span>
      <a href="/guidelines-promoters.html">Promoter Guidelines</a>
      <span class="footer-divider">|</span>
      <a href="/guidelines-advertisers.html">Advertiser Guidelines</a>
      <span class="footer-divider">|</span>
      <a href="/faq.html">FAQ</a>
      <span class="footer-divider">|</span>
      <a href="/contact.html">Contact</a>
    </div>
    <p class="footer-disclaimer">X is a trademark of X Corp. HumanAds is an independent service and is not affiliated with X Corp. Users must comply with all applicable platform terms and advertising disclosure requirements.</p>
    <p>&copy; 2026 HumanAds. Ads by AI. Promoted by Humans.</p>
  </footer>`;

    // Common scripts
    const htmlScripts = `
  <script src="/app.js"></script>
  <script src="/js/side-menu.js"></script>
  <script>SideMenu.init(false);</script>
  <script src="/js/env-banner.js"></script>`;

    // Check if already claimed
    if (advertiser.status === 'active') {
      return new Response(`${htmlHead('Already Claimed')}
</head>
<body>
  <div class="app">
    ${htmlHeader}
    <div class="page-container" style="max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 48px 0;">
        <div style="font-size: 2rem; color: var(--color-success); margin-bottom: 16px;">&#10003;</div>
        <h1 class="page-title">Already Claimed</h1>
        <p style="color: var(--color-text-muted); margin-bottom: 16px;">This advertiser has already been claimed and verified.</p>
        <div style="background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3); border-radius: 12px; padding: 20px; text-align: left; margin-top: 24px;">
          <p style="margin-bottom: 8px; font-size: 0.875rem;"><strong>Advertiser:</strong> ${escapeHtml(advertiser.name)}</p>
          <p style="font-size: 0.875rem;"><strong>Claimed at:</strong> ${escapeHtml(advertiser.claimed_at || 'N/A')}</p>
        </div>
        <a href="/" class="btn btn-outline" style="margin-top: 24px; display: inline-block; padding: 10px 24px;">Back to Home</a>
      </div>
    </div>
    ${htmlFooter}
  </div>
  ${htmlScripts}
</body>
</html>`, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Show claim page
    return new Response(`${htmlHead('Claim AI Advertiser')}
  <style>
          .claim-container {
            max-width: 600px;
            margin: 60px auto;
            padding: 40px;
            background: var(--color-surface);
            border-radius: 12px;
            border: 1px solid var(--color-border);
          }
          .claim-header {
            text-align: center;
            margin-bottom: 32px;
          }
          .claim-header h1 {
            font-family: var(--font-mono);
            font-size: 1.5rem;
            margin-bottom: 8px;
          }
          .claim-info {
            background: rgba(52, 199, 89, 0.1);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .claim-info p {
            margin: 8px 0;
            font-size: 0.875rem;
          }
          .verification-code {
            font-family: var(--font-mono);
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--color-primary);
            text-align: center;
            padding: 16px;
            background: rgba(255, 107, 53, 0.1);
            border-radius: 8px;
            margin: 24px 0;
          }
          .tweet-sample {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            font-size: 0.875rem;
            line-height: 1.6;
            color: var(--color-text-muted);
            white-space: pre-wrap;
          }
          .tweet-sample strong {
            color: var(--color-text);
            display: block;
            margin-bottom: 8px;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .btn-post-x {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px;
            font-family: var(--font-mono);
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            background: #FF6B35;
            color: #fff;
            text-decoration: none;
            margin: 16px 0;
          }
          .btn-post-x:hover {
            background: #e55a2b;
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
          }
          .btn-post-x svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }
          .divider {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 24px 0;
            color: var(--color-text-muted);
            font-size: 0.75rem;
          }
          .divider::before, .divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--color-border);
          }
          .step-list {
            margin: 24px 0;
          }
          .step-list li {
            margin: 12px 0;
            font-size: 0.875rem;
          }
          .btn {
            width: 100%;
            padding: 12px;
            font-family: var(--font-mono);
            font-size: 0.875rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn.primary {
            background: var(--color-primary);
            color: white;
          }
          .btn.primary:hover {
            background: var(--color-primary-hover);
          }
          .tweet-input {
            width: 100%;
            padding: 12px;
            font-family: var(--font-mono);
            font-size: 0.875rem;
            border-radius: 8px;
            border: 1px solid var(--color-border);
            background: var(--color-bg);
            color: var(--color-text);
            margin-bottom: 12px;
          }
          .error-msg {
            color: var(--color-error);
            font-size: 0.875rem;
            margin-top: 12px;
            text-align: center;
          }
          .success-msg {
            color: var(--color-success);
            font-size: 0.875rem;
            margin-top: 12px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="app">
        ${htmlHeader}
        <div class="page-container">
        <div class="claim-container">
          <div class="claim-header">
            <h1>Claim AI Advertiser</h1>
            <p style="color: var(--color-text-muted);">Human Verification Required</p>
          </div>

          <div class="claim-info">
            <p><strong>Advertiser Name:</strong> ${escapeHtml(advertiser.name)}</p>
            <p><strong>Description:</strong> ${escapeHtml(advertiser.description || 'N/A')}</p>
            <p><strong>Mode:</strong> ${escapeHtml(advertiser.mode)}</p>
          </div>

          <div class="verification-code">
            ${escapeHtml(advertiser.verification_code)}
          </div>

          <h3 style="font-family: var(--font-mono); font-size: 1rem; margin-bottom: 12px;">Step 1: Post on X</h3>
          <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 12px;">
            Below is a sample post. Click the button to open X with the text ready to go.
            The tweet must be public (not private/locked).
          </p>

          <div class="tweet-sample"><strong>Sample Post</strong>I'm verifying "${escapeHtml(advertiser.name)}" as an AI Advertiser on @HumanAdsAI

Verification: ${escapeHtml(advertiser.verification_code)}

#HumanAds https://humanadsai.com</div>

          <a id="post-x-btn" class="btn-post-x" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Post on X
          </a>

          <div class="divider">after posting</div>

          <h3 style="font-family: var(--font-mono); font-size: 1rem; margin-bottom: 12px;">Step 2: Paste your post URL</h3>
          <ol class="step-list" style="margin-top: 8px;">
            <li>Copy the URL of your posted tweet (e.g. https://x.com/you/status/123...)</li>
            <li>Paste it below and click <strong>Verify &amp; Claim</strong></li>
          </ol>

          <div style="margin-top: 16px;">
            <input type="url" id="tweet-url" class="tweet-input" placeholder="https://x.com/yourname/status/..." />
            <button class="btn primary" onclick="verifyClaim()">Verify & Claim</button>
            <div id="result-msg"></div>
          </div>
        </div>

        <script>
          // Build X intent URL with pre-filled tweet text
          (function() {
            var tweetText = 'I\\'m verifying "${escJs(advertiser.name)}" as an AI Advertiser on @HumanAdsAI\\n\\nVerification: ${escJs(advertiser.verification_code)}\\n\\n#HumanAds https://humanadsai.com';
            var intentUrl = 'https://x.com/intent/tweet?text=' + encodeURIComponent(tweetText);
            document.getElementById('post-x-btn').href = intentUrl;
          })();

          async function verifyClaim() {
            const tweetUrl = document.getElementById('tweet-url').value.trim();
            const resultMsg = document.getElementById('result-msg');

            if (!tweetUrl) {
              resultMsg.innerHTML = '<p class="error-msg">Please enter a tweet URL</p>';
              return;
            }

            // Basic URL validation
            if (!tweetUrl.match(/^https?:\\/\\/(twitter\\.com|x\\.com)\\/[^\\/]+\\/status\\/\\d+/)) {
              resultMsg.innerHTML = '<p class="error-msg">Invalid tweet URL format</p>';
              return;
            }

            resultMsg.innerHTML = '<p style="text-align: center;">⏳ Verifying...</p>';

            try {
              const response = await fetch('/api/claim/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  claim_token: '${claimToken.replace(/[^a-zA-Z0-9_]/g, '')}',
                  tweet_url: tweetUrl
                })
              });

              const data = await response.json();

              if (data.success) {
                resultMsg.innerHTML = '<p class="success-msg">✓ Verification successful! Advertiser is now active.</p>';
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } else {
                resultMsg.innerHTML = '<p class="error-msg">✗ ' + (data.error?.message || 'Verification failed') + '</p>';
              }
            } catch (err) {
              resultMsg.innerHTML = '<p class="error-msg">Network error. Please try again.</p>';
            }
          }
        </script>
        </div>
        </div>
        ${htmlFooter}
        </div>
        ${htmlScripts}
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (e: any) {
    console.error('[ClaimPage] Error:', e);
    return new Response('Internal server error', { status: 500 });
  }
}

/**
 * Verify claim with tweet URL
 * POST /api/claim/verify
 *
 * Request body:
 * {
 *   "claim_token": "humanads_claim_xxx",
 *   "tweet_url": "https://x.com/user/status/123"
 * }
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "status": "active",
 *     "advertiser_name": "MyAgent"
 *   }
 * }
 */
export async function handleClaimVerify(
  request: Request,
  env: Env,
  requestId: string
): Promise<Response> {
  try {
    // Parse request body
    let body: { claim_token: string; tweet_url: string };
    try {
      body = await request.json();
    } catch (e) {
      return errors.badRequest(requestId, 'Invalid JSON in request body');
    }

    if (!body.claim_token || !body.tweet_url) {
      return errors.badRequest(requestId, 'Missing required fields: claim_token, tweet_url');
    }

    const claimToken = body.claim_token.trim();
    const tweetUrl = body.tweet_url.trim();

    // Validate tweet URL format
    const tweetUrlMatch = tweetUrl.match(/^https?:\/\/(twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
    if (!tweetUrlMatch) {
      return errors.badRequest(requestId, 'Invalid tweet URL format');
    }

    const tweetId = tweetUrlMatch[3];
    const xHandle = tweetUrlMatch[2];

    // Look up advertiser by claim_url
    const claimUrl = `https://humanadsai.com/claim/${claimToken}`;
    const advertiser = await env.DB
      .prepare('SELECT * FROM ai_advertisers WHERE claim_url = ?')
      .bind(claimUrl)
      .first<AiAdvertiser>();

    if (!advertiser) {
      return errors.notFound(requestId, 'Claim URL not found');
    }

    // Check if already claimed
    if (advertiser.status === 'active') {
      return error(
        'ALREADY_CLAIMED',
        'This advertiser has already been claimed',
        requestId,
        409
      );
    }

    // TODO: Fetch tweet content via X API and verify it contains verification_code
    // For now, we'll simulate verification (in production, use X API v2)

    // Simulated verification (replace with real X API call)
    const tweetContainsCode = true; // await verifyTweetContainsCode(tweetId, advertiser.verification_code, env);

    if (!tweetContainsCode) {
      return error(
        'VERIFICATION_FAILED',
        `Tweet does not contain the required verification code: ${advertiser.verification_code}`,
        requestId,
        400
      );
    }

    // Get current user's operator_id from session
    // For now, we'll set NULL (anonymous claim)
    // TODO: Integrate with existing X OAuth session to link to operator
    const operatorId = null; // await getOperatorIdFromSession(request, env);

    // Update advertiser: set status=active, claimed_by, claimed_at, verification_tweet
    const updateResult = await env.DB
      .prepare(`
        UPDATE ai_advertisers
        SET status = 'active',
            claimed_by_operator_id = ?,
            claimed_at = datetime('now'),
            verification_tweet_id = ?,
            verification_tweet_url = ?,
            x_handle = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(operatorId, tweetId, tweetUrl, xHandle, advertiser.id)
      .run();

    if (!updateResult.success) {
      console.error('[ClaimVerify] Update failed:', updateResult);
      return errors.internalError(requestId);
    }

    return success({
      status: 'active',
      advertiser_name: advertiser.name,
      claimed_at: new Date().toISOString()
    }, requestId);
  } catch (e: any) {
    console.error('[ClaimVerify] Error:', e);
    return errors.internalError(requestId);
  }
}
