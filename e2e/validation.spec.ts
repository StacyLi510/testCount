import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001';

// 清空后端所有记录（直连后端，不依赖代理和 baseURL）
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

test('金额填 0 或空，前端报错且不新增', async ({ page, request }) => {
  await page.goto('/');

  await page.locator('input[type="number"]').fill('0');
  await page.getByRole('button', { name: '添加记录' }).click();

  await expect(page.getByText('请输入大于 0 的金额')).toBeVisible();
  // 列表不应新增任何记录
  await expect(page.locator('[data-testid^="record-item-"]')).toHaveCount(1);
});

test('空状态提示', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByText('暂无记账记录，添加第一笔吧')).toBeVisible();
});
