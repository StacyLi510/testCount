# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: validation.spec.ts >> 金额填 0 或空，前端报错且不新增
- Location: e2e\validation.spec.ts:19:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[data-testid^="record-item-"]')
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('[data-testid^="record-item-"]')
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - generic [ref=e10]:
        - heading "个人记账" [level=1] [ref=e11]
        - paragraph [ref=e12]: 随手记录每一笔收支
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e17]:
          - generic [ref=e18]: 总收入
          - img [ref=e20]
        - generic [ref=e23]: ¥ 0.00
      - generic [ref=e24]:
        - generic [ref=e26]:
          - generic [ref=e27]: 总支出
          - img [ref=e29]
        - generic [ref=e32]: ¥ 0.00
      - generic [ref=e33]:
        - generic [ref=e35]:
          - generic [ref=e36]: 结余
          - img [ref=e38]
        - generic [ref=e41]: ¥ 0.00
    - generic [ref=e42]:
      - generic [ref=e43]:
        - heading "新增记录" [level=2] [ref=e45]
        - generic [ref=e46]:
          - generic [ref=e47]:
            - generic [ref=e48]: 类型
            - generic [ref=e49]:
              - button "支出" [ref=e50] [cursor=pointer]
              - button "收入" [ref=e51] [cursor=pointer]
          - generic [ref=e52]:
            - generic [ref=e53]: 金额
            - spinbutton [ref=e54]: "0"
          - generic [ref=e55]:
            - generic [ref=e56]: 分类
            - combobox [ref=e57]:
              - option "餐饮" [selected]
              - option "交通"
              - option "购物"
              - option "工资"
              - option "兼职"
              - option "居住"
              - option "娱乐"
              - option "医疗"
              - option "其他"
          - generic [ref=e58]:
            - generic [ref=e59]: 日期
            - textbox [ref=e60]: 2026-07-17
          - generic [ref=e61]:
            - generic [ref=e62]: 备注
            - textbox "可选" [ref=e63]
        - paragraph [ref=e64]: 请输入大于 0 的金额
        - button "添加记录" [active] [ref=e65] [cursor=pointer]:
          - img [ref=e66]
          - text: 添加记录
      - generic [ref=e67]: 暂无记账记录，添加第一笔吧 ✨
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const API = 'http://localhost:3001';
  4  | 
  5  | // 清空后端所有记录（直连后端，不依赖代理和 baseURL）
  6  | async function clearAll(request: any) {
  7  |   const res = await request.get(`${API}/api/records`);
  8  |   const body = await res.json();
  9  |   const list = body.data ?? [];
  10 |   for (const r of list) {
  11 |     await request.delete(`${API}/api/records/${r.id}`);
  12 |   }
  13 | }
  14 | 
  15 | test.beforeEach(async ({ request }) => {
  16 |   await clearAll(request);
  17 | });
  18 | 
  19 | test('金额填 0 或空，前端报错且不新增', async ({ page, request }) => {
  20 |   await page.goto('/');
  21 | 
  22 |   await page.locator('input[type="number"]').fill('0');
  23 |   await page.getByRole('button', { name: '添加记录' }).click();
  24 | 
  25 |   await expect(page.getByText('请输入大于 0 的金额')).toBeVisible();
  26 |   // 列表不应新增任何记录
> 27 |   await expect(page.locator('[data-testid^="record-item-"]')).toHaveCount(1);
     |                                                               ^ Error: expect(locator).toHaveCount(expected) failed
  28 | });
  29 | 
  30 | test('空状态提示', async ({ page, request }) => {
  31 |   await page.goto('/');
  32 |   await expect(page.getByText('暂无记账记录，添加第一笔吧')).toBeVisible();
  33 | });
  34 | 
```