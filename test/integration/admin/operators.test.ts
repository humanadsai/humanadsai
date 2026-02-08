import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';

describe('Admin Operator Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/operators — list operators', async () => {
    const req = adminRequest('/api/admin/operators', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.operators).toBeInstanceOf(Array);
    expect(data.data.operators.length).toBe(2); // admin + regular
  });

  it('PUT /api/admin/operators/:id/role — promote to admin', async () => {
    const req = adminRequest(
      `/api/admin/operators/${seed.regularOperator.id}/role`,
      seed.adminOperator.sessionToken,
      {
        method: 'PUT',
        body: JSON.stringify({ role: 'admin' }),
      }
    );
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const operator = await env.DB.prepare('SELECT role FROM operators WHERE id = ?')
      .bind(seed.regularOperator.id).first<any>();
    expect(operator!.role).toBe('admin');
  });

  it('PUT /api/admin/operators/:id/role — demote to user', async () => {
    // First promote
    await env.DB.prepare('UPDATE operators SET role = ? WHERE id = ?')
      .bind('admin', seed.regularOperator.id).run();

    const req = adminRequest(
      `/api/admin/operators/${seed.regularOperator.id}/role`,
      seed.adminOperator.sessionToken,
      {
        method: 'PUT',
        body: JSON.stringify({ role: 'user' }),
      }
    );
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);

    const operator = await env.DB.prepare('SELECT role FROM operators WHERE id = ?')
      .bind(seed.regularOperator.id).first<any>();
    expect(operator!.role).toBe('user');
  });
});
