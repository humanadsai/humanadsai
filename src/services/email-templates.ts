/**
 * HTML Email Templates
 * All templates use inline CSS, HumanAds branding (#FF6B35), 600px max-width, mobile responsive.
 */

const BRAND_COLOR = '#FF6B35';
const BG_COLOR = '#0a0a0f';
const SURFACE_COLOR = '#1a1a2e';
const TEXT_COLOR = '#ffffff';
const TEXT_MUTED = '#a0a0b0';
const BASE_URL = 'https://humanadsai.com';

function layout(title: string, content: string, showUnsubscribe = true): string {
  const footer = showUnsubscribe
    ? `<p style="margin-top:32px;font-size:12px;color:${TEXT_MUTED};">
        <a href="${BASE_URL}/settings/notifications" style="color:${TEXT_MUTED};text-decoration:underline;">Manage notification preferences</a>
      </p>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${SURFACE_COLOR};border-radius:12px;border:1px solid rgba(255,255,255,0.1);">
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font-size:20px;font-weight:700;color:${BRAND_COLOR};font-family:monospace;margin-bottom:24px;">HumanAds</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;color:${TEXT_COLOR};font-size:14px;line-height:1.6;">
              ${content}
              ${footer}
            </td>
          </tr>
        </table>
        <p style="margin-top:16px;font-size:11px;color:${TEXT_MUTED};">
          &copy; ${new Date().getFullYear()} HumanAds &mdash; humanadsai.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:${BRAND_COLOR};border-radius:8px;">
        <a href="${url}" style="display:inline-block;padding:12px 24px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;font-family:monospace;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ============================================
// Auth Templates
// ============================================

export function magicLinkEmail(url: string, expiresMin: number): { subject: string; html: string } {
  return {
    subject: 'Sign in to HumanAds',
    html: layout('Sign in to HumanAds', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Sign in to your account</h2>
      <p style="color:${TEXT_MUTED};">Click the button below to sign in. This link expires in ${expiresMin} minutes.</p>
      ${button('Sign In', url)}
      <p style="font-size:12px;color:${TEXT_MUTED};">If you didn't request this, you can safely ignore this email.</p>
      <p style="font-size:12px;color:${TEXT_MUTED};word-break:break-all;">Link: ${url}</p>
    `, false),
  };
}

export function emailVerificationEmail(url: string, expiresHours: number): { subject: string; html: string } {
  return {
    subject: 'Verify your email - HumanAds',
    html: layout('Verify your email', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Verify your email address</h2>
      <p style="color:${TEXT_MUTED};">Click the button below to verify your email. This link expires in ${expiresHours} hours.</p>
      ${button('Verify Email', url)}
      <p style="font-size:12px;color:${TEXT_MUTED};">If you didn't add this email, you can safely ignore this message.</p>
    `, false),
  };
}

export function emailChangeNoticeEmail(newEmailMasked: string): { subject: string; html: string } {
  return {
    subject: 'Email change requested - HumanAds',
    html: layout('Email Change Request', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Email Change Requested</h2>
      <p style="color:${TEXT_MUTED};">Someone requested to change the email on your HumanAds account to <strong style="color:${TEXT_COLOR};">${newEmailMasked}</strong>.</p>
      <p style="color:${TEXT_MUTED};">If this was you, no action is needed on this email. The new email will need to be verified.</p>
      <p style="color:#ff4444;">If you did not request this change, please secure your account immediately by logging in via X.</p>
    `, false),
  };
}

export function emailChangeVerifyEmail(url: string, expiresMin: number): { subject: string; html: string } {
  return {
    subject: 'Verify your new email - HumanAds',
    html: layout('Verify New Email', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Verify your new email</h2>
      <p style="color:${TEXT_MUTED};">Click the button below to verify this as your new HumanAds email. This link expires in ${expiresMin} minutes.</p>
      ${button('Verify New Email', url)}
      <p style="font-size:12px;color:${TEXT_MUTED};">If you didn't request this change, you can safely ignore this email.</p>
    `, false),
  };
}

export function securityAlertEmail(action: string, details: string): { subject: string; html: string } {
  return {
    subject: `Security Alert - ${action} - HumanAds`,
    html: layout('Security Alert', `
      <h2 style="margin:0 0 16px;font-size:18px;color:#ff4444;">Security Alert</h2>
      <p style="color:${TEXT_MUTED};"><strong style="color:${TEXT_COLOR};">${action}</strong></p>
      <p style="color:${TEXT_MUTED};">${details}</p>
      <p style="color:${TEXT_MUTED};">If this was not you, please secure your account immediately.</p>
    `, false),
  };
}

// ============================================
// Notification Templates
// ============================================

export function payoutInitiatedEmail(dealTitle: string, amount: string): { subject: string; html: string; headers: Record<string, string> } {
  return {
    subject: `Payment Initiated - ${dealTitle}`,
    html: layout('Payment Initiated', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Payment Initiated</h2>
      <p style="color:${TEXT_MUTED};">Payment of <strong style="color:${TEXT_COLOR};">${amount} hUSD</strong> for <strong style="color:${TEXT_COLOR};">${dealTitle}</strong> has been initiated.</p>
      <p style="color:${TEXT_MUTED};">You'll receive another notification once the payment is confirmed.</p>
      ${button('View My Missions', `${BASE_URL}/missions/my`)}
    `),
    headers: { 'List-Unsubscribe': `<${BASE_URL}/settings/notifications>` },
  };
}

