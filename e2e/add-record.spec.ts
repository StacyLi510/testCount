import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

async function clearAll(request: any) {
  const res = await request.get(`${API}/api/records`);
  const body = await res.json();
  const list = body.data ?? [];
  for (const r of list) {
    await request.delete(`${API}/api/records/${r.id}`);
  }
}

test.beforeEach(async ({ request }) => {
  await clearAll(request);
});

test('新增一条餐饮支出，列表和统计同步更新', async ({ page }) => {
  await page.goto('/');

  const expenseBefore = await page.getByTestId('summary-总支出').innerText();

  // 填金额（默认分类"餐饮"、默认类型"支出"）
  await page.locator('input[type="number"]').fill('50');

  // 提交
  await page.getByRole('button', { name: '添加记录' }).click();

  // 列表出现这条记录
  await expect(page.getByText('- ¥ 50.00')).toBeVisible();

  // 总支出变化
  const expenseAfter = await page.getByTestId('summary-总支出').innerText();
  expect(expenseAfter).not.toEqual(expenseBefore);
});
