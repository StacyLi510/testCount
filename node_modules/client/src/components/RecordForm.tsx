import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import type { RecordItem, RecordInput, RecordType } from '../types.ts';

interface Props {
  editing: RecordItem | null;
  onSubmit: (input: RecordInput) => Promise<void>;
  onCancelEdit: () => void;
}

const CATEGORIES = ['餐饮', '交通', '购物', '工资', '兼职', '居住', '娱乐', '医疗', '其他'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RecordForm({ editing, onSubmit, onCancelEdit }: Props) {
  const [type, setType] = useState<RecordType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('餐饮');
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadFromEditing(item: RecordItem | null) {
    if (item) {
      setType(item.type);
      setAmount(String(item.amount));
      setCategory(item.category);
      setDate(item.date);
      setNote(item.note);
    } else {
      setType('expense');
      setAmount('');
      setCategory('餐饮');
      setDate(today());
      setNote('');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('请输入大于 0 的金额');
      return;
    }
    setSubmitting(true);
    onSubmit({
      type,
      amount: Math.round(amt * 100) / 100,
      category,
      date,
      note: note.trim(),
    })
      .then(() => {
        if (!editing) loadFromEditing(null);
      })
      .catch((e) => {
        console.error('保存失败:', e);
        setError(e instanceof Error ? e.message : '保存失败');
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          {editing ? '编辑记录' : '新增记录'}
        </h2>
        {editing && (
          <button
            type="button"
            onClick={() => {
              loadFromEditing(null);
              onCancelEdit();
            }}
            className="cursor-pointer rounded-lg px-3 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-100"
          >
            取消编辑
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-600">类型</label>
          <div className="flex gap-3">
            {(['expense', 'income'] as RecordType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  type === t
                    ? t === 'income'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {t === 'income' ? '收入' : '支出'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">金额</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">备注</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="可选"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-xl hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {editing ? <Pencil size={16} /> : <Plus size={16} />}
        {submitting ? '保存中…' : editing ? '保存修改' : '添加记录'}
      </button>
    </form>
  );
}
