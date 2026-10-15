const request = require('supertest');
const app = require('../../src/server');

describe('API Health & System Routing', () => {
  test('GET /api returns 200 with success status and friendly message', async () => {
    const res = await request(app).get('/api');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Backend is running successfully!',
    });
  });

  test('CORS middleware responds with Access-Control-Allow-Origin header', async () => {
    const res = await request(app).get('/api');

    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  test('OPTIONS preflight request returns 200 with appropriate CORS headers', async () => {
    const res = await request(app).options('/api/employees');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toContain('GET, POST, PUT, DELETE, OPTIONS');
  });
});
