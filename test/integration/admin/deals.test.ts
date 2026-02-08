import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { applyMigrations, seedTestData, clearDatabase, type TestSeedData } from '../../helpers/db';
import { adminRequest, fetchJson } from '../../helpers/request';
import { createDeal } from '../../helpers/factories';

describe('Admin Deal Management', () => {
  let seed: TestSeedData;

  beforeAll(async () => {
    await applyMigrations(env.DB);
  });

  beforeEach(async () => {
    await clearDatabase(env.DB);
    seed = await seedTestData(env.DB);
  });

  it('GET /api/admin/deals — list all deals', async () => {
    await createDeal(env.DB, { agent_id: seed.agent.id, title: 'Deal 1' });
    await createDeal(env.DB, { agent_id: seed.agent.id, title: 'Deal 2', visibility: 'hidden' });

    const req = adminRequest('/api/admin/deals', seed.adminOperator.sessionToken);
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.data.deals.length).toBe(2); // admin sees all including hidden
  });

  it('POST /api/admin/deals — create deal', async () => {
    const req = adminRequest('/api/admin/deals', seed.adminOperator.sessionToken, {
      method: 'POST',
      body: JSON.stringify({
        agent_id: seed.agent.id,
        title: 'New Deal',
        description: 'Test deal',
        requirements: {
          post_type: 'tweet',
          content_template: 'Check out HumanAds!',
          hashtags: ['#humanads'],
          verification_method: 'url_check',
        },
        reward_amount: 2000,
        max_participants: 5,
      }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.deal.title).toBe('New Deal');
    expect(data.data.deal.reward_amount).toBe(2000);
  });

  it('PUT /api/admin/deals/:id/status — change status', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, status: 'active' });

    const req = adminRequest(`/api/admin/deals/${dealId}/status`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ status: 'completed' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const deal = await env.DB.prepare('SELECT status FROM deals WHERE id = ?').bind(dealId).first<any>();
    expect(deal!.status).toBe('completed');
  });

  it('PUT /api/admin/deals/:id/visibility — hide deal', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, visibility: 'visible' });

    const req = adminRequest(`/api/admin/deals/${dealId}/visibility`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ action: 'hide', reason: 'Inappropriate content' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);
    expect(data.success).toBe(true);

    const deal = await env.DB.prepare('SELECT visibility FROM deals WHERE id = ?').bind(dealId).first<any>();
    expect(deal!.visibility).toBe('hidden');
  });

  it('PUT /api/admin/deals/:id/visibility — delete hidden deal', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, visibility: 'hidden' });

    const req = adminRequest(`/api/admin/deals/${dealId}/visibility`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ action: 'delete' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);

    const deal = await env.DB.prepare('SELECT visibility FROM deals WHERE id = ?').bind(dealId).first<any>();
    expect(deal!.visibility).toBe('deleted');
  });

  it('PUT /api/admin/deals/:id/visibility — restore deleted deal', async () => {
    const dealId = await createDeal(env.DB, { agent_id: seed.agent.id, visibility: 'deleted' });

    const req = adminRequest(`/api/admin/deals/${dealId}/visibility`, seed.adminOperator.sessionToken, {
      method: 'PUT',
      body: JSON.stringify({ action: 'restore' }),
    });
    const { status, data } = await fetchJson<any>(SELF, req);

    expect(status).toBe(200);

    const deal = await env.DB.prepare('SELECT visibility FROM deals WHERE id = ?').bind(dealId).first<any>();
    expect(deal!.visibility).toBe('visible');
  });
});
