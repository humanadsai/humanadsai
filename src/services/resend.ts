/**
 * Resend API client for sending emails.
 * Uses fetch() only — no npm packages needed.
 */

import type { Env } from '../types';
import { canSendEmail } from './email';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_DEFAULT = 'HumanAds <noreply@humanadsai.com>';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

interface ResendApiResponse {
  id?: string;
  message?: string;
}

/**
 * Send an email via Resend API.
 * Returns the Resend message ID on success.
 */
export async function sendEmail(
  env: Env,
  params: SendEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.error('[resend] RESEND_API_KEY not configured');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const body: Record<string, unknown> = {
      from: params.from || FROM_DEFAULT,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    };
    if (params.text) body.text = params.text;
    if (params.replyTo) body.reply_to = params.replyTo;
    if (params.headers) body.headers = params.headers;

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as ResendApiResponse;

    if (!response.ok) {
      console.error('[resend] API error:', response.status, data.message);
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return { success: true, messageId: data.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error('[resend] Send failed:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Send an email safely: checks suppression list and logs to email_logs.
 */
export async function sendEmailSafe(
  db: D1Database,
  env: Env,
  operatorId: string | null,
  params: SendEmailParams,
  template: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check suppression
  const check = await canSendEmail(db, params.to);
  if (!check.allowed) {
    console.log(`[resend] Email suppressed for ${params.to}: ${check.reason}`);
    return { success: false, error: `Suppressed: ${check.reason}` };
  }

  // Send
  const result = await sendEmail(env, params);

  // Log
  try {
    const id = crypto.randomUUID().replace(/-/g, '');
    await db.prepare(
      `INSERT INTO email_logs (id, operator_id, to_email, template, subject, resend_message_id, status, error_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      id,
      operatorId,
      params.to,
      template,
      params.subject,
      result.messageId || null,
      result.success ? 'sent' : 'failed',
      result.error || null
    ).run();
  } catch (e) {
    console.error('[resend] Failed to log email:', e);
  }

  return result;
}
