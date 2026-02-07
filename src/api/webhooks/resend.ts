import type { Env } from '../../types';
import { errors, generateRequestId } from '../../utils/response';
import {
  upsertSuppression,
  incrementSoftBounce,
  markEventProcessed,
} from '../../services/email';

const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60; // 5 minutes

/**
 * Verify Svix webhook signature using Web Crypto API.
 * Avoids the `svix` npm package which requires Node.js built-ins
 * not available in Cloudflare Workers.
 *
 * Algorithm:
 * 1. Strip `whsec_` prefix from secret and base64-decode to get HMAC key
 * 2. Signed content = `${svix-id}.${svix-timestamp}.${body}`
 * 3. HMAC-SHA256 → base64-encode
 * 4. Compare against signatures in svix-signature header (comma-separated `v1,<base64>`)
 * 5. Reject if timestamp is outside tolerance window
 */
async function verifySvixSignature(
  secret: string,
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string
): Promise<boolean> {
  // Timestamp check
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  // Decode secret (strip "whsec_" prefix)
  const secretStr = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const secretBytes = Uint8Array.from(atob(secretStr), (c) => c.charCodeAt(0));

  // Import key
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign: "${svix-id}.${svix-timestamp}.${body}"
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signedContent));
  const expectedSig = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // Compare against provided signatures (format: "v1,<base64>,v1,<base64>,...")
  const providedSigs = svixSignature.split(' ');
  for (const sig of providedSigs) {
    const [version, value] = sig.split(',', 2);
    if (version === 'v1' && value === expectedSig) {
      return true;
    }
  }
  return false;
}

/**
 * Handle Resend webhook events with Svix signature verification.
 * Logs events to email_webhook_events and processes bounces/complaints
 * into the email_suppressions table.
 */
export async function handleResendWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  const requestId = generateRequestId();

  // 1. Get raw body (must use text(), not json(), for signature verification)
  const rawBody = await request.text();

  // 2. Check secret configured
  if (!env.RESEND_WEBHOOK_SECRET) {
    console.error('[webhook:resend] RESEND_WEBHOOK_SECRET not configured');
    return errors.internalError(requestId);
  }

  // 3. Extract Svix headers
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return errors.badRequest(requestId, 'Missing webhook signature headers');
  }

  // 4. Verify signature (using Web Crypto API)
  let verified: boolean;
  try {
    verified = await verifySvixSignature(
      env.RESEND_WEBHOOK_SECRET,
      rawBody,
      svixId,
      svixTimestamp,
      svixSignature
    );
  } catch (e) {
    console.error('[webhook:resend] Signature verification error:', e);
    return errors.signatureInvalid(requestId);
  }

  if (!verified) {
    console.error('[webhook:resend] Signature verification failed');
    return errors.signatureInvalid(requestId);
  }

  // 5. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errors.badRequest(requestId, 'Invalid JSON payload');
  }

  // 6. Extract event data
  const eventId = svixId;
  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown>;

  // 7. INSERT OR IGNORE (idempotent via event_id PK)
  const recipient = extractRecipient(data);
  const bounceData = data?.bounce as Record<string, unknown> | undefined;
  const errorData = data?.error as Record<string, unknown> | undefined;

  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO email_webhook_events
        (event_id, type, email_to, email_from, subject, resend_message_id,
         bounce_type, error_message, raw_payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        eventId,
        eventType,
        recipient,
        (data?.from as string) || null,
        (data?.subject as string) || null,
        (data?.email_id as string) || null,
        (bounceData?.type as string) || null,
        (bounceData?.message as string) || (errorData?.message as string) || null,
        rawBody
      )
      .run();
  } catch (e) {
    console.error('[webhook:resend] DB insert error:', e);
    return errors.internalError(requestId);
  }

  // 8. Process event (fire-and-forget)
  processEvent(env.DB, eventId, eventType, data).catch((e) =>
    console.error('[webhook:resend] Event processing error:', e)
  );

  // 9. Return 200 immediately
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Process webhook event: update suppression list for bounces/complaints.
 */
async function processEvent(
  db: D1Database,
  eventId: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  switch (eventType) {
    case 'email.bounced': {
      const email = extractRecipient(data)?.toLowerCase();
      if (!email) break;
      const bounceData = data.bounce as Record<string, unknown> | undefined;
      const bounceType = bounceData?.type as string | undefined;
      if (bounceType === 'hard') {
        await upsertSuppression(db, email, 'hard_bounce', true);
      } else {
        await incrementSoftBounce(db, email);
      }
      // Update email_logs status
      const bouncedMessageId = data?.email_id as string;
      if (bouncedMessageId) {
        try {
          await db.prepare(
            "UPDATE email_logs SET status = 'bounced' WHERE resend_message_id = ?"
          ).bind(bouncedMessageId).run();
        } catch (e) {
          console.error('[webhook:resend] Failed to update email_logs for bounce:', e);
        }
      }
      await markEventProcessed(db, eventId);
      break;
    }
    case 'email.complained': {
      const email = extractRecipient(data)?.toLowerCase();
      if (!email) break;
      await upsertSuppression(db, email, 'complaint', true);
      await markEventProcessed(db, eventId);
      break;
    }
    case 'email.delivered': {
      const deliveredMessageId = data?.email_id as string;
      if (deliveredMessageId) {
        try {
          await db.prepare(
            "UPDATE email_logs SET status = 'delivered' WHERE resend_message_id = ?"
          ).bind(deliveredMessageId).run();
        } catch (e) {
          console.error('[webhook:resend] Failed to update email_logs for delivered:', e);
        }
      }
      await markEventProcessed(db, eventId);
      break;
    }
    case 'email.sent':
    case 'email.delivery_delayed':
      await markEventProcessed(db, eventId);
      break;
  }
}

/**
 * Extract recipient email from Resend event data.
 * `data.to` can be a string, an array of strings, or undefined.
 */
function extractRecipient(data: Record<string, unknown>): string | null {
  if (!data) return null;
  const to = data.to;
  if (typeof to === 'string') return to;
  if (Array.isArray(to) && to.length > 0 && typeof to[0] === 'string') return to[0];
  return null;
}
