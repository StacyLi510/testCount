import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getSummary,
} from '../db/index.js';

import type { RecordInput, RecordType } from '../types.js';

const router = Router();

function validateInput(body: unknown): { input?: RecordInput; error?: string } {
  if (!body || typeof body !== 'object') {
    return { error: '请求体格式错误' };
  }
  const b = body as Record<string, unknown>;
  const type = b.type as RecordType;
  const amount = Number(b.amount);
  const category = typeof b.category === 'string' ? b.category.trim() : '';
  const date = typeof b.date === 'string' ? b.date.trim() : '';
  const note = typeof b.note === 'string' ? b.note : '';

  if (type !== 'income' && type !== 'expense') {
    return { error: '类型必须是 income 或 expense' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: '金额必须是大于 0 的数字' };
  }
  if (!category) {
    return { error: '分类不能为空' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: '日期格式必须为 YYYY-MM-DD' };
  }
  return {
    input: {
      type,
      amount: Math.round(amount * 100) / 100,
      category,
      date,
      note,
    },
  };
}

router.get('/records', (_req: Request, res: Response) => {
  res.json({ data: getAllRecords() });
});

router.get('/records/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const record = getRecordById(id);
  if (!record) {
    res.status(404).json({ error: '记录不存在' });
    return;
  }
  res.json({ data: record });
});

router.post('/records', (req: Request, res: Response) => {
  const { input, error } = validateInput(req.body);
  if (error || !input) {
    res.status(400).json({ error });
    return;
  }
  const created = createRecord(input);
  res.status(201).json({ data: created });
});

router.put('/records/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!getRecordById(id)) {
    res.status(404).json({ error: '记录不存在' });
    return;
  }
  const { input, error } = validateInput(req.body);
  if (error || !input) {
    res.status(400).json({ error });
    return;
  }
  const updated = updateRecord(id, input);
  res.json({ data: updated });
});

router.delete('/records/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!deleteRecord(id)) {
    res.status(404).json({ error: '记录不存在' });
    return;
  }
  res.json({ data: { success: true } });
});

router.get('/summary', (_req: Request, res: Response) => {
  res.json({ data: getSummary() });
});

export default router;
