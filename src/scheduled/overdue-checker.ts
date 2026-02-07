import type { Env } from '../types';
import { markAgentOverdue } from '../services/ledger';
import { createNotificationWithEmail } from '../services/email-notifications';

/**
 * Overdue Checker Scheduled Job
 *
 * Runs every 15 minutes to:
 * 1. Check for overdue A-Plan payments (past payout_deadline_at)
 * 2. Transition missions to OVERDUE status
 * 3. Apply automatic sanctions to agents
 *
 * Cron schedule: 15 * * * * (every 15 minutes)
 */
export async function handleScheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  console.log('Running overdue checker at:', new Date().toISOString());

  try {
    // 1. Check for overdue payouts
    await checkOverduePayouts(env);

    // 2. Check for 7-day suspension lifts
    await checkSuspensionLifts(env);

    console.log('Overdue checker completed successfully');
  } catch (error) {
    console.error('Overdue checker error:', error);
  }
}

/**
 * Check for missions past their payout deadline
 * Transitions: APPROVED or ADDRESS_UNLOCKED → OVERDUE
 */
async function checkOverduePayouts(env: Env): Promise<void> {
  const now = new Date().toISOString();

  // Find missions that are past deadline and still in payment states
  const overdueMissions = await env.DB.prepare(
    `SELECT m.id as mission_id, m.status, m.operator_id, d.agent_id, d.title as deal_title, d.id as deal_id
     FROM missions m
     JOIN deals d ON m.deal_id = d.id
     WHERE m.payout_deadline_at IS NOT NULL
       AND m.payout_deadline_at < ?
       AND m.status IN ('approved', 'address_unlocked')
       AND d.payment_model = 'a_plan'
     LIMIT 100`
  )
    .bind(now)
    .all<{ mission_id: string; status: string; operator_id: string; agent_id: string; deal_title: string; deal_id: string }>();

  console.log(`Found ${overdueMissions.results?.length || 0} overdue missions`);

  for (const mission of overdueMissions.results || []) {
    try {
      console.log(`Marking mission ${mission.mission_id} as overdue for agent ${mission.agent_id}`);
      await markAgentOverdue(env.DB, mission.agent_id, mission.mission_id);

      // Notify operator
      await createNotificationWithEmail(env.DB, env, {
        recipientId: mission.operator_id,
        type: 'payout_overdue',
        title: 'Payment Overdue',
        body: `Payment for '${mission.deal_title}' is overdue — support has been notified`,
        referenceType: 'mission',
        referenceId: mission.mission_id,
        metadata: { deal_title: mission.deal_title, deal_id: mission.deal_id },
      });
    } catch (error) {
      console.error(`Error marking mission ${mission.mission_id} as overdue:`, error);
    }
  }
}

/**
 * Check for agents whose 7-day suspension should be lifted
 * Only applies to 2nd offense (not 3rd+ which is permanent)
 */
async function checkSuspensionLifts(env: Env): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Find agents with exactly 2 overdues who were suspended more than 7 days ago
  const agentsToLift = await env.DB.prepare(
    `SELECT id, overdue_count, last_overdue_at
     FROM agents
     WHERE is_suspended_for_overdue = 1
       AND overdue_count = 2
       AND last_overdue_at < ?
     LIMIT 50`
  )
    .bind(sevenDaysAgo)
    .all<{ id: string; overdue_count: number; last_overdue_at: string }>();

  console.log(`Found ${agentsToLift.results?.length || 0} agents eligible for suspension lift`);

  for (const agent of agentsToLift.results || []) {
    try {
      console.log(`Lifting suspension for agent ${agent.id} (2nd offense, 7 days passed)`);
      await env.DB.prepare(
        `UPDATE agents SET
          is_suspended_for_overdue = 0,
          updated_at = datetime('now')
         WHERE id = ? AND overdue_count = 2`
      )
        .bind(agent.id)
        .run();
    } catch (error) {
      console.error(`Error lifting suspension for agent ${agent.id}:`, error);
    }
  }
}

/**
 * Auto-suspend agents based on overdue rules
 * Rules:
 * - 1st overdue: Warning only (no suspension)
 * - 2nd overdue: 7-day suspension
 * - 3rd+ overdue: Permanent suspension
 *
 * Note: Most of this logic is handled in markAgentOverdue(),
 * but this function can be used for batch checks if needed
 */
async function autoSuspendOverdueAgents(env: Env): Promise<void> {
  // Agents with 3+ overdues who are not yet suspended (safety catch)
  const agentsToSuspend = await env.DB.prepare(
    `SELECT id, overdue_count
     FROM agents
     WHERE is_suspended_for_overdue = 0
       AND overdue_count >= 3
     LIMIT 50`
  )
    .bind()
    .all<{ id: string; overdue_count: number }>();

  for (const agent of agentsToSuspend.results || []) {
    console.log(`Auto-suspending agent ${agent.id} with ${agent.overdue_count} overdues`);
    await env.DB.prepare(
      `UPDATE agents SET
        is_suspended_for_overdue = 1,
        updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(agent.id)
      .run();
  }
}
