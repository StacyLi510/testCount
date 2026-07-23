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
  updateRecord: vi.fn((id: number, input: RecordInput) => {
    const idx = h.store.findIndex((r) => r.id === id);
    if (idx !== -1) h.store[idx] = { ...h.store[idx], ...input };
    return Promise.resolve(h.store[idx] || ({} as RecordItem));
  }),
  deleteRecord: vi.fn((id: number) => {
    const idx = h.store.findIndex((r) => r.id === id);
    if (idx !== -1) h.store.splice(idx, 1);
    return Promise.resolve({ success: true });
  }),
}));

beforeEach(() => {
  // 每个用例前清空假数据库与调用记录，保证用例互不污染
  h.store.length = 0;
  h.nextId.value = 1;
  vi.clearAllMocks();
  vi.unstubAllGlobals(); // 还原被 stub 的全局变量（如 confirm）
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

  test('点击编辑按钮，表单切换为编辑模式，修改金额后保存，列表与汇总联动更新', async () => {
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

    // 初始：加载完成，1 条支出 50
    expect(await screen.findByTestId('record-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 50.00');

    // 点击编辑按钮（data-testid="edit-1"）
    fireEvent.click(screen.getByTestId('edit-1'));

    // 表单标题变为「编辑记录」，按钮变为「保存修改」
    expect(screen.getByText('编辑记录')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存修改' })).toBeInTheDocument();

    // 清空金额并改为 80
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '80' } });

    // 点击「保存修改」
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    // 等待刷新完成：编辑结束后按钮从「保存修改」变回「添加记录」
    expect(await screen.findByRole('button', { name: '添加记录' })).toBeInTheDocument();

    // 汇总联动：金额从 50 变为 80
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 80.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ -80.00');

    // 集成验证：确实调了 updateRecord 并携带正确参数
    expect(api.updateRecord).toHaveBeenCalledWith(1, expect.objectContaining({
      type: 'expense',
      amount: 80,
      category: '餐饮',
    }));
  });

  test('确认删除后，记录消失且汇总联动更新', async () => {
    h.store.push({
      id: 1,
      type: 'expense',
      amount: 100,
      category: '购物',
      date: '2026-07-20',
      note: '',
    });
    h.store.push({
      id: 2,
      type: 'income',
      amount: 500,
      category: '工资',
      date: '2026-07-01',
      note: '',
    });
    h.nextId.value = 3;

    // mock 掉 window.confirm：模拟用户点「确定」
    vi.stubGlobal('confirm', vi.fn(() => true));

    render(<App />);

    // 初始：2 条记录，支出 100，收入 500，结余 400
    expect(await screen.findByTestId('record-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('record-item-2')).toBeInTheDocument();
    expect(screen.getByText('共 2 条')).toBeInTheDocument();
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 100.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ 400.00');

    // 点击第 1 条的删除按钮
    fireEvent.click(screen.getByTestId('delete-1'));

    // 等待 record-item-1 消失
    await screen.findByText('共 1 条');
    expect(screen.queryByTestId('record-item-1')).toBeNull();

    // 汇总：支出 0，收入 500，结余 500
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 0.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ 500.00');

    // 集成验证：deleteRecord 被调用且携带正确 id
    expect(api.deleteRecord).toHaveBeenCalledWith(1);
  });
});
