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

// 列表中的第一条记录行
function firstRow(page: any) {
  return page.locator('[data-testid^="record-item-"]').first();
}

async function addRecord(page: any, opts: { amount: string; type?: '支出' | '收入'; category?: string }) {
  if (opts.type === '收入') {
    await page.getByRole('button', { name: '收入' }).click();
  }
  if (opts.category) {
    await page.locator('select').selectOption(opts.category);
  }
  await page.locator('input[type="number"]').fill(opts.amount);
  await page.getByRole('button', { name: '添加记录' }).click();
  // 等待列表出现对应记录
  const sign = opts.type === '收入' ? '+' : '-';
  await expect(
    page.getByText(
      `${sign} ¥ ${Number(opts.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
    )
  ).toBeVisible();
}

test('新增收入，结余增加', async ({ page }) => {
  await page.goto('/');
  const balanceBefore = await page.getByTestId('summary-结余').innerText();

  await addRecord(page, { amount: '1000', type: '收入', category: '工资' });

  await expect(page.getByText('+ ¥ 1,000.00')).toBeVisible();
  const balanceAfter = await page.getByTestId('summary-结余').innerText();
  expect(balanceAfter).not.toEqual(balanceBefore);
});

test('编辑一条记录的金额', async ({ page }) => {
  await page.goto('/');
  await addRecord(page, { amount: '50' });

  const row = firstRow(page);
  await expect(row).toBeVisible();

  // 在行内找"编辑"按钮（用 aria-label，不依赖 id）
  await row.getByRole('button', { name: '编辑' }).click();

  const amountInput = page.locator('input[type="number"]');
  await amountInput.fill('80');
  await page.getByRole('button', { name: '保存修改' }).click();

  await expect(page.getByText('- ¥ 80.00')).toBeVisible();
  await expect(page.getByText('- ¥ 50.00')).toHaveCount(0);
});

test('删除一条记录', async ({ page }) => {
  await page.goto('/');
  await addRecord(page, { amount: '30' });

  const row = firstRow(page);
  await expect(row).toBeVisible();

  page.on('dialog', (dialog) => dialog.accept()); // 自动确认浏览器的 confirm
  await row.getByRole('button', { name: '删除' }).click();

  await expect(row).toHaveCount(0);
});
