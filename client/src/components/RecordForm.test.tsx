import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordForm from './RecordForm';

describe('RecordForm', () => {
  test('渲染所有输入字段和提交按钮', () => {
    render(<RecordForm editing={null} onSubmit={vi.fn().mockResolvedValue(undefined)} onCancelEdit={vi.fn()} />);

    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加记录' })).toBeInTheDocument();
    // 默认类型是"支出"
    expect(screen.getByText('支出')).toHaveClass('border-rose-400');
  });

  test('金额为 0 时显示校验错误，且 onSubmit 不被调用', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RecordForm editing={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: '添加记录' }));

    expect(screen.getByText('请输入大于 0 的金额')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('输入有效金额并提交，调用 onSubmit 且携带正确数据', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<RecordForm editing={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: '添加记录' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'expense', amount: 50, category: '餐饮' })
      );
    });
  });

  test('切换类型为收入', () => {
    render(<RecordForm editing={null} onSubmit={vi.fn().mockResolvedValue(undefined)} onCancelEdit={vi.fn()} />);

    fireEvent.click(screen.getByText('收入'));
    expect(screen.getByText('收入')).toHaveClass('border-emerald-400');
  });
});
