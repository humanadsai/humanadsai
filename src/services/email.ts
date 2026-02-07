/**
 * Email suppression service.
 * Manages bounce/complaint suppression list for email deliverability.
 */

/**
 * Check if an email can receive messages (not suppressed).
 */
export async function canSendEmail(
  db: D1Database,
  to: string
): Promise<{ allowed: boolean; reason?: string }> {
  const email = to.toLowerCase().trim();
  const row = await db
    .prepare(
      'SELECT suppressed, reason FROM email_suppressions WHERE email = ? AND suppressed = 1'
    )
    .bind(email)
    .first<{ suppressed: number; reason: string }>();

  if (row) {
    await logSuppressedSendAttempt(db, email, row.reason);
    return { allowed: false, reason: row.reason };
  }
  return { allowed: true };
}

/**
 * Upsert a suppression record.
 */
export async function upsertSuppression(
  db: D1Database,
  email: string,
  reason: string,
  suppress: boolean
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO email_suppressions (email, reason, suppressed, first_event_at, suppressed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         reason = excluded.reason,
         suppressed = excluded.suppressed,
         suppressed_at = CASE WHEN excluded.suppressed = 1 AND email_suppressions.suppressed = 0 THEN ? ELSE email_suppressions.suppressed_at END,
         updated_at = ?`
    )
    .bind(
      email,
      reason,
      suppress ? 1 : 0,
      now,
      suppress ? now : null,
      now,
      now,
      now,
      now
    )
    .run();
}

/**
 * Increment soft bounce counter. Suppress at >= 3 soft bounces.
 */
export async function incrementSoftBounce(
  db: D1Database,
  email: string
): Promise<void> {
  const now = new Date().toISOString();
  const SOFT_BOUNCE_THRESHOLD = 3;

  // Upsert with bounce_count increment
  await db
    .prepare(
      `INSERT INTO email_suppressions (email, reason, bounce_count, suppressed, first_event_at, created_at, updated_at)
       VALUES (?, 'soft_bounce', 1, 0, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         bounce_count = email_suppressions.bounce_count + 1,
         updated_at = ?`
    )
    .bind(email, now, now, now, now)
    .run();

  // Check if threshold reached and suppress
  const row = await db
    .prepare('SELECT bounce_count, suppressed FROM email_suppressions WHERE email = ?')
    .bind(email)
    .first<{ bounce_count: number; suppressed: number }>();

  if (row && row.bounce_count >= SOFT_BOUNCE_THRESHOLD && row.suppressed === 0) {
    await db
      .prepare(
        'UPDATE email_suppressions SET suppressed = 1, reason = ?, suppressed_at = ?, updated_at = ? WHERE email = ?'
      )
      .bind('soft_bounce_threshold', now, now, email)
      .run();
  }
}

/**
 * Mark a webhook event as processed.
 */
export async function markEventProcessed(
  db: D1Database,
  eventId: string
): Promise<void> {
  await db
    .prepare('UPDATE email_webhook_events SET processed = 1 WHERE event_id = ?')
    .bind(eventId)
    .run();
}

/**
 * Log a suppressed send attempt for monitoring.
 */
async function logSuppressedSendAttempt(
  db: D1Database,
  email: string,
  reason: string
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO email_webhook_events
          (event_id, type, email_to, raw_payload, processed)
        VALUES (?, 'suppressed_send_attempt', ?, ?, 1)`
      )
      .bind(
        crypto.randomUUID(),
        email,
        JSON.stringify({ reason, attempted_at: new Date().toISOString() })
      )
      .run();
  } catch (e) {
    console.error('Failed to log suppressed send attempt:', e);
  }
}
