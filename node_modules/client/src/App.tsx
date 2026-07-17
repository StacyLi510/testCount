import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useRecords } from './hooks/useRecords.ts';
import SummaryCard from './components/SummaryCard.tsx';
import RecordForm from './components/RecordForm.tsx';
import RecordList from './components/RecordList.tsx';
import type { RecordItem, RecordInput } from './types.ts';

export default function App() {
  const { records, summary, loading, error, addRecord, editRecord, removeRecord } =
    useRecords();
  const [editing, setEditing] = useState<RecordItem | null>(null);

  function handleSubmit(input: RecordInput) {
    if (editing) {
      return editRecord(editing.id, input).then(() => setEditing(null));
    }
    return addRecord(input);
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-10 border-b border-white/50 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/30">
            <Wallet size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">个人记账</h1>
            <p className="text-xs text-slate-400">随手记录每一笔收支</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-5 pt-6">
        <SummaryCard summary={summary} />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecordForm
            editing={editing}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditing(null)}
          />
          <RecordList
            records={records}
            loading={loading}
            onEdit={(item) => setEditing(item)}
            onDelete={(id) => {
              if (confirm('确定删除这条记录吗？')) removeRecord(id);
            }}
          />
        </div>
      </main>
    </div>
  );
}