export function payoutCompletedEmail(dealTitle: string, amount: string, txHash?: string): { subject: string; html: string; headers: Record<string, string> } {
  const txLink = txHash ? `<p style="color:${TEXT_MUTED};font-size:12px;">TX: <a href="https://sepolia.etherscan.io/tx/${txHash}" style="color:${BRAND_COLOR};">${txHash.slice(0, 10)}...${txHash.slice(-8)}</a></p>` : '';
  return {
    subject: `Payment Complete - ${dealTitle}`,
    html: layout('Payment Complete', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Payment Complete</h2>
      <p style="color:${TEXT_MUTED};">Your payment of <strong style="color:${TEXT_COLOR};">${amount} hUSD</strong> for <strong style="color:${TEXT_COLOR};">${dealTitle}</strong> has been confirmed.</p>
      ${txLink}
      ${button('View My Missions', `${BASE_URL}/missions/my`)}
    `),
    headers: { 'List-Unsubscribe': `<${BASE_URL}/settings/notifications>` },
  };
}

export function submissionVerifiedEmail(dealTitle: string): { subject: string; html: string; headers: Record<string, string> } {
  return {
    subject: `Submission Verified - ${dealTitle}`,
    html: layout('Submission Verified', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Submission Verified</h2>
      <p style="color:${TEXT_MUTED};">Your submission for <strong style="color:${TEXT_COLOR};">${dealTitle}</strong> has been verified and approved.</p>
      ${button('View My Missions', `${BASE_URL}/missions/my`)}
    `),
    headers: { 'List-Unsubscribe': `<${BASE_URL}/settings/notifications>` },
  };
}

export function submissionRejectedEmail(dealTitle: string, reason: string): { subject: string; html: string; headers: Record<string, string> } {
  return {
    subject: `Submission Needs Revision - ${dealTitle}`,
    html: layout('Submission Needs Revision', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Submission Needs Revision</h2>
      <p style="color:${TEXT_MUTED};">Your submission for <strong style="color:${TEXT_COLOR};">${dealTitle}</strong> needs revision.</p>
      <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:${TEXT_MUTED};font-size:13px;"><strong style="color:${TEXT_COLOR};">Reason:</strong> ${reason}</p>
      </div>
      ${button('View My Missions', `${BASE_URL}/missions/my`)}
    `),
    headers: { 'List-Unsubscribe': `<${BASE_URL}/settings/notifications>` },
  };
}

export function missionSelectedEmail(dealTitle: string): { subject: string; html: string; headers: Record<string, string> } {
  return {
    subject: `You've Been Selected! - ${dealTitle}`,
    html: layout('Mission Selected', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">You've Been Selected!</h2>
      <p style="color:${TEXT_MUTED};">Congratulations! You've been selected for <strong style="color:${TEXT_COLOR};">${dealTitle}</strong>. A mission has been created for you.</p>
      ${button('View My Missions', `${BASE_URL}/missions/my`)}
    `),
    headers: { 'List-Unsubscribe': `<${BASE_URL}/settings/notifications>` },
  };
}

export function missionClaimedEmail(dealTitle: string, operatorHandle: string): { subject: string; html: string; headers: Record<string, string> } {
  return {
    subject: `Mission Claimed - ${dealTitle}`,
    html: layout('Mission Claimed', `
      <h2 style="margin:0 0 16px;font-size:18px;color:${TEXT_COLOR};">Mission Claimed</h2>
      <p style="color:${TEXT_MUTED};">Your mission <strong style="color:${TEXT_COLOR};">${dealTitle}</strong> has been claimed by <strong style="color:${TEXT_COLOR};">@${operatorHandle}</strong>.</p>
      ${button('View Missions', `${BASE_URL}/missions`)}
    `),
    headers: { 'List-Unsubscribe': `<${BASE_URL}/settings/notifications>` },
  };
}

export function accountWarningEmail(reason: string): { subject: string; html: string } {
  return {
    subject: 'Account Notice - HumanAds',
    html: layout('Account Notice', `
      <h2 style="margin:0 0 16px;font-size:18px;color:#ff4444;">Account Notice</h2>
      <p style="color:${TEXT_MUTED};">${reason}</p>
      <p style="color:${TEXT_MUTED};">If you have questions, please contact support.</p>
    `, false),
  };
}
