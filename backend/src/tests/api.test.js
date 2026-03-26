const request = require('supertest');
const app     = require('../src/server');

// ── Auth flow ─────────────────────────────────────────────────────────────────
describe('Auth API', () => {
  const phone = '+919999900001';

  it('POST /auth/send-otp — rejects invalid phone', async () => {
    const res = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone: '123' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/send-otp — accepts valid phone', async () => {
    const res = await request(app)
      .post('/api/v1/auth/send-otp')
      .send({ phone });
    // In test mode, SMS is not sent but OTP is stored
    expect([200, 429]).toContain(res.status);
  });

  it('POST /auth/verify-otp — rejects wrong OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phone, otp: '000000' });
    expect([400, 429]).toContain(res.status);
  });

  it('GET /auth/me — requires auth', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

// ── Products ──────────────────────────────────────────────────────────────────
describe('Products API', () => {
  it('GET /products — returns list', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /products?category=feed — filters correctly', async () => {
    const res = await request(app).get('/api/v1/products?category=feed');
    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      expect(res.body.data.every((p) => p.category === 'feed')).toBe(true);
    }
  });

  it('GET /products/:id — 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('POST /products — requires admin auth', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Test Feed', category: 'feed' });
    expect(res.status).toBe(401);
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
describe('Health', () => {
  it('GET /health — returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ── Farmer routes — require auth ──────────────────────────────────────────────
describe('Farmer routes — unauthenticated', () => {
  it('GET /farmers/profile — 401', async () => {
    const res = await request(app).get('/api/v1/farmers/profile');
    expect(res.status).toBe(401);
  });
  it('GET /farmers/ponds — 401', async () => {
    const res = await request(app).get('/api/v1/farmers/ponds');
    expect(res.status).toBe(401);
  });
});

// ── Vendor routes — require auth ──────────────────────────────────────────────
describe('Vendor routes — unauthenticated', () => {
  it('GET /vendors/inventory — 401', async () => {
    const res = await request(app).get('/api/v1/vendors/inventory');
    expect(res.status).toBe(401);
  });
});
