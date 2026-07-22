import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecordList from './RecordList';
import type { RecordItem } from '../types';

const records: RecordItem[] = [
  { id: 1, type: 'expense', amount: 50, category: '餐饮', date: '2026-07-22', note: '午饭' },
  { id: 2, type: 'income', amount: 1000, category: '工资', date: '2026-07-01', note: '' },
];

describe('RecordList', () => {
  test('空状态显示提示文案', () => {
    render(<RecordList records={[]} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('暂无记账记录，添加第一笔吧 ✨')).toBeInTheDocument();
  });

  test('加载中且为空时显示加载提示', () => {
    render(<RecordList records={[]} loading onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });

  test('渲染记录列表，显示分类、金额和条数', () => {
    render(<RecordList records={records} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('工资')).toBeInTheDocument();
    expect(screen.getByText('共 2 条')).toBeInTheDocument();
    expect(screen.getByText(/¥ 50\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\+ ¥ 1,000\.00/)).toBeInTheDocument();
    // 每条记录有对应的 data-testid
    expect(screen.getByTestId('record-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('record-item-2')).toBeInTheDocument();
  });

  test('点击删除按钮，调用 onDelete 并携带正确 id', () => {
    const onDelete = vi.fn();
    render(<RecordList records={records} loading={false} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByTestId('delete-1'));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test('点击编辑按钮，调用 onEdit 并携带正确记录', () => {
    const onEdit = vi.fn();
    render(<RecordList records={records} loading={false} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByTestId('edit-2'));

    expect(onEdit).toHaveBeenCalledWith(records[1]);
  });
});
