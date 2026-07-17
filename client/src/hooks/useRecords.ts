import { useCallback, useEffect, useState } from 'react';
import type { RecordItem, RecordInput, Summary } from '../types.ts';
import * as api from '../api/records.ts';

export function useRecords() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, sum] = await Promise.all([api.getRecords(), api.getSummary()]);
      setRecords(recs);
      setSummary(sum);
    } catch (e) {
      console.error('加载数据失败:', e);
      setError(e instanceof Error ? e.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRecord = useCallback(
    async (input: RecordInput) => {
      await api.createRecord(input);
      await refresh();
    },
    [refresh]
  );

  const editRecord = useCallback(
    async (id: number, input: RecordInput) => {
      await api.updateRecord(id, input);
      await refresh();
    },
    [refresh]
  );

  const removeRecord = useCallback(
    async (id: number) => {
      await api.deleteRecord(id);
      await refresh();
    },
    [refresh]
  );

  return { records, summary, loading, error, refresh, addRecord, editRecord, removeRecord };
}
