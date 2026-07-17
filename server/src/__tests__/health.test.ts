import { describe, test, expect } from 'vitest';
import supertest from 'supertest';
import app from '../app.js';

describe('GET /api/health', () => {
  test('返回 200 和 status: ok', async () => {
    const response = await supertest(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
