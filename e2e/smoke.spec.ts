import { test, expect } from '@playwright/test';

test('页面能打开，标题显示个人记账', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('个人记账')).toBeVisible();
});
