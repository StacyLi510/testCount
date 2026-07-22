import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCard from './SummaryCard';
import type { Summary } from '../types';

describe('SummaryCard', () => {
  test('渲染总收入、总支出、结余', () => {
    const summary: Summary = {
      totalIncome: 1000,
      totalExpense: 300,
      balance: 700,
    };

    render(<SummaryCard summary={summary} />);

    expect(screen.getByTestId('summary-总收入')).toHaveTextContent('¥ 1,000.00');
    expect(screen.getByTestId('summary-总支出')).toHaveTextContent('¥ 300.00');
    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ 700.00');
  });

  test('结余为 0 时正确显示', () => {
    const summary: Summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };

    render(<SummaryCard summary={summary} />);

    expect(screen.getByTestId('summary-结余')).toHaveTextContent('¥ 0.00');
  });
});
