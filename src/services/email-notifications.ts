/**
 * Email Notification Bridge
 *
 * Maps in-app notification types to email categories and templates.
 * Provides createNotificationWithEmail() wrapper.
 */

import type { Env } from '../types';
import { createNotification, type CreateNotificationParams } from './notifications';
import { sendEmailSafe } from './resend';
import {
  payoutInitiatedEmail,
  payoutCompletedEmail,
  submissionVerifiedEmail,
  submissionApprovedEmail,
  submissionRejectedEmail,
  missionSelectedEmail,
  accountWarningEmail,
  buildUnsubscribeUrl,
} from './email-templates';

type EmailCategory = 'security' | 'transactional' | 'campaign' | 'mission' | 'marketing';

/** Map notification type → email category */
const CATEGORY_MAP: Record<string, EmailCategory> = {
  payout_auf_paid: 'transactional',
  payout_confirmed: 'transactional',
  payout_failed: 'transactional',
  payout_overdue: 'transactional',
  submission_verified: 'mission',
  submission_rejected: 'mission',
  submission_approved: 'mission',
  needs_revision: 'mission',
  application_selected: 'mission',
  application_shortlisted: 'mission',
  application_rejected: 'mission',
  deal_hidden: 'campaign',
  campaign_started: 'campaign',
  campaign_ended: 'campaign',
  account_warning: 'security',
  account_suspended: 'security',
};

/**
 * Send an email notification for a given in-app notification.
 * Fire-and-forget: never throws.
 */
async function sendNotificationEmail(
  db: D1Database,
  env: Env,
  params: CreateNotificationParams
): Promise<void> {
  try {
    // Look up operator's verified email
    const emailRow = await db.prepare(
      `SELECT email FROM operator_emails
       WHERE operator_id = ? AND is_primary = 1 AND verified_at IS NOT NULL`
    ).bind(params.recipientId).first<{ email: string }>();

    if (!emailRow) return; // No verified email

    // Determine category
    const category = CATEGORY_MAP[params.type];
    if (!category) return; // Unknown type, skip email

    // Check preferences (security always sends)
    if (category !== 'security') {
      const pref = await db.prepare(
        'SELECT enabled FROM email_preferences WHERE operator_id = ? AND category = ?'
      ).bind(params.recipientId, category).first<{ enabled: number }>();

      // If no preference row, use defaults: all enabled except marketing
      if (pref && pref.enabled === 0) return;
      if (!pref && category === 'marketing') return;
    }

    // Generate unsubscribe URL
    const unsubSecret = env.RESEND_WEBHOOK_SECRET || 'humanads-unsub-fallback';
    const unsubUrl = await buildUnsubscribeUrl(params.recipientId, unsubSecret);

    // Select template based on notification type
    const meta = params.metadata as Record<string, string> | undefined;
    const dealTitle = meta?.deal_title || 'a mission';
    const amount = meta?.amount || '0.00';
    let email: { subject: string; html: string; headers?: Record<string, string> } | null = null;

    switch (params.type) {
      case 'payout_auf_paid':
        email = payoutInitiatedEmail(dealTitle, amount, unsubUrl);
        break;
      case 'payout_confirmed':
        email = payoutCompletedEmail(dealTitle, amount, meta?.tx_hash, unsubUrl);
        break;
      case 'submission_verified':
        email = submissionVerifiedEmail(dealTitle, unsubUrl);
        break;
      case 'submission_approved':
        email = submissionApprovedEmail(dealTitle, unsubUrl);
        break;
      case 'submission_rejected':
      case 'needs_revision':
        email = submissionRejectedEmail(dealTitle, meta?.reason || 'Please review and resubmit.', unsubUrl);
        break;
      case 'application_selected':
        email = missionSelectedEmail(dealTitle, unsubUrl);
        break;
      case 'account_warning':
      case 'account_suspended':
        email = accountWarningEmail(params.body || 'Your account has a new notice.');
        break;
      default:
        return; // No template for this type
    }

    if (!email) return;

    await sendEmailSafe(db, env, params.recipientId, {
      to: emailRow.email,
      subject: email.subject,
      html: email.html,
      headers: email.headers,
    }, params.type);
  } catch (e) {
    console.error('[email-notifications] Failed to send notification email:', e);
  }
}

/**
 * Create an in-app notification AND send an email notification.
 * The email is fire-and-forget and never blocks the response.
 */
export async function createNotificationWithEmail(
  db: D1Database,
  env: Env,
  params: CreateNotificationParams
): Promise<void> {
  // Create in-app notification (existing behavior)
  await createNotification(db, params);

  // Fire-and-forget email
  sendNotificationEmail(db, env, params).catch((e) =>
    console.error('[email-notifications] Background email error:', e)
  );
}
