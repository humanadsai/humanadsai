// AI Advertiser API Router
// Handles /api/v1/advertisers/* endpoints

import type { Env } from '../../types';
import { authenticateAiAdvertiser, requireActiveStatus } from '../../middleware/ai-advertiser-auth';
import { error, errors } from '../../utils/response';
import { generateRandomString } from '../../utils/crypto';
import { handleRegister } from './register';
import { handleGetMe, handleGetStatus } from './profile';
import { handleCreateMission, handleListMyMissions, handleGetMission } from './missions';
import { handleListApplications, handleSelectApplication, handleRejectApplication } from './applications';
import {
  handleListSubmissions,
  handleCreateTestSubmission,
  handleApproveSubmission,
  handleRejectSubmission,
  handleTriggerPayout,
  handleGetPayoutStatus,
  handleReportPayment,
  handleListPayouts
} from './submissions';

/**
 * Route AI Advertiser API requests
 *
 * @param request HTTP request
 * @param env Environment bindings
 * @param path Request path (e.g., /api/v1/advertisers/register)
 * @param method HTTP method
 * @returns Response
 */
export async function handleAiAdvertiserApi(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  const requestId = generateRandomString(16);

  // Extract the sub-path after /api/v1/advertisers
  const prefix = '/api/v1/advertisers';
  if (!path.startsWith(prefix)) {
    return errors.notFound(requestId, 'API endpoint not found');
  }

  const subPath = path.substring(prefix.length) || '/';

  try {
    // Public endpoints (no authentication required)
    if (method === 'POST' && subPath === '/register') {
      return await handleRegister(request, env, requestId);
    }

    // Protected endpoints (authentication required)
    // Authenticate the request
    const authResult = await authenticateAiAdvertiser(request, env, requestId);
    if (!authResult.success || !authResult.context) {
      return error(
        'AUTHENTICATION_FAILED',
        authResult.error!.hint || authResult.error!.message,
        requestId,
        authResult.error!.status
      );
    }

    const context = authResult.context;

    // Profile endpoints
    if (method === 'GET' && subPath === '/me') {
      return await handleGetMe(request, env, context);
    }

    if (method === 'GET' && subPath === '/status') {
      return await handleGetStatus(request, env, context);
    }

    // Mission endpoints (Phase 4)
    if (method === 'POST' && subPath === '/missions') {
      return await handleCreateMission(request, env, context);
    }

    if (method === 'GET' && subPath === '/missions/mine') {
      return await handleListMyMissions(request, env, context);
    }

    // GET /missions/:id - must be after /missions/mine to avoid conflict
    const missionMatch = subPath.match(/^\/missions\/([a-zA-Z0-9_]+)$/);
    if (missionMatch && method === 'GET') {
      return await handleGetMission(request, env, context, missionMatch[1]);
    }

    // Application endpoints

    // GET /missions/:id/applications - List applications for a mission
    const applicationsMatch = subPath.match(/^\/missions\/([a-zA-Z0-9_]+)\/applications$/);
    if (applicationsMatch && method === 'GET') {
      return await handleListApplications(request, env, context, applicationsMatch[1]);
    }

    // POST /applications/:id/select - Select an applicant
    const selectAppMatch = subPath.match(/^\/applications\/([a-zA-Z0-9_]+)\/select$/);
    if (selectAppMatch && method === 'POST') {
      return await handleSelectApplication(request, env, context, selectAppMatch[1]);
    }

    // POST /applications/:id/reject - Reject an applicant
    const rejectAppMatch = subPath.match(/^\/applications\/([a-zA-Z0-9_]+)\/reject$/);
    if (rejectAppMatch && method === 'POST') {
      return await handleRejectApplication(request, env, context, rejectAppMatch[1]);
    }

    // Submission endpoints (Phase 5)

    // GET /missions/:id/submissions - List submissions for a mission
    const submissionsMatch = subPath.match(/^\/missions\/([a-zA-Z0-9_]+)\/submissions$/);
    if (submissionsMatch && method === 'GET') {
      return await handleListSubmissions(request, env, context, submissionsMatch[1]);
    }

    // POST /missions/:id/test-submission - Create test submission (test mode only)
    const testSubMatch = subPath.match(/^\/missions\/([a-zA-Z0-9_]+)\/test-submission$/);
    if (testSubMatch && method === 'POST') {
      return await handleCreateTestSubmission(request, env, context, testSubMatch[1]);
    }

    // POST /submissions/:id/approve - Approve a submission
    const approveMatch = subPath.match(/^\/submissions\/([a-zA-Z0-9_]+)\/approve$/);
    if (approveMatch && method === 'POST') {
      return await handleApproveSubmission(request, env, context, approveMatch[1]);
    }

    // POST /submissions/:id/reject - Reject a submission
    const rejectMatch = subPath.match(/^\/submissions\/([a-zA-Z0-9_]+)\/reject$/);
    if (rejectMatch && method === 'POST') {
      return await handleRejectSubmission(request, env, context, rejectMatch[1]);
    }

    // POST /submissions/:id/payout - Trigger payout
    const payoutTriggerMatch = subPath.match(/^\/submissions\/([a-zA-Z0-9_]+)\/payout$/);
    if (payoutTriggerMatch && method === 'POST') {
      return await handleTriggerPayout(request, env, context, payoutTriggerMatch[1]);
    }

    // GET /submissions/:id/payout - Check payout status
    const payoutStatusMatch = subPath.match(/^\/submissions\/([a-zA-Z0-9_]+)\/payout$/);
    if (payoutStatusMatch && method === 'GET') {
      return await handleGetPayoutStatus(request, env, context, payoutStatusMatch[1]);
    }

    // POST /submissions/:id/payout/report - Report payment tx_hash
    const payoutReportMatch = subPath.match(/^\/submissions\/([a-zA-Z0-9_]+)\/payout\/report$/);
    if (payoutReportMatch && method === 'POST') {
      return await handleReportPayment(request, env, context, payoutReportMatch[1]);
    }

    // GET /payouts - List all payouts
    if (subPath === '/payouts' && method === 'GET') {
      return await handleListPayouts(request, env, context);
    }

    // No matching route
    return errors.notFound(requestId, 'API endpoint not found');
  } catch (e: any) {
    console.error('[AiAdvertiserApi] Unexpected error:', e);
    return errors.internalError(requestId);
  }
}
