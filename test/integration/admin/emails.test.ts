import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';

describe('Admin Email Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/emails/stats — email statistics', async () => {
    // Seed some email data
    await env.DB.prepare(
      `INSERT INTO operator_emails (id, operator_id, email, is_primary, verified_at)
       VALUES ('email-1', ?, 'test@example.com', 1, datetime('now'))`,
    ).bind(seed.regularOperator.id).run();

    const req = adminRequest('/api/admin/emails/stats', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total_emails).toBeTypeOf('number');
  });

  it('GET /api/admin/emails/logs — email send logs', async () => {
    // Seed email log
    await env.DB.prepare(
      `INSERT INTO email_logs (id, operator_id, to_email, template, status)
       VALUES ('log-1', ?, 'test@example.com', 'magic_link', 'sent')`,
    ).bind(seed.regularOperator.id).run();

    const req = adminRequest('/api/admin/emails/logs', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.logs).toBeInstanceOf(Array);
  });

  it('GET /api/admin/emails/suppressions — suppression list', async () => {
    // Seed suppression
    await env.DB.prepare(
      `INSERT INTO email_suppressions (email, reason, suppressed, suppressed_at)
       VALUES ('bounced@example.com', 'hard_bounce', 1, datetime('now'))`,
    ).run();

    const req = adminRequest('/api/admin/emails/suppressions', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.suppressions).toBeInstanceOf(Array);
    expect(data.data.suppressions.length).toBe(1);
  });
});
