import { describe, test, expect } from 'vitest';
import supertest from 'supertest';
import app from '../app.js';

describe('POST /api/records', () => {
  test('新增一条支出记录，返回 201 和完整记录', async () => {
    const newRecord = {
      type: 'expense',
      amount: 200,
      category: '餐饮',
      date: '2026-07-14',
      note: 'vitest测试',
    };

    const response = await supertest(app)
      .post('/api/records')
      .send(newRecord);

    // 断言 1：状态码 201
    expect(response.status).toBe(201);

    // 断言 2：返回体有 data 字段
    expect(response.body).toHaveProperty('data');

    // 断言 3：data 里包含 id（数据库自增主键）
    expect(response.body.data).toHaveProperty('id');
    expect(typeof response.body.data.id).toBe('number');

    // 断言 4：返回的字段和发过去的一致
    expect(response.body.data.type).toBe('expense');
    expect(response.body.data.amount).toBe(200);
    expect(response.body.data.category).toBe('餐饮');
    expect(response.body.data.date).toBe('2026-07-14');
    expect(response.body.data.note).toBe('vitest测试');
  });

  test('类型不是 income 或 expense，返回 400', async () => {
    const badRecord = {
      type: 'invalid',
      amount: 100,
      category: '餐饮',
      date: '2026-07-14',
      note: '',
    };

    const response = await supertest(app)
      .post('/api/records')
      .send(badRecord);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('金额为 0，返回 400', async () => {
    const badRecord = {
      type: 'expense',
      amount: 0,
      category: '餐饮',
      date: '2026-07-14',
      note: '',
    };

    const response = await supertest(app)
      .post('/api/records')
      .send(badRecord);

    expect(response.status).toBe(400);
  });
});
