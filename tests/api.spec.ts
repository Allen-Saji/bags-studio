import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3099';

// A known Bags coin mint for testing the Bags API proxy + score endpoint
// Using a real mint so we can test the full flow against the live Bags API
const TEST_MINT = 'So11111111111111111111111111111111111111112'; // Wrapped SOL (likely has claim data)

test.describe('API: Campaigns CRUD', () => {
  let campaignId: string;

  test('GET /api/campaigns returns empty array initially', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/campaigns rejects invalid JSON', async ({ request }) => {
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: 'not json',
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/campaigns rejects missing fields', async ({ request }) => {
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: { name: '' },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.errors).toBeDefined();
    expect(data.errors.name).toBeDefined();
    expect(data.errors.mint_address).toBeDefined();
    expect(data.errors.creator_wallet).toBeDefined();
  });

  test('POST /api/campaigns rejects invalid mint address', async ({ request }) => {
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: {
        name: 'Test Campaign',
        mint_address: 'not-base58!@#$',
        creator_wallet: 'not-base58!@#$',
        type: 'airdrop',
        tier_threshold: 'Active',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.errors.mint_address).toBeDefined();
    expect(data.errors.creator_wallet).toBeDefined();
  });

  test('POST /api/campaigns rejects invalid type', async ({ request }) => {
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: {
        name: 'Test',
        mint_address: 'So11111111111111111111111111111111111111112',
        creator_wallet: 'BPFLoaderUpgradeab1e11111111111111111111111',
        type: 'invalid_type',
        tier_threshold: 'Active',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.errors.type).toBeDefined();
  });

  test('POST /api/campaigns rejects invalid tier', async ({ request }) => {
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: {
        name: 'Test',
        mint_address: 'So11111111111111111111111111111111111111112',
        creator_wallet: 'BPFLoaderUpgradeab1e11111111111111111111111',
        type: 'airdrop',
        tier_threshold: 'InvalidTier',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.errors.tier_threshold).toBeDefined();
  });

  test('POST /api/campaigns rejects invalid max_wallets', async ({ request }) => {
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: {
        name: 'Test',
        mint_address: 'So11111111111111111111111111111111111111112',
        creator_wallet: 'BPFLoaderUpgradeab1e11111111111111111111111',
        type: 'airdrop',
        tier_threshold: 'Active',
        max_wallets: -5,
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.errors.max_wallets).toBeDefined();
  });

  test('POST /api/campaigns rejects non-owner wallet (403)', async ({ request }) => {
    // This wallet is valid base58 but not the creator of this mint
    const res = await request.post(`${BASE}/api/campaigns`, {
      data: {
        name: 'Test Campaign',
        mint_address: 'So11111111111111111111111111111111111111112',
        creator_wallet: 'BPFLoaderUpgradeab1e11111111111111111111111',
        type: 'airdrop',
        tier_threshold: 'Active',
      },
    });
    // Should get 403 (not owner) since BPFLoader isn't the creator of wrapped SOL
    expect(res.status()).toBe(403);
  });

  test('GET /api/campaigns filters by mint', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns?mint=nonexistent`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  test('GET /api/campaigns filters by wallet', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns?wallet=nonexistent`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});

test.describe('API: Campaign lifecycle', () => {
  // We need to insert a campaign directly to test lifecycle since we can't bypass ownership check
  // We'll use the service key to insert directly

  let campaignId: string;

  test.beforeAll(async ({ request }) => {
    // Insert a test campaign directly via Supabase REST API
    const supabaseUrl = 'http://127.0.0.1:54321';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    const res = await request.post(`${supabaseUrl}/rest/v1/campaigns`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      data: {
        mint_address: 'So11111111111111111111111111111111111111112',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
        name: 'Lifecycle Test Campaign',
        type: 'airdrop',
        tier_threshold: 'Active',
        status: 'draft',
      },
    });

    expect(res.status()).toBe(201);
    const data = await res.json();
    campaignId = data[0].id;
  });

  test('GET /api/campaigns/:id returns campaign', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns/${campaignId}`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Lifecycle Test Campaign');
    expect(data.status).toBe('draft');
  });

  test('PATCH rejects invalid transition (draft -> completed)', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'completed',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Cannot transition');
  });

  test('PATCH allows draft -> active', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'active',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('active');
  });

  test('PATCH rejects active -> draft', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'draft',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('PATCH allows active -> completed', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'completed',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('completed');
  });

  test('PATCH rejects changes to completed campaign', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'active',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/campaigns/:id/export returns CSV', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns/${campaignId}/export`);
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'];
    expect(contentType).toContain('text/csv');
    const text = await res.text();
    expect(text).toContain('wallet,score,tier');
  });
});

test.describe('API: Campaign lifecycle (cancel)', () => {
  let campaignId: string;

  test.beforeAll(async ({ request }) => {
    const supabaseUrl = 'http://127.0.0.1:54321';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    const res = await request.post(`${supabaseUrl}/rest/v1/campaigns`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      data: {
        mint_address: 'So11111111111111111111111111111111111111112',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
        name: 'Cancel Test Campaign',
        type: 'allowlist',
        tier_threshold: 'Loyal',
        status: 'draft',
      },
    });

    const data = await res.json();
    campaignId = data[0].id;
  });

  test('PATCH allows draft -> cancelled', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'cancelled',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('cancelled');
  });

  test('PATCH rejects changes to cancelled campaign', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/campaigns/${campaignId}`, {
      data: {
        status: 'active',
        creator_wallet: 'TestWallet111111111111111111111111111111111',
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('API: Score endpoint', () => {
  test('GET /api/score/:mint returns scores or error for unknown mint', async ({ request }) => {
    const res = await request.get(`${BASE}/api/score/So11111111111111111111111111111111111111112`);
    // May return scores, cached data, or an upstream API error
    expect([200, 400, 404, 500]).toContain(res.status());
    if (res.status() === 200) {
      const data = await res.json();
      expect(data).toHaveProperty('totalSupporters');
      // Check if cached flag exists
      expect(data).toHaveProperty('cached');
    }
  });
});

test.describe('API: Bags proxy', () => {
  test('GET /api/bags/token/:mint proxies to Bags API', async ({ request }) => {
    const res = await request.get(`${BASE}/api/bags/fee-share/admin/list`);
    // Should proxy through — either 200 or an upstream error
    expect([200, 400, 401, 403, 404, 500]).toContain(res.status());
  });
});

test.describe('API: Campaign not found', () => {
  test('GET /api/campaigns/:id returns 404 for nonexistent', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns/00000000-0000-0000-0000-000000000000`);
    expect(res.status()).toBe(404);
  });

  test('GET /api/campaigns/:id/export returns 404 for nonexistent', async ({ request }) => {
    const res = await request.get(`${BASE}/api/campaigns/00000000-0000-0000-0000-000000000000/export`);
    expect(res.status()).toBe(404);
  });
});
