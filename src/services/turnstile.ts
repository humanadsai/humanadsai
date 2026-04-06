/**
 * Cloudflare Turnstile verification service
 */

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string,
  ip: string,
  secretKey: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  if (!token) {
    return { success: false, errorCodes: ['missing-input-response'] };
  }
  if (!secretKey) {
    return { success: false, errorCodes: ['missing-secret'] };
  }

  try {
    const resp = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    if (!resp.ok) {
      return { success: false, errorCodes: ['server-error'] };
    }

    const data = await resp.json<TurnstileResponse>();
    return {
      success: data.success,
      errorCodes: data['error-codes'],
    };
  } catch {
    return { success: false, errorCodes: ['network-error'] };
  }
}
