import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import * as api from './api/records';
import type { RecordItem, RecordInput, Summary } from './types';

// 在 vi.mock 工厂函数执行前，准备好可共享的可变状态（hoist 安全写法）。
// store 充当「假后端数据库」，computeSummary 充当「假后端聚合」。
const h = vi.hoisted(() => {
  const store: RecordItem[] = [];
  const nextId = { value: 1 };
  const computeSummary = (items: RecordItem[]): Summary => {
    const totalIncome = items
      .filter((i) => i.type === 'income')
      .reduce((s, i) => s + i.amount, 0);
    const totalExpense = items
      .filter((i) => i.type === 'expense')
      .reduce((s, i) => s + i.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  };
  return { store, nextId, computeSummary };
});

// 把真实后端请求整体替换成内存假实现：
// - getRecords/getSummary 从 store 读出当前数据
// - createRecord 往 store 塞一条并自增 id（模拟服务端生成主键）
vi.mock('./api/records', () => ({
  getRecords: vi.fn(() => Promise.resolve([...h.store])),
  getSummary: vi.fn(() => Promise.resolve(h.computeSummary(h.store))),
  createRecord: vi.fn((input: RecordInput) => {
    const item: RecordItem = { id: h.nextId.value++, ...input };
    h.store.push(item);
    return Promise.resolve(item);
  }),
  updateRecord: vi.fn(() => Promise.resolve({} as RecordItem)),
  deleteRecord: vi.fn(() => Promise.resolve({ success: true })),
}));

beforeEach(() => {
  // 每个用例前清空假数据库与调用记录，保证用例互不污染
  h.store.length = 0;
  h.nextId.value = 1;
  vi.clearAllMocks();
});

describe('App 集成流程', () => {
  test('填写表单提交后，列表新增一条且汇总数字联动更新', async () => {
    render(<App />);

    // ① 初始：空状态 + 汇总全 0
    expect(await screen.findByText('暂无记账记录，添加第一笔吧 ✨')).toBeInTheDocument();
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 0.00');

    // ② 填金额（默认类型=支出，分类=餐饮）
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '50' } });

    // ③ 点击「添加记录」提交
    fireEvent.click(screen.getByRole('button', { name: '添加记录' }));

    // ④ 等待异步提交 + 刷新（createRecord → refresh → getRecords）→ 列表多一条
    expect(await screen.findByTestId('record-item-1')).toBeInTheDocument();
    expect(screen.getByText('共 1 条')).toBeInTheDocument();

    // ⑤ 汇总联动：总支出 50，结余 -50
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 50.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ -50.00');
  });

  test('已有支出时再添加一笔收入，总收入与结余正确联动', async () => {
    // 预置一条已有支出（并让假后端自增 id 从 2 开始，避免主键冲突）
    h.store.push({
      id: 1,
      type: 'expense',
      amount: 50,
      category: '餐饮',
      date: '2026-07-22',
      note: '午饭',
    });
    h.nextId.value = 2;

    render(<App />);

    // 初始加载完成：1 条支出，总支出 50，结余 -50
    expect(await screen.findByTestId('record-item-1')).toBeInTheDocument();
    expect(screen.getByText('共 1 条')).toBeInTheDocument();
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 50.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ -50.00');

    // 切到「收入」类型
    fireEvent.click(screen.getByRole('button', { name: '收入' }));
    // 选分类「工资」
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '工资' } });
    // 填金额
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1000' } });
    // 提交
    fireEvent.click(screen.getByRole('button', { name: '添加记录' }));

    // 等待新增：第 2 条出现
    expect(await screen.findByTestId('record-item-2')).toBeInTheDocument();
    expect(screen.getByText('共 2 条')).toBeInTheDocument();

    // 汇总联动：总收入 1000，结余 950
    expect(screen.getByTestId('summary-总收入')).toHaveTextContent('¥ 1,000.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ 950.00');
  });

  test('金额为 0 时表单校验拦截，不调用后端 createRecord', async () => {
    render(<App />);
    await screen.findByText('暂无记账记录，添加第一笔吧 ✨');

    // 直接提交空金额
    fireEvent.click(screen.getByRole('button', { name: '添加记录' }));

    // 表单层校验报错
    expect(await screen.findByText('请输入大于 0 的金额')).toBeInTheDocument();
    // 集成验证：根本没走到后端写接口
    expect(api.createRecord).not.toHaveBeenCalled();
  });
});
