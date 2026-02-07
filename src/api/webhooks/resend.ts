import { Webhook } from 'svix';
import type { Env } from '../../types';
import { errors, generateRequestId } from '../../utils/response';
import {
  upsertSuppression,
  incrementSoftBounce,
  markEventProcessed,
} from '../../services/email';

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

  // 1. Get raw body (must use text(), not json(), for Svix verification)
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

  // 4. Verify signature
  const wh = new Webhook(env.RESEND_WEBHOOK_SECRET);
  let payload: Record<string, unknown>;
  try {
    payload = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as Record<string, unknown>;
  } catch (e) {
    console.error('[webhook:resend] Signature verification failed:', e);
    return errors.signatureInvalid(requestId);
  }

  // 5. Extract event data
  const eventId = svixId;
  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown>;

  // 6. INSERT OR IGNORE (idempotent via event_id PK)
  const recipient = extractRecipient(data);
  const bounceData = data.bounce as Record<string, unknown> | undefined;
  const errorData = data.error as Record<string, unknown> | undefined;

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
        (data.from as string) || null,
        (data.subject as string) || null,
        (data.email_id as string) || null,
        (bounceData?.type as string) || null,
        (bounceData?.message as string) || (errorData?.message as string) || null,
        rawBody
      )
      .run();
  } catch (e) {
    console.error('[webhook:resend] DB insert error:', e);
    return errors.internalError(requestId);
  }

  // 7. Process event (fire-and-forget)
  processEvent(env.DB, eventId, eventType, data).catch((e) =>
    console.error('[webhook:resend] Event processing error:', e)
  );

  // 8. Return 200 immediately
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
    case 'email.delivered':
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
  const to = data.to;
  if (typeof to === 'string') return to;
  if (Array.isArray(to) && to.length > 0 && typeof to[0] === 'string') return to[0];
  return null;
}
