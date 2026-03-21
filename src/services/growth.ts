import type { Env } from '../types';

interface GrowthRow {
  paid_to_humans_cents: number;
  missions_created: number;
  promoter_count: number;
  ai_agents_count: number;
  growth_rate_budget: number;
  growth_rate_missions: number;
  growth_rate_promoters: number;
  growth_rate_agents: number;
  jitter_fraction: number;
  last_tick_at: string;
}

interface GrowthOffsets {
  paid_to_humans_cents: number;
  missions_created: number;
  promoter_count: number;
  ai_agents_count: number;
}

const ZERO_OFFSETS: GrowthOffsets = {
  paid_to_humans_cents: 0,
  missions_created: 0,
  promoter_count: 0,
  ai_agents_count: 0,
};

function jitteredGrowth(currentValue: number, rate: number, jitterFrac: number): number {
  const jitter = 1 + (Math.random() * 2 - 1) * jitterFrac;
  const increment = currentValue * rate * jitter;
  return Math.max(1, Math.round(increment));
}

async function isGrowthEnabled(env: Env): Promise<boolean> {
  try {
    const row = await env.DB.prepare(
      `SELECT value FROM app_config WHERE key = 'GROWTH_ENABLED'`
    ).first<{ value: string }>();
    return row?.value === 'true';
  } catch {
    return false;
  }
}

/**
 * Called from cron every minute. Only acts if 55+ minutes since last tick.
 */
export async function updateGrowthMetrics(env: Env): Promise<void> {
  if (!(await isGrowthEnabled(env))) return;

  try {
    const row = await env.DB.prepare(
      `SELECT * FROM platform_growth WHERE id = 'main'`
    ).first<GrowthRow>();

    if (!row) return;

    const lastTick = new Date(row.last_tick_at + 'Z').getTime();
    const now = Date.now();
    const minutesSinceTick = (now - lastTick) / (1000 * 60);

    if (minutesSinceTick < 55) return;

    const newBudget = row.paid_to_humans_cents + jitteredGrowth(row.paid_to_humans_cents, row.growth_rate_budget, row.jitter_fraction);
    const newMissions = row.missions_created + jitteredGrowth(row.missions_created, row.growth_rate_missions, row.jitter_fraction);
    const newPromoters = row.promoter_count + jitteredGrowth(row.promoter_count, row.growth_rate_promoters, row.jitter_fraction);
    const newAgents = row.ai_agents_count + jitteredGrowth(row.ai_agents_count, row.growth_rate_agents, row.jitter_fraction);

    await env.DB.prepare(
      `UPDATE platform_growth
       SET paid_to_humans_cents = ?,
           missions_created = ?,
           promoter_count = ?,
           ai_agents_count = ?,
           last_tick_at = datetime('now')
       WHERE id = 'main'`
    ).bind(newBudget, newMissions, newPromoters, newAgents).run();

    console.log(`Growth tick: budget=$${(newBudget / 100).toFixed(2)}, missions=${newMissions}, promoters=${newPromoters}, agents=${newAgents}`);
  } catch (e) {
    console.error('Growth update error:', e);
  }
}

/**
 * Returns growth offsets to add to real stats.
 */
export async function getGrowthOffsets(env: Env): Promise<GrowthOffsets> {
  if (!(await isGrowthEnabled(env))) return ZERO_OFFSETS;

  try {
    const row = await env.DB.prepare(
      `SELECT paid_to_humans_cents, missions_created, promoter_count, ai_agents_count
       FROM platform_growth WHERE id = 'main'`
    ).first<GrowthOffsets>();

    return row || ZERO_OFFSETS;
  } catch {
    return ZERO_OFFSETS;
  }
}
