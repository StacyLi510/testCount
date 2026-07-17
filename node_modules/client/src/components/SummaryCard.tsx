import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import type { Summary } from '../types.ts';

interface Props {
  summary: Summary;
}

function formatMoney(value: number): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SummaryCard({ summary }: Props) {
  const cards = [
    {
      label: '总收入',
      value: summary.totalIncome,
      icon: TrendingUp,
      gradient: 'from-emerald-400 to-teal-500',
      text: 'text-emerald-600',
    },
    {
      label: '总支出',
      value: summary.totalExpense,
      icon: TrendingDown,
      gradient: 'from-rose-400 to-red-500',
      text: 'text-rose-600',
    },
    {
      label: '结余',
      value: summary.balance,
      icon: Wallet,
      gradient: 'from-sky-400 to-blue-500',
      text: 'text-sky-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur transition-transform duration-300 hover:-translate-y-1"
          >
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{c.label}</span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow`}
              >
                <Icon size={18} />
              </span>
            </div>
            <div className={`mt-3 text-2xl font-bold ${c.text}`} data-testid={`summary-${c.label}`}>
              ¥ {formatMoney(c.value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
