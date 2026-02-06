import type { Env, Operator } from '../../types';
import { success, errors, generateRequestId } from '../../utils/response';
import { authenticateOperator } from '../operator/register';
import { cleanXHandle } from '../../utils/format';

/**
 * Get current user info
 *
 * GET /api/me
 *
 * Returns the authenticated user's info including X connection status.
 * Used by frontend to determine if user needs to sign in before applying to missions.
 */
export async function getMe(request: Request, env: Env): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // Try to authenticate
    const authResult = await authenticateOperator(request, env);

    if (!authResult.success) {
      // Not authenticated - return xConnected: false
      return success(
        {
          xConnected: false,
          user: null,
        },
        requestId
      );
    }

    const operator = authResult.operator!;

    // Use x_profile_image_url from X OAuth, fallback to avatar_url
    const avatarUrl = operator.x_profile_image_url || operator.avatar_url || null;

    return success(
      {
        xConnected: true,
        user: {
          id: operator.id,
          x_handle: cleanXHandle(operator.x_handle),
          display_name: operator.display_name,
          avatar_url: avatarUrl,
          x_profile_image_url: operator.x_profile_image_url,
          status: operator.status,
          role: operator.role || 'user',
          is_admin: operator.role === 'admin',
        },
      },
      requestId
    );
  } catch (e) {
    console.error('Get me error:', e);
    return errors.internalError(requestId);
  }
}
