import type { Env, Operator, AdminContext } from '../types';
import { errors, generateRequestId } from '../utils/response';
import { authenticateOperator } from '../api/operator/register';

/**
 * Admin Authentication Middleware
 *
 * Extends operator authentication to check for admin role.
 * Supports both:
 * 1. Bearer token in Authorization header
 * 2. Cookie-based session (HttpOnly 'session' cookie)
 *
 * Returns 403 Forbidden if the authenticated operator is not an admin.
 */
export async function requireAdmin(
  request: Request,
  env: Env
): Promise<{ success: boolean; context?: AdminContext; error?: Response }> {
  const requestId = generateRequestId();

  // First, authenticate as a regular operator
  const authResult = await authenticateOperator(request, env);

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    };
  }

  const operator = authResult.operator!;

  // Check if operator has admin role
  if (operator.role !== 'admin') {
    return {
      success: false,
      error: errors.forbidden(requestId, 'Admin access required'),
    };
  }

  return {
    success: true,
    context: {
      requestId,
      operator,
    },
  };
}

/**
 * Check if an operator is an admin
 */
export function isAdmin(operator: Operator): boolean {
  return operator.role === 'admin';
}
