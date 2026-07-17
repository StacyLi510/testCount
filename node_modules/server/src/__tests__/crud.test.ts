import { describe, test, expect } from 'vitest';
import supertest from 'supertest';
import app from '../app.js';

describe('PUT /api/records/:id', () => {
  test('修改已有记录，返回 200 和更新后的数据', async () => {
    // 1. 先新增一条，拿到 id
    const created = await supertest(app)
      .post('/api/records')
      .send({
        type: 'expense',
        amount: 200,
        category: '餐饮',
        date: '2026-07-14',
        note: '待修改',
      });
    const id = created.body.data.id;

    // 2. 用这个 id 发 PUT 修改
    const response = await supertest(app)
      .put(`/api/records/${id}`)
      .send({
        type: 'expense',
        amount: 88.5,
        category: '餐饮',
        date: '2026-07-14',
        note: '已修改',
      });

    // 3. 断言
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(id);
    expect(response.body.data.amount).toBe(88.5);
    expect(response.body.data.note).toBe('已修改');
  });

  test('修改不存在的 id，返回 404', async () => {
    const response = await supertest(app)
      .put('/api/records/999999')
      .send({
        type: 'expense',
        amount: 50,
        category: '餐饮',
        date: '2026-07-14',
        note: '',
      });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/records/:id', () => {
  test('删除已有记录，返回 200 和 success: true', async () => {
    // 1. 先新增一条，拿到 id
    const created = await supertest(app)
      .post('/api/records')
      .send({
        type: 'income',
        amount: 1000,
        category: '工资',
        date: '2026-07-14',
        note: '待删除',
      });
    const id = created.body.data.id;

    // 2. 用这个 id 发 DELETE
    const response = await supertest(app)
      .delete(`/api/records/${id}`);

    // 3. 断言
    expect(response.status).toBe(200);
    expect(response.body.data.success).toBe(true);
  });

  test('删除不存在的 id，返回 404', async () => {
    const response = await supertest(app)
      .delete('/api/records/999999');

    expect(response.status).toBe(404);
  });
});
