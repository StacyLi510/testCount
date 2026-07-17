import { describe, test, expect } from 'vitest';
import supertest from 'supertest';
import app from '../app.js';

describe('GET /api/records', () => {
  test('返回 200，data 是数组', async () => {
    const response = await supertest(app).get('/api/records');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('新增一条后，列表里能找到这条记录', async () => {
    // 1. 先新增
    const created = await supertest(app)
      .post('/api/records')
      .send({
        type: 'expense',
        amount: 123,
        category: '购物',
        date: '2026-07-14',
        note: '列表测试',
      });
    const newId = created.body.data.id;

    // 2. 查列表
    const response = await supertest(app).get('/api/records');

    // 3. 断言列表里包含刚新增的 id
    const ids = response.body.data.map((r: any) => r.id);
    expect(ids).toContain(newId);
  });
});

describe('GET /api/summary', () => {
  test('返回 200，包含 totalIncome / totalExpense / balance', async () => {
    const response = await supertest(app).get('/api/summary');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('totalIncome');
    expect(response.body.data).toHaveProperty('totalExpense');
    expect(response.body.data).toHaveProperty('balance');
  });

  test('balance 等于 总收入减总支出', async () => {
    const response = await supertest(app).get('/api/summary');
    const { totalIncome, totalExpense, balance } = response.body.data;

    expect(balance).toBe(totalIncome - totalExpense);
  });

  test('新增一条收入后，统计的 totalIncome 会增加', async () => {
    // 1. 记录修改前的总收入
    const before = await supertest(app).get('/api/summary');
    const incomeBefore = before.body.data.totalIncome;

    // 2. 新增一条收入 500
    await supertest(app)
      .post('/api/records')
      .send({
        type: 'income',
        amount: 500,
        category: '工资',
        date: '2026-07-14',
        note: '统计测试',
      });

    // 3. 再查统计
    const after = await supertest(app).get('/api/summary');
    const incomeAfter = after.body.data.totalIncome;

    // 4. 断言总收入增加了 500
    expect(incomeAfter).toBe(incomeBefore + 500);
  });
});
