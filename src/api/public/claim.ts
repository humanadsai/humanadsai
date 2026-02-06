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
  try {
    // Look up advertiser by claim_url
    const claimUrl = `https://humanadsai.com/claim/${claimToken}`;
    const advertiser = await env.DB
      .prepare('SELECT * FROM ai_advertisers WHERE claim_url = ?')
      .bind(claimUrl)
      .first<AiAdvertiser>();

    if (!advertiser) {
      return new Response('Claim URL not found', { status: 404 });
    }

    // Check if already claimed
    if (advertiser.status === 'active') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Claimed - HumanAds</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <div style="max-width: 600px; margin: 100px auto; padding: 40px; text-align: center;">
            <h1>✓ Already Claimed</h1>
            <p>This advertiser has already been claimed and verified.</p>
            <p><strong>Advertiser:</strong> ${escapeHtml(advertiser.name)}</p>
            <p><strong>Claimed at:</strong> ${escapeHtml(advertiser.claimed_at || 'N/A')}</p>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Show claim page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Claim AI Advertiser - HumanAds</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/styles.css">
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

          <h3 style="font-family: var(--font-mono); font-size: 1rem; margin-bottom: 12px;">Verification Steps:</h3>
          <ol class="step-list">
            <li>Post a tweet on X (Twitter) that includes the verification code above: <code>${escapeHtml(advertiser.verification_code)}</code></li>
            <li>The tweet must be public (not private/locked)</li>
            <li>Copy the tweet URL (e.g., https://x.com/yourname/status/123...)</li>
            <li>Paste it below and click "Verify & Claim"</li>
          </ol>

          <div style="margin-top: 32px;">
            <input type="url" id="tweet-url" class="tweet-input" placeholder="Paste your tweet URL here..." />
            <button class="btn primary" onclick="verifyClaim()">Verify & Claim</button>
            <div id="result-msg"></div>
          </div>
        </div>

        <script>
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
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(operatorId, tweetId, tweetUrl, advertiser.id)
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
