// Next Actions helper — provides machine-readable hints for AI agents
// so they know what API call to make next after each response.

export interface NextAction {
  action: string;
  method?: string;
  endpoint?: string;
  description: string;
}

// ── Mission-level next actions ──

export function getMissionNextActions(mission: {
  mission_id: string;
  status: string;
  pending_applications_count: number;
  pending_submissions_count: number;
  verified_submissions_count: number;
}): NextAction[] {
  if (mission.status !== 'active') return [];

  const actions: NextAction[] = [];

  if (mission.pending_applications_count > 0) {
    actions.push({
      action: 'review_applications',
      method: 'GET',
      endpoint: `/api/v1/missions/${mission.mission_id}/applications`,
      description: `Review ${mission.pending_applications_count} pending application(s)`,
    });
  }

  if (mission.pending_submissions_count > 0) {
    actions.push({
      action: 'review_submissions',
      method: 'GET',
      endpoint: `/api/v1/missions/${mission.mission_id}/submissions?status=submitted`,
      description: `Review ${mission.pending_submissions_count} pending submission(s)`,
    });
  }

  if (mission.verified_submissions_count > 0) {
    actions.push({
      action: 'list_payable_submissions',
      method: 'GET',
      endpoint: `/api/v1/missions/${mission.mission_id}/submissions?status=verified`,
      description: `${mission.verified_submissions_count} submission(s) ready for payout — list them, then call POST /submissions/:id/payout/execute for each`,
    });
  }

  if (actions.length === 0) {
    actions.push({
      action: 'wait',
      description: 'No pending actions. Wait for promoters to apply or submit.',
    });
  }

  return actions;
}

// ── Submission-level next actions ──

export function getSubmissionNextActions(
  status: string,
  submissionId: string
): NextAction[] {
  switch (status) {
    case 'submitted':
      return [
        {
          action: 'approve',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/approve`,
          description: 'Approve this submission (marks as verified)',
        },
        {
          action: 'reject',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/reject`,
          description: 'Reject this submission (reason required)',
        },
      ];

    case 'verified':
      return [
        {
          action: 'execute_payout',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/payout/execute`,
          description: 'Execute payout server-side (recommended for sandboxed agents)',
        },
        {
          action: 'trigger_payout',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/payout`,
          description: 'Trigger payout manually (get addresses for on-chain transfer)',
        },
      ];

    case 'approved':
    case 'paid_partial':
      return [
        {
          action: 'execute_payout',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/payout/execute`,
          description: 'Execute payout server-side (completes remaining payments)',
        },
      ];

    case 'paid_complete':
      return [
        {
          action: 'submit_review',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/review`,
          description: 'Rate this promoter (1-5 stars, double-blind)',
        },
      ];

    default:
      return [];
  }
}

// ── Payout-level next actions ──

export function getPayoutNextActions(
  payoutStatus: string,
  submissionId: string
): NextAction[] {
  switch (payoutStatus) {
    case 'pending':
      return [
        {
          action: 'execute_payout',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/payout/execute`,
          description: 'Execute payout server-side (recommended)',
        },
      ];

    case 'paid_partial':
      return [
        {
          action: 'execute_payout',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/payout/execute`,
          description: 'Retry payout to complete remaining payment',
        },
      ];

    case 'paid_complete':
      return [
        {
          action: 'submit_review',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/review`,
          description: 'Rate this promoter (1-5 stars, double-blind)',
        },
      ];

    case 'failed':
      return [
        {
          action: 'execute_payout',
          method: 'POST',
          endpoint: `/api/v1/submissions/${submissionId}/payout/execute`,
          description: 'Retry payout (previous transaction failed)',
        },
      ];

    default:
      return [];
  }
}

// ── Application-level next actions ──

export function getApplicationNextActions(
  status: string,
  applicationId: string,
  dealId: string
): NextAction[] {
  switch (status) {
    case 'applied':
    case 'shortlisted':
      return [
        {
          action: 'select',
          method: 'POST',
          endpoint: `/api/v1/applications/${applicationId}/select`,
          description: 'Select this applicant for the mission',
        },
        {
          action: 'reject',
          method: 'POST',
          endpoint: `/api/v1/applications/${applicationId}/reject`,
          description: 'Reject this applicant',
        },
      ];

    case 'selected':
      return [
        {
          action: 'check_submissions',
          method: 'GET',
          endpoint: `/api/v1/missions/${dealId}/submissions?status=submitted`,
          description: 'Check if this promoter has submitted their post',
        },
      ];

    default:
      return [];
  }
}
