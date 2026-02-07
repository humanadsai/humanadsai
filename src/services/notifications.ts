/**
 * Notification Service
 *
 * Fire-and-forget notification creation for operator status updates.
 * All functions are wrapped in try/catch and never throw.
 */

export interface CreateNotificationParams {
  recipientId: string;
  type: string;
  title: string;
  body?: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a single notification (fire-and-forget)
 */
export async function createNotification(
  db: D1Database,
  params: CreateNotificationParams
): Promise<void> {
  try {
    const id = crypto.randomUUID().replace(/-/g, '');
    await db
      .prepare(
        `INSERT INTO notifications (id, recipient_id, type, title, body, reference_type, reference_id, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(
        id,
        params.recipientId,
        params.type,
        params.title,
        params.body || null,
        params.referenceType || null,
        params.referenceId || null,
        params.metadata ? JSON.stringify(params.metadata) : null
      )
      .run();
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
}

/**
 * Create multiple notifications in batch (fire-and-forget)
 */
export async function createBatchNotifications(
  db: D1Database,
  notifications: CreateNotificationParams[]
): Promise<void> {
  try {
    if (notifications.length === 0) return;

    const statements = notifications.map((params) => {
      const id = crypto.randomUUID().replace(/-/g, '');
      return db
        .prepare(
          `INSERT INTO notifications (id, recipient_id, type, title, body, reference_type, reference_id, metadata, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        )
        .bind(
          id,
          params.recipientId,
          params.type,
          params.title,
          params.body || null,
          params.referenceType || null,
          params.referenceId || null,
          params.metadata ? JSON.stringify(params.metadata) : null
        );
    });

    await db.batch(statements);
  } catch (e) {
    console.error('Failed to create batch notifications:', e);
  }
}
