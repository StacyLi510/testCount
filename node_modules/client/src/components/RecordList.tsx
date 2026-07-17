import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { RecordItem } from '../types.ts';

interface Props {
  records: RecordItem[];
  loading: boolean;
  onEdit: (item: RecordItem) => void;
  onDelete: (id: number) => void;
}

function formatMoney(value: number): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RecordList({ records, loading, onEdit, onDelete }: Props) {
  if (loading && records.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/80 p-10 text-center text-slate-400 shadow-card backdrop-blur">
        加载中…
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-400 backdrop-blur">
        暂无记账记录，添加第一笔吧 ✨
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-card backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">收支明细</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          共 {records.length} 条
        </span>
      </div>
      <ul className="divide-y divide-slate-100">
        {records.map((r) => {
          const isIncome = r.type === 'income';
          return (
            <li
              key={r.id}
              data-testid={`record-item-${r.id}`}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isIncome
                    ? 'bg-emerald-50 text-emerald-500'
                    : 'bg-rose-50 text-rose-500'
                }`}
              >
                {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{r.category}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {isIncome ? '收入' : '支出'}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-400">
                  {r.date}
                  {r.note ? ` · ${r.note}` : ''}
                </div>
              </div>

              <div
                className={`text-base font-bold ${
                  isIncome ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isIncome ? '+' : '-'} ¥ {formatMoney(r.amount)}
              </div>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  data-testid={`edit-${r.id}`}
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-500"
                  aria-label="编辑"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  data-testid={`delete-${r.id}`}
                  className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  aria-label="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
